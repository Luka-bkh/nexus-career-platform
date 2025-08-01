import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { decryptData } from '../utils/encryption';
import { CreditService, CreditTransactionData } from './CreditService';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// 진로 추천 인터페이스
export interface CareerRecommendation {
  title: string;
  matchScore: number;
  description: string;
  category: string;
  averageSalary: string;
  growthProspect: 'high' | 'medium' | 'low';
  requiredSkills: string[];
  workEnvironment: string[];
  educationLevel: string;
  jobMarketDemand: 'high' | 'medium' | 'low';
}

export interface CareerAnalysisResult {
  recommendedCareers: CareerRecommendation[];
  careerRoadmaps: Record<string, any>;
  skillGaps: Array<{
    skill: string;
    currentLevel: number;
    requiredLevel: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  learningPaths: Array<{
    title: string;
    duration: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    modules: string[];
    estimatedCost: string;
  }>;
  personalityInsights: Array<{
    trait: string;
    score: number;
    description: string;
    careerImplications: string[];
  }>;
}

export class CareerRecommendationService {
  /**
   * 설문 데이터 기반 진로 추천 생성
   */
  static async generateInitialRecommendation(
    userId: string,
    surveyId: string
  ): Promise<CareerAnalysisResult> {
    try {
      // 설문 데이터 조회
      const survey = await prisma.careerSurvey.findFirst({
        where: {
          id: surveyId,
          userId,
          isCompleted: true,
        },
      });

      if (!survey) {
        throw createError.notFound('완료된 설문을 찾을 수 없습니다.');
      }

      // 설문 데이터 복호화
      const basicInfo = decryptData(survey.basicInfo);
      const interests = decryptData(survey.interests);
      const strengths = decryptData(survey.strengths);
      const personality = decryptData(survey.personality);

      logger.info('Processing career recommendation', {
        userId,
        surveyId,
        hasBasicInfo: !!basicInfo,
        hasInterests: !!interests,
        hasStrengths: !!strengths,
        hasPersonality: !!personality,
      });

      // AI 추천 로직 실행
      const analysis = await this.processCareerAnalysis({
        basicInfo,
        interests,
        strengths,
        personality,
      });

      // 추천 결과 저장
      const result = await prisma.careerResult.create({
        data: {
          userId,
          careerSurveyId: surveyId,
          recommendedCareers: analysis.recommendedCareers,
          careerRoadmaps: analysis.careerRoadmaps,
          skillGaps: analysis.skillGaps,
          learningPaths: analysis.learningPaths,
          matchScore: this.calculateOverallMatchScore(analysis.recommendedCareers),
          confidence: this.calculateConfidenceScore(analysis),
          creditsUsed: 1,
        },
      });

      // 크레딧 차감
      await CreditService.deductCredits({
        userId,
        type: 'ANALYSIS_USAGE',
        amount: 1,
        reason: '진로 분석 서비스 이용',
        description: 'AI 기반 진로 추천 분석',
        relatedId: result.id,
        relatedType: 'career_result',
      });

      // 첫 분석 완료 보너스 크레딧 지급
      const isFirstAnalysis = await this.isFirstAnalysis(userId);
      if (isFirstAnalysis) {
        await CreditService.awardCredits({
          userId,
          type: 'SURVEY_COMPLETION',
          amount: 2,
          reason: '첫 진로 분석 완료 보너스',
          description: '첫 번째 진로 분석 완료에 따른 보너스 크레딧',
          relatedId: result.id,
          relatedType: 'career_result',
        });
      }

      logger.logEvent('career_analysis_completed', {
        userId,
        resultId: result.id,
        surveyId,
        matchScore: result.matchScore,
        confidence: result.confidence,
        isFirstAnalysis,
      }, userId);

      return analysis;
    } catch (error) {
      logger.error('Career recommendation generation failed', { userId, surveyId, error });
      throw error;
    }
  }

  /**
   * AI 기반 진로 분석 처리 (초기 규칙 기반 모델)
   */
  private static async processCareerAnalysis(surveyData: any): Promise<CareerAnalysisResult> {
    const { basicInfo, interests, strengths, personality } = surveyData;

    // 1. 관심사 기반 직업 매칭
    const careersByInterest = this.mapInterestsToCareers(interests.interests);
    
    // 2. 강점 기반 직업 필터링
    const careersByStrength = this.mapStrengthsToCareers(strengths.skills);
    
    // 3. 성격 기반 직업 보정
    const personalityAdjustment = this.getPersonalityAdjustment(personality.personality);
    
    // 4. 최종 추천 목록 생성
    const recommendedCareers = this.generateFinalRecommendations(
      careersByInterest,
      careersByStrength,
      personalityAdjustment,
      basicInfo,
      interests.workEnvironment
    );

    // 5. 스킬 갭 분석
    const skillGaps = this.analyzeSkillGaps(recommendedCareers, strengths.skills);
    
    // 6. 학습 경로 추천
    const learningPaths = this.generateLearningPaths(recommendedCareers, skillGaps);
    
    // 7. 진로 로드맵 생성
    const careerRoadmaps = this.generateCareerRoadmaps(recommendedCareers, basicInfo);
    
    // 8. 성격 인사이트 생성
    const personalityInsights = this.generatePersonalityInsights(personality.personality);

    return {
      recommendedCareers,
      careerRoadmaps,
      skillGaps,
      learningPaths,
      personalityInsights,
    };
  }

  /**
   * 관심사를 직업으로 매핑
   */
  private static mapInterestsToCareers(interests: string[]): Record<string, number> {
    const careerMapping: Record<string, string[]> = {
      'technology': ['AI 개발자', '소프트웨어 엔지니어', '데이터 사이언티스트', 'DevOps 엔지니어', '보안 전문가'],
      'business': ['비즈니스 애널리스트', '마케팅 매니저', '프로덕트 매니저', '컨설턴트', '기업가'],
      'creative': ['UX/UI 디자이너', '그래픽 디자이너', '영상 제작자', '웹 디자이너', '콘텐츠 크리에이터'],
      'education': ['교육 컨설턴트', '강사', '교육과정 개발자', '교육 기술 전문가', '연구원'],
      'healthcare': ['의료 데이터 분석가', '의료기기 개발자', '헬스케어 IT 전문가', '바이오 엔지니어'],
      'service': ['고객 성공 매니저', '세일즈 매니저', '호텔리어', '이벤트 플래너'],
      'manufacturing': ['생산 관리자', '품질 관리 전문가', '공정 엔지니어', '로봇 엔지니어'],
      'finance': ['핀테크 개발자', '투자 분석가', '재무 분석가', '보험계리사']
    };

    const careerScores: Record<string, number> = {};

    interests.forEach(interest => {
      const careers = careerMapping[interest] || [];
      careers.forEach(career => {
        careerScores[career] = (careerScores[career] || 0) + 1;
      });
    });

    return careerScores;
  }

  /**
   * 강점을 직업으로 매핑
   */
  private static mapStrengthsToCareers(skills: string[]): Record<string, number> {
    const skillMapping: Record<string, string[]> = {
      'programming': ['AI 개발자', '소프트웨어 엔지니어', '데이터 사이언티스트', 'DevOps 엔지니어'],
      'analytical': ['데이터 사이언티스트', '비즈니스 애널리스트', '투자 분석가', '연구원'],
      'creativity': ['UX/UI 디자이너', '콘텐츠 크리에이터', '프로덕트 매니저', '마케팅 매니저'],
      'communication': ['마케팅 매니저', '세일즈 매니저', '컨설턴트', '교육 컨설턴트'],
      'leadership': ['프로덕트 매니저', '팀 리더', '기업가', '프로젝트 매니저'],
      'problem_solving': ['AI 개발자', '컨설턴트', '보안 전문가', '시스템 분석가']
    };

    const careerScores: Record<string, number> = {};

    skills.forEach(skill => {
      const careers = skillMapping[skill] || [];
      careers.forEach(career => {
        careerScores[career] = (careerScores[career] || 0) + 1;
      });
    });

    return careerScores;
  }

  /**
   * 성격 기반 보정값 계산
   */
  private static getPersonalityAdjustment(personality: any): Record<string, number> {
    const adjustments: Record<string, number> = {};

    // 외향성이 높으면 소통 관련 직업 가산점
    if (personality.extroversion >= 4) {
      adjustments['마케팅 매니저'] = 0.2;
      adjustments['세일즈 매니저'] = 0.2;
      adjustments['컨설턴트'] = 0.1;
    }

    // 성실성이 높으면 관리 관련 직업 가산점
    if (personality.conscientiousness >= 4) {
      adjustments['프로젝트 매니저'] = 0.2;
      adjustments['품질 관리 전문가'] = 0.2;
    }

    // 개방성이 높으면 창의적 직업 가산점
    if (personality.openness >= 4) {
      adjustments['AI 개발자'] = 0.2;
      adjustments['UX/UI 디자이너'] = 0.2;
      adjustments['연구원'] = 0.1;
    }

    return adjustments;
  }

  /**
   * 최종 추천 목록 생성
   */
  private static generateFinalRecommendations(
    interestScores: Record<string, number>,
    strengthScores: Record<string, number>,
    personalityAdjustment: Record<string, number>,
    basicInfo: any,
    workEnvironment: string
  ): CareerRecommendation[] {
    // 모든 직업 목록 통합
    const allCareers = new Set([
      ...Object.keys(interestScores),
      ...Object.keys(strengthScores),
    ]);

    const careerRecommendations: CareerRecommendation[] = [];

    allCareers.forEach(career => {
      const interestScore = interestScores[career] || 0;
      const strengthScore = strengthScores[career] || 0;
      const personalityBonus = personalityAdjustment[career] || 0;

      // 기본 매치 스코어 계산 (관심사 40%, 강점 40%, 성격 20%)
      let matchScore = (interestScore * 0.4 + strengthScore * 0.4) * 20 + personalityBonus * 100;

      // 경력에 따른 보정
      if (basicInfo.experience === '없음' && this.isEntryLevelFriendly(career)) {
        matchScore += 5;
      } else if (basicInfo.experience === '10년 이상' && this.isSeniorRole(career)) {
        matchScore += 10;
      }

      // 근무 환경 선호도 반영
      if (this.matchesWorkEnvironment(career, workEnvironment)) {
        matchScore += 5;
      }

      // 최대 100점으로 제한
      matchScore = Math.min(matchScore, 100);

      if (matchScore >= 50) { // 50점 이상만 추천
        careerRecommendations.push({
          title: career,
          matchScore: Math.round(matchScore),
          description: this.getCareerDescription(career),
          category: this.getCareerCategory(career),
          averageSalary: this.getAverageSalary(career),
          growthProspect: this.getGrowthProspect(career),
          requiredSkills: this.getRequiredSkills(career),
          workEnvironment: this.getWorkEnvironment(career),
          educationLevel: this.getEducationLevel(career),
          jobMarketDemand: this.getJobMarketDemand(career),
        });
      }
    });

    // 점수 기준 정렬 후 상위 8개 반환
    return careerRecommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);
  }

  /**
   * 스킬 갭 분석
   */
  private static analyzeSkillGaps(careers: CareerRecommendation[], currentSkills: string[]): any[] {
    const skillGaps: any[] = [];
    const skillLevels: Record<string, number> = {};

    // 현재 스킬 레벨 설정
    currentSkills.forEach(skill => {
      skillLevels[skill] = 3; // 기본 3레벨로 설정
    });

    // 각 추천 직업의 필요 스킬 분석
    careers.forEach(career => {
      career.requiredSkills.forEach(skill => {
        const currentLevel = skillLevels[skill] || 0;
        const requiredLevel = this.getSkillRequiredLevel(skill, career.title);
        
        if (currentLevel < requiredLevel) {
          const existingGap = skillGaps.find(gap => gap.skill === skill);
          if (!existingGap) {
            skillGaps.push({
              skill,
              currentLevel,
              requiredLevel,
              priority: this.getSkillPriority(skill, careers),
            });
          }
        }
      });
    });

    return skillGaps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 학습 경로 생성
   */
  private static generateLearningPaths(careers: CareerRecommendation[], skillGaps: any[]): any[] {
    const learningPaths: any[] = [];

    // 상위 3개 직업에 대한 학습 경로 생성
    careers.slice(0, 3).forEach(career => {
      const path = {
        title: `${career.title} 완성 과정`,
        duration: this.calculateLearningDuration(career, skillGaps),
        difficulty: this.getDifficulty(career),
        modules: this.generateLearningModules(career, skillGaps),
        estimatedCost: this.estimateLearningCost(career),
      };
      learningPaths.push(path);
    });

    return learningPaths;
  }

  /**
   * 진로 로드맵 생성
   */
  private static generateCareerRoadmaps(careers: CareerRecommendation[], basicInfo: any): Record<string, any> {
    const roadmaps: Record<string, any> = {};

    careers.slice(0, 5).forEach(career => {
      roadmaps[career.title] = {
        shortTerm: this.getShortTermGoals(career, basicInfo),
        mediumTerm: this.getMediumTermGoals(career, basicInfo),
        longTerm: this.getLongTermGoals(career, basicInfo),
        timeline: this.getTimeline(career, basicInfo),
      };
    });

    return roadmaps;
  }

  /**
   * 성격 인사이트 생성
   */
  private static generatePersonalityInsights(personality: any): any[] {
    const insights: any[] = [];

    Object.entries(personality).forEach(([trait, score]: [string, any]) => {
      const insight = {
        trait: this.getPersonalityTraitName(trait),
        score: score,
        description: this.getPersonalityDescription(trait, score),
        careerImplications: this.getCareerImplications(trait, score),
      };
      insights.push(insight);
    });

    return insights;
  }

  // ========== 헬퍼 메서드들 ==========

  private static async isFirstAnalysis(userId: string): Promise<boolean> {
    const count = await prisma.careerResult.count({
      where: { userId },
    });
    return count === 0;
  }

  private static calculateOverallMatchScore(careers: CareerRecommendation[]): number {
    if (careers.length === 0) return 0;
    return careers.reduce((sum, career) => sum + career.matchScore, 0) / careers.length;
  }

  private static calculateConfidenceScore(analysis: CareerAnalysisResult): number {
    const careerCount = analysis.recommendedCareers.length;
    const avgScore = analysis.recommendedCareers.reduce((sum, career) => sum + career.matchScore, 0) / careerCount;
    const variance = analysis.recommendedCareers.reduce((sum, career) => sum + Math.pow(career.matchScore - avgScore, 2), 0) / careerCount;
    
    // 낮은 분산은 높은 신뢰도를 의미
    const confidenceScore = Math.max(0.6, 1 - (variance / 1000));
    return Math.round(confidenceScore * 100) / 100;
  }

  private static isEntryLevelFriendly(career: string): boolean {
    const entryFriendly = ['소프트웨어 엔지니어', 'UX/UI 디자이너', '마케팅 매니저', '콘텐츠 크리에이터'];
    return entryFriendly.includes(career);
  }

  private static isSeniorRole(career: string): boolean {
    const seniorRoles = ['AI 개발자', '컨설턴트', '프로덕트 매니저', '시스템 아키텍트'];
    return seniorRoles.includes(career);
  }

  private static matchesWorkEnvironment(career: string, workEnvironment: string): boolean {
    const remoteFreindly = ['소프트웨어 엔지니어', 'AI 개발자', 'UX/UI 디자이너', '데이터 사이언티스트'];
    const officeRequired = ['마케팅 매니저', '세일즈 매니저', '프로덕트 매니저'];
    
    if (workEnvironment === 'remote' && remoteFreindly.includes(career)) return true;
    if (workEnvironment === 'office' && officeRequired.includes(career)) return true;
    if (workEnvironment === 'hybrid') return true;
    
    return false;
  }

  private static getCareerDescription(career: string): string {
    const descriptions: Record<string, string> = {
      'AI 개발자': '인공지능 모델 개발 및 구현을 담당하는 전문가',
      '소프트웨어 엔지니어': '소프트웨어 시스템 설계 및 개발',
      '데이터 사이언티스트': '데이터 분석을 통한 비즈니스 인사이트 도출',
      'UX/UI 디자이너': '사용자 경험과 인터페이스 디자인',
      '마케팅 매니저': '마케팅 전략 수립 및 캠페인 실행',
      '프로덕트 매니저': '제품 기획 및 개발 프로세스 관리',
    };
    return descriptions[career] || '해당 분야의 전문가';
  }

  private static getCareerCategory(career: string): string {
    const categories: Record<string, string> = {
      'AI 개발자': 'Technology',
      '소프트웨어 엔지니어': 'Technology',
      '데이터 사이언티스트': 'Technology',
      'UX/UI 디자이너': 'Design',
      '마케팅 매니저': 'Business',
      '프로덕트 매니저': 'Business',
    };
    return categories[career] || 'General';
  }

  private static getAverageSalary(career: string): string {
    const salaries: Record<string, string> = {
      'AI 개발자': '6000-8000만원',
      '소프트웨어 엔지니어': '4500-6500만원',
      '데이터 사이언티스트': '5000-7000만원',
      'UX/UI 디자이너': '4000-6000만원',
      '마케팅 매니저': '4500-6500만원',
      '프로덕트 매니저': '5500-8000만원',
    };
    return salaries[career] || '4000-6000만원';
  }

  private static getGrowthProspect(career: string): 'high' | 'medium' | 'low' {
    const prospects: Record<string, 'high' | 'medium' | 'low'> = {
      'AI 개발자': 'high',
      '소프트웨어 엔지니어': 'high',
      '데이터 사이언티스트': 'high',
      'UX/UI 디자이너': 'medium',
      '마케팅 매니저': 'medium',
      '프로덕트 매니저': 'high',
    };
    return prospects[career] || 'medium';
  }

  private static getRequiredSkills(career: string): string[] {
    const skills: Record<string, string[]> = {
      'AI 개발자': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch'],
      '소프트웨어 엔지니어': ['JavaScript', 'React', 'Node.js', 'Git', 'Database'],
      '데이터 사이언티스트': ['Python', 'SQL', 'Statistics', 'Pandas', 'Visualization'],
      'UX/UI 디자이너': ['Figma', 'Sketch', 'Prototyping', 'User Research', 'HTML/CSS'],
      '마케팅 매니저': ['Digital Marketing', 'Analytics', 'SEO/SEM', 'Content Strategy'],
      '프로덕트 매니저': ['Product Strategy', 'Agile', 'Analytics', 'User Research'],
    };
    return skills[career] || ['Communication', 'Problem Solving'];
  }

  private static getWorkEnvironment(career: string): string[] {
    const environments: Record<string, string[]> = {
      'AI 개발자': ['Remote', 'Hybrid', 'Tech Office'],
      '소프트웨어 엔지니어': ['Remote', 'Hybrid', 'Tech Office'],
      '데이터 사이언티스트': ['Remote', 'Hybrid', 'Office'],
      'UX/UI 디자이너': ['Remote', 'Hybrid', 'Creative Space'],
      '마케팅 매니저': ['Office', 'Hybrid', 'Creative Space'],
      '프로덕트 매니저': ['Office', 'Hybrid', 'Collaborative Space'],
    };
    return environments[career] || ['Office', 'Hybrid'];
  }

  private static getEducationLevel(career: string): string {
    const education: Record<string, string> = {
      'AI 개발자': '대학교 졸업 (컴공/수학/통계)',
      '소프트웨어 엔지니어': '대학교 졸업 또는 부트캠프',
      '데이터 사이언티스트': '대학교 졸업 (통계/수학/컴공)',
      'UX/UI 디자이너': '대학교 졸업 또는 디자인 교육',
      '마케팅 매니저': '대학교 졸업 (마케팅/경영)',
      '프로덕트 매니저': '대학교 졸업 (다양한 전공)',
    };
    return education[career] || '대학교 졸업';
  }

  private static getJobMarketDemand(career: string): 'high' | 'medium' | 'low' {
    const demand: Record<string, 'high' | 'medium' | 'low'> = {
      'AI 개발자': 'high',
      '소프트웨어 엔지니어': 'high',
      '데이터 사이언티스트': 'high',
      'UX/UI 디자이너': 'medium',
      '마케팅 매니저': 'medium',
      '프로덕트 매니저': 'high',
    };
    return demand[career] || 'medium';
  }

  private static getSkillRequiredLevel(skill: string, career: string): number {
    // 스킬과 직업에 따른 요구 레벨 (1-5)
    if (skill === 'Python' && career === 'AI 개발자') return 5;
    if (skill === 'Machine Learning' && career === 'AI 개발자') return 5;
    if (skill === 'JavaScript' && career === '소프트웨어 엔지니어') return 4;
    return 3; // 기본값
  }

  private static getSkillPriority(skill: string, careers: CareerRecommendation[]): 'high' | 'medium' | 'low' {
    const careerCount = careers.filter(career => career.requiredSkills.includes(skill)).length;
    if (careerCount >= 3) return 'high';
    if (careerCount >= 2) return 'medium';
    return 'low';
  }

  private static calculateLearningDuration(career: CareerRecommendation, skillGaps: any[]): string {
    const gapCount = skillGaps.filter(gap => 
      career.requiredSkills.includes(gap.skill) && gap.priority === 'high'
    ).length;
    
    if (gapCount >= 3) return '6-9개월';
    if (gapCount >= 2) return '3-6개월';
    return '1-3개월';
  }

  private static getDifficulty(career: CareerRecommendation): 'beginner' | 'intermediate' | 'advanced' {
    const techCareers = ['AI 개발자', '데이터 사이언티스트'];
    if (techCareers.includes(career.title)) return 'advanced';
    if (career.title.includes('매니저')) return 'intermediate';
    return 'beginner';
  }

  private static generateLearningModules(career: CareerRecommendation, skillGaps: any[]): string[] {
    const relevantGaps = skillGaps.filter(gap => career.requiredSkills.includes(gap.skill));
    return relevantGaps.slice(0, 5).map(gap => `${gap.skill} 마스터 과정`);
  }

  private static estimateLearningCost(career: CareerRecommendation): string {
    const costs: Record<string, string> = {
      'AI 개발자': '200-500만원',
      '소프트웨어 엔지니어': '100-300만원',
      '데이터 사이언티스트': '150-400만원',
      'UX/UI 디자이너': '100-250만원',
    };
    return costs[career.title] || '50-200만원';
  }

  private static getShortTermGoals(career: CareerRecommendation, basicInfo: any): string[] {
    return [
      `${career.requiredSkills[0]} 기초 학습`,
      '온라인 강의 수강',
      '기본 프로젝트 완성'
    ];
  }

  private static getMediumTermGoals(career: CareerRecommendation, basicInfo: any): string[] {
    return [
      '실무 프로젝트 경험',
      '포트폴리오 구축',
      '네트워킹 활동'
    ];
  }

  private static getLongTermGoals(career: CareerRecommendation, basicInfo: any): string[] {
    return [
      `${career.title} 전문가 인증`,
      '시니어 레벨 달성',
      '팀 리더십 역할'
    ];
  }

  private static getTimeline(career: CareerRecommendation, basicInfo: any): any {
    return {
      '0-6개월': '기초 학습 및 입문',
      '6-18개월': '실무 경험 축적',
      '18개월-3년': '전문성 개발',
      '3년+': '리더십 및 전문가'
    };
  }

  private static getPersonalityTraitName(trait: string): string {
    const names: Record<string, string> = {
      'extroversion': '외향성',
      'conscientiousness': '성실성',
      'openness': '개방성',
      'agreeableness': '호감성',
      'neuroticism': '신경성'
    };
    return names[trait] || trait;
  }

  private static getPersonalityDescription(trait: string, score: number): string {
    const descriptions: Record<string, Record<string, string>> = {
      'extroversion': {
        'high': '사람들과의 상호작용에서 에너지를 얻으며 활발한 성격',
        'medium': '상황에 따라 내향적/외향적 특성을 보임',
        'low': '혼자만의 시간을 선호하며 깊이 있는 관계를 추구'
      }
    };
    
    const level = score >= 4 ? 'high' : score >= 3 ? 'medium' : 'low';
    return descriptions[trait]?.[level] || '개인의 고유한 특성';
  }

  private static getCareerImplications(trait: string, score: number): string[] {
    if (trait === 'extroversion' && score >= 4) {
      return ['팀워크 중심 환경에 적합', '고객 대면 업무 선호', '프레젠테이션 능력 우수'];
    }
    if (trait === 'conscientiousness' && score >= 4) {
      return ['계획적이고 체계적인 업무 선호', '품질 관리에 강점', '장기 프로젝트 적합'];
    }
    return ['개인의 강점을 활용한 역할 추천'];
  }
}