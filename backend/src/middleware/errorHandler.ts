import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger';
import { config } from '../config/environment';

// 커스텀 에러 클래스
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 에러 타입 검사 함수들
const isPrismaError = (error: any): error is Prisma.PrismaClientKnownRequestError => {
  return error instanceof Prisma.PrismaClientKnownRequestError;
};

const isValidationError = (error: any): boolean => {
  return error.name === 'ValidationError' || error.details;
};

const isJWTError = (error: any): boolean => {
  return error.name === 'JsonWebTokenError' || 
         error.name === 'TokenExpiredError' || 
         error.name === 'NotBeforeError';
};

// Prisma 에러 처리
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint failed
      const target = error.meta?.target as string[];
      const field = target?.[0] || 'field';
      return new AppError(`${field}이(가) 이미 존재합니다.`, 409, 'DUPLICATE_ENTRY');
      
    case 'P2025':
      // Record not found
      return new AppError('요청한 데이터를 찾을 수 없습니다.', 404, 'NOT_FOUND');
      
    case 'P2003':
      // Foreign key constraint failed
      return new AppError('관련 데이터가 존재하지 않습니다.', 400, 'INVALID_REFERENCE');
      
    case 'P2014':
      // Invalid ID
      return new AppError('잘못된 ID 형식입니다.', 400, 'INVALID_ID');
      
    default:
      logger.error('Unhandled Prisma Error', { code: error.code, meta: error.meta });
      return new AppError('데이터베이스 오류가 발생했습니다.', 500, 'DATABASE_ERROR');
  }
};

// JWT 에러 처리
const handleJWTError = (error: any): AppError => {
  switch (error.name) {
    case 'JsonWebTokenError':
      return new AppError('유효하지 않은 토큰입니다.', 401, 'INVALID_TOKEN');
    case 'TokenExpiredError':
      return new AppError('토큰이 만료되었습니다.', 401, 'TOKEN_EXPIRED');
    case 'NotBeforeError':
      return new AppError('토큰이 아직 활성화되지 않았습니다.', 401, 'TOKEN_NOT_ACTIVE');
    default:
      return new AppError('인증 오류가 발생했습니다.', 401, 'AUTH_ERROR');
  }
};

// 유효성 검사 에러 처리
const handleValidationError = (error: any): AppError => {
  if (error.details) {
    // Joi validation error
    const message = error.details.map((detail: any) => detail.message).join(', ');
    return new AppError(`입력값 검증 실패: ${message}`, 400, 'VALIDATION_ERROR');
  }
  
  return new AppError('입력값이 올바르지 않습니다.', 400, 'VALIDATION_ERROR');
};

// 에러 응답 포맷
const sendErrorResponse = (error: AppError, res: Response) => {
  const errorResponse: any = {
    success: false,
    error: {
      message: error.message,
      code: error.code,
    },
  };

  // 개발 환경에서는 스택 트레이스 포함
  if (config.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
  }

  res.status(error.statusCode).json(errorResponse);
};

// 메인 에러 핸들러
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let handledError: AppError;

  // 이미 처리된 에러인지 확인
  if (error instanceof AppError) {
    handledError = error;
  }
  // Prisma 에러 처리
  else if (isPrismaError(error)) {
    handledError = handlePrismaError(error);
  }
  // JWT 에러 처리
  else if (isJWTError(error)) {
    handledError = handleJWTError(error);
  }
  // 유효성 검사 에러 처리
  else if (isValidationError(error)) {
    handledError = handleValidationError(error);
  }
  // 일반 에러 처리
  else {
    handledError = new AppError(
      config.NODE_ENV === 'production' 
        ? '서버 내부 오류가 발생했습니다.' 
        : error.message,
      500,
      'INTERNAL_ERROR'
    );
  }

  // 에러 로깅
  logger.logError(error, req);

  // 5xx 에러는 별도 알림 (프로덕션 환경에서 모니터링 시스템 연동)
  if (handledError.statusCode >= 500) {
    logger.error('Server Error', {
      error: handledError,
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        userId: (req as any).user?.id,
      },
    });
  }

  sendErrorResponse(handledError, res);
};

// 비동기 함수 래퍼 (에러 자동 처리)
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 공통 에러 생성 함수들
export const createError = {
  badRequest: (message: string, code?: string) => new AppError(message, 400, code),
  unauthorized: (message: string = '인증이 필요합니다.', code?: string) => new AppError(message, 401, code),
  forbidden: (message: string = '접근 권한이 없습니다.', code?: string) => new AppError(message, 403, code),
  notFound: (message: string = '요청한 리소스를 찾을 수 없습니다.', code?: string) => new AppError(message, 404, code),
  conflict: (message: string, code?: string) => new AppError(message, 409, code),
  internal: (message: string = '서버 내부 오류가 발생했습니다.', code?: string) => new AppError(message, 500, code),
  tooManyRequests: (message: string = '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.', code?: string) => new AppError(message, 429, code),
};