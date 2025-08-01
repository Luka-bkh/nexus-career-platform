import express from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';
import { QuestService } from '../services/QuestService';
import { QuestType } from '@prisma/client';
import Joi from 'joi';
import logger from '../utils/logger';

const router = express.Router();

// 모든 라우트에 인증 필요
router.use(requireAuth);

/**
 * GET /api/v1/quest/daily
 * 오늘의 일일 퀘스트 조회
 */
router.get('/daily',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    try {
      const dailyQuests = await QuestService.getTodayQuests(userId);

      res.json({
        success: true,
        message: '오늘의 퀘스트를 조회했습니다.',
        data: {
          quests: dailyQuests,
          total: dailyQuests.length,
          completed: dailyQuests.filter(q => q.isCompleted).length,
        },
      });

    } catch (error) {
      logger.error('Daily quests retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/quest/generate
 * 일일 퀘스트 생성/갱신 (수동)
 */
router.post('/generate',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    try {
      const quests = await QuestService.generateDailyQuests(userId);

      res.json({
        success: true,
        message: '일일 퀘스트가 생성되었습니다.',
        data: {
          quests,
          total: quests.length,
        },
      });

    } catch (error) {
      logger.error('Daily quest generation failed', { userId, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/quest/:questId/complete
 * 퀘스트 완료 처리
 */
router.post('/:questId/complete',
  validateRequest({
    params: Joi.object({
      questId: Joi.string().required(),
    }),
    body: Joi.object({
      metadata: Joi.object().optional(),
      notes: Joi.string().max(500).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { questId } = req.params;
    const { metadata, notes } = req.body;

    try {
      const result = await QuestService.completeQuest(userId, questId, {
        ...metadata,
        notes,
        completedBy: 'manual',
      });

      res.json({
        success: true,
        message: '퀘스트가 완료되었습니다!',
        data: result,
      });

    } catch (error) {
      logger.error('Quest completion failed', { userId, questId, error });
      throw error;
    }
  })
);

/**
 * PUT /api/v1/quest/:questId/progress
 * 퀘스트 진행 상황 업데이트
 */
router.put('/:questId/progress',
  validateRequest({
    params: Joi.object({
      questId: Joi.string().required(),
    }),
    body: Joi.object({
      increment: Joi.number().integer().min(1).default(1),
      metadata: Joi.object().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { questId } = req.params;
    const { increment, metadata } = req.body;

    try {
      // 퀘스트 정보 조회
      const userQuest = await QuestService.getTodayQuests(userId);
      const targetQuest = userQuest.find(q => q.questId === questId);

      if (!targetQuest) {
        throw createError.notFound('해당 퀘스트를 찾을 수 없습니다.');
      }

      // 진행 상황 업데이트
      await QuestService.updateQuestProgress(userId, targetQuest.quest.type, increment, metadata);

      // 업데이트된 퀘스트 정보 조회
      const updatedQuests = await QuestService.getTodayQuests(userId);
      const updatedQuest = updatedQuests.find(q => q.questId === questId);

      res.json({
        success: true,
        message: '퀘스트 진행 상황이 업데이트되었습니다.',
        data: updatedQuest,
      });

    } catch (error) {
      logger.error('Quest progress update failed', { userId, questId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/quest/stats
 * 퀘스트 통계 조회
 */
router.get('/stats',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    try {
      const stats = await QuestService.getQuestStats(userId);

      res.json({
        success: true,
        message: '퀘스트 통계를 조회했습니다.',
        data: stats,
      });

    } catch (error) {
      logger.error('Quest stats retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/quest/trigger
 * 퀘스트 트리거 (자동 진행 상황 업데이트용)
 */
router.post('/trigger',
  validateRequest({
    body: Joi.object({
      type: Joi.string().valid(...Object.values(QuestType)).required(),
      increment: Joi.number().integer().min(1).default(1),
      metadata: Joi.object().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { type, increment, metadata } = req.body;

    try {
      await QuestService.updateQuestProgress(userId, type as QuestType, increment, metadata);

      res.json({
        success: true,
        message: '퀘스트 진행 상황이 업데이트되었습니다.',
      });

    } catch (error) {
      logger.error('Quest trigger failed', { userId, type, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/quest/history
 * 퀘스트 완료 이력 조회
 */
router.get('/history',
  validateRequest({
    query: Joi.object({
      limit: Joi.number().integer().min(1).max(100).default(20),
      offset: Joi.number().integer().min(0).default(0),
      type: Joi.string().valid(...Object.values(QuestType)).optional(),
      completed: Joi.boolean().optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { limit, offset, type, completed } = req.query;

    try {
      // Prisma를 직접 사용하여 이력 조회
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const where: any = { userId };
      if (type) where.quest = { type };
      if (completed !== undefined) where.isCompleted = completed;

      const [quests, total] = await Promise.all([
        prisma.userQuest.findMany({
          where,
          include: {
            quest: true,
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.userQuest.count({ where }),
      ]);

      res.json({
        success: true,
        message: '퀘스트 이력을 조회했습니다.',
        data: {
          quests,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
          },
        },
      });

    } catch (error) {
      logger.error('Quest history retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/quest/leaderboard
 * 퀘스트 리더보드 (주간/월간)
 */
router.get('/leaderboard',
  validateRequest({
    query: Joi.object({
      period: Joi.string().valid('daily', 'weekly', 'monthly').default('weekly'),
      limit: Joi.number().integer().min(1).max(50).default(10),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { period, limit } = req.query;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      // 기간별 시작 날짜 계산
      let startDate: Date;
      const now = new Date();
      
      switch (period) {
        case 'daily':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          const dayOfWeek = now.getDay();
          startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // 리더보드 데이터 조회
      const leaderboard = await prisma.userQuest.groupBy({
        by: ['userId'],
        where: {
          isCompleted: true,
          completedAt: { gte: startDate },
        },
        _count: { id: true },
        _sum: { quest: { rewardXp: true } },
        orderBy: { _count: { id: 'desc' } },
        take: limit,
      });

      // 사용자 정보 추가
      const userIds = leaderboard.map(item => item.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });

      const userMap = users.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {} as any);

      const formattedLeaderboard = leaderboard.map((item, index) => ({
        rank: index + 1,
        userId: item.userId,
        userName: userMap[item.userId]?.name ? 
          userMap[item.userId].name.charAt(0) + '*'.repeat(userMap[item.userId].name.length - 1) : 
          '익명',
        completedQuests: item._count.id,
        totalXp: item._sum?.quest?.rewardXp || 0,
      }));

      res.json({
        success: true,
        message: '퀘스트 리더보드를 조회했습니다.',
        data: {
          leaderboard: formattedLeaderboard,
          period,
          startDate,
        },
      });

    } catch (error) {
      logger.error('Quest leaderboard retrieval failed', { period, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/quest/templates
 * 사용 가능한 퀘스트 템플릿 조회 (관리자용)
 */
router.get('/templates',
  validateRequest({
    query: Joi.object({
      type: Joi.string().valid(...Object.values(QuestType)).optional(),
      active: Joi.boolean().default(true),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { type, active } = req.query;

    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const where: any = {};
      if (type) where.type = type;
      if (active !== undefined) where.isActive = active;

      const templates = await prisma.quest.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
      });

      res.json({
        success: true,
        message: '퀘스트 템플릿을 조회했습니다.',
        data: {
          templates,
          total: templates.length,
        },
      });

    } catch (error) {
      logger.error('Quest templates retrieval failed', { type, active, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/quest/feedback
 * 퀘스트에 대한 피드백 제출
 */
router.post('/feedback',
  validateRequest({
    body: Joi.object({
      questId: Joi.string().optional(),
      questType: Joi.string().valid(...Object.values(QuestType)).optional(),
      rating: Joi.number().integer().min(1).max(5).required(),
      feedback: Joi.string().max(1000).optional(),
      difficulty: Joi.string().valid('too_easy', 'just_right', 'too_hard').optional(),
      suggestions: Joi.string().max(500).optional(),
    }).or('questId', 'questType'),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { questId, questType, rating, feedback, difficulty, suggestions } = req.body;

    try {
      // 피드백 로깅 (향후 별도 피드백 테이블로 확장 가능)
      logger.logEvent('quest_feedback', {
        userId,
        questId,
        questType,
        rating,
        feedback,
        difficulty,
        suggestions,
      }, userId);

      res.json({
        success: true,
        message: '피드백이 제출되었습니다. 더 나은 퀘스트 경험을 위해 활용하겠습니다.',
      });

    } catch (error) {
      logger.error('Quest feedback submission failed', { userId, error });
      throw error;
    }
  })
);

export default router;