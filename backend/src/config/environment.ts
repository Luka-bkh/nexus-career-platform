import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

interface Config {
  // 서버 설정
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;
  
  // 데이터베이스 설정
  DATABASE_URL: string;
  REDIS_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_PASSWORD: string;
  REDIS_DB: string;
  
  // JWT 설정
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  
  // 암호화 설정
  ENCRYPTION_KEY: string;
  ENCRYPTION_ALGORITHM: string;
  
  // CORS 설정
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string[];
  
  // 로그 설정
  LOG_LEVEL: string;
  
  // AI 서비스 설정
  OPENAI_API_KEY?: string;
  
  // 레이트 리미팅
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
];

// 필수 환경 변수 검증
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// 암호화 키 길이 검증
if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
}

export const config: Config = {
  // 서버 설정
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  API_VERSION: process.env.API_VERSION || 'v1',
  
  // 데이터베이스 설정
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || '6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  REDIS_DB: process.env.REDIS_DB || '0',
  
  // JWT 설정
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // 암호화 설정
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
  ENCRYPTION_ALGORITHM: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
  
  // CORS 설정
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  
  // 로그 설정
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // AI 서비스 설정
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // 레이트 리미팅
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15분
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};

// 개발 환경 설정 로그
if (config.NODE_ENV === 'development') {
  console.log('🔧 Development Environment Configuration:');
  console.log(`  - Port: ${config.PORT}`);
  console.log(`  - API Version: ${config.API_VERSION}`);
  console.log(`  - Frontend URL: ${config.FRONTEND_URL}`);
  console.log(`  - Database: ${config.DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`);
  console.log(`  - Redis: ${config.REDIS_URL}`);
  console.log(`  - Log Level: ${config.LOG_LEVEL}`);
}

export default config;