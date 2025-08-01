import { PrismaClient, CreditTransactionType } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface CreditTransactionData {
  userId: string;
  type: CreditTransactionType;
  amount: number;
  reason: string;
  description?: string;
  relatedId?: string;
  relatedType?: string;
  expiresAt?: Date;
}

export class CreditService {
  /**
   * 크레딧 지급
   */
  static async awardCredits(data: CreditTransactionData): Promise<any> {
    if (data.amount <= 0) {
      throw createError.badRequest('크레딧 지급 금액은 0보다 커야 합니다.');
    }

    try {
      return await prisma.$transaction(async (tx) => {
        // 현재 사용자 정보 조회
        const user = await tx.user.findUnique({
          where: { id: data.userId },
          select: { credits: true, paidCredits: true, isActive: true },
        });

        if (!user) {
          throw createError.notFound('사용자를 찾을 수 없습니다.');
        }

        if (!user.isActive) {
          throw createError.forbidden('비활성화된 사용자입니다.');
        }

        const currentBalance = user.credits + user.paidCredits;
        const newBalance = currentBalance + data.amount;

        // 크레딧 타입에 따라 무료/유료 크레딧 구분
        const isFreeCreditType = [
          CreditTransactionType.SIGNUP_BONUS,
          CreditTransactionType.REFERRAL_BONUS,
          CreditTransactionType.SURVEY_COMPLETION,
          CreditTransactionType.PROMOTION,
        ].includes(data.type);

        // 사용자 크레딧 업데이트
        const updateData = isFreeCreditType
          ? { credits: { increment: data.amount } }
          : { paidCredits: { increment: data.amount } };

        await tx.user.update({
          where: { id: data.userId },
          data: updateData,
        });

        // 크레딧 트랜잭션 기록
        const transaction = await tx.creditTransaction.create({
          data: {
            userId: data.userId,
            type: data.type,
            amount: data.amount,
            reason: data.reason,
            description: data.description,
            relatedId: data.relatedId,
            relatedType: data.relatedType,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            expiresAt: data.expiresAt,
          },
        });

        // 활동 로그 기록
        await tx.activityLog.create({
          data: {
            userId: data.userId,
            action: 'credit_awarded',
            description: `${data.amount} 크레딧 지급: ${data.reason}`,
            metadata: {
              transactionId: transaction.id,
              creditType: data.type,
              amount: data.amount,
              balanceAfter: newBalance,
            },
          },
        });

        logger.logEvent('credit_awarded', {
          userId: data.userId,
          transactionId: transaction.id,
          type: data.type,
          amount: data.amount,
          balanceAfter: newBalance,
        }, data.userId);

        return {
          transaction,
          newBalance,
          creditType: isFreeCreditType ? 'free' : 'paid',
        };
      });
    } catch (error) {
      logger.error('Credit award failed', { userId: data.userId, data, error });
      throw error;
    }
  }

  /**
   * 크레딧 차감
   */
  static async deductCredits(data: CreditTransactionData): Promise<any> {
    if (data.amount <= 0) {
      throw createError.badRequest('크레딧 차감 금액은 0보다 커야 합니다.');
    }

    try {
      return await prisma.$transaction(async (tx) => {
        // 현재 사용자 정보 조회
        const user = await tx.user.findUnique({
          where: { id: data.userId },
          select: { credits: true, paidCredits: true, isActive: true },
        });

        if (!user) {
          throw createError.notFound('사용자를 찾을 수 없습니다.');
        }

        if (!user.isActive) {
          throw createError.forbidden('비활성화된 사용자입니다.');
        }

        const currentBalance = user.credits + user.paidCredits;

        if (currentBalance < data.amount) {
          throw createError.badRequest(`크레딧이 부족합니다. (보유: ${currentBalance}, 필요: ${data.amount})`);
        }

        const newBalance = currentBalance - data.amount;

        // 유료 크레딧 우선 차감
        let remainingDeduction = data.amount;
        let paidCreditsUsed = 0;
        let freeCreditsUsed = 0;

        if (user.paidCredits > 0) {
          paidCreditsUsed = Math.min(user.paidCredits, remainingDeduction);
          remainingDeduction -= paidCreditsUsed;
        }

        if (remainingDeduction > 0) {
          freeCreditsUsed = remainingDeduction;
        }

        // 사용자 크레딧 업데이트
        await tx.user.update({
          where: { id: data.userId },
          data: {
            paidCredits: { decrement: paidCreditsUsed },
            credits: { decrement: freeCreditsUsed },
          },
        });

        // 크레딧 트랜잭션 기록 (음수로 기록)
        const transaction = await tx.creditTransaction.create({
          data: {
            userId: data.userId,
            type: data.type,
            amount: -data.amount, // 차감은 음수로 기록
            reason: data.reason,
            description: data.description,
            relatedId: data.relatedId,
            relatedType: data.relatedType,
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
          },
        });

        // 활동 로그 기록
        await tx.activityLog.create({
          data: {
            userId: data.userId,
            action: 'credit_deducted',
            description: `${data.amount} 크레딧 차감: ${data.reason}`,
            metadata: {
              transactionId: transaction.id,
              creditType: data.type,
              amount: data.amount,
              paidCreditsUsed,
              freeCreditsUsed,
              balanceAfter: newBalance,
            },
          },
        });

        logger.logEvent('credit_deducted', {
          userId: data.userId,
          transactionId: transaction.id,
          type: data.type,
          amount: data.amount,
          paidCreditsUsed,
          freeCreditsUsed,
          balanceAfter: newBalance,
        }, data.userId);

        return {
          transaction,
          newBalance,
          paidCreditsUsed,
          freeCreditsUsed,
        };
      });
    } catch (error) {
      logger.error('Credit deduction failed', { userId: data.userId, data, error });
      throw error;
    }
  }

  /**
   * 사용자 크레딧 잔액 조회
   */
  static async getBalance(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          credits: true,
          paidCredits: true,
          subscriptionType: true,
        },
      });

      if (!user) {
        throw createError.notFound('사용자를 찾을 수 없습니다.');
      }

      return {
        freeCredits: user.credits,
        paidCredits: user.paidCredits,
        totalCredits: user.credits + user.paidCredits,
        subscriptionType: user.subscriptionType,
      };
    } catch (error) {
      logger.error('Credit balance retrieval failed', { userId, error });
      throw error;
    }
  }

  /**
   * 크레딧 트랜잭션 히스토리 조회
   */
  static async getTransactionHistory(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        prisma.creditTransaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.creditTransaction.count({
          where: { userId },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        transactions,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Credit transaction history retrieval failed', { userId, error });
      throw error;
    }
  }

  /**
   * 특정 기간 크레딧 사용량 통계
   */
  static async getCreditUsageStats(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const transactions = await prisma.creditTransaction.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          type: true,
          amount: true,
          createdAt: true,
        },
      });

      // 타입별 집계
      const stats = transactions.reduce((acc, transaction) => {
        const type = transaction.type;
        if (!acc[type]) {
          acc[type] = { earned: 0, spent: 0, count: 0 };
        }

        if (transaction.amount > 0) {
          acc[type].earned += transaction.amount;
        } else {
          acc[type].spent += Math.abs(transaction.amount);
        }
        acc[type].count += 1;

        return acc;
      }, {} as Record<string, any>);

      const totalEarned = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const totalSpent = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        period: { startDate, endDate },
        summary: {
          totalEarned,
          totalSpent,
          netChange: totalEarned - totalSpent,
          transactionCount: transactions.length,
        },
        byType: stats,
      };
    } catch (error) {
      logger.error('Credit usage stats retrieval failed', { userId, error });
      throw error;
    }
  }

  /**
   * 만료 예정 크레딧 조회
   */
  static async getExpiringCredits(userId: string, days: number = 30): Promise<any> {
    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);

      const expiringCredits = await prisma.creditTransaction.findMany({
        where: {
          userId,
          type: CreditTransactionType.PURCHASE,
          amount: { gt: 0 },
          expiresAt: {
            lte: expirationDate,
            gte: new Date(),
          },
        },
        orderBy: { expiresAt: 'asc' },
      });

      const totalExpiringCredits = expiringCredits.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

      return {
        expiringCredits,
        totalExpiringCredits,
        daysUntilExpiration: days,
      };
    } catch (error) {
      logger.error('Expiring credits retrieval failed', { userId, error });
      throw error;
    }
  }
}