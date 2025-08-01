import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateRequest, surveySchemas } from '../middleware/validation';
import { checkCredits } from '../middleware/auth';
import { encryptData, decryptData } from '../utils/encryption';
import { CreditService } from '../services/CreditService';
import logger from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/v1/onboarding/survey
 * 진로 적성 설문 저장
 */
router.post('/survey', 
  checkCredits(1), // 1 크레딧 필요
  validateRequest({
    body: surveySchemas.completeSurvey
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { basicInfo, interests, strengths, personality } = req.body;

    try {
      // 기존 설문이 있는지 확인
      const existingSurvey = await prisma.careerSurvey.findFirst({
        where: { 
          userId,
          isCompleted: true 
        },
        orderBy: { createdAt: 'desc' }
      });

      // 데이터 암호화
      const encryptedBasicInfo = encryptData(basicInfo);
      const encryptedInterests = encryptData(interests);
      const encryptedStrengths = encryptData(strengths);
      const encryptedPersonality = encryptData(personality);

      // 설문 데이터 저장
      const careerSurvey = await prisma.careerSurvey.create({
        data: {
          userId,
          basicInfo: encryptedBasicInfo,
          interests: encryptedInterests,
          strengths: encryptedStrengths,
          personality: encryptedPersonality,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // 크레딧 차감
      await CreditService.deductCredits({
        userId,
        type: 'SURVEY_USAGE',
        amount: 1,
        reason: '진로 적성 설문 완료',
        description: '4단계 진로 적성 설문 완료에 따른 크레딧 차감',
        relatedId: careerSurvey.id,
        relatedType: 'career_survey',
      });

      // 활동 로그 기록
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'survey_completed',
          description: '진로 적성 설문 완료',
          metadata: {
            surveyId: careerSurvey.id,
            isFirstSurvey: !existingSurvey,
            creditsUsed: 1,
          },
        },
      });

      logger.logEvent('survey_completed', {
        surveyId: careerSurvey.id,
        userId,
        isFirstSurvey: !existingSurvey,
      }, userId);

      res.status(201).json({
        success: true,
        message: '설문이 성공적으로 저장되었습니다.',
        data: {
          surveyId: careerSurvey.id,
          completedAt: careerSurvey.completedAt,
          creditsRemaining: req.user!.credits - 1,
        },
      });

    } catch (error) {
      logger.error('Survey save failed', { userId, error });
      throw error;
    }
  })
);

/**
 * POST /api/v1/onboarding/survey/draft
 * 설문 임시 저장 (미완료)
 */
router.post('/survey/draft',
  validateRequest({
    body: {
      stepData: surveySchemas.completeSurvey.fork(['basicInfo', 'interests', 'strengths', 'personality'], (schema) => 
        schema.optional()
      ),
      currentStep: Joi.number().integer().min(1).max(4).required(),
    }
  }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { stepData, currentStep } = req.body;

    try {
      // 기존 임시 저장된 설문 찾기
      let draftSurvey = await prisma.careerSurvey.findFirst({
        where: { 
          userId,
          isCompleted: false 
        },
        orderBy: { updatedAt: 'desc' }
      });

      const updateData: any = {};

      // 각 단계별 데이터 암호화 및 저장
      if (stepData.basicInfo) {
        updateData.basicInfo = encryptData(stepData.basicInfo);
      }
      if (stepData.interests) {
        updateData.interests = encryptData(stepData.interests);
      }
      if (stepData.strengths) {
        updateData.strengths = encryptData(stepData.strengths);
      }
      if (stepData.personality) {
        updateData.personality = encryptData(stepData.personality);
      }

      if (draftSurvey) {
        // 기존 임시 저장 업데이트
        draftSurvey = await prisma.careerSurvey.update({
          where: { id: draftSurvey.id },
          data: updateData,
        });
      } else {
        // 새로운 임시 저장 생성
        draftSurvey = await prisma.careerSurvey.create({
          data: {
            userId,
            ...updateData,
            isCompleted: false,
          },
        });
      }

      logger.logEvent('survey_draft_saved', {
        surveyId: draftSurvey.id,
        currentStep,
        userId,
      }, userId);

      res.json({
        success: true,
        message: '설문이 임시 저장되었습니다.',
        data: {
          surveyId: draftSurvey.id,
          currentStep,
          updatedAt: draftSurvey.updatedAt,
        },
      });

    } catch (error) {
      logger.error('Survey draft save failed', { userId, currentStep, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/onboarding/survey/draft
 * 임시 저장된 설문 조회
 */
router.get('/survey/draft',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    try {
      const draftSurvey = await prisma.careerSurvey.findFirst({
        where: { 
          userId,
          isCompleted: false 
        },
        orderBy: { updatedAt: 'desc' }
      });

      if (!draftSurvey) {
        return res.json({
          success: true,
          message: '임시 저장된 설문이 없습니다.',
          data: null,
        });
      }

      // 데이터 복호화
      const decryptedData: any = {};
      
      if (draftSurvey.basicInfo) {
        decryptedData.basicInfo = decryptData(draftSurvey.basicInfo);
      }
      if (draftSurvey.interests) {
        decryptedData.interests = decryptData(draftSurvey.interests);
      }
      if (draftSurvey.strengths) {
        decryptedData.strengths = decryptData(draftSurvey.strengths);
      }
      if (draftSurvey.personality) {
        decryptedData.personality = decryptData(draftSurvey.personality);
      }

      res.json({
        success: true,
        message: '임시 저장된 설문을 조회했습니다.',
        data: {
          surveyId: draftSurvey.id,
          ...decryptedData,
          updatedAt: draftSurvey.updatedAt,
        },
      });

    } catch (error) {
      logger.error('Survey draft retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * GET /api/v1/onboarding/survey/history
 * 설문 기록 조회
 */
router.get('/survey/history',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
      const [surveys, total] = await Promise.all([
        prisma.careerSurvey.findMany({
          where: { 
            userId,
            isCompleted: true 
          },
          orderBy: { completedAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            completedAt: true,
            createdAt: true,
            careerResults: {
              select: {
                id: true,
                matchScore: true,
                confidence: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        }),
        prisma.careerSurvey.count({
          where: { 
            userId,
            isCompleted: true 
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        message: '설문 기록을 조회했습니다.',
        data: {
          surveys,
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
      logger.error('Survey history retrieval failed', { userId, error });
      throw error;
    }
  })
);

/**
 * DELETE /api/v1/onboarding/survey/draft/:id
 * 임시 저장된 설문 삭제
 */
router.delete('/survey/draft/:id',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const surveyId = req.params.id;

    try {
      const draftSurvey = await prisma.careerSurvey.findFirst({
        where: { 
          id: surveyId,
          userId,
          isCompleted: false 
        },
      });

      if (!draftSurvey) {
        throw createError.notFound('임시 저장된 설문을 찾을 수 없습니다.');
      }

      await prisma.careerSurvey.delete({
        where: { id: surveyId },
      });

      logger.logEvent('survey_draft_deleted', {
        surveyId,
        userId,
      }, userId);

      res.json({
        success: true,
        message: '임시 저장된 설문이 삭제되었습니다.',
      });

    } catch (error) {
      logger.error('Survey draft deletion failed', { userId, surveyId, error });
      throw error;
    }
  })
);

export default router;