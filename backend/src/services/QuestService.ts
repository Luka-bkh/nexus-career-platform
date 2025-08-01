import { PrismaClient, QuestType, QuestCategory, QuestDifficulty, QuestStatus } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { RedisClient } from '../utils/redis';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const redis = new RedisClient();

export interface QuestTemplate {
  name: string;
  description: string;
  type: QuestType;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  targetValue: number;
  requirements: any;
  rewardCredits: number;
  rewardXp: number;
  rewardBadge?: string;
  priority: number;
}

export interface QuestProgress {
  questId: string;
  userId: string;
  progress: number;
  isCompleted: boolean;
  metadata?: any;
}

export class QuestService {
  private static readonly CACHE_TTL = 3600; // 1시간
  private static readonly DAILY_RESET_HOUR = 0; // UTC 자정

  /**
   * 사용자의 일일 퀘스트 생성 및 할당
   */
  static async generateDailyQuests(userId: string): Promise<any[]> {
    try {
      logger.info('Generating daily quests', { userId });

      // 오늘 날짜 (UTC 기준)
      const today = this.getTodayDate();
      
      // 이미 오늘 퀘스트가 할당되었는지 확인
      const existingQuests = await this.getTodayUserQuests(userId, today);
      if (existingQuests.length > 0) {
        logger.info('Daily quests already assigned', { userId, questCount: existingQuests.length });
        return existingQuests;
      }

      // 사용자 정보 및 진행 상황 분석
      const userProfile = await this.analyzeUserProfile(userId);
      
      // 퀘스트 템플릿 선택
      const questTemplates = await this.selectQuestTemplates(userProfile);
      
      // 퀘스트 할당
      const assignedQuests = await this.assignQuestsToUser(userId, questTemplates, today);
      
      // 캐시에 저장
      await this.cacheUserQuests(userId, today, assignedQuests);

      logger.logEvent('daily_quests_generated', {
        userId,
        questCount: assignedQuests.length,
        questTypes: assignedQuests.map(q => q.quest.type),
      }, userId);

      return assignedQuests;

    } catch (error) {
      logger.error('Daily quest generation failed', { userId, error });
      throw error;
    }
  }

  /**
   * 퀘스트 완료 처리
   */
  static async completeQuest(userId: string, questId: string, metadata?: any): Promise<any> {
    try {
      logger.info('Completing quest', { userId, questId });

      // 진행 중인 퀘스트 확인
      const userQuest = await prisma.userQuest.findFirst({
        where: {
          userId,
          questId,
          isCompleted: false,
          status: QuestStatus.IN_PROGRESS,
        },
        include: {
          quest: true,
        },
      });

      if (!userQuest) {
        throw createError.notFound('진행 중인 퀘스트를 찾을 수 없습니다.');
      }

      // 퀘스트가 이미 만료되었는지 확인
      if (userQuest.expiresAt && userQuest.expiresAt < new Date()) {
        await this.expireQuest(userQuest.id);
        throw createError.badRequest('퀘스트가 만료되었습니다.');
      }

      // 퀘스트 완료 처리
      const completedQuest = await prisma.userQuest.update({
        where: { id: userQuest.id },
        data: {
          status: QuestStatus.COMPLETED,
          progress: userQuest.quest.targetValue,
          isCompleted: true,
          completedAt: new Date(),
          metadata: metadata || userQuest.metadata,
        },
        include: {
          quest: true,
        },
      });

      // 보상 지급
      const rewards = await this.grantRewards(userId, userQuest.quest);

      // 캐시 무효화
      await this.invalidateUserQuestCache(userId);

      // 연속 완료 추적 및 추가 퀘스트 트리거
      await this.handleQuestCompletion(userId, userQuest.quest);

      logger.logEvent('quest_completed', {
        userId,
        questId,
        questType: userQuest.quest.type,
        rewards,
      }, userId);

      return {
        quest: completedQuest,
        rewards,
      };

    } catch (error) {
      logger.error('Quest completion failed', { userId, questId, error });
      throw error;
    }
  }

  /**
   * 퀘스트 진행 상황 업데이트
   */
  static async updateQuestProgress(userId: string, questType: QuestType, increment: number = 1, metadata?: any): Promise<void> {
    try {
      // 오늘의 해당 타입 퀘스트 조회
      const today = this.getTodayDate();
      const userQuests = await prisma.userQuest.findMany({
        where: {
          userId,
          quest: { type: questType },
          assignedDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
          isCompleted: false,
          status: QuestStatus.IN_PROGRESS,
        },
        include: {
          quest: true,
        },
      });

      for (const userQuest of userQuests) {
        const newProgress = Math.min(userQuest.progress + increment, userQuest.quest.targetValue);
        const isCompleted = newProgress >= userQuest.quest.targetValue;

        await prisma.userQuest.update({
          where: { id: userQuest.id },
          data: {
            progress: newProgress,
            isCompleted,
            status: isCompleted ? QuestStatus.COMPLETED : QuestStatus.IN_PROGRESS,
            completedAt: isCompleted ? new Date() : null,
            metadata: metadata ? { ...userQuest.metadata, ...metadata } : userQuest.metadata,
          },
        });

        // 자동 완료된 경우 보상 지급
        if (isCompleted && !userQuest.isCompleted) {
          await this.grantRewards(userId, userQuest.quest);
          
          logger.logEvent('quest_auto_completed', {
            userId,
            questId: userQuest.questId,
            questType: userQuest.quest.type,
            finalProgress: newProgress,
          }, userId);
        }
      }

      // 캐시 무효화
      await this.invalidateUserQuestCache(userId);

    } catch (error) {
      logger.error('Quest progress update failed', { userId, questType, increment, error });
      // 진행 상황 업데이트 실패는 메인 플로우에 영향을 주지 않도록 에러를 던지지 않음
    }
  }

  /**
   * 사용자의 오늘 퀘스트 조회
   */
  static async getTodayQuests(userId: string): Promise<any[]> {
    try {
      const today = this.getTodayDate();
      
      // 캐시에서 먼저 확인
      const cached = await this.getCachedUserQuests(userId, today);
      if (cached) {
        return cached;
      }

      const quests = await this.getTodayUserQuests(userId, today);
      
      // 캐시에 저장
      if (quests.length > 0) {
        await this.cacheUserQuests(userId, today, quests);
      }

      return quests;

    } catch (error) {
      logger.error('Today quests retrieval failed', { userId, error });
      throw error;
    }
  }

  /**
   * 퀘스트 통계 조회
   */
  static async getQuestStats(userId: string): Promise<any> {
    try {
      const today = this.getTodayDate();
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [todayStats, weeklyStats, totalStats] = await Promise.all([
        // 오늘 통계
        prisma.userQuest.aggregate({
          where: {
            userId,
            assignedDate: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
          _count: { id: true },
        }),
        
        // 주간 통계
        prisma.userQuest.aggregate({
          where: {
            userId,
            completedAt: {
              gte: weekStart,
            },
            isCompleted: true,
          },
          _count: { id: true },
          _sum: { quest: { rewardXp: true, rewardCredits: true } },
        }),
        
        // 전체 통계
        prisma.userQuest.aggregate({
          where: {
            userId,
            isCompleted: true,
          },
          _count: { id: true },
          _sum: { quest: { rewardXp: true, rewardCredits: true } },
        }),
      ]);

      const todayCompleted = await prisma.userQuest.count({
        where: {
          userId,
          assignedDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
          isCompleted: true,
        },
      });

      return {
        today: {
          total: todayStats._count.id,
          completed: todayCompleted,
          completionRate: todayStats._count.id > 0 ? Math.round((todayCompleted / todayStats._count.id) * 100) : 0,
        },
        thisWeek: {
          completed: weeklyStats._count.id,
          xpEarned: weeklyStats._sum?.quest?.rewardXp || 0,
          creditsEarned: weeklyStats._sum?.quest?.rewardCredits || 0,
        },
        allTime: {
          completed: totalStats._count.id,
          totalXp: totalStats._sum?.quest?.rewardXp || 0,
          totalCredits: totalStats._sum?.quest?.rewardCredits || 0,
        },
      };

    } catch (error) {
      logger.error('Quest stats retrieval failed', { userId, error });
      throw error;
    }
  }

  /**
   * 모든 사용자의 일일 퀘스트 갱신 (스케줄러용)
   */
  static async refreshAllDailyQuests(): Promise<void> {
    try {
      logger.info('Starting daily quest refresh for all users');

      // 어제까지의 만료된 퀘스트들 정리
      await this.cleanupExpiredQuests();

      // 활성 사용자들 조회 (최근 7일 내 활동)
      const activeUsers = await prisma.user.findMany({
        where: {
          isActive: true,
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: { id: true },
      });

      logger.info(`Refreshing quests for ${activeUsers.length} active users`);

      // 배치 처리로 부하 분산
      const batchSize = 100;
      for (let i = 0; i < activeUsers.length; i += batchSize) {
        const batch = activeUsers.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(user => 
            this.generateDailyQuests(user.id).catch(error => 
              logger.error('Daily quest generation failed for user', { userId: user.id, error })
            )
          )
        );

        // 배치 간 짧은 대기
        if (i + batchSize < activeUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      logger.info('Daily quest refresh completed');

    } catch (error) {
      logger.error('Daily quest refresh failed', { error });
      throw error;
    }
  }

  // === 프라이빗 헬퍼 메서드들 ===

  private static getTodayDate(): Date {
    const now = new Date();
    return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  }

  private static async getTodayUserQuests(userId: string, today: Date): Promise<any[]> {
    return prisma.userQuest.findMany({
      where: {
        userId,
        assignedDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        quest: true,
      },
      orderBy: {
        quest: { priority: 'desc' },
      },
    });
  }

  private static async analyzeUserProfile(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        simulationSessions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        userRoadmaps: {
          where: { isActive: true },
          take: 1,
        },
        careerSurveys: {
          where: { isCompleted: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw createError.notFound('사용자를 찾을 수 없습니다.');
    }

    // 사용자 활동 패턴 분석
    const recentSimulations = user.simulationSessions.length;
    const hasActiveRoadmap = user.userRoadmaps.length > 0;
    const hasCompletedSurvey = user.careerSurveys.length > 0;
    const totalCredits = user.credits + user.paidCredits;

    // 사용자 레벨 결정 (퀘스트 난이도 조정용)
    let userLevel = 'beginner';
    if (recentSimulations >= 3 && hasActiveRoadmap) {
      userLevel = 'intermediate';
    }
    if (recentSimulations >= 10 && hasActiveRoadmap && totalCredits >= 10) {
      userLevel = 'advanced';
    }

    return {
      userId: user.id,
      level: userLevel,
      recentSimulations,
      hasActiveRoadmap,
      hasCompletedSurvey,
      totalCredits,
      registrationDate: user.createdAt,
      lastLogin: user.lastLoginAt,
    };
  }

  private static async selectQuestTemplates(userProfile: any): Promise<QuestTemplate[]> {
    // 기본 일일 퀘스트 풀
    const questPool: QuestTemplate[] = [
      // 로그인 퀘스트 (매일 기본)
      {
        name: '일일 출석체크',
        description: '오늘 플랫폼에 로그인하기',
        type: QuestType.LOGIN,
        category: QuestCategory.DAILY,
        difficulty: QuestDifficulty.EASY,
        targetValue: 1,
        requirements: {},
        rewardCredits: 1,
        rewardXp: 10,
        priority: 100,
      },

      // 시뮬레이션 퀘스트
      {
        name: '시뮬레이션 도전',
        description: 'AI 시뮬레이션 1회 완료하기',
        type: QuestType.SIMULATION,
        category: QuestCategory.DAILY,
        difficulty: QuestDifficulty.NORMAL,
        targetValue: 1,
        requirements: {},
        rewardCredits: 2,
        rewardXp: 25,
        priority: 80,
      },

      // 학습 퀘스트
      {
        name: '학습 진행',
        description: '로드맵에서 마일스톤 1개 완료하기',
        type: QuestType.MILESTONE,
        category: QuestCategory.DAILY,
        difficulty: QuestDifficulty.NORMAL,
        targetValue: 1,
        requirements: {},
        rewardCredits: 1,
        rewardXp: 20,
        priority: 70,
      },

      // 탐색 퀘스트
      {
        name: '기능 탐색',
        description: '새로운 기능 또는 페이지 방문하기',
        type: QuestType.EXPLORATION,
        category: QuestCategory.DAILY,
        difficulty: QuestDifficulty.EASY,
        targetValue: 3,
        requirements: {},
        rewardCredits: 1,
        rewardXp: 15,
        priority: 60,
      },
    ];

    // 사용자 레벨에 따른 추가 퀘스트
    if (userProfile.level === 'intermediate' || userProfile.level === 'advanced') {
      questPool.push({
        name: '연속 학습',
        description: '시뮬레이션 2회 연속 완료하기',
        type: QuestType.STREAK,
        category: QuestCategory.DAILY,
        difficulty: QuestDifficulty.HARD,
        targetValue: 2,
        requirements: { consecutive: true },
        rewardCredits: 3,
        rewardXp: 50,
        priority: 90,
      });
    }

    // 신규 사용자용 온보딩 퀘스트
    if (!userProfile.hasCompletedSurvey) {
      questPool.push({
        name: '진로 탐색 시작',
        description: '진로 적성 설문조사 완료하기',
        type: QuestType.SURVEY,
        category: QuestCategory.ONBOARDING,
        difficulty: QuestDifficulty.NORMAL,
        targetValue: 1,
        requirements: {},
        rewardCredits: 3,
        rewardXp: 30,
        rewardBadge: 'first_survey',
        priority: 95,
      });
    }

    // 일일 퀘스트 3-5개 선택 (우선순위 기반)
    const selectedQuests = questPool
      .sort((a, b) => b.priority - a.priority)
      .slice(0, Math.min(4, questPool.length));

    return selectedQuests;
  }

  private static async assignQuestsToUser(userId: string, templates: QuestTemplate[], assignedDate: Date): Promise<any[]> {
    const assignedQuests = [];

    for (const template of templates) {
      // 퀘스트 DB에서 찾거나 생성
      let quest = await prisma.quest.findFirst({
        where: {
          name: template.name,
          type: template.type,
          isActive: true,
        },
      });

      if (!quest) {
        quest = await prisma.quest.create({
          data: template,
        });
      }

      // 사용자에게 퀘스트 할당
      const expiresAt = new Date(assignedDate.getTime() + 24 * 60 * 60 * 1000); // 24시간 후 만료

      const userQuest = await prisma.userQuest.create({
        data: {
          userId,
          questId: quest.id,
          assignedDate,
          expiresAt,
          status: QuestStatus.IN_PROGRESS,
        },
        include: {
          quest: true,
        },
      });

      assignedQuests.push(userQuest);
    }

    return assignedQuests;
  }

  private static async grantRewards(userId: string, quest: any): Promise<any> {
    const rewards = {
      credits: quest.rewardCredits,
      xp: quest.rewardXp,
      badge: quest.rewardBadge,
    };

    // 크레딧 지급
    if (quest.rewardCredits > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: { increment: quest.rewardCredits },
        },
      });

      // 크레딧 트랜잭션 기록
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount: quest.rewardCredits,
          type: 'EARNED',
          description: `퀘스트 완료: ${quest.name}`,
          source: 'QUEST_REWARD',
        },
      });
    }

    // XP는 향후 레벨 시스템에서 활용 예정
    // 뱃지는 향후 성취 시스템에서 활용 예정

    return rewards;
  }

  private static async handleQuestCompletion(userId: string, quest: any): Promise<void> {
    // 연속 완료 체크
    if (quest.type === QuestType.LOGIN) {
      await this.checkLoginStreak(userId);
    }

    // 특별 퀘스트 트리거 (예: 첫 번째 시뮬레이션 완료)
    if (quest.type === QuestType.SIMULATION) {
      await this.checkFirstTimeAchievements(userId, 'simulation');
    }
  }

  private static async checkLoginStreak(userId: string): Promise<void> {
    // 연속 로그인 일수 계산 및 특별 보상 (향후 구현)
  }

  private static async checkFirstTimeAchievements(userId: string, type: string): Promise<void> {
    // 첫 번째 달성 체크 및 특별 보상 (향후 구현)
  }

  private static async expireQuest(userQuestId: string): Promise<void> {
    await prisma.userQuest.update({
      where: { id: userQuestId },
      data: { status: QuestStatus.EXPIRED },
    });
  }

  private static async cleanupExpiredQuests(): Promise<void> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    await prisma.userQuest.updateMany({
      where: {
        expiresAt: { lt: yesterday },
        status: { in: [QuestStatus.IN_PROGRESS, QuestStatus.ASSIGNED] },
      },
      data: { status: QuestStatus.EXPIRED },
    });
  }

  // === Redis 캐싱 메서드들 ===

  private static getCacheKey(userId: string, date: Date): string {
    const dateStr = date.toISOString().split('T')[0];
    return `user_quests:${userId}:${dateStr}`;
  }

  private static async getCachedUserQuests(userId: string, date: Date): Promise<any[] | null> {
    try {
      const key = this.getCacheKey(userId, date);
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Cache retrieval failed', { userId, error });
      return null;
    }
  }

  private static async cacheUserQuests(userId: string, date: Date, quests: any[]): Promise<void> {
    try {
      const key = this.getCacheKey(userId, date);
      await redis.setex(key, this.CACHE_TTL, JSON.stringify(quests));
    } catch (error) {
      logger.error('Cache storage failed', { userId, error });
    }
  }

  private static async invalidateUserQuestCache(userId: string): Promise<void> {
    try {
      const today = this.getTodayDate();
      const key = this.getCacheKey(userId, today);
      await redis.del(key);
    } catch (error) {
      logger.error('Cache invalidation failed', { userId, error });
    }
  }
}