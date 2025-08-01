import express from 'express';
import { QuestService } from '../services/QuestService';
import { QuestType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateRequest, authSchemas } from '../middleware/validation';
import { hashPassword, verifyPassword, generateTokens, generateRandomCode } from '../utils/encryption';
import { optionalAuthMiddleware } from '../middleware/auth';
import { CreditService } from '../services/CreditService';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/v1/auth/register
 * 회원가입
 */
router.post('/register',
  validateRequest({
    body: authSchemas.register
  }),
  asyncHandler(async (req, res) => {
    const { email, password, name, phone, referralCode } = req.body;

    try {
      // 이메일 중복 확인
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw createError.conflict('이미 등록된 이메일입니다.', 'EMAIL_EXISTS');
      }

      // 추천인 확인
      let referrerId = null;
      if (referralCode) {
        const referrer = await prisma.user.findUnique({
          where: { referralCode },
        });
        
        if (!referrer) {
          throw createError.badRequest('유효하지 않은 추천인 코드입니다.', 'INVALID_REFERRAL_CODE');
        }
        
        referrerId = referrer.id;
      }

      // 비밀번호 해싱
      const hashedPassword = await hashPassword(password);
      
      // 고유한 추천인 코드 생성
      let userReferralCode = generateRandomCode(8);
      while (await prisma.user.findUnique({ where: { referralCode: userReferralCode } })) {
        userReferralCode = generateRandomCode(8);
      }

      // 회원가입 처리
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          phone,
          referralCode: userReferralCode,
          referredBy: referrerId,
          credits: 0, // 초기값 0으로 설정, 이후 CreditService로 지급
        },
        select: {
          id: true,
          email: true,
          name: true,
          referralCode: true,
          credits: true,
          subscriptionType: true,
          createdAt: true,
        },
      });

      // 가입 보너스 크레딧 지급
      const signupBonus = referrerId ? 5 : 3; // 추천인 있으면 5개, 없으면 3개
      await CreditService.awardCredits({
        userId: user.id,
        type: 'SIGNUP_BONUS',
        amount: signupBonus,
        reason: '회원가입 보너스',
        description: referrerId ? '추천인을 통한 가입 보너스' : '일반 가입 보너스',
        relatedId: user.id,
        relatedType: 'user_registration',
      });

      // 추천인에게 보상 지급
      if (referrerId) {
        await CreditService.awardCredits({
          userId: referrerId,
          type: 'REFERRAL_BONUS',
          amount: 2,
          reason: '추천인 보상',
          description: `새로운 사용자 추천 완료: ${user.email}`,
          relatedId: user.id,
          relatedType: 'user_referral',
        });

        // 추천 완료 로그
        await prisma.activityLog.create({
          data: {
            userId: referrerId,
            action: 'referral_completed',
            description: `새로운 사용자 추천 완료: ${user.email}`,
            metadata: {
              referredUserId: user.id,
              creditsAwarded: 2,
            },
          },
        });
      }

      // JWT 토큰 생성
      const tokens = generateTokens(user.id);

      // 가입 완료 로그
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'user_registered',
          description: '신규 회원가입 완료',
          metadata: {
            hasReferrer: !!referrerId,
            initialCredits: user.credits,
          },
        },
      });

      logger.logEvent('user_registered', {
        userId: user.id,
        email: user.email,
        hasReferrer: !!referrerId,
        initialCredits: user.credits,
      }, user.id);

      res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: {
          user,
          tokens,
        },
      });

    } catch (error) {
      logger.error('Registration failed', { email, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/auth/login
 * 로그인
 */
router.post('/login',
  validateRequest({
    body: authSchemas.login
  }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
      // 사용자 조회
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          isActive: true,
          subscriptionType: true,
          credits: true,
          paidCredits: true,
          lastLoginAt: true,
        },
      });

      if (!user) {
        throw createError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다.', 'INVALID_CREDENTIALS');
      }

      if (!user.isActive) {
        throw createError.forbidden('비활성화된 계정입니다.', 'ACCOUNT_DEACTIVATED');
      }

      // 비밀번호 확인
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        throw createError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다.', 'INVALID_CREDENTIALS');
      }

      // JWT 토큰 생성
      const tokens = generateTokens(user.id);

      // 마지막 로그인 시간 업데이트
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // 로그인 로그
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'user_login',
          description: '로그인 성공',
        },
      });

      logger.logEvent('user_login', {
        userId: user.id,
        email: user.email,
        lastLoginAt: user.lastLoginAt,
      }, user.id);

      // 로그인 퀘스트 진행 상황 업데이트 (비동기, 에러시 무시)
      QuestService.updateQuestProgress(user.id, QuestType.LOGIN, 1, {
        loginTime: new Date(),
        source: 'login_api',
      }).catch(error => {
        logger.warn('Login quest update failed', { userId: user.id, error });
      });

      // 사용자 정보 (비밀번호 제외)
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: '로그인이 완료되었습니다.',
        data: {
          user: {
            ...userWithoutPassword,
            totalCredits: user.credits + user.paidCredits,
          },
          tokens,
        },
      });

    } catch (error) {
      logger.error('Login failed', { email, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/auth/refresh
 * 토큰 갱신
 */
router.post('/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError.badRequest('리프레시 토큰이 필요합니다.', 'REFRESH_TOKEN_REQUIRED');
    }

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      if (decoded.type !== 'refresh') {
        throw createError.unauthorized('유효하지 않은 리프레시 토큰입니다.', 'INVALID_REFRESH_TOKEN');
      }

      // 사용자 확인
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw createError.unauthorized('유효하지 않은 사용자입니다.', 'INVALID_USER');
      }

      // 새로운 토큰 생성
      const tokens = generateTokens(user.id);

      res.json({
        success: true,
        message: '토큰이 갱신되었습니다.',
        data: { tokens },
      });

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw createError.unauthorized('리프레시 토큰이 만료되었습니다.', 'REFRESH_TOKEN_EXPIRED');
      }
      throw createError.unauthorized('토큰 갱신에 실패했습니다.', 'REFRESH_FAILED');
    }
  })
);

/**
 * POST /api/v1/auth/logout
 * 로그아웃 (토큰 무효화는 클라이언트에서 처리)
 */
router.post('/logout',
  optionalAuthMiddleware,
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (userId) {
      // 로그아웃 로그
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'user_logout',
          description: '로그아웃 완료',
        },
      });

      logger.logEvent('user_logout', { userId }, userId);
    }

    res.json({
      success: true,
      message: '로그아웃이 완료되었습니다.',
    });
  })
);

/**
 * GET /api/v1/auth/check
 * 인증 상태 확인
 */
router.get('/check',
  optionalAuthMiddleware,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.json({
        success: false,
        message: '인증되지 않은 사용자입니다.',
        data: { authenticated: false },
      });
    }

    // 최신 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        subscriptionType: true,
        credits: true,
        paidCredits: true,
        lastLoginAt: true,
      },
    });

    if (!user || !user.isActive) {
      return res.json({
        success: false,
        message: '유효하지 않은 사용자입니다.',
        data: { authenticated: false },
      });
    }

    res.json({
      success: true,
      message: '인증된 사용자입니다.',
      data: {
        authenticated: true,
        user: {
          ...user,
          totalCredits: user.credits + user.paidCredits,
        },
      },
    });
  })
);

export default router;