import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware/auth';
import { validateRequest } from './middleware/validation';
import logger from './utils/logger';

// 라우트 import
import authRoutes from './routes/auth';
import onboardingRoutes from './routes/onboarding';
import careerRoutes from './routes/career';
import simulationRoutes from './routes/simulation';
import roadmapRoutes from './routes/roadmap';
import questRoutes from './routes/quest';
import userRoutes from './routes/user';

const app = express();

// 기본 미들웨어 설정
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());

app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 레이트 리미팅
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// JSON 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 요청 로깅
app.use(requestLogger);

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: config.API_VERSION,
    environment: config.NODE_ENV,
  });
});

// API 라우트
const apiRouter = express.Router();

// 공개 라우트
apiRouter.use('/auth', authRoutes);

// 인증 미들웨어 적용
apiRouter.use(authMiddleware);

// 보호된 라우트
apiRouter.use('/onboarding', onboardingRoutes);
apiRouter.use('/career', careerRoutes);
apiRouter.use('/simulation', simulationRoutes);
apiRouter.use('/roadmap', roadmapRoutes);
apiRouter.use('/quest', questRoutes);
apiRouter.use('/user', userRoutes);

app.use(`/api/${config.API_VERSION}`, apiRouter);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
const startServer = () => {
  const port = config.PORT;
  
  app.listen(port, () => {
    logger.info(`🚀 넥서스 백엔드 서버가 포트 ${port}에서 실행중입니다`);
    logger.info(`📝 환경: ${config.NODE_ENV}`);
    logger.info(`🔗 API 주소: http://localhost:${port}/api/${config.API_VERSION}`);
    logger.info(`💊 헬스체크: http://localhost:${port}/health`);
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// 처리되지 않은 에러 처리
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

export default app;