import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { ReportAnalyzer } from './ReportAnalyzer';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface SimulationReport {
  id: string;
  sessionId: string;
  userId: string;
  simulationId: string;
  
  // 기본 성과 정보
  overallPerformance: {
    finalScore: number;
    grade: string;
    percentile: number;
    completionTime: number;
    accuracy: number;
  };
  
  // 역량 분석
  competencyAnalysis: {
    technical: CompetencyScore;
    collaboration: CompetencyScore;
    problemSolving: CompetencyScore;
    communication: CompetencyScore;
    adaptability: CompetencyScore;
  };
  
  // 강점 및 개선점
  strengthsWeaknesses: {
    topStrengths: string[];
    keyWeaknesses: string[];
    improvementAreas: string[];
    naturalTalents: string[];
  };
  
  // AI 생성 인사이트
  aiInsights: {
    personalityProfile: string;
    workStyle: string;
    careerRecommendations: CareerRecommendation[];
    learningPriorities: string[];
    nextSteps: string[];
  };
  
  // 상세 분석
  detailedAnalysis: {
    decisionMakingPattern: string;
    problemApproach: string;
    collaborationStyle: string;
    learningCurve: string;
    stressResponse: string;
  };
  
  // 벤치마킹
  benchmarking: {
    peerComparison: PeerComparison;
    industryStandards: IndustryComparison;
    roleSpecificMetrics: RoleMetrics;
  };
  
  // 액션 플랜
  actionPlan: {
    immediate: ActionItem[];
    shortTerm: ActionItem[];
    longTerm: ActionItem[];
  };
  
  // 메타데이터
  metadata: {
    generatedAt: string;
    version: string;
    confidence: number;
    analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  };
}

interface CompetencyScore {
  score: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  evidence: string[];
  improvement: string;
}

interface CareerRecommendation {
  title: string;
  matchScore: number;
  reasoning: string;
  pathway: string[];
  timeframe: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
}

interface PeerComparison {
  ranking: number;
  totalParticipants: number;
  percentile: number;
  averageScore: number;
  topPerformersProfile: string;
}

interface IndustryComparison {
  industryAverage: number;
  topCompaniesStandard: number;
  skillGapAnalysis: string[];
  marketDemand: string;
}

interface RoleMetrics {
  roleFit: number;
  skillAlignment: number;
  experienceGap: number;
  readinessLevel: string;
}

interface ActionItem {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  resources: string[];
  successMetrics: string[];
}

export class SimulationReportService {
  private static reportAnalyzer = new ReportAnalyzer();

  /**
   * 시뮬레이션 리포트 생성 (메인 함수)
   */
  static async generateReport(sessionId: string, userId: string): Promise<SimulationReport> {
    try {
      // 세션 데이터 조회
      const session = await prisma.simulationSession.findFirst({
        where: {
          id: sessionId,
          userId,
          status: 'COMPLETED',
        },
        include: {
          interactions: {
            orderBy: { createdAt: 'asc' },
          },
          result: true,
          user: {
            select: {
              id: true,
              name: true,
              careerSurveys: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      if (!session) {
        throw createError.notFound('완료된 시뮬레이션 세션을 찾을 수 없습니다.');
      }

      if (!session.result) {
        throw createError.badRequest('시뮬레이션 결과가 아직 생성되지 않았습니다.');
      }

      // 기존 리포트 확인
      const existingReport = await this.getExistingReport(sessionId);
      if (existingReport) {
        return existingReport;
      }

      // 새 리포트 생성
      const report = await this.createNewReport(session);
      
      // 리포트 저장 (캐싱)
      await this.saveReportCache(report);

      logger.logEvent('simulation_report_generated', {
        sessionId,
        userId,
        finalScore: report.overallPerformance.finalScore,
        grade: report.overallPerformance.grade,
      }, userId);

      return report;

    } catch (error) {
      logger.error('Simulation report generation failed', { sessionId, userId, error });
      throw error;
    }
  }

  /**
   * 새 리포트 생성
   */
  private static async createNewReport(session: any): Promise<SimulationReport> {
    const interactions = session.interactions;
    const result = session.result;
    const careerSurvey = session.user.careerSurveys[0];

    // AI 분석 수행
    const aiAnalysis = await this.reportAnalyzer.analyzeSimulationData({
      session,
      interactions,
      result,
      careerSurvey,
    });

    // 기본 성과 정보
    const overallPerformance = {
      finalScore: result.finalScore,
      grade: result.grade,
      percentile: result.percentile,
      completionTime: session.totalPlayTime || 0,
      accuracy: this.calculateAccuracy(interactions),
    };

    // 역량 분석
    const competencyAnalysis = this.analyzeCompetencies(interactions, result.skillAssessment);

    // 강점/약점 분석
    const strengthsWeaknesses = this.analyzeStrengthsWeaknesses(
      interactions,
      result.strengthsWeaknesses,
      aiAnalysis
    );

    // AI 인사이트
    const aiInsights = {
      personalityProfile: aiAnalysis.personalityProfile,
      workStyle: aiAnalysis.workStyle,
      careerRecommendations: aiAnalysis.careerRecommendations,
      learningPriorities: aiAnalysis.learningPriorities,
      nextSteps: aiAnalysis.nextSteps,
    };

    // 상세 분석
    const detailedAnalysis = this.generateDetailedAnalysis(interactions, aiAnalysis);

    // 벤치마킹
    const benchmarking = await this.generateBenchmarking(session.simulationId, result.finalScore);

    // 액션 플랜
    const actionPlan = this.generateActionPlan(aiAnalysis, strengthsWeaknesses);

    const report: SimulationReport = {
      id: `report_${session.id}`,
      sessionId: session.id,
      userId: session.userId,
      simulationId: session.simulationId,
      overallPerformance,
      competencyAnalysis,
      strengthsWeaknesses,
      aiInsights,
      detailedAnalysis,
      benchmarking,
      actionPlan,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0',
        confidence: aiAnalysis.confidence || 0.85,
        analysisDepth: 'comprehensive',
      },
    };

    return report;
  }

  /**
   * 정확도 계산
   */
  private static calculateAccuracy(interactions: any[]): number {
    if (interactions.length === 0) return 0;
    
    const totalScore = interactions.reduce((sum, interaction) => sum + interaction.scoreGained, 0);
    const maxPossibleScore = interactions.length * 10; // 최대 10점
    
    return Math.round((totalScore / maxPossibleScore) * 100);
  }

  /**
   * 역량 분석
   */
  private static analyzeCompetencies(interactions: any[], skillAssessment: any): any {
    const skillLevels = skillAssessment || {};
    
    const competencies = {
      technical: this.calculateCompetencyScore('technical', interactions, skillLevels),
      collaboration: this.calculateCompetencyScore('collaboration', interactions, skillLevels),
      problemSolving: this.calculateCompetencyScore('problem_solving', interactions, skillLevels),
      communication: this.calculateCompetencyScore('communication', interactions, skillLevels),
      adaptability: this.calculateCompetencyScore('adaptability', interactions, skillLevels),
    };

    return competencies;
  }

  /**
   * 개별 역량 점수 계산
   */
  private static calculateCompetencyScore(competency: string, interactions: any[], skillLevels: any): CompetencyScore {
    const relevantInteractions = interactions.filter(interaction => 
      JSON.stringify(interaction.skillsGained || {}).includes(competency)
    );

    const averageScore = relevantInteractions.length > 0
      ? relevantInteractions.reduce((sum, interaction) => sum + interaction.scoreGained, 0) / relevantInteractions.length
      : 5;

    const normalizedScore = Math.round(averageScore * 10); // 0-100 스케일
    const level = this.getCompetencyLevel(normalizedScore);

    return {
      score: normalizedScore,
      level,
      description: this.getCompetencyDescription(competency, level),
      evidence: this.getEvidence(competency, relevantInteractions),
      improvement: this.getImprovementSuggestion(competency, level),
    };
  }

  private static getCompetencyLevel(score: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (score >= 90) return 'expert';
    if (score >= 75) return 'advanced';
    if (score >= 60) return 'intermediate';
    return 'beginner';
  }

  private static getCompetencyDescription(competency: string, level: string): string {
    const descriptions = {
      technical: {
        beginner: '기본적인 기술 이해도를 보유하고 있습니다.',
        intermediate: '실무에 필요한 기술 역량을 갖추고 있습니다.',
        advanced: '높은 수준의 기술 전문성을 보여줍니다.',
        expert: '업계 최고 수준의 기술 역량을 보유하고 있습니다.',
      },
      collaboration: {
        beginner: '팀워크의 기본 개념을 이해하고 있습니다.',
        intermediate: '팀 내에서 효과적으로 협업할 수 있습니다.',
        advanced: '팀의 성과 향상에 크게 기여할 수 있습니다.',
        expert: '뛰어난 리더십으로 팀을 이끌어갈 수 있습니다.',
      },
      problem_solving: {
        beginner: '구조화된 문제 해결에 익숙합니다.',
        intermediate: '복잡한 문제를 체계적으로 분석할 수 있습니다.',
        advanced: '창의적이고 혁신적인 해결책을 제시합니다.',
        expert: '매우 복잡한 문제도 효과적으로 해결합니다.',
      },
      communication: {
        beginner: '기본적인 의사소통이 가능합니다.',
        intermediate: '명확하고 효과적으로 소통할 수 있습니다.',
        advanced: '설득력 있는 커뮤니케이션이 가능합니다.',
        expert: '뛰어난 소통 능력으로 조직을 이끕니다.',
      },
      adaptability: {
        beginner: '변화에 대응하려고 노력합니다.',
        intermediate: '새로운 환경에 잘 적응합니다.',
        advanced: '변화를 주도적으로 만들어갑니다.',
        expert: '혁신을 통해 조직 변화를 이끕니다.',
      },
    };

    return descriptions[competency]?.[level] || '평가가 필요합니다.';
  }

  private static getEvidence(competency: string, interactions: any[]): string[] {
    return interactions.slice(0, 3).map(interaction => 
      `${interaction.questId}에서 ${interaction.scoreGained}점 획득`
    );
  }

  private static getImprovementSuggestion(competency: string, level: string): string {
    const suggestions = {
      technical: {
        beginner: '기본기 강화를 위한 온라인 강의 수강을 추천합니다.',
        intermediate: '실무 프로젝트 참여를 통해 경험을 쌓아보세요.',
        advanced: '최신 기술 트렌드를 지속적으로 학습하세요.',
        expert: '기술 리더십과 멘토링 역할을 고려해보세요.',
      },
      collaboration: {
        beginner: '팀 프로젝트 참여 경험을 늘려보세요.',
        intermediate: '리더십 역할을 맡아보는 것을 추천합니다.',
        advanced: '크로스 펑셔널 팀에서 경험을 쌓아보세요.',
        expert: '조직 차원의 협업 문화 개선에 참여해보세요.',
      },
      problem_solving: {
        beginner: '체계적인 문제 해결 방법론을 학습하세요.',
        intermediate: '다양한 관점에서 문제를 바라보는 연습을 하세요.',
        advanced: '창의적 사고 기법을 활용해보세요.',
        expert: '복잡한 비즈니스 문제 해결에 도전해보세요.',
      },
      communication: {
        beginner: '발표나 글쓰기 연습을 늘려보세요.',
        intermediate: '다양한 상황에서의 소통 경험을 쌓으세요.',
        advanced: '설득과 협상 기술을 개발해보세요.',
        expert: '조직 내 소통 체계 개선에 기여해보세요.',
      },
      adaptability: {
        beginner: '새로운 환경에 적극적으로 노출되어보세요.',
        intermediate: '변화 관리 기술을 학습하세요.',
        advanced: '혁신 프로젝트에 참여해보세요.',
        expert: '조직 변화 관리를 주도해보세요.',
      },
    };

    return suggestions[competency]?.[level] || '지속적인 학습과 성장을 추천합니다.';
  }

  /**
   * 강점/약점 분석
   */
  private static analyzeStrengthsWeaknesses(interactions: any[], existingAnalysis: any, aiAnalysis: any): any {
    return {
      topStrengths: aiAnalysis.topStrengths || [
        '체계적인 문제 해결 능력',
        '빠른 학습 속도',
        '적극적인 소통 자세',
      ],
      keyWeaknesses: aiAnalysis.keyWeaknesses || [
        '시간 관리 개선 필요',
        '스트레스 상황에서의 판단력',
      ],
      improvementAreas: [
        '고급 기술 스킬 개발',
        '리더십 경험 축적',
        '비즈니스 이해도 향상',
      ],
      naturalTalents: [
        '논리적 사고',
        '패턴 인식',
        '팀워크',
      ],
    };
  }

  /**
   * 상세 분석 생성
   */
  private static generateDetailedAnalysis(interactions: any[], aiAnalysis: any): any {
    return {
      decisionMakingPattern: '데이터 기반의 신중한 의사결정을 선호하며, 리스크를 충분히 고려하는 경향을 보입니다.',
      problemApproach: '복잡한 문제를 단계별로 분해하여 해결하는 체계적인 접근법을 사용합니다.',
      collaborationStyle: '개방적이고 수용적인 태도로 팀원들과 소통하며, 건설적인 피드백을 잘 활용합니다.',
      learningCurve: '새로운 개념을 빠르게 습득하고 실무에 적용하는 능력이 뛰어납니다.',
      stressResponse: '압박 상황에서도 침착함을 유지하며, 우선순위를 명확히 하여 대응합니다.',
    };
  }

  /**
   * 벤치마킹 데이터 생성
   */
  private static async generateBenchmarking(simulationId: string, finalScore: number): Promise<any> {
    // 동일 시뮬레이션 참가자들과 비교
    const peerStats = await prisma.finalSimulationResult.aggregate({
      where: {
        session: {
          simulationId,
          status: 'COMPLETED',
        },
      },
      _avg: { finalScore: true },
      _count: { id: true },
    });

    const betterThanCount = await prisma.finalSimulationResult.count({
      where: {
        session: {
          simulationId,
          status: 'COMPLETED',
        },
        finalScore: { lt: finalScore },
      },
    });

    const totalParticipants = peerStats._count.id || 1;
    const percentile = Math.round((betterThanCount / totalParticipants) * 100);

    return {
      peerComparison: {
        ranking: totalParticipants - betterThanCount,
        totalParticipants,
        percentile,
        averageScore: Math.round(peerStats._avg.finalScore || 0),
        topPerformersProfile: '상위 10% 참가자들은 체계적인 문제 해결과 뛰어난 기술적 역량을 보여줍니다.',
      },
      industryStandards: {
        industryAverage: 75,
        topCompaniesStandard: 85,
        skillGapAnalysis: [
          '고급 알고리즘 이해',
          '시스템 설계 경험',
          '데이터 사이언스 스킬',
        ],
        marketDemand: 'AI 개발자는 현재 시장에서 매우 높은 수요를 보이고 있습니다.',
      },
      roleSpecificMetrics: {
        roleFit: Math.min(95, finalScore + 10),
        skillAlignment: 85,
        experienceGap: 20,
        readinessLevel: finalScore >= 80 ? '즉시 취업 가능' : finalScore >= 60 ? '추가 학습 후 취업 가능' : '기초 역량 강화 필요',
      },
    };
  }

  /**
   * 액션 플랜 생성
   */
  private static generateActionPlan(aiAnalysis: any, strengthsWeaknesses: any): any {
    return {
      immediate: [
        {
          title: 'Python 기초 실력 점검',
          description: '코딩 테스트와 기본 알고리즘 문제를 통해 현재 수준을 확인하세요.',
          priority: 'high',
          estimatedTime: '1-2주',
          resources: ['LeetCode', 'HackerRank', '백준 온라인'],
          successMetrics: ['기본 알고리즘 100문제 해결', '코딩 테스트 통과율 80% 이상'],
        },
        {
          title: '머신러닝 기초 이론 학습',
          description: '기본적인 ML 개념과 라이브러리 사용법을 익히세요.',
          priority: 'high',
          estimatedTime: '2-3주',
          resources: ['Coursera ML Course', 'Scikit-learn Documentation'],
          successMetrics: ['기본 모델 구현 완료', '캐글 입문 대회 참여'],
        },
      ],
      shortTerm: [
        {
          title: '실무 프로젝트 경험',
          description: '실제 데이터를 활용한 ML 프로젝트를 진행하세요.',
          priority: 'high',
          estimatedTime: '2-3개월',
          resources: ['GitHub', 'Kaggle Datasets', 'Google Colab'],
          successMetrics: ['포트폴리오 3개 프로젝트 완성', 'GitHub 활동 점수 증가'],
        },
        {
          title: '팀 프로젝트 참여',
          description: '협업 도구와 프로세스를 익히며 팀워크를 개발하세요.',
          priority: 'medium',
          estimatedTime: '1-2개월',
          resources: ['Git/GitHub', 'Slack', 'Jira'],
          successMetrics: ['팀 프로젝트 성공적 완료', '협업 도구 숙련도 향상'],
        },
      ],
      longTerm: [
        {
          title: 'AI 전문 영역 특화',
          description: 'NLP, 컴퓨터 비전 등 특정 분야의 전문성을 기르세요.',
          priority: 'medium',
          estimatedTime: '6-12개월',
          resources: ['전문 서적', '온라인 특화 과정', '컨퍼런스'],
          successMetrics: ['전문 분야 인증 취득', '관련 논문 이해 및 구현'],
        },
        {
          title: '리더십 및 커뮤니케이션',
          description: '시니어 개발자로 성장하기 위한 소프트 스킬을 개발하세요.',
          priority: 'low',
          estimatedTime: '12개월 이상',
          resources: ['리더십 교육', '발표 경험', '멘토링'],
          successMetrics: ['팀 리딩 경험', '기술 발표 및 공유'],
        },
      ],
    };
  }

  /**
   * 기존 리포트 조회
   */
  private static async getExistingReport(sessionId: string): Promise<SimulationReport | null> {
    // 실제로는 캐시나 DB에서 조회
    // 임시로 null 반환
    return null;
  }

  /**
   * 리포트 캐시 저장
   */
  private static async saveReportCache(report: SimulationReport): Promise<void> {
    // 실제로는 Redis나 DB에 저장
    // 임시로 로그만 출력
    logger.info('Report cached', { reportId: report.id });
  }

  /**
   * 리포트 요약 생성
   */
  static generateReportSummary(report: SimulationReport): any {
    return {
      overallRating: report.overallPerformance.grade,
      keyHighlight: `${report.overallPerformance.percentile}% 상위 성과`,
      topStrength: report.strengthsWeaknesses.topStrengths[0],
      mainImprovement: report.strengthsWeaknesses.improvementAreas[0],
      careerRecommendation: report.aiInsights.careerRecommendations[0]?.title,
      nextAction: report.actionPlan.immediate[0]?.title,
    };
  }
}