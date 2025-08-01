import express from 'express';
import { PrismaClient, InteractionType, QuestType } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { checkCredits } from '../middleware/auth';
import { SimulationEngine } from '../services/SimulationEngine';
import { SimulationReportService } from '../services/SimulationReportService';
import { CreditService } from '../services/CreditService';
import { QuestService } from '../services/QuestService';
import Joi from 'joi';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/v1/simulation/start
 * 시뮬레이션 시작
 */
router.post('/start',
  validateRequest({
    body: Joi.object({
      simulationId: Joi.string().required().messages({
        'any.required': '시뮬레이션 ID는 필수입니다.',
        'string.empty': '시뮬레이션 ID는 필수입니다.',
      }),
      difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').default('intermediate'),
      personalizations: Joi.object().default({}),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { simulationId, difficulty, personalizations } = req.body;

    try {
      const result = await SimulationEngine.startSimulation({
        userId,
        simulationId,
        difficulty,
        personalizations,
      });

      res.json({
        success: true,
        message: result.message,
        data: result,
      });

    } catch (error) {
      logger.error('Simulation start failed', { userId, simulationId, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/simulation/:sessionId/interact
 * 시뮬레이션 상호작용 처리
 */
router.post('/:sessionId/interact',
  validateRequest({
    params: Joi.object({
      sessionId: Joi.string().required(),
    }),
    body: Joi.object({
      questId: Joi.string().required().messages({
        'any.required': '퀘스트 ID는 필수입니다.',
      }),
      interactionType: Joi.string().valid(...Object.values(InteractionType)).required().messages({
        'any.required': '상호작용 타입은 필수입니다.',
        'any.only': '유효하지 않은 상호작용 타입입니다.',
      }),
      userInput: Joi.object().required().messages({
        'any.required': '사용자 입력은 필수입니다.',
      }),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    const { questId, interactionType, userInput } = req.body;

    try {
      const result = await SimulationEngine.processInteraction({
        sessionId,
        questId,
        interactionType,
        userInput,
        userId,
      });

      res.json({
        success: true,
        message: '상호작용이 처리되었습니다.',
        data: result,
      });

    } catch (error) {
      logger.error('Simulation interaction failed', { userId, sessionId, questId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/simulation/:sessionId/state
 * 시뮬레이션 상태 조회
 */
router.get('/:sessionId/state',
  validateRequest({
    params: Joi.object({
      sessionId: Joi.string().required(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    try {
      const state = await SimulationEngine.getSimulationState(sessionId, userId);

      res.json({
        success: true,
        message: '시뮬레이션 상태를 조회했습니다.',
        data: state,
      });

    } catch (error) {
      logger.error('Simulation state retrieval failed', { userId, sessionId, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/simulation/:sessionId/pause
 * 시뮬레이션 일시정지
 */
router.post('/:sessionId/pause',
  validateRequest({
    params: Joi.object({
      sessionId: Joi.string().required(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    try {
      await SimulationEngine.pauseSimulation(sessionId, userId);

      res.json({
        success: true,
        message: '시뮬레이션이 일시정지되었습니다.',
        data: { sessionId, status: 'paused' },
      });

    } catch (error) {
      logger.error('Simulation pause failed', { userId, sessionId, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/simulation/:sessionId/resume
 * 시뮬레이션 재개
 */
router.post('/:sessionId/resume',
  validateRequest({
    params: Joi.object({
      sessionId: Joi.string().required(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    try {
      const result = await SimulationEngine.resumeSimulation(sessionId, userId);

      res.json({
        success: true,
        message: result.message,
        data: result,
      });

    } catch (error) {
      logger.error('Simulation resume failed', { userId, sessionId, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/simulation/:sessionId/complete
 * 시뮬레이션 완료 처리
 */
router.post('/:sessionId/complete',
  validateRequest({
    params: Joi.object({
      sessionId: Joi.string().required(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    try {
      const result = await SimulationEngine.completeSimulation(sessionId, userId);

      res.json({
        success: true,
        message: result.message,
        data: result,
      });

    } catch (error) {
      logger.error('Simulation completion failed', { userId, sessionId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/simulation/scenarios
 * 사용 가능한 시뮬레이션 시나리오 목록 조회
 */
router.get('/scenarios',
  asyncHandler(async (req, res) => {
    try {
      // 시나리오 목록 (실제로는 파일 시스템이나 DB에서 조회)
      const scenarios = [
        {
          id: 'ai-developer-001',
          title: 'AI 개발자 실무 체험',
          description: '스타트업에서 AI 개발자로 첫 출근! 실제 프로젝트를 통해 AI 개발자의 업무를 체험해보세요.',
          duration: '45-60분',
          difficulty: 'intermediate',
          creditsRequired: 2,
          tags: ['ai', 'machine-learning', 'python', 'data-science', 'startup'],
          thumbnail: '/images/scenarios/ai-developer-thumbnail.jpg',
          learningObjectives: [
            'AI 개발자의 일상 업무 이해',
            '머신러닝 프로젝트 수행 과정 체험',
            '팀 협업 및 커뮤니케이션 경험',
            '데이터 분석 및 모델 구축 프로세스 학습'
          ],
          prerequisites: [
            '기본적인 프로그래밍 개념',
            'Python 기초 문법 (권장)',
            '머신러닝 입문 수준 (선택)'
          ],
          completionStats: {
            totalPlayers: 1247,
            averageScore: 76.5,
            completionRate: 84.2
          }
        }
      ];

      res.json({
        success: true,
        message: '시뮬레이션 시나리오 목록을 조회했습니다.',
        data: {
          scenarios,
          total: scenarios.length,
        },
      });

    } catch (error) {
      logger.error('Scenario list retrieval failed', { error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/simulation/scenarios/:scenarioId
 * 특정 시뮬레이션 시나리오 상세 정보
 */
router.get('/scenarios/:scenarioId',
  validateRequest({
    params: Joi.object({
      scenarioId: Joi.string().required(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { scenarioId } = req.params;

    try {
      // 실제로는 파일 시스템이나 DB에서 조회
      if (scenarioId !== 'ai-developer-001') {
        throw createError.notFound('시나리오를 찾을 수 없습니다.');
      }

      const scenarioDetail = {
        id: 'ai-developer-001',
        title: 'AI 개발자 실무 체험',
        description: '스타트업에서 AI 개발자로 첫 출근! 실제 프로젝트를 통해 AI 개발자의 업무를 체험해보세요.',
        fullDescription: '실제 AI 개발자의 하루를 생생하게 체험할 수 있는 몰입형 시뮬레이션입니다. 스타트업 환경에서 감정 분석 프로젝트를 진행하며, 데이터 수집부터 모델 배포까지의 전체 과정을 경험할 수 있습니다.',
        duration: '45-60분',
        difficulty: 'intermediate',
        creditsRequired: 2,
        chapters: [
          {
            id: 'chapter-1',
            title: '첫 출근과 팀 미팅',
            description: '새로운 프로젝트가 시작되었습니다. 팀 미팅에서 역할을 분담받고 계획을 세워보세요.',
            estimatedTime: '10-12분'
          },
          {
            id: 'chapter-2',
            title: '데이터 분석 및 탐색',
            description: '실제 리뷰 데이터를 분석하고 문제점을 파악해보세요.',
            estimatedTime: '15-18분'
          },
          {
            id: 'chapter-3',
            title: '모델 개발과 실험',
            description: '감정 분석 모델을 직접 구축하고 성능을 개선해보세요.',
            estimatedTime: '15-20분'
          },
          {
            id: 'chapter-4',
            title: '배포와 모니터링',
            description: '완성된 모델을 실제 서비스에 배포하고 성능을 모니터링해보세요.',
            estimatedTime: '10-15분'
          },
          {
            id: 'chapter-5',
            title: '성과 평가 및 피드백',
            description: '프로젝트를 마무리하고 팀과 함께 성과를 평가해보세요.',
            estimatedTime: '8-10분'
          }
        ],
        learningObjectives: [
          'AI 개발자의 일상 업무 이해',
          '머신러닝 프로젝트 수행 과정 체험',
          '팀 협업 및 커뮤니케이션 경험',
          '데이터 분석 및 모델 구축 프로세스 학습',
          'AI 프로젝트의 도전과 해결 방법 이해'
        ],
        skillsGained: [
          { name: '데이터 사이언스', description: '데이터 수집, 전처리, 분석 기법' },
          { name: '머신러닝', description: '모델 선택, 튜닝, 평가 방법' },
          { name: '팀워크', description: '개발팀 내 협업 및 소통' },
          { name: '문제 해결', description: '체계적 접근과 창의적 사고' },
          { name: '비즈니스 이해', description: 'AI 프로젝트의 비즈니스 가치' }
        ],
        prerequisites: [
          '기본적인 프로그래밍 개념',
          'Python 기초 문법 (권장)',
          '머신러닝 입문 수준 (선택)'
        ],
        gameFeatures: [
          '실시간 AI 피드백',
          '개인별 맞춤 시나리오',
          '스킬 레벨업 시스템',
          '성취 배지 시스템',
          '상세한 성과 분석'
        ],
        completionStats: {
          totalPlayers: 1247,
          averageScore: 76.5,
          completionRate: 84.2,
          averagePlayTime: 52.3,
          topPerformers: [
            { name: '김**', score: 98, grade: 'A+' },
            { name: '이**', score: 95, grade: 'A+' },
            { name: '박**', score: 93, grade: 'A' }
          ]
        },
        reviews: [
          {
            userId: '****',
            rating: 5,
            comment: '실제 업무와 너무 비슷해서 놀랐어요. AI 개발자가 어떤 일을 하는지 확실히 알게 됐습니다.',
            date: '2025-01-15'
          },
          {
            userId: '****',
            rating: 4,
            comment: '팀워크 부분이 특히 현실적이었어요. 게임처럼 재미있게 배울 수 있어서 좋았습니다.',
            date: '2025-01-10'
          }
        ]
      };

      res.json({
        success: true,
        message: '시나리오 상세 정보를 조회했습니다.',
        data: scenarioDetail,
      });

    } catch (error) {
      logger.error('Scenario detail retrieval failed', { scenarioId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/simulation/sessions
 * 사용자의 시뮬레이션 세션 목록 조회
 */
router.get('/sessions',
  validateRequest({
    query: Joi.object({
      status: Joi.string().valid('all', 'in_progress', 'completed', 'paused').default('all'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(10),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { status, page, limit } = req.query;

    try {
      const skip = (page - 1) * limit;
      const whereClause: any = { userId };

      if (status !== 'all') {
        whereClause.status = status.toUpperCase();
      }

      const [sessions, total] = await Promise.all([
        prisma.simulationSession.findMany({
          where: whereClause,
          orderBy: { startedAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            simulationId: true,
            status: true,
            progress: true,
            totalScore: true,
            startedAt: true,
            lastActiveAt: true,
            completedAt: true,
            result: {
              select: {
                finalScore: true,
                grade: true,
              },
            },
          },
        }),
        prisma.simulationSession.count({
          where: whereClause,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        message: '시뮬레이션 세션 목록을 조회했습니다.',
        data: {
          sessions,
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
      logger.error('Simulation sessions retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/simulation/results/:resultId
 * 시뮬레이션 결과 상세 조회
 */
router.get('/results/:resultId',
  validateRequest({
    params: Joi.object({
      resultId: Joi.string().required(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { resultId } = req.params;

    try {
      const result = await prisma.finalSimulationResult.findFirst({
        where: {
          id: resultId,
          userId,
        },
        include: {
          session: {
            select: {
              simulationId: true,
              totalPlayTime: true,
              badges: true,
              skillLevels: true,
            },
          },
        },
      });

      if (!result) {
        throw createError.notFound('시뮬레이션 결과를 찾을 수 없습니다.');
      }

      res.json({
        success: true,
        message: '시뮬레이션 결과를 조회했습니다.',
        data: result,
      });

    } catch (error) {
      logger.error('Simulation result retrieval failed', { userId, resultId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/simulation/:sessionId/report
 * 시뮬레이션 상세 리포트 생성 및 조회
 */
router.get('/:sessionId/report',
  validateRequest({
    params: Joi.object({
      sessionId: Joi.string().required(),
    }),
    query: Joi.object({
      refresh: Joi.boolean().default(false),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    const { refresh } = req.query;

    try {
      const report = await SimulationReportService.generateReport(sessionId, userId);

      res.json({
        success: true,
        message: '시뮬레이션 리포트를 생성했습니다.',
        data: report,
      });

    } catch (error) {
      logger.error('Simulation report generation failed', { userId, sessionId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/simulation/:sessionId/report/summary
 * 시뮬레이션 리포트 요약 조회
 */
router.get('/:sessionId/report/summary',
  validateRequest({
    params: Joi.object({
      sessionId: Joi.string().required(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    try {
      const report = await SimulationReportService.generateReport(sessionId, userId);
      const summary = SimulationReportService.generateReportSummary(report);

      res.json({
        success: true,
        message: '리포트 요약을 조회했습니다.',
        data: summary,
      });

    } catch (error) {
      logger.error('Report summary retrieval failed', { userId, sessionId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/simulation/leaderboard/:scenarioId
 * 시뮬레이션 리더보드 조회
 */
router.get('/leaderboard/:scenarioId',
  validateRequest({
    params: Joi.object({
      scenarioId: Joi.string().required(),
    }),
    query: Joi.object({
      period: Joi.string().valid('all', 'week', 'month').default('all'),
      limit: Joi.number().integer().min(1).max(100).default(20),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { scenarioId } = req.params;
    const { period, limit } = req.query;

    try {
      let dateFilter = {};
      
      if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = { completedAt: { gte: weekAgo } };
      } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = { completedAt: { gte: monthAgo } };
      }

      const topResults = await prisma.finalSimulationResult.findMany({
        where: {
          session: {
            simulationId: scenarioId,
          },
          ...dateFilter,
        },
        orderBy: { finalScore: 'desc' },
        take: limit,
        select: {
          finalScore: true,
          grade: true,
          completedAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // 사용자 이름 마스킹
      const maskedResults = topResults.map((result, index) => ({
        rank: index + 1,
        userName: result.user.name.charAt(0) + '*'.repeat(result.user.name.length - 1),
        finalScore: result.finalScore,
        grade: result.grade,
        completedAt: result.completedAt,
      }));

      res.json({
        success: true,
        message: '리더보드를 조회했습니다.',
        data: {
          leaderboard: maskedResults,
          period,
          total: maskedResults.length,
        },
      });

    } catch (error) {
      logger.error('Leaderboard retrieval failed', { scenarioId, error });
      throw error;
    }
  })
);

export default router;