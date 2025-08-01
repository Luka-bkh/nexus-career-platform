import winston from 'winston';
import { config } from '../config/environment';

// 로그 포맷 설정
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 개발 환경용 콘솔 포맷
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}] ${message}`;
    
    // 메타데이터가 있으면 추가
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// 로거 생성
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'nexus-backend' },
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 일반 로그 파일
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 개발 환경에서는 콘솔에도 출력
if (config.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// 프로덕션 환경에서는 콘솔 출력 최소화
if (config.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      level: 'warn',
    })
  );
}

// HTTP 요청 로깅을 위한 커스텀 메서드
logger.logRequest = (req: any, res: any, responseTime: number) => {
  const logData = {
    method: req.method,
    url: req.originalUrl || req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || 'anonymous',
  };
  
  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

// 에러 로깅을 위한 커스텀 메서드
logger.logError = (error: Error, req?: any) => {
  const logData: any = {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
  };
  
  if (req) {
    logData.request = {
      method: req.method,
      url: req.originalUrl || req.url,
      headers: req.headers,
      body: req.body,
      userId: req.user?.id,
      ip: req.ip || req.connection.remoteAddress,
    };
  }
  
  logger.error('Application Error', logData);
};

// 비즈니스 이벤트 로깅을 위한 커스텀 메서드
logger.logEvent = (event: string, data: any, userId?: string) => {
  logger.info('Business Event', {
    event,
    data,
    userId,
    timestamp: new Date().toISOString(),
  });
};

export default logger;