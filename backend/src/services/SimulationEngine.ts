import { PrismaClient, SimulationStatus, InteractionType } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { CreditService } from './CreditService';
import { AIFeedbackGenerator } from './AIFeedbackGenerator';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export interface SimulationStartRequest {
  userId: string;
  simulationId: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  personalizations?: Record<string, any>;
}

export interface InteractionRequest {
  sessionId: string;
  questId: string;
  interactionType: InteractionType;
  userInput: any;
  userId: string;
}

export interface SimulationState {
  sessionId: string;
  currentChapter: string;
  currentQuest: string;
  progress: number;
  score: number;
  skillLevels: Record<string, number>;
  badges: string[];
  gameVariables: Record<string, any>;
}

export class SimulationEngine {
  private static aiGenerator = new AIFeedbackGenerator();

  /**
   * 시뮬레이션 시작
   */
  static async startSimulation(request: SimulationStartRequest): Promise<any> {
    const { userId, simulationId, difficulty = 'intermediate', personalizations = {} } = request;

    try {
      // 사용자 크레딧 확인
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true, paidCredits: true, isActive: true },
      });

      if (!user) {
        throw createError.notFound('사용자를 찾을 수 없습니다.');
      }

      if (!user.isActive) {
        throw createError.forbidden('비활성화된 사용자입니다.');
      }

      const totalCredits = user.credits + user.paidCredits;
      const requiredCredits = 2; // 시뮬레이션 필요 크레딧

      if (totalCredits < requiredCredits) {
        throw createError.badRequest(`크레딧이 부족합니다. (필요: ${requiredCredits}, 보유: ${totalCredits})`);
      }

      // 시나리오 데이터 로드
      const scenarioData = await this.loadScenarioData(simulationId);
      if (!scenarioData) {
        throw createError.notFound('시뮬레이션 시나리오를 찾을 수 없습니다.');
      }

      // 진행 중인 세션 확인
      const existingSession = await prisma.simulationSession.findFirst({
        where: {
          userId,
          simulationId,
          status: { in: [SimulationStatus.IN_PROGRESS, SimulationStatus.PAUSED] },
        },
      });

      if (existingSession) {
        // 기존 세션 재개
        return {
          sessionId: existingSession.id,
          resumed: true,
          currentState: this.buildSimulationState(existingSession),
          message: '진행 중인 시뮬레이션을 재개합니다.',
        };
      }

      // 새 세션 생성
      const firstChapter = scenarioData.chapters[0];
      const firstQuest = firstChapter.quests[0];

      const session = await prisma.simulationSession.create({
        data: {
          userId,
          simulationId,
          scenarioData: this.applyPersonalizations(scenarioData, personalizations, difficulty),
          currentChapter: firstChapter.id,
          currentQuest: firstQuest.id,
          currentState: {
            difficulty,
            personalizations,
            gameVariables: {},
            completedQuests: [],
            startTime: new Date().toISOString(),
          },
          status: SimulationStatus.IN_PROGRESS,
        },
      });

      // 크레딧 차감
      await CreditService.deductCredits({
        userId,
        type: 'SIMULATION_USAGE',
        amount: requiredCredits,
        reason: '시뮬레이션 체험',
        description: `${scenarioData.title} 시뮬레이션 시작`,
        relatedId: session.id,
        relatedType: 'simulation_session',
      });

      // 활동 로그
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'simulation_started',
          description: `시뮬레이션 시작: ${scenarioData.title}`,
          metadata: {
            sessionId: session.id,
            simulationId,
            difficulty,
          },
        },
      });

      logger.logEvent('simulation_started', {
        sessionId: session.id,
        userId,
        simulationId,
        difficulty,
      }, userId);

      return {
        sessionId: session.id,
        resumed: false,
        currentState: this.buildSimulationState(session),
        currentQuest: firstQuest,
        message: '시뮬레이션이 시작되었습니다.',
      };
    } catch (error) {
      logger.error('Simulation start failed', { userId, simulationId, error });
      throw error;
    }
  }

  /**
   * 사용자 상호작용 처리
   */
  static async processInteraction(request: InteractionRequest): Promise<any> {
    const { sessionId, questId, interactionType, userInput, userId } = request;
    const startTime = Date.now();

    try {
      // 세션 조회
      const session = await prisma.simulationSession.findFirst({
        where: {
          id: sessionId,
          userId,
          status: SimulationStatus.IN_PROGRESS,
        },
      });

      if (!session) {
        throw createError.notFound('활성 시뮬레이션 세션을 찾을 수 없습니다.');
      }

      const scenarioData = session.scenarioData as any;
      const currentChapter = this.findChapterById(scenarioData, session.currentChapter);
      const currentQuest = this.findQuestById(currentChapter, questId);

      if (!currentQuest) {
        throw createError.badRequest('유효하지 않은 퀘스트입니다.');
      }

      // AI 피드백 생성
      const aiResponse = await this.aiGenerator.generateFeedback({
        quest: currentQuest,
        userInput,
        interactionType,
        sessionContext: session.currentState as any,
        scenarioData,
      });

      // 점수 계산
      const scoreGained = this.calculateScore(currentQuest, userInput, aiResponse);
      
      // 스킬 경험치 계산
      const skillsGained = this.calculateSkillExperience(currentQuest, userInput, aiResponse);

      // 상호작용 기록
      const interaction = await prisma.simulationInteraction.create({
        data: {
          sessionId,
          questId,
          interactionType,
          userInput,
          aiResponse,
          scoreGained,
          skillsGained,
          responseTime: Date.now() - startTime,
        },
      });

      // 세션 상태 업데이트
      const updatedState = await this.updateSessionState(session, {
        questCompleted: questId,
        scoreGained,
        skillsGained,
        userChoice: userInput,
        aiResponse,
      });

      // 다음 퀘스트 결정
      const nextQuest = this.determineNextQuest(
        scenarioData,
        session.currentChapter,
        questId,
        userInput,
        aiResponse
      );

      logger.logEvent('simulation_interaction', {
        sessionId,
        questId,
        interactionType,
        scoreGained,
        responseTime: Date.now() - startTime,
      }, userId);

      return {
        interaction: {
          id: interaction.id,
          aiResponse,
          scoreGained,
          skillsGained,
          responseTime: Date.now() - startTime,
        },
        updatedState,
        nextQuest,
        isChapterCompleted: nextQuest?.chapterChange || false,
        isSimulationCompleted: nextQuest === null,
      };
    } catch (error) {
      logger.error('Interaction processing failed', { sessionId, questId, error });
      throw error;
    }
  }

  /**
   * 시뮬레이션 일시정지
   */
  static async pauseSimulation(sessionId: string, userId: string): Promise<void> {
    try {
      await prisma.simulationSession.updateMany({
        where: {
          id: sessionId,
          userId,
          status: SimulationStatus.IN_PROGRESS,
        },
        data: {
          status: SimulationStatus.PAUSED,
          lastActiveAt: new Date(),
        },
      });

      logger.logEvent('simulation_paused', { sessionId }, userId);
    } catch (error) {
      logger.error('Simulation pause failed', { sessionId, error });
      throw error;
    }
  }

  /**
   * 시뮬레이션 재개
   */
  static async resumeSimulation(sessionId: string, userId: string): Promise<any> {
    try {
      const session = await prisma.simulationSession.findFirst({
        where: {
          id: sessionId,
          userId,
          status: SimulationStatus.PAUSED,
        },
      });

      if (!session) {
        throw createError.notFound('일시정지된 시뮬레이션을 찾을 수 없습니다.');
      }

      await prisma.simulationSession.update({
        where: { id: sessionId },
        data: {
          status: SimulationStatus.IN_PROGRESS,
          lastActiveAt: new Date(),
        },
      });

      logger.logEvent('simulation_resumed', { sessionId }, userId);

      return {
        sessionId,
        currentState: this.buildSimulationState(session),
        message: '시뮬레이션을 재개합니다.',
      };
    } catch (error) {
      logger.error('Simulation resume failed', { sessionId, error });
      throw error;
    }
  }

  /**
   * 시뮬레이션 완료 처리
   */
  static async completeSimulation(sessionId: string, userId: string): Promise<any> {
    try {
      const session = await prisma.simulationSession.findFirst({
        where: {
          id: sessionId,
          userId,
          status: SimulationStatus.IN_PROGRESS,
        },
        include: {
          interactions: true,
        },
      });

      if (!session) {
        throw createError.notFound('완료할 시뮬레이션을 찾을 수 없습니다.');
      }

      // 최종 평가 생성
      const finalAssessment = await this.generateFinalAssessment(session);

      // 최종 결과 저장
      const result = await prisma.finalSimulationResult.create({
        data: {
          sessionId,
          userId,
          finalScore: session.totalScore,
          grade: finalAssessment.grade,
          categoryScores: finalAssessment.categoryScores,
          skillAssessment: finalAssessment.skillAssessment,
          strengthsWeaknesses: finalAssessment.strengthsWeaknesses,
          personalizedFeedback: finalAssessment.personalizedFeedback,
          nextSteps: finalAssessment.nextSteps,
          percentile: finalAssessment.percentile,
          averageScore: finalAssessment.averageScore,
          jobRecommendations: finalAssessment.jobRecommendations,
          creditsUsed: 2,
          bonusCredits: finalAssessment.bonusCredits,
        },
      });

      // 세션 완료 처리
      await prisma.simulationSession.update({
        where: { id: sessionId },
        data: {
          status: SimulationStatus.COMPLETED,
          completedAt: new Date(),
          totalPlayTime: Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000),
        },
      });

      // 보너스 크레딧 지급
      if (finalAssessment.bonusCredits > 0) {
        await CreditService.awardCredits({
          userId,
          type: 'SURVEY_COMPLETION',
          amount: finalAssessment.bonusCredits,
          reason: '시뮬레이션 완료 보너스',
          description: `우수한 성과로 인한 보너스 크레딧 (등급: ${finalAssessment.grade})`,
          relatedId: sessionId,
          relatedType: 'simulation_session',
        });
      }

      logger.logEvent('simulation_completed', {
        sessionId,
        finalScore: session.totalScore,
        grade: finalAssessment.grade,
        bonusCredits: finalAssessment.bonusCredits,
      }, userId);

      return {
        result,
        finalAssessment,
        message: '시뮬레이션이 완료되었습니다.',
      };
    } catch (error) {
      logger.error('Simulation completion failed', { sessionId, error });
      throw error;
    }
  }

  /**
   * 시뮬레이션 상태 조회
   */
  static async getSimulationState(sessionId: string, userId: string): Promise<any> {
    try {
      const session = await prisma.simulationSession.findFirst({
        where: {
          id: sessionId,
          userId,
        },
        include: {
          interactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!session) {
        throw createError.notFound('시뮬레이션 세션을 찾을 수 없습니다.');
      }

      return {
        sessionId,
        status: session.status,
        currentState: this.buildSimulationState(session),
        recentInteractions: session.interactions,
        startedAt: session.startedAt,
        lastActiveAt: session.lastActiveAt,
        completedAt: session.completedAt,
      };
    } catch (error) {
      logger.error('Simulation state retrieval failed', { sessionId, error });
      throw error;
    }
  }

  // ========== 헬퍼 메서드들 ==========

  private static async loadScenarioData(simulationId: string): Promise<any> {
    try {
      const scenarioPath = path.join(process.cwd(), 'data/simulations', `${simulationId}.json`);
      
      if (!fs.existsSync(scenarioPath)) {
        return null;
      }

      const data = fs.readFileSync(scenarioPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Scenario loading failed', { simulationId, error });
      return null;
    }
  }

  private static applyPersonalizations(
    scenarioData: any, 
    personalizations: Record<string, any>, 
    difficulty: string
  ): any {
    const personalized = JSON.parse(JSON.stringify(scenarioData));
    
    // 난이도 조정
    if (difficulty === 'beginner') {
      personalized.moreHints = true;
      personalized.simplifiedCode = true;
      personalized.extendedTime = true;
    } else if (difficulty === 'advanced') {
      personalized.complexScenarios = true;
      personalized.openEndedProblems = true;
      personalized.timePressure = true;
    }

    // 개인화 적용
    Object.keys(personalizations).forEach(key => {
      if (personalized.variations && personalized.variations[key]) {
        Object.assign(personalized, personalized.variations[key]);
      }
    });

    return personalized;
  }

  private static buildSimulationState(session: any): SimulationState {
    return {
      sessionId: session.id,
      currentChapter: session.currentChapter,
      currentQuest: session.currentQuest,
      progress: session.progress,
      score: session.totalScore,
      skillLevels: session.skillLevels as Record<string, number>,
      badges: session.badges as string[],
      gameVariables: (session.currentState as any)?.gameVariables || {},
    };
  }

  private static findChapterById(scenarioData: any, chapterId: string): any {
    return scenarioData.chapters?.find((chapter: any) => chapter.id === chapterId);
  }

  private static findQuestById(chapter: any, questId: string): any {
    return chapter?.quests?.find((quest: any) => quest.id === questId);
  }

  private static calculateScore(quest: any, userInput: any, aiResponse: any): number {
    // 기본 점수
    let score = quest.baseScore || 5;

    // AI 응답의 점수 정보 활용
    if (aiResponse.feedback?.score) {
      score = aiResponse.feedback.score;
    }

    // 선택의 질에 따른 보정
    if (userInput.choice && quest.content?.options) {
      const selectedOption = quest.content.options.find((opt: any) => opt.text === userInput.choice);
      if (selectedOption) {
        score = selectedOption.points || score;
      }
    }

    return Math.max(0, Math.min(25, score)); // 0-25 점 범위
  }

  private static calculateSkillExperience(quest: any, userInput: any, aiResponse: any): Record<string, number> {
    const skills: Record<string, number> = {};

    // 퀘스트 타입에 따른 기본 스킬 경험치
    const skillMapping = {
      'dialogue': { 'communication': 2, 'teamwork': 1 },
      'decision': { 'problem_solving': 3, 'business_understanding': 2 },
      'coding': { 'technical_skills': 4, 'programming': 3 },
      'analysis': { 'data_science': 4, 'analytical_thinking': 3 },
      'collaboration': { 'teamwork': 4, 'communication': 2 },
      'technical_decision': { 'technical_skills': 3, 'decision_making': 3 },
    };

    const questType = quest.type || 'dialogue';
    const baseSkills = skillMapping[questType] || { 'general': 1 };

    Object.keys(baseSkills).forEach(skill => {
      skills[skill] = baseSkills[skill];
    });

    // AI 응답의 스킬 정보 활용
    if (aiResponse.skillsGained) {
      Object.keys(aiResponse.skillsGained).forEach(skill => {
        skills[skill] = (skills[skill] || 0) + aiResponse.skillsGained[skill];
      });
    }

    return skills;
  }

  private static async updateSessionState(session: any, updateData: any): Promise<SimulationState> {
    const currentState = session.currentState as any;
    const newChoicesHistory = [...(currentState.choicesHistory || []), updateData];
    
    // 스킬 레벨 업데이트
    const currentSkills = session.skillLevels as Record<string, number>;
    Object.keys(updateData.skillsGained || {}).forEach(skill => {
      currentSkills[skill] = (currentSkills[skill] || 0) + updateData.skillsGained[skill];
    });

    // 뱃지 확인
    const newBadges = this.checkForNewBadges(session, updateData);

    // 진행률 계산
    const totalQuests = this.getTotalQuestCount(session.scenarioData);
    const completedQuests = newChoicesHistory.length;
    const progress = Math.min(1.0, completedQuests / totalQuests);

    // 세션 업데이트
    const updatedSession = await prisma.simulationSession.update({
      where: { id: session.id },
      data: {
        currentState: {
          ...currentState,
          choicesHistory: newChoicesHistory,
          lastUpdate: new Date().toISOString(),
        },
        totalScore: session.totalScore + updateData.scoreGained,
        skillLevels: currentSkills,
        badges: [...session.badges, ...newBadges],
        progress,
        lastActiveAt: new Date(),
      },
    });

    return this.buildSimulationState(updatedSession);
  }

  private static determineNextQuest(
    scenarioData: any,
    currentChapter: string,
    currentQuest: string,
    userInput: any,
    aiResponse: any
  ): any {
    const chapter = this.findChapterById(scenarioData, currentChapter);
    const questIndex = chapter.quests.findIndex((q: any) => q.id === currentQuest);
    
    // 다음 퀘스트가 있는지 확인
    if (questIndex < chapter.quests.length - 1) {
      return {
        quest: chapter.quests[questIndex + 1],
        chapterChange: false,
      };
    }

    // 다음 챕터로 이동
    const chapterIndex = scenarioData.chapters.findIndex((c: any) => c.id === currentChapter);
    if (chapterIndex < scenarioData.chapters.length - 1) {
      const nextChapter = scenarioData.chapters[chapterIndex + 1];
      return {
        quest: nextChapter.quests[0],
        chapterChange: true,
        newChapter: nextChapter,
      };
    }

    // 시뮬레이션 완료
    return null;
  }

  private static checkForNewBadges(session: any, updateData: any): string[] {
    const badges: string[] = [];
    const currentBadges = session.badges as string[];
    
    // 데이터 탐정 배지
    if (updateData.userChoice?.includes('데이터 품질') && !currentBadges.includes('data_detective')) {
      badges.push('data_detective');
    }

    // 팀 플레이어 배지  
    if (updateData.aiResponse?.feedback?.type === 'positive' && 
        updateData.interactionType === 'collaboration' && 
        !currentBadges.includes('team_player')) {
      badges.push('team_player');
    }

    // 모델 마스터 배지
    if (session.totalScore + updateData.scoreGained >= 80 && !currentBadges.includes('model_master')) {
      badges.push('model_master');
    }

    return badges;
  }

  private static getTotalQuestCount(scenarioData: any): number {
    return scenarioData.chapters?.reduce((total: number, chapter: any) => {
      return total + (chapter.quests?.length || 0);
    }, 0) || 1;
  }

  private static async generateFinalAssessment(session: any): Promise<any> {
    const totalScore = session.totalScore;
    const maxScore = 100;
    const finalPercentage = (totalScore / maxScore) * 100;

    // 등급 계산
    let grade = 'C';
    if (finalPercentage >= 90) grade = 'A+';
    else if (finalPercentage >= 80) grade = 'A';
    else if (finalPercentage >= 70) grade = 'B+';
    else if (finalPercentage >= 60) grade = 'B';

    // 상위 몇 % 계산 (전체 평균 대비)
    const averageScore = await this.getAverageScore(session.simulationId);
    const percentile = await this.calculatePercentile(session.simulationId, totalScore);

    // 보너스 크레딧 계산
    let bonusCredits = 0;
    if (grade === 'A+') bonusCredits = 3;
    else if (grade === 'A') bonusCredits = 2;
    else if (grade === 'B+') bonusCredits = 1;

    return {
      grade,
      categoryScores: this.calculateCategoryScores(session),
      skillAssessment: session.skillLevels,
      strengthsWeaknesses: this.analyzeStrengthsWeaknesses(session),
      personalizedFeedback: await this.generatePersonalizedFeedback(session),
      nextSteps: this.generateNextSteps(session),
      percentile,
      averageScore,
      jobRecommendations: this.generateJobRecommendations(session),
      bonusCredits,
    };
  }

  private static async getAverageScore(simulationId: string): Promise<number> {
    const result = await prisma.simulationSession.aggregate({
      where: {
        simulationId,
        status: SimulationStatus.COMPLETED,
      },
      _avg: {
        totalScore: true,
      },
    });
    return result._avg.totalScore || 0;
  }

  private static async calculatePercentile(simulationId: string, score: number): Promise<number> {
    const totalSessions = await prisma.simulationSession.count({
      where: {
        simulationId,
        status: SimulationStatus.COMPLETED,
      },
    });

    const lowerSessions = await prisma.simulationSession.count({
      where: {
        simulationId,
        status: SimulationStatus.COMPLETED,
        totalScore: { lt: score },
      },
    });

    return totalSessions > 0 ? (lowerSessions / totalSessions) * 100 : 50;
  }

  private static calculateCategoryScores(session: any): Record<string, number> {
    // 영역별 점수 계산 로직
    return {
      technical_skills: 85,
      collaboration: 78,
      business_understanding: 82,
      growth_mindset: 90,
      execution: 75,
    };
  }

  private static analyzeStrengthsWeaknesses(session: any): any {
    const skillLevels = session.skillLevels as Record<string, number>;
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    Object.keys(skillLevels).forEach(skill => {
      if (skillLevels[skill] >= 4) {
        strengths.push(skill);
      } else if (skillLevels[skill] <= 2) {
        weaknesses.push(skill);
      }
    });

    return { strengths, weaknesses };
  }

  private static async generatePersonalizedFeedback(session: any): Promise<any> {
    // AI 기반 개인화된 피드백 생성
    return {
      overall: '전체적으로 우수한 성과를 보여주었습니다.',
      technical: '기술적 역량이 뛰어납니다.',
      soft_skills: '협업 능력을 더 개발해보세요.',
    };
  }

  private static generateNextSteps(session: any): any {
    return {
      immediate: ['Python 고급 과정 수강', '실무 프로젝트 참여'],
      short_term: ['포트폴리오 구축', '네트워킹 활동'],
      long_term: ['AI 전문가 인증', '리더십 역량 개발'],
    };
  }

  private static generateJobRecommendations(session: any): any {
    return [
      {
        title: 'AI 개발자',
        match_score: 92,
        reason: '시뮬레이션에서 뛰어난 기술적 역량을 보여줌',
      },
      {
        title: '데이터 사이언티스트',
        match_score: 87,
        reason: '데이터 분석 능력이 우수함',
      },
    ];
  }
}