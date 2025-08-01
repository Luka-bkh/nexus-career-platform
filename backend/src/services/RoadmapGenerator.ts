import { RoadmapDifficulty } from '@prisma/client';
import { 
  GeneratedRoadmap, 
  RoadmapPhase, 
  Milestone, 
  Resource, 
  CareerProgression, 
  PersonalizationData, 
  AIAnalysisMetadata 
} from './CareerRoadmapService';
import logger from '../utils/logger';

export interface UserDataInput {
  user: {
    id: string;
    name?: string;
    email: string;
    birthYear?: number;
    gender?: string;
    credits: number;
  };
  survey?: {
    id: string;
    basicInfo: any;
    interests: any;
    strengths: any;
    personality: any;
    completedAt: Date;
  };
  simulations: Array<{
    id: string;
    simulationId: string;
    finalScore: number;
    grade: string;
    skillLevels: any;
    totalPlayTime?: number;
    interactions: number;
    completedAt?: Date;
  }>;
  simulationResults: Array<{
    id: string;
    finalScore: number;
    grade: string;
    skillAssessment: any;
    strengthsWeaknesses: any;
    percentile: number;
    jobRecommendations: any;
  }>;
  dataSourceIds: string[];
  hasMinimumData: boolean;
}

export class RoadmapGenerator {

  /**
   * 개인화된 진로 로드맵 생성 (메인 함수)
   */
  async generatePersonalizedRoadmap(
    userData: UserDataInput,
    options?: {
      targetRole?: string;
      difficulty?: RoadmapDifficulty;
    }
  ): Promise<GeneratedRoadmap> {
    try {
      logger.info('Starting personalized roadmap generation', { userId: userData.user.id });

      // 1. 사용자 데이터 분석
      const analysis = await this.analyzeUserData(userData);
      
      // 2. 목표 직무 결정
      const targetRole = options?.targetRole || this.determineTargetRole(analysis);
      
      // 3. 로드맵 난이도 결정
      const difficulty = options?.difficulty || this.determineDifficulty(analysis);
      
      // 4. 개인화 정보 생성
      const personalization = this.generatePersonalizationData(analysis);
      
      // 5. 로드맵 단계 생성
      const phases = await this.generateRoadmapPhases(targetRole, difficulty, analysis, personalization);
      
      // 6. 진로 발전 경로 생성
      const careerProgression = this.generateCareerProgression(targetRole, difficulty);
      
      // 7. AI 분석 메타데이터 생성
      const aiAnalysis = this.generateAIAnalysis(analysis, userData);
      
      // 8. 최종 로드맵 조합
      const roadmap: GeneratedRoadmap = {
        id: `roadmap_${Date.now()}_${userData.user.id}`,
        userId: userData.user.id,
        title: this.generateRoadmapTitle(targetRole, difficulty),
        description: this.generateRoadmapDescription(targetRole, analysis),
        targetRole,
        difficulty,
        estimatedDuration: this.calculateEstimatedDuration(phases),
        
        phases,
        totalSkills: this.extractTotalSkills(phases),
        careerProgression,
        
        personalizedFor: personalization,
        aiAnalysis,
        
        dataSourceIds: userData.dataSourceIds,
        basedOnSurvey: !!userData.survey,
        basedOnSimulation: userData.simulations.length > 0,
      };

      logger.info('Roadmap generation completed', {
        userId: userData.user.id,
        targetRole,
        difficulty,
        phaseCount: phases.length,
        totalSkillCount: roadmap.totalSkills.length,
      });

      return roadmap;

    } catch (error) {
      logger.error('Roadmap generation failed', { userData: userData.user.id, error });
      throw error;
    }
  }

  /**
   * 기존 로드맵 적응형 업데이트
   */
  async adaptExistingRoadmap(
    existingRoadmap: any,
    newUserData: UserDataInput,
    trigger: 'new_simulation' | 'skill_update' | 'goal_change'
  ): Promise<GeneratedRoadmap> {
    try {
      const analysis = await this.analyzeUserData(newUserData);
      const currentRoadmap = existingRoadmap.roadmapData;

      // 적응 전략 결정
      let adaptationStrategy: 'minor_adjust' | 'major_update' | 'regenerate';
      
      if (trigger === 'new_simulation') {
        const latestSimScore = newUserData.simulations[0]?.finalScore || 0;
        adaptationStrategy = latestSimScore >= 80 ? 'minor_adjust' : 'major_update';
      } else if (trigger === 'skill_update') {
        adaptationStrategy = 'minor_adjust';
      } else {
        adaptationStrategy = 'regenerate';
      }

      if (adaptationStrategy === 'regenerate') {
        return this.generatePersonalizedRoadmap(newUserData, {
          targetRole: existingRoadmap.targetRole,
          difficulty: existingRoadmap.difficulty,
        });
      }

      // 기존 로드맵 기반 적응
      const adaptedPhases = await this.adaptRoadmapPhases(
        currentRoadmap.phases || [],
        analysis,
        adaptationStrategy
      );

      const adaptedRoadmap: GeneratedRoadmap = {
        id: existingRoadmap.id,
        userId: existingRoadmap.userId,
        title: existingRoadmap.title,
        description: existingRoadmap.description,
        targetRole: existingRoadmap.targetRole,
        difficulty: existingRoadmap.difficulty,
        estimatedDuration: this.calculateEstimatedDuration(adaptedPhases),
        
        phases: adaptedPhases,
        totalSkills: this.extractTotalSkills(adaptedPhases),
        careerProgression: currentRoadmap.careerProgression || [],
        
        personalizedFor: existingRoadmap.personalizedFor || {},
        aiAnalysis: {
          ...existingRoadmap.aiAnalysis,
          adaptationLevel: 'high',
          recommendationReason: `${trigger}에 따른 로드맵 적응 업데이트`,
        },
        
        dataSourceIds: newUserData.dataSourceIds,
        basedOnSurvey: !!newUserData.survey,
        basedOnSimulation: newUserData.simulations.length > 0,
      };

      return adaptedRoadmap;

    } catch (error) {
      logger.error('Roadmap adaptation failed', { trigger, error });
      throw error;
    }
  }

  /**
   * 사용자 데이터 종합 분석
   */
  private async analyzeUserData(userData: UserDataInput): Promise<any> {
    const analysis = {
      // 기본 프로필 분석
      profile: this.analyzeProfile(userData.user),
      
      // 설문 분석
      survey: userData.survey ? this.analyzeSurvey(userData.survey) : null,
      
      // 시뮬레이션 분석
      simulations: this.analyzeSimulations(userData.simulations, userData.simulationResults),
      
      // 종합 스킬 레벨
      overallSkillLevel: this.calculateOverallSkillLevel(userData),
      
      // 학습 스타일 추론
      learningStyle: this.inferLearningStyle(userData),
      
      // 진로 선호도
      careerPreferences: this.analyzeCareerPreferences(userData),
      
      // 시간 및 리소스 분석
      timeAndResources: this.analyzeTimeAndResources(userData),
    };

    return analysis;
  }

  /**
   * 프로필 분석
   */
  private analyzeProfile(user: any): any {
    const currentYear = new Date().getFullYear();
    const age = user.birthYear ? currentYear - user.birthYear : null;
    
    let lifeStage = 'adult';
    if (age && age < 25) lifeStage = 'early_career';
    else if (age && age > 40) lifeStage = 'mid_career';

    return {
      age,
      lifeStage,
      hasCredits: user.credits > 0,
      engagementLevel: user.credits > 3 ? 'high' : 'moderate',
    };
  }

  /**
   * 설문 분석
   */
  private analyzeSurvey(survey: any): any {
    const interests = survey.interests || {};
    const strengths = survey.strengths || {};
    const personality = survey.personality || {};

    return {
      primaryInterests: this.extractPrimaryInterests(interests),
      keyStrengths: this.extractKeyStrengths(strengths),
      personalityTraits: this.analyzePersonalityTraits(personality),
      workStylePreference: this.inferWorkStyleFromSurvey(survey),
      motivationFactors: this.extractMotivationFactors(survey),
    };
  }

  /**
   * 시뮬레이션 분석
   */
  private analyzeSimulations(simulations: any[], results: any[]): any {
    if (simulations.length === 0) {
      return {
        hasData: false,
        performanceLevel: 'unknown',
        skillGaps: [],
        recommendedFocus: [],
      };
    }

    const avgScore = simulations.reduce((sum, sim) => sum + sim.finalScore, 0) / simulations.length;
    const performanceLevel = avgScore >= 80 ? 'high' : avgScore >= 60 ? 'medium' : 'low';

    const skillAssessments = results.map(r => r.skillAssessment).filter(Boolean);
    const strengthsWeaknesses = results.map(r => r.strengthsWeaknesses).filter(Boolean);

    return {
      hasData: true,
      performanceLevel,
      averageScore: Math.round(avgScore),
      totalSimulations: simulations.length,
      skillGaps: this.identifySkillGaps(skillAssessments),
      recommendedFocus: this.identifyRecommendedFocus(strengthsWeaknesses),
      preferredSimulationType: this.identifyPreferredSimulationType(simulations),
    };
  }

  /**
   * 전체 스킬 레벨 계산
   */
  private calculateOverallSkillLevel(userData: UserDataInput): 'beginner' | 'intermediate' | 'advanced' {
    let score = 0;
    let factors = 0;

    // 설문 기반 스킬 평가
    if (userData.survey) {
      const surveySkillLevel = this.extractSkillLevelFromSurvey(userData.survey);
      score += surveySkillLevel * 0.4;
      factors += 0.4;
    }

    // 시뮬레이션 기반 평가
    if (userData.simulations.length > 0) {
      const avgSimScore = userData.simulations.reduce((sum, sim) => sum + sim.finalScore, 0) / userData.simulations.length;
      const simSkillLevel = avgSimScore / 100; // 0-1 정규화
      score += simSkillLevel * 0.6;
      factors += 0.6;
    }

    if (factors === 0) return 'beginner';

    const normalizedScore = score / factors;
    
    if (normalizedScore >= 0.7) return 'advanced';
    if (normalizedScore >= 0.4) return 'intermediate';
    return 'beginner';
  }

  /**
   * 목표 직무 결정
   */
  private determineTargetRole(analysis: any): string {
    // 시뮬레이션 결과 기반 추천
    if (analysis.simulations.hasData) {
      if (analysis.simulations.averageScore >= 80) {
        return 'AI 개발자';
      } else if (analysis.simulations.averageScore >= 60) {
        return '데이터 분석가';
      }
    }

    // 설문 기반 추천
    if (analysis.survey) {
      const interests = analysis.survey.primaryInterests;
      if (interests.includes('기술') || interests.includes('프로그래밍')) {
        return 'AI 개발자';
      } else if (interests.includes('데이터') || interests.includes('분석')) {
        return '데이터 사이언티스트';
      } else if (interests.includes('비즈니스') || interests.includes('관리')) {
        return '프로덕트 매니저';
      }
    }

    // 기본값
    return 'AI 개발자';
  }

  /**
   * 로드맵 난이도 결정
   */
  private determineDifficulty(analysis: any): RoadmapDifficulty {
    const skillLevel = analysis.overallSkillLevel;
    const performanceLevel = analysis.simulations.performanceLevel;

    if (skillLevel === 'advanced' || performanceLevel === 'high') {
      return RoadmapDifficulty.ADVANCED;
    } else if (skillLevel === 'intermediate' || performanceLevel === 'medium') {
      return RoadmapDifficulty.INTERMEDIATE;
    } else {
      return RoadmapDifficulty.BEGINNER;
    }
  }

  /**
   * 개인화 데이터 생성
   */
  private generatePersonalizationData(analysis: any): PersonalizationData {
    return {
      learningStyle: analysis.learningStyle || 'visual',
      availability: this.inferAvailability(analysis),
      preferredLearningMethods: this.inferPreferredMethods(analysis),
      currentSkillLevel: this.mapSkillLevel(analysis.overallSkillLevel),
      budget: this.inferBudget(analysis),
      timeCommitment: this.inferTimeCommitment(analysis),
      priorities: this.extractPriorities(analysis),
      constraints: this.identifyConstraints(analysis),
    };
  }

  /**
   * 로드맵 단계 생성
   */
  private async generateRoadmapPhases(
    targetRole: string,
    difficulty: RoadmapDifficulty,
    analysis: any,
    personalization: PersonalizationData
  ): Promise<RoadmapPhase[]> {
    const phaseTemplates = this.getRolePhaseTemplates(targetRole, difficulty);
    const personalizedPhases: RoadmapPhase[] = [];

    for (let i = 0; i < phaseTemplates.length; i++) {
      const template = phaseTemplates[i];
      const personalizedPhase = await this.personalizePhase(template, analysis, personalization, i);
      personalizedPhases.push(personalizedPhase);
    }

    return personalizedPhases;
  }

  /**
   * 직무별 단계 템플릿 조회
   */
  private getRolePhaseTemplates(targetRole: string, difficulty: RoadmapDifficulty): any[] {
    const templates = {
      'AI 개발자': {
        [RoadmapDifficulty.BEGINNER]: [
          {
            title: '프로그래밍 기초',
            description: 'Python과 기본 프로그래밍 개념 습득',
            duration: 2,
            coreSkills: ['Python', '알고리즘', '데이터 구조'],
          },
          {
            title: '수학 및 통계 기초',
            description: '머신러닝에 필요한 수학적 기초 다지기',
            duration: 2,
            coreSkills: ['선형대수', '확률통계', '미적분학'],
          },
          {
            title: '머신러닝 입문',
            description: '기본 ML 알고리즘과 라이브러리 학습',
            duration: 3,
            coreSkills: ['Scikit-learn', '데이터 전처리', '모델 평가'],
          },
          {
            title: '딥러닝 기초',
            description: '신경망과 딥러닝 프레임워크 학습',
            duration: 3,
            coreSkills: ['TensorFlow', 'PyTorch', 'CNN', 'RNN'],
          },
          {
            title: '실무 프로젝트',
            description: '포트폴리오용 실전 AI 프로젝트 진행',
            duration: 4,
            coreSkills: ['프로젝트 관리', 'MLOps', '모델 배포'],
          },
        ],
        [RoadmapDifficulty.INTERMEDIATE]: [
          {
            title: 'AI 심화 이론',
            description: '고급 머신러닝 및 딥러닝 이론 학습',
            duration: 2,
            coreSkills: ['Advanced ML', '최적화', 'NLP'],
          },
          {
            title: '특화 분야 선택',
            description: 'Computer Vision, NLP, 또는 Reinforcement Learning 전문화',
            duration: 3,
            coreSkills: ['Computer Vision', 'NLP', 'RL'],
          },
          {
            title: '프로덕션 AI',
            description: 'MLOps와 실제 서비스 배포 경험',
            duration: 3,
            coreSkills: ['MLOps', 'Docker', 'Kubernetes', 'AWS/GCP'],
          },
        ],
      },
      '데이터 사이언티스트': {
        [RoadmapDifficulty.BEGINNER]: [
          {
            title: '데이터 분석 기초',
            description: 'Python과 데이터 분석 라이브러리 습득',
            duration: 2,
            coreSkills: ['Python', 'Pandas', 'NumPy', 'Matplotlib'],
          },
          {
            title: '통계학 및 데이터 시각화',
            description: '통계 분석과 효과적인 데이터 시각화',
            duration: 2,
            coreSkills: ['통계학', 'Seaborn', 'Plotly', '가설검정'],
          },
          {
            title: '머신러닝 응용',
            description: '비즈니스 문제 해결을 위한 ML 적용',
            duration: 3,
            coreSkills: ['Scikit-learn', '피처 엔지니어링', '모델 해석'],
          },
          {
            title: '데이터베이스 및 SQL',
            description: '대용량 데이터 처리와 SQL 마스터',
            duration: 2,
            coreSkills: ['SQL', 'PostgreSQL', 'MongoDB', 'Spark'],
          },
          {
            title: '비즈니스 인텔리전스',
            description: '인사이트 도출과 비즈니스 의사결정 지원',
            duration: 3,
            coreSkills: ['Tableau', 'Power BI', '스토리텔링'],
          },
        ],
      },
    };

    return templates[targetRole]?.[difficulty] || templates['AI 개발자'][RoadmapDifficulty.BEGINNER];
  }

  /**
   * 단계 개인화
   */
  private async personalizePhase(
    template: any,
    analysis: any,
    personalization: PersonalizationData,
    phaseIndex: number
  ): Promise<RoadmapPhase> {
    const milestones = await this.generateMilestones(template, analysis, personalization);

    return {
      id: `phase-${phaseIndex + 1}`,
      title: template.title,
      description: template.description,
      duration: this.adjustDuration(template.duration, personalization),
      prerequisites: phaseIndex === 0 ? [] : [`phase-${phaseIndex}`],
      milestones,
      skills: template.coreSkills || [],
      order: phaseIndex,
    };
  }

  /**
   * 마일스톤 생성
   */
  private async generateMilestones(
    template: any,
    analysis: any,
    personalization: PersonalizationData
  ): Promise<Milestone[]> {
    const milestones: Milestone[] = [];
    const coreSkills = template.coreSkills || [];

    // 각 핵심 스킬에 대한 마일스톤 생성
    coreSkills.forEach((skill: string, index: number) => {
      const milestone = this.createSkillMilestone(skill, analysis, personalization, index);
      milestones.push(milestone);
    });

    // 프로젝트 마일스톤 추가
    if (template.title.includes('프로젝트') || template.title.includes('실무')) {
      const projectMilestone = this.createProjectMilestone(template, analysis, personalization);
      milestones.push(projectMilestone);
    }

    return milestones;
  }

  /**
   * 스킬 마일스톤 생성
   */
  private createSkillMilestone(
    skill: string,
    analysis: any,
    personalization: PersonalizationData,
    index: number
  ): Milestone {
    const resources = this.getSkillResources(skill, personalization);
    const estimatedHours = this.calculateEstimatedHours(skill, personalization);

    return {
      id: `milestone-${skill.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      title: `${skill} 마스터`,
      description: `${skill} 기술의 기본 개념을 이해하고 실무에 적용할 수 있는 수준까지 학습`,
      type: 'skill',
      priority: this.determineMilestonePriority(skill, analysis),
      estimatedHours,
      resources,
      skills: [skill],
      successCriteria: this.generateSuccessCriteria(skill),
    };
  }

  /**
   * 프로젝트 마일스톤 생성
   */
  private createProjectMilestone(
    template: any,
    analysis: any,
    personalization: PersonalizationData
  ): Milestone {
    return {
      id: `milestone-project-${template.title.toLowerCase().replace(/\s+/g, '-')}`,
      title: `${template.title} 프로젝트 완성`,
      description: `학습한 기술을 활용하여 실제 프로젝트를 완성하고 포트폴리오에 추가`,
      type: 'project',
      priority: 'high',
      estimatedHours: 80,
      resources: this.getProjectResources(template, personalization),
      skills: template.coreSkills || [],
      successCriteria: [
        '프로젝트 기획서 작성 완료',
        '핵심 기능 구현 완료',
        'GitHub에 코드 업로드',
        '프로젝트 문서화 완료',
        '결과 발표 또는 데모 진행',
      ],
    };
  }

  /**
   * 스킬별 리소스 조회
   */
  private getSkillResources(skill: string, personalization: PersonalizationData): Resource[] {
    const resourceDB = {
      'Python': [
        {
          type: 'course' as const,
          title: '점프 투 파이썬',
          description: '파이썬 기초부터 고급까지',
          url: 'https://wikidocs.net/book/1',
          provider: '점프 투 파이썬',
          cost: 'free' as const,
          rating: 4.5,
          difficulty: 'beginner',
          duration: '4주',
        },
        {
          type: 'practice' as const,
          title: 'LeetCode Python',
          description: '파이썬 알고리즘 문제 해결',
          url: 'https://leetcode.com',
          provider: 'LeetCode',
          cost: 'free' as const,
          rating: 4.7,
        },
      ],
      '머신러닝': [
        {
          type: 'course' as const,
          title: 'Andrew Ng Machine Learning Course',
          description: '머신러닝 기초 이론과 실습',
          provider: 'Coursera',
          cost: 'subscription' as const,
          rating: 4.9,
          duration: '11주',
        },
      ],
      // 추가 스킬별 리소스...
    };

    return resourceDB[skill] || [
      {
        type: 'course' as const,
        title: `${skill} 온라인 강의`,
        description: `${skill} 기초부터 실무까지`,
        provider: '추천 플랫폼',
        cost: personalization.budget === 'free' ? 'free' as const : 'paid' as const,
      },
    ];
  }

  /**
   * 프로젝트 리소스 조회
   */
  private getProjectResources(template: any, personalization: PersonalizationData): Resource[] {
    return [
      {
        type: 'community' as const,
        title: 'GitHub',
        description: '프로젝트 코드 관리 및 협업',
        url: 'https://github.com',
        cost: 'free' as const,
      },
      {
        type: 'tool' as const,
        title: 'Jupyter Notebook',
        description: '데이터 분석 및 프로토타이핑',
        cost: 'free' as const,
      },
      {
        type: 'community' as const,
        title: 'Stack Overflow',
        description: '기술적 문제 해결 커뮤니티',
        url: 'https://stackoverflow.com',
        cost: 'free' as const,
      },
    ];
  }

  // 헬퍼 메서드들...

  private extractPrimaryInterests(interests: any): string[] {
    // 설문 interests 데이터에서 주요 관심사 추출
    return Object.keys(interests).filter(key => interests[key] === true).slice(0, 3);
  }

  private extractKeyStrengths(strengths: any): string[] {
    // 설문 strengths 데이터에서 주요 강점 추출
    return Object.keys(strengths).filter(key => strengths[key] === true).slice(0, 3);
  }

  private analyzePersonalityTraits(personality: any): any {
    // Big 5 성격 특성 분석
    return {
      openness: personality.openness || 0.5,
      conscientiousness: personality.conscientiousness || 0.5,
      extraversion: personality.extraversion || 0.5,
      agreeableness: personality.agreeableness || 0.5,
      neuroticism: personality.neuroticism || 0.5,
    };
  }

  private inferWorkStyleFromSurvey(survey: any): string {
    // 설문 데이터로부터 업무 스타일 추론
    const personality = survey.personality || {};
    if (personality.extraversion > 0.6) return 'collaborative';
    if (personality.conscientiousness > 0.7) return 'methodical';
    return 'flexible';
  }

  private extractMotivationFactors(survey: any): string[] {
    // 동기 요인 추출
    const factors = [];
    const interests = survey.interests || {};
    
    if (interests.growth) factors.push('성장과 학습');
    if (interests.achievement) factors.push('성취감');
    if (interests.teamwork) factors.push('팀워크');
    if (interests.innovation) factors.push('혁신');
    
    return factors.length > 0 ? factors : ['성장과 학습', '성취감'];
  }

  private identifySkillGaps(skillAssessments: any[]): string[] {
    // 시뮬레이션 결과에서 스킬 갭 식별
    const gaps = [];
    
    skillAssessments.forEach(assessment => {
      Object.keys(assessment || {}).forEach(skill => {
        if (assessment[skill] < 0.6) { // 60% 미만이면 갭으로 식별
          gaps.push(skill);
        }
      });
    });
    
    return [...new Set(gaps)]; // 중복 제거
  }

  private identifyRecommendedFocus(strengthsWeaknesses: any[]): string[] {
    // 강점/약점 분석에서 추천 포커스 영역 식별
    const focusAreas = [];
    
    strengthsWeaknesses.forEach(sw => {
      if (sw.improvementAreas) {
        focusAreas.push(...sw.improvementAreas);
      }
    });
    
    return [...new Set(focusAreas)].slice(0, 3);
  }

  private identifyPreferredSimulationType(simulations: any[]): string {
    // 선호하는 시뮬레이션 타입 식별
    const typeScores = {};
    
    simulations.forEach(sim => {
      const type = sim.simulationId.split('-')[0]; // 예: 'ai-developer' -> 'ai'
      typeScores[type] = (typeScores[type] || 0) + sim.finalScore;
    });
    
    return Object.keys(typeScores).reduce((a, b) => typeScores[a] > typeScores[b] ? a : b, 'ai');
  }

  private extractSkillLevelFromSurvey(survey: any): number {
    // 설문에서 스킬 레벨 추출 (0-1 스케일)
    const strengths = survey.strengths || {};
    const experienceCount = Object.keys(strengths).filter(key => strengths[key]).length;
    return Math.min(experienceCount / 10, 1); // 최대 10개 강점 기준
  }

  private inferLearningStyle(userData: UserDataInput): 'visual' | 'auditory' | 'kinesthetic' | 'reading' {
    // 학습 스타일 추론
    if (userData.survey?.personality?.openness > 0.7) return 'visual';
    if (userData.simulations.length > 2) return 'kinesthetic'; // 실습 선호
    return 'visual'; // 기본값
  }

  private inferAvailability(analysis: any): 'weekdays' | 'weekends' | 'evenings' | 'flexible' {
    // 이용 가능 시간 추론
    const lifeStage = analysis.profile.lifeStage;
    if (lifeStage === 'early_career') return 'evenings';
    if (lifeStage === 'mid_career') return 'weekends';
    return 'flexible';
  }

  private inferPreferredMethods(analysis: any): string[] {
    // 선호 학습 방법 추론
    const methods = ['온라인 강의'];
    
    if (analysis.simulations.hasData) methods.push('실습 프로젝트');
    if (analysis.survey?.personalityTraits?.extraversion > 0.6) methods.push('스터디 그룹');
    
    return methods;
  }

  private mapSkillLevel(level: string): 'complete_beginner' | 'some_experience' | 'intermediate' | 'advanced' {
    const mapping = {
      'beginner': 'complete_beginner' as const,
      'intermediate': 'some_experience' as const,
      'advanced': 'intermediate' as const,
    };
    return mapping[level] || 'complete_beginner';
  }

  private inferBudget(analysis: any): 'free' | 'limited' | 'moderate' | 'unlimited' {
    // 예산 추론
    const credits = analysis.profile.hasCredits;
    const engagementLevel = analysis.profile.engagementLevel;
    
    if (engagementLevel === 'high' && credits) return 'moderate';
    return 'limited';
  }

  private inferTimeCommitment(analysis: any): string {
    // 시간 투자 가능량 추론
    const lifeStage = analysis.profile.lifeStage;
    if (lifeStage === 'early_career') return '15-20h/week';
    if (lifeStage === 'mid_career') return '8-12h/week';
    return '10-15h/week';
  }

  private extractPriorities(analysis: any): string[] {
    // 우선순위 추출
    const priorities = [];
    
    if (analysis.simulations.hasData && analysis.simulations.performanceLevel === 'low') {
      priorities.push('기초 역량 강화');
    }
    if (analysis.survey?.primaryInterests.includes('취업')) {
      priorities.push('취업 준비');
    }
    
    priorities.push('실무 스킬 습득');
    return priorities;
  }

  private identifyConstraints(analysis: any): string[] {
    // 제약사항 식별
    const constraints = [];
    
    if (analysis.timeAndResources?.availability === 'weekends') {
      constraints.push('주말 학습만 가능');
    }
    if (analysis.timeAndResources?.budget === 'free') {
      constraints.push('무료 리소스 우선');
    }
    
    return constraints;
  }

  private adjustDuration(baseDuration: number, personalization: PersonalizationData): number {
    // 개인화 요소를 고려한 기간 조정
    let adjustedDuration = baseDuration;
    
    if (personalization.currentSkillLevel === 'complete_beginner') {
      adjustedDuration *= 1.3; // 30% 증가
    } else if (personalization.currentSkillLevel === 'intermediate') {
      adjustedDuration *= 0.8; // 20% 감소
    }
    
    if (personalization.timeCommitment.includes('20h')) {
      adjustedDuration *= 0.7; // 시간 투자가 많으면 기간 단축
    }
    
    return Math.ceil(adjustedDuration);
  }

  private determineMilestonePriority(skill: string, analysis: any): 'high' | 'medium' | 'low' {
    // 마일스톤 우선순위 결정
    const coreSkills = ['Python', '머신러닝', 'SQL', '데이터 분석'];
    
    if (coreSkills.includes(skill)) return 'high';
    if (analysis.simulations.skillGaps.includes(skill)) return 'high';
    return 'medium';
  }

  private calculateEstimatedHours(skill: string, personalization: PersonalizationData): number {
    // 스킬별 예상 학습 시간 계산
    const baseHours = {
      'Python': 80,
      '머신러닝': 120,
      'SQL': 60,
      '데이터 분석': 100,
      '딥러닝': 150,
    };
    
    let hours = baseHours[skill] || 80;
    
    if (personalization.currentSkillLevel === 'complete_beginner') {
      hours *= 1.5;
    } else if (personalization.currentSkillLevel === 'intermediate') {
      hours *= 0.7;
    }
    
    return Math.round(hours);
  }

  private generateSuccessCriteria(skill: string): string[] {
    // 스킬별 성공 기준 생성
    const criteriaMap = {
      'Python': [
        '기본 문법과 자료구조 이해',
        '함수와 클래스 작성 가능',
        '라이브러리 활용 능력',
        '간단한 프로그램 작성 가능',
      ],
      '머신러닝': [
        'ML 알고리즘 개념 이해',
        'Scikit-learn 라이브러리 사용',
        '모델 평가 및 튜닝',
        '실제 데이터셋으로 모델 구축',
      ],
      // 추가 스킬별 기준...
    };
    
    return criteriaMap[skill] || [
      `${skill} 기본 개념 이해`,
      `${skill} 실무 적용 가능`,
      `${skill} 관련 도구 사용 능력`,
    ];
  }

  private generateCareerProgression(targetRole: string, difficulty: RoadmapDifficulty): CareerProgression[] {
    // 진로 발전 경로 생성
    const progressions = {
      'AI 개발자': [
        {
          position: '주니어 AI 개발자',
          timeline: '6-12개월',
          requirements: ['Python', '기본 ML 지식', '포트폴리오 2개'],
          averageSalary: '3,500-4,500만원',
          companies: ['스타트업', '중소기업 AI팀'],
          nextSteps: ['팀 프로젝트 경험', '특화 분야 선택'],
        },
        {
          position: '시니어 AI 개발자',
          timeline: '2-3년',
          requirements: ['고급 ML/DL', 'MLOps', '프로젝트 리드 경험'],
          averageSalary: '5,500-7,000만원',
          companies: ['대기업 AI연구소', '글로벌 테크기업'],
          nextSteps: ['AI 전문가', '팀 리더', '창업'],
        },
      ],
    };
    
    return progressions[targetRole] || progressions['AI 개발자'];
  }

  private generateAIAnalysis(analysis: any, userData: UserDataInput): AIAnalysisMetadata {
    // AI 분석 메타데이터 생성
    const surveyWeight = userData.survey ? 0.6 : 0;
    const simulationWeight = userData.simulations.length > 0 ? 0.4 : 0;
    const totalWeight = surveyWeight + simulationWeight;
    
    return {
      strengthsConsidered: analysis.survey?.keyStrengths || ['논리적 사고'],
      weaknessesAddressed: analysis.simulations.skillGaps || ['실무 경험'],
      surveyInfluence: totalWeight > 0 ? surveyWeight / totalWeight : 0,
      simulationInfluence: totalWeight > 0 ? simulationWeight / totalWeight : 0,
      confidence: this.calculateConfidence(analysis, userData),
      adaptationLevel: 'high',
      recommendationReason: this.generateRecommendationReason(analysis),
      alternativeOptions: this.generateAlternativeOptions(analysis),
    };
  }

  private calculateConfidence(analysis: any, userData: UserDataInput): number {
    // 추천 신뢰도 계산
    let confidence = 0.5;
    
    if (userData.survey) confidence += 0.2;
    if (userData.simulations.length > 0) confidence += 0.2;
    if (userData.simulations.length > 2) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }

  private generateRecommendationReason(analysis: any): string {
    // 추천 이유 생성
    const reasons = [];
    
    if (analysis.survey) {
      reasons.push('설문 결과 기반 적성 분석');
    }
    if (analysis.simulations.hasData) {
      reasons.push(`시뮬레이션 성과 (평균 ${analysis.simulations.averageScore}점)`);
    }
    
    return reasons.join(', ') || '기본 적성 분석 기반';
  }

  private generateAlternativeOptions(analysis: any): string[] {
    // 대안 옵션 생성
    const alternatives = ['데이터 사이언티스트', '프로덕트 매니저', '소프트웨어 엔지니어'];
    return alternatives.slice(0, 2);
  }

  private generateRoadmapTitle(targetRole: string, difficulty: RoadmapDifficulty): string {
    const difficultyMap = {
      [RoadmapDifficulty.BEGINNER]: '기초부터 시작하는',
      [RoadmapDifficulty.INTERMEDIATE]: '실무 중심의',
      [RoadmapDifficulty.ADVANCED]: '전문가를 위한',
      [RoadmapDifficulty.EXPERT]: '마스터 레벨',
    };
    
    return `${difficultyMap[difficulty]} ${targetRole} 성장 로드맵`;
  }

  private generateRoadmapDescription(targetRole: string, analysis: any): string {
    return `개인화된 분석을 바탕으로 ${targetRole}가 되기 위한 단계별 학습 계획입니다. 현재 역량 수준과 학습 스타일을 고려하여 최적의 학습 경로를 제시합니다.`;
  }

  private calculateEstimatedDuration(phases: RoadmapPhase[]): number {
    return phases.reduce((total, phase) => total + phase.duration, 0);
  }

  private extractTotalSkills(phases: RoadmapPhase[]): string[] {
    const allSkills = phases.flatMap(phase => phase.skills);
    return [...new Set(allSkills)]; // 중복 제거
  }

  private adaptRoadmapPhases(
    existingPhases: RoadmapPhase[],
    analysis: any,
    strategy: 'minor_adjust' | 'major_update'
  ): Promise<RoadmapPhase[]> {
    // 기존 로드맵 단계 적응
    if (strategy === 'minor_adjust') {
      // 마일스톤 우선순위 조정
      return Promise.resolve(existingPhases.map(phase => ({
        ...phase,
        milestones: phase.milestones.map(milestone => ({
          ...milestone,
          priority: this.determineMilestonePriority(milestone.skills[0], analysis),
        })),
      })));
    }
    
    // major_update의 경우 더 큰 변경사항 적용
    return Promise.resolve(existingPhases);
  }

  private analyzeTimeAndResources(userData: UserDataInput): any {
    // 시간 및 리소스 분석
    return {
      availability: this.inferAvailability({ profile: this.analyzeProfile(userData.user) }),
      budget: this.inferBudget({ profile: this.analyzeProfile(userData.user) }),
      preferredLearningTime: 'evening',
      resourcePreference: 'online',
    };
  }

  private analyzeCareerPreferences(userData: UserDataInput): any {
    // 진로 선호도 분석
    const preferences = {
      preferredIndustry: 'technology',
      companySize: 'medium',
      workEnvironment: 'hybrid',
      careerGoals: ['skill_development', 'career_growth'],
    };
    
    if (userData.survey) {
      const interests = userData.survey.interests || {};
      if (interests.startup) preferences.companySize = 'startup';
      if (interests.enterprise) preferences.companySize = 'large';
    }
    
    return preferences;
  }
}