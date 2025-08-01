import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// 요청 로깅 미들웨어
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // 요청 시작 로그
  logger.info('Request started', {
    method: req.method,
    url: req.originalUrl || req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
  });

  // 응답 완료 시 로그
  const originalSend = res.send;
  res.send = function(body: any) {
    const responseTime = Date.now() - startTime;
    
    // 커스텀 로깅 메서드 사용
    (logger as any).logRequest(req, res, responseTime);
    
    return originalSend.call(this, body);
  };

  next();
};