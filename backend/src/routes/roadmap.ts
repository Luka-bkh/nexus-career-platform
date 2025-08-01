import express from 'express';
import { PrismaClient, RoadmapDifficulty } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';
import { CareerRoadmapService } from '../services/CareerRoadmapService';
import Joi from 'joi';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// 모든 라우트에 인증 필요
router.use(requireAuth);

/**
 * POST /api/v1/roadmap/generate
 * 개인화된 진로 로드맵 생성
 */
router.post('/generate',
  validateRequest({
    body: Joi.object({
      targetRole: Joi.string().optional().valid(
        'AI 개발자',
        '데이터 사이언티스트',
        'ML 엔지니어',
        '소프트웨어 엔지니어',
        '프로덕트 매니저',
        '기술 컨설턴트'
      ),
      difficulty: Joi.string().optional().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
      forceRegenerate: Joi.boolean().default(false),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { targetRole, difficulty, forceRegenerate } = req.body;

    try {
      const roadmap = await CareerRoadmapService.generateRoadmap(userId, {
        targetRole,
        difficulty: difficulty as RoadmapDifficulty,
        forceRegenerate,
      });

      res.status(201).json({
        success: true,
        message: '개인화된 진로 로드맵이 생성되었습니다.',
        data: roadmap,
      });

    } catch (error) {
      logger.error('Roadmap generation API failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/roadmap/active
 * 사용자의 활성 로드맵 조회
 */
router.get('/active',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    try {
      const activeRoadmap = await CareerRoadmapService.getActiveRoadmap(userId);

      if (!activeRoadmap) {
        return res.json({
          success: true,
          message: '활성 로드맵이 없습니다.',
          data: null,
        });
      }

      const roadmap = await CareerRoadmapService.getRoadmapById(activeRoadmap.id, userId);

      res.json({
        success: true,
        message: '활성 로드맵을 조회했습니다.',
        data: roadmap,
      });

    } catch (error) {
      logger.error('Active roadmap retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/roadmap/list
 * 사용자의 모든 로드맵 목록 조회
 */
router.get('/list',
  validateRequest({
    query: Joi.object({
      includeInactive: Joi.boolean().default(false),
      limit: Joi.number().integer().min(1).max(50).default(10),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { includeInactive, limit } = req.query;

    try {
      const roadmaps = await CareerRoadmapService.getUserRoadmaps(userId, {
        includeInactive,
        limit,
      });

      res.json({
        success: true,
        message: '로드맵 목록을 조회했습니다.',
        data: {
          roadmaps,
          total: roadmaps.length,
        },
      });

    } catch (error) {
      logger.error('Roadmap list retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/roadmap/:roadmapId
 * 특정 로드맵 상세 조회
 */
router.get('/:roadmapId',
  validateRequest({
    params: Joi.object({
      roadmapId: Joi.string().required(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { roadmapId } = req.params;

    try {
      const roadmap = await CareerRoadmapService.getRoadmapById(roadmapId, userId);

      res.json({
        success: true,
        message: '로드맵 상세 정보를 조회했습니다.',
        data: roadmap,
      });

    } catch (error) {
      logger.error('Roadmap detail retrieval failed', { userId, roadmapId, error });
      throw error;
    }
  })
);

/**
 * PUT /api/v1/roadmap/:roadmapId/progress
 * 로드맵 진행상황 업데이트
 */
router.put('/:roadmapId/progress',
  validateRequest({
    params: Joi.object({
      roadmapId: Joi.string().required(),
    }),
    body: Joi.object({
      phaseId: Joi.string().optional(),
      milestoneId: Joi.string().optional(),
      isCompleted: Joi.boolean().optional(),
      customProgress: Joi.number().min(0).max(1).optional(),
    }).or('phaseId', 'milestoneId', 'customProgress'),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { roadmapId } = req.params;
    const progressData = req.body;

    try {
      const updatedRoadmap = await CareerRoadmapService.updateProgress(userId, progressData);

      res.json({
        success: true,
        message: '진행상황이 업데이트되었습니다.',
        data: updatedRoadmap,
      });

    } catch (error) {
      logger.error('Roadmap progress update failed', { userId, roadmapId, progressData, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/roadmap/:roadmapId/adapt
 * 로드맵 적응형 업데이트
 */
router.post('/:roadmapId/adapt',
  validateRequest({
    params: Joi.object({
      roadmapId: Joi.string().required(),
    }),
    body: Joi.object({
      trigger: Joi.string().required().valid('new_simulation', 'skill_update', 'goal_change'),
      reason: Joi.string().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { roadmapId } = req.params;
    const { trigger, reason } = req.body;

    try {
      const adaptedRoadmap = await CareerRoadmapService.adaptRoadmap(userId, trigger);

      res.json({
        success: true,
        message: '로드맵이 새로운 데이터에 맞춰 적응되었습니다.',
        data: adaptedRoadmap,
      });

    } catch (error) {
      logger.error('Roadmap adaptation failed', { userId, roadmapId, trigger, error });
      throw error;
    }
  })
);

/**
 * DELETE /api/v1/roadmap/:roadmapId
 * 로드맵 삭제
 */
router.delete('/:roadmapId',
  validateRequest({
    params: Joi.object({
      roadmapId: Joi.string().required(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { roadmapId } = req.params;

    try {
      await CareerRoadmapService.deleteRoadmap(roadmapId, userId);

      res.json({
        success: true,
        message: '로드맵이 삭제되었습니다.',
      });

    } catch (error) {
      logger.error('Roadmap deletion failed', { userId, roadmapId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/roadmap/stats
 * 사용자 로드맵 통계 조회
 */
router.get('/stats',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    try {
      const stats = await CareerRoadmapService.getRoadmapStats(userId);

      res.json({
        success: true,
        message: '로드맵 통계를 조회했습니다.',
        data: stats,
      });

    } catch (error) {
      logger.error('Roadmap stats retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/roadmap/:roadmapId/summary
 * 로드맵 요약 정보 조회
 */
router.get('/:roadmapId/summary',
  validateRequest({
    params: Joi.object({
      roadmapId: Joi.string().required(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { roadmapId } = req.params;

    try {
      const roadmap = await CareerRoadmapService.getRoadmapById(roadmapId, userId);
      const summary = CareerRoadmapService.generateRoadmapSummary(roadmap);

      res.json({
        success: true,
        message: '로드맵 요약을 조회했습니다.',
        data: summary,
      });

    } catch (error) {
      logger.error('Roadmap summary retrieval failed', { userId, roadmapId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/roadmap/:roadmapId/phases/:phaseId
 * 특정 단계 상세 조회
 */
router.get('/:roadmapId/phases/:phaseId',
  validateRequest({
    params: Joi.object({
      roadmapId: Joi.string().required(),
      phaseId: Joi.string().required(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { roadmapId, phaseId } = req.params;

    try {
      const roadmap = await CareerRoadmapService.getRoadmapById(roadmapId, userId);
      const phase = roadmap.phases.find(p => p.id === phaseId);

      if (!phase) {
        throw createError.notFound('해당 단계를 찾을 수 없습니다.');
      }

      res.json({
        success: true,
        message: '단계 상세 정보를 조회했습니다.',
        data: phase,
      });

    } catch (error) {
      logger.error('Phase detail retrieval failed', { userId, roadmapId, phaseId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/roadmap/:roadmapId/milestones/:milestoneId
 * 특정 마일스톤 상세 조회
 */
router.get('/:roadmapId/milestones/:milestoneId',
  validateRequest({
    params: Joi.object({
      roadmapId: Joi.string().required(),
      milestoneId: Joi.string().required(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { roadmapId, milestoneId } = req.params;

    try {
      const roadmap = await CareerRoadmapService.getRoadmapById(roadmapId, userId);
      
      let milestone = null;
      for (const phase of roadmap.phases) {
        milestone = phase.milestones.find(m => m.id === milestoneId);
        if (milestone) {
          milestone = { ...milestone, phase: phase.title };
          break;
        }
      }

      if (!milestone) {
        throw createError.notFound('해당 마일스톤을 찾을 수 없습니다.');
      }

      res.json({
        success: true,
        message: '마일스톤 상세 정보를 조회했습니다.',
        data: milestone,
      });

    } catch (error) {
      logger.error('Milestone detail retrieval failed', { userId, roadmapId, milestoneId, error });
      throw error;
    }
  })
);

/**
 * PUT /api/v1/roadmap/:roadmapId/milestones/:milestoneId/complete
 * 마일스톤 완료 처리
 */
router.put('/:roadmapId/milestones/:milestoneId/complete',
  validateRequest({
    params: Joi.object({
      roadmapId: Joi.string().required(),
      milestoneId: Joi.string().required(),
    }),
    body: Joi.object({
      notes: Joi.string().optional(),
      evidence: Joi.string().optional(), // 완료 증빙 (링크, 설명 등)
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { roadmapId, milestoneId } = req.params;
    const { notes, evidence } = req.body;

    try {
      const updatedRoadmap = await CareerRoadmapService.updateProgress(userId, {
        milestoneId,
        isCompleted: true,
      });

      // 완료 로그 기록
      logger.logEvent('milestone_completed', {
        userId,
        roadmapId,
        milestoneId,
        notes,
        evidence,
      }, userId);

      res.json({
        success: true,
        message: '마일스톤이 완료 처리되었습니다.',
        data: updatedRoadmap,
      });

    } catch (error) {
      logger.error('Milestone completion failed', { userId, roadmapId, milestoneId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/roadmap/templates
 * 로드맵 템플릿 목록 조회 (참고용)
 */
router.get('/templates',
  validateRequest({
    query: Joi.object({
      role: Joi.string().optional(),
      difficulty: Joi.string().optional().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { role, difficulty } = req.query;

    try {
      // 기본 템플릿 정보 제공 (실제로는 별도 서비스에서 관리)
      const templates = [
        {
          id: 'ai-developer-beginner',
          title: '기초부터 시작하는 AI 개발자',
          targetRole: 'AI 개발자',
          difficulty: 'BEGINNER',
          estimatedDuration: 14,
          phaseCount: 5,
          description: '프로그래밍 기초부터 AI 개발까지 체계적으로 학습',
          prerequisites: ['기본적인 수학 지식'],
          outcomes: ['주니어 AI 개발자 취업', 'ML 모델 구현 능력', '포트폴리오 3개 완성'],
        },
        {
          id: 'data-scientist-intermediate',
          title: '실무 중심의 데이터 사이언티스트',
          targetRole: '데이터 사이언티스트',
          difficulty: 'INTERMEDIATE',
          estimatedDuration: 10,
          phaseCount: 4,
          description: '비즈니스 문제 해결을 위한 데이터 사이언스 전문가 과정',
          prerequisites: ['Python 기초', '통계학 기본 지식'],
          outcomes: ['시니어 데이터 사이언티스트', '비즈니스 인사이트 도출', 'A/B 테스트 설계'],
        },
      ];

      // 필터링
      let filteredTemplates = templates;
      if (role) {
        filteredTemplates = filteredTemplates.filter(t => t.targetRole === role);
      }
      if (difficulty) {
        filteredTemplates = filteredTemplates.filter(t => t.difficulty === difficulty);
      }

      res.json({
        success: true,
        message: '로드맵 템플릿 목록을 조회했습니다.',
        data: {
          templates: filteredTemplates,
          total: filteredTemplates.length,
        },
      });

    } catch (error) {
      logger.error('Template retrieval failed', { role, difficulty, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/roadmap/:roadmapId/feedback
 * 로드맵에 대한 사용자 피드백 제출
 */
router.post('/:roadmapId/feedback',
  validateRequest({
    params: Joi.object({
      roadmapId: Joi.string().required(),
    }),
    body: Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      feedback: Joi.string().max(1000).optional(),
      suggestions: Joi.string().max(500).optional(),
      categories: Joi.array().items(
        Joi.string().valid('content', 'difficulty', 'resources', 'timeline', 'personalization')
      ).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { roadmapId } = req.params;
    const { rating, feedback, suggestions, categories } = req.body;

    try {
      // 피드백 저장 (실제로는 별도 테이블에 저장)
      logger.logEvent('roadmap_feedback', {
        userId,
        roadmapId,
        rating,
        feedback,
        suggestions,
        categories,
      }, userId);

      res.json({
        success: true,
        message: '피드백이 제출되었습니다. 더 나은 로드맵 제공을 위해 활용하겠습니다.',
      });

    } catch (error) {
      logger.error('Roadmap feedback submission failed', { userId, roadmapId, error });
      throw error;
    }
  })
);

export default router;