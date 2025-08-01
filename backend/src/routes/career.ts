import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { checkCredits } from '../middleware/auth';
import { CareerRecommendationService } from '../services/CareerRecommendationService';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/v1/career/analyze
 * AI 진로 분석 및 추천
 */
router.post('/analyze',
  checkCredits(1), // 1 크레딧 필요
  validateRequest({
    body: Joi.object({
      surveyId: Joi.string().required().messages({
        'any.required': '설문 ID는 필수입니다.',
        'string.empty': '설문 ID는 필수입니다.',
      }),
    }),
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { surveyId } = req.body;

    try {
      // AI 기반 진로 추천 생성
      const analysisResult = await CareerRecommendationService.generateInitialRecommendation(
        userId,
        surveyId
      );

      // 사용자 잔여 크레딧 조회
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true, paidCredits: true },
      });

      const remainingCredits = (user?.credits || 0) + (user?.paidCredits || 0);

      res.json({
        success: true,
        message: 'AI 진로 분석이 완료되었습니다.',
        data: {
          ...analysisResult,
          creditsRemaining: remainingCredits,
          analysisCompletedAt: new Date().toISOString(),
        },
      });

    } catch (error) {
      logger.error('Career analysis failed', { userId, surveyId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/career/results
 * 진로 분석 결과 목록 조회
 */
router.get('/results',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
      const [results, total] = await Promise.all([
        prisma.careerResult.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            careerSurvey: {
              select: {
                id: true,
                completedAt: true,
              },
            },
          },
        }),
        prisma.careerResult.count({
          where: { userId },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        message: '진로 분석 결과를 조회했습니다.',
        data: {
          results,
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
      logger.error('Career results retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/career/results/:id
 * 특정 진로 분석 결과 상세 조회
 */
router.get('/results/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const resultId = req.params.id;

    try {
      const result = await prisma.careerResult.findFirst({
        where: {
          id: resultId,
          userId,
        },
        include: {
          careerSurvey: {
            select: {
              id: true,
              completedAt: true,
            },
          },
        },
      });

      if (!result) {
        throw createError.notFound('진로 분석 결과를 찾을 수 없습니다.');
      }

      res.json({
        success: true,
        message: '진로 분석 결과를 조회했습니다.',
        data: result,
      });

    } catch (error) {
      logger.error('Career result detail retrieval failed', { userId, resultId, error });
      throw error;
    }
  })
);

export default router;