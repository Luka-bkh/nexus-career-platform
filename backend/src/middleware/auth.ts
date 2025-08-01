import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/environment';
import { createError } from './errorHandler';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// 사용자 인터페이스 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        subscriptionType: string;
        credits: number;
        isActive: boolean;
      };
    }
  }
}

// JWT 토큰 검증 및 디코드
const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

// 메인 인증 미들웨어
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Authorization 헤더 확인
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw createError.unauthorized('인증 토큰이 필요합니다.');
    }

    // Bearer 토큰 추출
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      throw createError.unauthorized('유효하지 않은 토큰 형식입니다.');
    }

    // 토큰 검증
    const decoded = await verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      throw createError.unauthorized('유효하지 않은 토큰입니다.');
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        subscriptionType: true,
        credits: true,
        paidCredits: true,
        isActive: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw createError.unauthorized('사용자를 찾을 수 없습니다.');
    }

    if (!user.isActive) {
      throw createError.forbidden('비활성화된 계정입니다.');
    }

    // 요청 객체에 사용자 정보 추가
    req.user = {
      id: user.id,
      email: user.email,
      subscriptionType: user.subscriptionType,
      credits: user.credits + user.paidCredits,
      isActive: user.isActive,
    };

    // 마지막 로그인 시간 업데이트 (1시간 이상 지난 경우만)
    const lastLogin = user.lastLoginAt;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    if (!lastLogin || lastLogin < oneHourAgo) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    logger.info('User authenticated', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
    });

    next();
  } catch (error) {
    next(error);
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return next();
    }

    const decoded = await verifyToken(token);
    
    if (decoded && decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          subscriptionType: true,
          credits: true,
          paidCredits: true,
          isActive: true,
        },
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          subscriptionType: user.subscriptionType,
          credits: user.credits + user.paidCredits,
          isActive: user.isActive,
        };
      }
    }

    next();
  } catch (error) {
    // 선택적 인증에서는 에러를 무시하고 통과
    next();
  }
};

// 관리자 권한 확인 미들웨어
export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError.unauthorized('인증이 필요합니다.');
    }

    // 관리자 이메일 확인 (환경변수로 관리)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    
    if (!adminEmails.includes(req.user.email)) {
      throw createError.forbidden('관리자 권한이 필요합니다.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// 크레딧 확인 미들웨어
export const checkCredits = (requiredCredits: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw createError.unauthorized('인증이 필요합니다.');
      }

      if (req.user.credits < requiredCredits) {
        throw createError.forbidden(`크레딧이 부족합니다. (필요: ${requiredCredits}, 보유: ${req.user.credits})`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// 구독 타입 확인 미들웨어
export const checkSubscription = (allowedTypes: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw createError.unauthorized('인증이 필요합니다.');
      }

      if (!allowedTypes.includes(req.user.subscriptionType)) {
        throw createError.forbidden('구독 업그레이드가 필요합니다.');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};