import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateRequest, userSchemas, commonSchemas } from '../middleware/validation';
import { verifyPassword, hashPassword } from '../utils/encryption';
import { CreditService } from '../services/CreditService';
import Joi from 'joi';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/user/profile
 * 사용자 프로필 조회
 */
router.get('/profile',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          nickname: true,
          phone: true,
          birthYear: true,
          gender: true,
          subscriptionType: true,
          credits: true,
          paidCredits: true,
          referralCode: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              careerSurveys: { where: { isCompleted: true } },
              careerResults: true,
              simulationResults: { where: { isCompleted: true } },
              referrals: true,
            },
          },
        },
      });

      if (!user) {
        throw createError.notFound('사용자를 찾을 수 없습니다.');
      }

      res.json({
        success: true,
        message: '프로필을 조회했습니다.',
        data: {
          user: {
            ...user,
            totalCredits: user.credits + user.paidCredits,
            stats: {
              completedSurveys: user._count.careerSurveys,
              careerAnalyses: user._count.careerResults,
              completedSimulations: user._count.simulationResults,
              totalReferrals: user._count.referrals,
            },
          },
        },
      });

    } catch (error) {
      logger.error('Profile retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * PUT /api/v1/user/profile
 * 사용자 프로필 업데이트
 */
router.put('/profile',
  validateRequest({
    body: userSchemas.updateProfile
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { name, phone, birthYear, gender } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          birthYear,
          gender,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          birthYear: true,
          gender: true,
          updatedAt: true,
        },
      });

      logger.logEvent('profile_updated', {
        userId,
        updatedFields: Object.keys(req.body),
      }, userId);

      res.json({
        success: true,
        message: '프로필이 업데이트되었습니다.',
        data: { user: updatedUser },
      });

    } catch (error) {
      logger.error('Profile update failed', { userId, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/user/change-password
 * 비밀번호 변경
 */
router.post('/change-password',
  validateRequest({
    body: userSchemas.changePassword
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    try {
      // 현재 비밀번호 확인
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user) {
        throw createError.notFound('사용자를 찾을 수 없습니다.');
      }

      const isValidPassword = await verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        throw createError.badRequest('현재 비밀번호가 올바르지 않습니다.');
      }

      // 새 비밀번호 해싱 및 업데이트
      const hashedNewPassword = await hashPassword(newPassword);
      
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      logger.logEvent('password_changed', { userId }, userId);

      res.json({
        success: true,
        message: '비밀번호가 변경되었습니다.',
      });

    } catch (error) {
      logger.error('Password change failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/user/credits
 * 크레딧 현황 조회
 */
router.get('/credits',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    try {
      const creditBalance = await CreditService.getBalance(userId);

      res.json({
        success: true,
        message: '크레딧 현황을 조회했습니다.',
        data: creditBalance,
      });

    } catch (error) {
      logger.error('Credits retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/user/credits/transactions
 * 크레딧 트랜잭션 히스토리 조회
 */
router.get('/credits/transactions',
  validateRequest({
    query: Joi.object({
      page: commonSchemas.page,
      limit: commonSchemas.limit,
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    try {
      const transactionHistory = await CreditService.getTransactionHistory(userId, page, limit);

      res.json({
        success: true,
        message: '크레딧 트랜잭션 히스토리를 조회했습니다.',
        data: transactionHistory,
      });

    } catch (error) {
      logger.error('Credit transaction history retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/user/credits/stats
 * 크레딧 사용량 통계 조회
 */
router.get('/credits/stats',
  validateRequest({
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().required().greater(Joi.ref('startDate')),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);

    try {
      const stats = await CreditService.getCreditUsageStats(userId, startDate, endDate);

      res.json({
        success: true,
        message: '크레딧 사용량 통계를 조회했습니다.',
        data: stats,
      });

    } catch (error) {
      logger.error('Credit usage stats retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/user/credits/expiring
 * 만료 예정 크레딧 조회
 */
router.get('/credits/expiring',
  validateRequest({
    query: Joi.object({
      days: Joi.number().integer().min(1).max(365).default(30),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const days = parseInt(req.query.days as string) || 30;

    try {
      const expiringCredits = await CreditService.getExpiringCredits(userId, days);

      res.json({
        success: true,
        message: '만료 예정 크레딧을 조회했습니다.',
        data: expiringCredits,
      });

    } catch (error) {
      logger.error('Expiring credits retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/user/referrals
 * 추천인 현황 조회
 */
router.get('/referrals',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          referralCode: true,
          referrals: {
            select: {
              email: true,
              name: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        throw createError.notFound('사용자를 찾을 수 없습니다.');
      }

      res.json({
        success: true,
        message: '추천인 현황을 조회했습니다.',
        data: {
          referralCode: user.referralCode,
          totalReferrals: user.referrals.length,
          referrals: user.referrals,
          referralReward: user.referrals.length * 2, // 추천인당 2크레딧
        },
      });

    } catch (error) {
      logger.error('Referrals retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/user/activity
 * 활동 내역 조회
 */
router.get('/activity',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    try {
      const [activities, total] = await Promise.all([
        prisma.activityLog.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            action: true,
            description: true,
            metadata: true,
            createdAt: true,
          },
        }),
        prisma.activityLog.count({
          where: { userId },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        message: '활동 내역을 조회했습니다.',
        data: {
          activities,
          pagination: {
            total,
            totalPages,
            currentPage: page,
            limit,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });

    } catch (error) {
      logger.error('Activity retrieval failed', { userId, error });
      throw error;
    }
  })
);

export default router;