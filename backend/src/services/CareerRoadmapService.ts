import { PrismaClient, RoadmapDifficulty } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { RoadmapGenerator } from './RoadmapGenerator';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  duration: number; // 개월
  prerequisites: string[];
  milestones: Milestone[];
  skills: string[];
  order: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  type: 'skill' | 'project' | 'certification' | 'experience' | 'networking';
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  resources: Resource[];
  skills: string[];
  successCriteria: string[];
  isCompleted?: boolean;
  completedAt?: string;
}

export interface Resource {
  type: 'course' | 'book' | 'article' | 'video' | 'practice' | 'community' | 'tool';
  title: string;
  description?: string;
  url?: string;
  provider?: string;
  cost: 'free' | 'paid' | 'subscription';
  rating?: number;
  difficulty?: string;
  duration?: string;
}

export interface CareerProgression {
  position: string;
  timeline: string;
  requirements: string[];
  averageSalary?: string;
  companies?: string[];
  nextSteps?: string[];
}

export interface PersonalizationData {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  availability: 'weekdays' | 'weekends' | 'evenings' | 'flexible';
  preferredLearningMethods: string[];
  currentSkillLevel: 'complete_beginner' | 'some_experience' | 'intermediate' | 'advanced';
  budget: 'free' | 'limited' | 'moderate' | 'unlimited';
  timeCommitment: string; // 예: "10-15h/week"
  priorities: string[];
  constraints: string[];
}

export interface AIAnalysisMetadata {
  strengthsConsidered: string[];
  weaknessesAddressed: string[];
  surveyInfluence: number;
  simulationInfluence: number;
  confidence: number;
  adaptationLevel: 'low' | 'medium' | 'high';
  recommendationReason: string;
  alternativeOptions: string[];
}

export interface GeneratedRoadmap {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetRole: string;
  difficulty: RoadmapDifficulty;
  estimatedDuration: number;
  
  phases: RoadmapPhase[];
  totalSkills: string[];
  careerProgression: CareerProgression[];
  
  personalizedFor: PersonalizationData;
  aiAnalysis: AIAnalysisMetadata;
  
  dataSourceIds: string[];
  basedOnSurvey: boolean;
  basedOnSimulation: boolean;
}

export class CareerRoadmapService {
  private static roadmapGenerator = new RoadmapGenerator();

  /**
   * 사용자의 통합 데이터를 기반으로 개인화된 진로 로드맵 생성
   */
  static async generateRoadmap(userId: string, options?: {
    targetRole?: string;
    forceRegenerate?: boolean;
    difficulty?: RoadmapDifficulty;
  }): Promise<GeneratedRoadmap> {
    try {
      // 기존 활성 로드맵 확인
      if (!options?.forceRegenerate) {
        const existingRoadmap = await this.getActiveRoadmap(userId);
        if (existingRoadmap) {
          return this.convertToGeneratedRoadmap(existingRoadmap);
        }
      }

      // 사용자 통합 데이터 수집
      const userData = await this.collectUserData(userId);
      
      if (!userData.hasMinimumData) {
        throw createError.badRequest('로드맵 생성을 위한 충분한 데이터가 없습니다. 설문조사나 시뮬레이션을 먼저 완료해주세요.');
      }

      // AI 기반 로드맵 생성
      const generatedRoadmap = await this.roadmapGenerator.generatePersonalizedRoadmap(userData, options);

      // 데이터베이스에 저장
      const savedRoadmap = await this.saveRoadmap(generatedRoadmap);

      // 이전 로드맵 비활성화
      await this.deactivatePreviousRoadmaps(userId, savedRoadmap.id);

      logger.logEvent('roadmap_generated', {
        userId,
        roadmapId: savedRoadmap.id,
        targetRole: generatedRoadmap.targetRole,
        difficulty: generatedRoadmap.difficulty,
        estimatedDuration: generatedRoadmap.estimatedDuration,
        dataSourceCount: generatedRoadmap.dataSourceIds.length,
      }, userId);

      return generatedRoadmap;

    } catch (error) {
      logger.error('Roadmap generation failed', { userId, options, error });
      throw error;
    }
  }

  /**
   * 사용자의 통합 데이터 수집
   */
  private static async collectUserData(userId: string): Promise<any> {
    try {
      // 사용자 기본 정보
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          careerSurveys: {
            where: { isCompleted: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          simulationSessions: {
            where: { status: 'COMPLETED' },
            include: {
              result: true,
              interactions: {
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { completedAt: 'desc' },
            take: 3, // 최근 3개 시뮬레이션
          },
          finalSimulationResults: {
            orderBy: { completedAt: 'desc' },
            take: 3,
          },
        },
      });

      if (!user) {
        throw createError.notFound('사용자를 찾을 수 없습니다.');
      }

      const latestSurvey = user.careerSurveys[0];
      const recentSimulations = user.simulationSessions;
      const simulationResults = user.finalSimulationResults;

      // 최소 데이터 요구사항 검증
      const hasMinimumData = latestSurvey || recentSimulations.length > 0;

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          birthYear: user.birthYear,
          gender: user.gender,
          credits: user.credits + user.paidCredits,
        },
        survey: latestSurvey ? {
          id: latestSurvey.id,
          basicInfo: latestSurvey.basicInfo,
          interests: latestSurvey.interests,
          strengths: latestSurvey.strengths,
          personality: latestSurvey.personality,
          completedAt: latestSurvey.createdAt,
        } : null,
        simulations: recentSimulations.map(sim => ({
          id: sim.id,
          simulationId: sim.simulationId,
          finalScore: sim.result?.finalScore || 0,
          grade: sim.result?.grade || 'C',
          skillLevels: sim.skillLevels,
          totalPlayTime: sim.totalPlayTime,
          interactions: sim.interactions.length,
          completedAt: sim.completedAt,
        })),
        simulationResults: simulationResults.map(result => ({
          id: result.id,
          finalScore: result.finalScore,
          grade: result.grade,
          skillAssessment: result.skillAssessment,
          strengthsWeaknesses: result.strengthsWeaknesses,
          percentile: result.percentile,
          jobRecommendations: result.jobRecommendations,
        })),
        hasMinimumData,
        dataSourceIds: [
          ...(latestSurvey ? [latestSurvey.id] : []),
          ...recentSimulations.map(sim => sim.id),
        ],
      };

    } catch (error) {
      logger.error('User data collection failed', { userId, error });
      throw error;
    }
  }

  /**
   * 로드맵을 데이터베이스에 저장
   */
  private static async saveRoadmap(roadmap: GeneratedRoadmap): Promise<any> {
    try {
      const savedRoadmap = await prisma.userRoadmap.create({
        data: {
          userId: roadmap.userId,
          title: roadmap.title,
          description: roadmap.description,
          targetRole: roadmap.targetRole,
          difficulty: roadmap.difficulty,
          estimatedDuration: roadmap.estimatedDuration,
          basedOnSurvey: roadmap.basedOnSurvey,
          basedOnSimulation: roadmap.basedOnSimulation,
          dataSourceIds: roadmap.dataSourceIds,
          roadmapData: {
            phases: roadmap.phases,
            totalSkills: roadmap.totalSkills,
            careerProgression: roadmap.careerProgression,
          },
          personalizedFor: roadmap.personalizedFor,
          aiAnalysis: roadmap.aiAnalysis,
        },
      });

      return savedRoadmap;

    } catch (error) {
      logger.error('Roadmap save failed', { roadmapId: roadmap.id, error });
      throw error;
    }
  }

  /**
   * 이전 로드맵들 비활성화
   */
  private static async deactivatePreviousRoadmaps(userId: string, excludeId: string): Promise<void> {
    try {
      await prisma.userRoadmap.updateMany({
        where: {
          userId,
          id: { not: excludeId },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

    } catch (error) {
      logger.error('Previous roadmaps deactivation failed', { userId, excludeId, error });
      // 실패해도 메인 프로세스에는 영향 주지 않음
    }
  }

  /**
   * 사용자의 활성 로드맵 조회
   */
  static async getActiveRoadmap(userId: string): Promise<any | null> {
    try {
      const roadmap = await prisma.userRoadmap.findFirst({
        where: {
          userId,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return roadmap;

    } catch (error) {
      logger.error('Active roadmap retrieval failed', { userId, error });
      return null;
    }
  }

  /**
   * 로드맵 진행상황 업데이트
   */
  static async updateProgress(userId: string, progressData: {
    phaseId?: string;
    milestoneId?: string;
    isCompleted?: boolean;
    customProgress?: number;
  }): Promise<any> {
    try {
      const activeRoadmap = await this.getActiveRoadmap(userId);
      if (!activeRoadmap) {
        throw createError.notFound('활성 로드맵을 찾을 수 없습니다.');
      }

      const roadmapData = activeRoadmap.roadmapData;
      let updated = false;

      // 마일스톤 완료 처리
      if (progressData.milestoneId && progressData.isCompleted !== undefined) {
        for (const phase of roadmapData.phases) {
          for (const milestone of phase.milestones) {
            if (milestone.id === progressData.milestoneId) {
              milestone.isCompleted = progressData.isCompleted;
              if (progressData.isCompleted) {
                milestone.completedAt = new Date().toISOString();
              } else {
                delete milestone.completedAt;
              }
              updated = true;
              break;
            }
          }
          if (updated) break;
        }
      }

      // 전체 진행률 재계산
      const totalMilestones = roadmapData.phases.reduce((sum: number, phase: any) => sum + phase.milestones.length, 0);
      const completedMilestones = roadmapData.phases.reduce((sum: number, phase: any) => 
        sum + phase.milestones.filter((m: any) => m.isCompleted).length, 0
      );
      const calculatedProgress = totalMilestones > 0 ? completedMilestones / totalMilestones : 0;

      const finalProgress = progressData.customProgress !== undefined ? progressData.customProgress : calculatedProgress;

      // 현재 단계 업데이트
      let currentPhase = activeRoadmap.currentPhase;
      if (progressData.phaseId) {
        currentPhase = progressData.phaseId;
      }

      // 데이터베이스 업데이트
      const updatedRoadmap = await prisma.userRoadmap.update({
        where: { id: activeRoadmap.id },
        data: {
          roadmapData,
          progress: finalProgress,
          currentPhase,
          lastReviewedAt: new Date(),
        },
      });

      logger.logEvent('roadmap_progress_updated', {
        userId,
        roadmapId: activeRoadmap.id,
        progress: finalProgress,
        milestoneCompleted: progressData.milestoneId && progressData.isCompleted,
      }, userId);

      return this.convertToGeneratedRoadmap(updatedRoadmap);

    } catch (error) {
      logger.error('Roadmap progress update failed', { userId, progressData, error });
      throw error;
    }
  }

  /**
   * 로드맵 적응형 업데이트 (새로운 데이터 기반)
   */
  static async adaptRoadmap(userId: string, trigger: 'new_simulation' | 'skill_update' | 'goal_change'): Promise<GeneratedRoadmap> {
    try {
      const currentRoadmap = await this.getActiveRoadmap(userId);
      if (!currentRoadmap) {
        throw createError.notFound('적응할 로드맵이 없습니다.');
      }

      // 새로운 사용자 데이터 수집
      const userData = await this.collectUserData(userId);

      // AI 기반 로드맵 적응
      const adaptedRoadmap = await this.roadmapGenerator.adaptExistingRoadmap(
        currentRoadmap,
        userData,
        trigger
      );

      // 새 버전으로 저장
      const savedRoadmap = await prisma.userRoadmap.update({
        where: { id: currentRoadmap.id },
        data: {
          version: currentRoadmap.version + 1,
          roadmapData: {
            phases: adaptedRoadmap.phases,
            totalSkills: adaptedRoadmap.totalSkills,
            careerProgression: adaptedRoadmap.careerProgression,
          },
          aiAnalysis: adaptedRoadmap.aiAnalysis,
          lastReviewedAt: new Date(),
        },
      });

      logger.logEvent('roadmap_adapted', {
        userId,
        roadmapId: currentRoadmap.id,
        trigger,
        newVersion: savedRoadmap.version,
      }, userId);

      return adaptedRoadmap;

    } catch (error) {
      logger.error('Roadmap adaptation failed', { userId, trigger, error });
      throw error;
    }
  }

  /**
   * 로드맵 목록 조회 (사용자의 모든 로드맵)
   */
  static async getUserRoadmaps(userId: string, options?: {
    includeInactive?: boolean;
    limit?: number;
  }): Promise<any[]> {
    try {
      const roadmaps = await prisma.userRoadmap.findMany({
        where: {
          userId,
          ...(options?.includeInactive ? {} : { isActive: true }),
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 10,
      });

      return roadmaps.map(roadmap => this.convertToGeneratedRoadmap(roadmap));

    } catch (error) {
      logger.error('User roadmaps retrieval failed', { userId, options, error });
      throw error;
    }
  }

  /**
   * 로드맵 상세 조회
   */
  static async getRoadmapById(roadmapId: string, userId: string): Promise<GeneratedRoadmap> {
    try {
      const roadmap = await prisma.userRoadmap.findFirst({
        where: {
          id: roadmapId,
          userId, // 보안: 본인의 로드맵만 조회 가능
        },
      });

      if (!roadmap) {
        throw createError.notFound('로드맵을 찾을 수 없습니다.');
      }

      return this.convertToGeneratedRoadmap(roadmap);

    } catch (error) {
      logger.error('Roadmap retrieval failed', { roadmapId, userId, error });
      throw error;
    }
  }

  /**
   * 로드맵 삭제
   */
  static async deleteRoadmap(roadmapId: string, userId: string): Promise<void> {
    try {
      const deletedRoadmap = await prisma.userRoadmap.deleteMany({
        where: {
          id: roadmapId,
          userId, // 보안: 본인의 로드맵만 삭제 가능
        },
      });

      if (deletedRoadmap.count === 0) {
        throw createError.notFound('삭제할 로드맵을 찾을 수 없습니다.');
      }

      logger.logEvent('roadmap_deleted', { roadmapId, userId }, userId);

    } catch (error) {
      logger.error('Roadmap deletion failed', { roadmapId, userId, error });
      throw error;
    }
  }

  /**
   * 로드맵 통계 조회
   */
  static async getRoadmapStats(userId: string): Promise<any> {
    try {
      const stats = await prisma.userRoadmap.aggregate({
        where: { userId },
        _count: { id: true },
        _avg: { progress: true },
      });

      const activeRoadmap = await this.getActiveRoadmap(userId);
      
      const roadmapStats = {
        totalRoadmaps: stats._count.id || 0,
        averageProgress: Math.round((stats._avg.progress || 0) * 100),
        hasActiveRoadmap: !!activeRoadmap,
        currentProgress: activeRoadmap ? Math.round(activeRoadmap.progress * 100) : 0,
        currentTargetRole: activeRoadmap?.targetRole || null,
        estimatedCompletion: activeRoadmap ? this.calculateEstimatedCompletion(activeRoadmap) : null,
      };

      return roadmapStats;

    } catch (error) {
      logger.error('Roadmap stats retrieval failed', { userId, error });
      throw error;
    }
  }

  /**
   * 완료 예상 시점 계산
   */
  private static calculateEstimatedCompletion(roadmap: any): string {
    const progressRemaining = 1 - roadmap.progress;
    const monthsRemaining = Math.ceil(roadmap.estimatedDuration * progressRemaining);
    
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsRemaining);
    
    return completionDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  }

  /**
   * 데이터베이스 모델을 GeneratedRoadmap으로 변환
   */
  private static convertToGeneratedRoadmap(roadmap: any): GeneratedRoadmap {
    const roadmapData = roadmap.roadmapData || {};
    
    return {
      id: roadmap.id,
      userId: roadmap.userId,
      title: roadmap.title,
      description: roadmap.description || '',
      targetRole: roadmap.targetRole,
      difficulty: roadmap.difficulty,
      estimatedDuration: roadmap.estimatedDuration,
      
      phases: roadmapData.phases || [],
      totalSkills: roadmapData.totalSkills || [],
      careerProgression: roadmapData.careerProgression || [],
      
      personalizedFor: roadmap.personalizedFor || {},
      aiAnalysis: roadmap.aiAnalysis || {},
      
      dataSourceIds: roadmap.dataSourceIds || [],
      basedOnSurvey: roadmap.basedOnSurvey,
      basedOnSimulation: roadmap.basedOnSimulation,
    };
  }

  /**
   * 로드맵 요약 생성
   */
  static generateRoadmapSummary(roadmap: GeneratedRoadmap): any {
    const totalMilestones = roadmap.phases.reduce((sum, phase) => sum + phase.milestones.length, 0);
    const highPriorityMilestones = roadmap.phases.reduce((sum, phase) => 
      sum + phase.milestones.filter(m => m.priority === 'high').length, 0
    );

    return {
      title: roadmap.title,
      targetRole: roadmap.targetRole,
      difficulty: roadmap.difficulty,
      estimatedDuration: `${roadmap.estimatedDuration}개월`,
      totalPhases: roadmap.phases.length,
      totalMilestones,
      highPriorityMilestones,
      keySkills: roadmap.totalSkills.slice(0, 5),
      nextMilestone: this.getNextMilestone(roadmap),
      confidenceLevel: roadmap.aiAnalysis.confidence || 0.8,
    };
  }

  /**
   * 다음 마일스톤 찾기
   */
  private static getNextMilestone(roadmap: GeneratedRoadmap): any {
    for (const phase of roadmap.phases) {
      for (const milestone of phase.milestones) {
        if (!milestone.isCompleted) {
          return {
            title: milestone.title,
            phase: phase.title,
            priority: milestone.priority,
            estimatedHours: milestone.estimatedHours,
          };
        }
      }
    }
    return null;
  }
}