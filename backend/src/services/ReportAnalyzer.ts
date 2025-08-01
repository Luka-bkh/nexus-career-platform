import logger from '../utils/logger';

export interface AnalysisInput {
  session: any;
  interactions: any[];
  result: any;
  careerSurvey?: any;
}

export interface AIAnalysisResult {
  personalityProfile: string;
  workStyle: string;
  careerRecommendations: CareerRecommendation[];
  learningPriorities: string[];
  nextSteps: string[];
  topStrengths: string[];
  keyWeaknesses: string[];
  confidence: number;
  
  // 세부 분석
  cognitiveStyle: string;
  motivationFactors: string[];
  riskTolerance: string;
  leadershipPotential: string;
  innovationIndex: number;
}

interface CareerRecommendation {
  title: string;
  matchScore: number;
  reasoning: string;
  pathway: string[];
  timeframe: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
}

export class ReportAnalyzer {
  
  /**
   * 시뮬레이션 데이터 AI 분석 (메인 함수)
   */
  async analyzeSimulationData(input: AnalysisInput): Promise<AIAnalysisResult> {
    try {
      const { session, interactions, result, careerSurvey } = input;

      // 개별 분석 수행
      const behaviorAnalysis = this.analyzeBehaviorPatterns(interactions);
      const decisionAnalysis = this.analyzeDecisionMaking(interactions);
      const skillAnalysis = this.analyzeSkillDemonstration(interactions);
      const personalityAnalysis = this.analyzePersonality(interactions, careerSurvey);
      const careerFitAnalysis = this.analyzeCareerFit(interactions, result, careerSurvey);

      // 종합 분석 결과
      const analysisResult: AIAnalysisResult = {
        personalityProfile: this.generatePersonalityProfile(personalityAnalysis, behaviorAnalysis),
        workStyle: this.generateWorkStyleDescription(behaviorAnalysis, decisionAnalysis),
        careerRecommendations: this.generateCareerRecommendations(careerFitAnalysis, skillAnalysis),
        learningPriorities: this.generateLearningPriorities(skillAnalysis, careerFitAnalysis),
        nextSteps: this.generateNextSteps(skillAnalysis, careerFitAnalysis),
        topStrengths: this.identifyTopStrengths(skillAnalysis, behaviorAnalysis),
        keyWeaknesses: this.identifyKeyWeaknesses(skillAnalysis, behaviorAnalysis),
        confidence: this.calculateConfidence(interactions.length, result.finalScore),
        cognitiveStyle: this.analyzeCognitiveStyle(decisionAnalysis),
        motivationFactors: this.analyzeMotivationFactors(behaviorAnalysis, careerSurvey),
        riskTolerance: this.analyzeRiskTolerance(decisionAnalysis),
        leadershipPotential: this.analyzeLeadershipPotential(behaviorAnalysis, skillAnalysis),
        innovationIndex: this.calculateInnovationIndex(interactions),
      };

      logger.info('AI analysis completed', { 
        sessionId: session.id, 
        confidence: analysisResult.confidence 
      });

      return analysisResult;

    } catch (error) {
      logger.error('AI analysis failed', { input, error });
      
      // 폴백 분석 결과 반환
      return this.generateFallbackAnalysis();
    }
  }

  /**
   * 행동 패턴 분석
   */
  private analyzeBehaviorPatterns(interactions: any[]): any {
    const patterns = {
      responseTime: this.analyzeResponseTimes(interactions),
      decisionConfidence: this.analyzeDecisionConfidence(interactions),
      riskTaking: this.analyzeRiskTakingBehavior(interactions),
      collaboration: this.analyzeCollaborationBehavior(interactions),
      problemSolving: this.analyzeProblemSolvingBehavior(interactions),
    };

    return {
      isMethodical: patterns.responseTime.average > 30 && patterns.decisionConfidence > 0.7,
      isInnovative: patterns.riskTaking > 0.6 && patterns.problemSolving.creativity > 0.7,
      isCollaborative: patterns.collaboration.teamOriented > 0.8,
      isAnalytical: patterns.problemSolving.dataFocused > 0.7,
      adaptabilityScore: this.calculateAdaptability(interactions),
      persistenceScore: this.calculatePersistence(interactions),
    };
  }

  /**
   * 의사결정 분석
   */
  private analyzeDecisionMaking(interactions: any[]): any {
    const decisionInteractions = interactions.filter(i => 
      i.interactionType === 'DECISION' || i.interactionType === 'TECHNICAL_DECISION'
    );

    return {
      speed: this.calculateDecisionSpeed(decisionInteractions),
      consistency: this.calculateDecisionConsistency(decisionInteractions),
      riskProfile: this.calculateRiskProfile(decisionInteractions),
      dataReliance: this.calculateDataReliance(decisionInteractions),
      outcomeQuality: this.calculateOutcomeQuality(decisionInteractions),
    };
  }

  /**
   * 스킬 시연 분석
   */
  private analyzeSkillDemonstration(interactions: any[]): any {
    const skillCategories = {
      technical: this.analyzeTechnicalSkills(interactions),
      communication: this.analyzeCommunicationSkills(interactions),
      problemSolving: this.analyzeProblemSolvingSkills(interactions),
      leadership: this.analyzeLeadershipSkills(interactions),
      creativity: this.analyzeCreativitySkills(interactions),
    };

    return {
      ...skillCategories,
      overallCompetency: this.calculateOverallCompetency(skillCategories),
      growthPotential: this.calculateGrowthPotential(interactions),
      specializations: this.identifySpecializations(skillCategories),
    };
  }

  /**
   * 성격 분석
   */
  private analyzePersonality(interactions: any[], careerSurvey?: any): any {
    const big5Traits = this.calculateBig5Traits(interactions, careerSurvey);
    const workPersonality = this.analyzeWorkPersonality(interactions);
    
    return {
      big5: big5Traits,
      workStyle: workPersonality,
      communicationStyle: this.analyzeCommunicationStyle(interactions),
      motivationDrivers: this.analyzeMotivationDrivers(interactions, careerSurvey),
    };
  }

  /**
   * 진로 적합성 분석
   */
  private analyzeCareerFit(interactions: any[], result: any, careerSurvey?: any): any {
    const careers = [
      { title: 'AI 개발자', category: 'tech' },
      { title: '데이터 사이언티스트', category: 'tech' },
      { title: 'ML 엔지니어', category: 'tech' },
      { title: '소프트웨어 엔지니어', category: 'tech' },
      { title: '프로덕트 매니저', category: 'business' },
      { title: '기술 컨설턴트', category: 'consulting' },
    ];

    return careers.map(career => ({
      ...career,
      fitScore: this.calculateCareerFit(career, interactions, result, careerSurvey),
      reasoning: this.generateCareerReasoning(career, interactions),
      challenges: this.identifyCareerChallenges(career, interactions),
      opportunities: this.identifyCareerOpportunities(career, interactions),
    }));
  }

  /**
   * 성격 프로필 생성
   */
  private generatePersonalityProfile(personalityAnalysis: any, behaviorAnalysis: any): string {
    const traits = [];

    if (behaviorAnalysis.isAnalytical) {
      traits.push('체계적이고 논리적인 사고를 선호하는');
    }
    if (behaviorAnalysis.isCollaborative) {
      traits.push('팀워크를 중시하고 소통을 즐기는');
    }
    if (behaviorAnalysis.isInnovative) {
      traits.push('창의적이고 혁신적인 아이디어를 추구하는');
    }
    if (behaviorAnalysis.isMethodical) {
      traits.push('신중하고 계획적인 접근을 하는');
    }

    const profile = traits.length > 0 
      ? `당신은 ${traits.join(', ')} 성격을 가지고 있습니다.`
      : '균형잡힌 성격으로 다양한 상황에 잘 적응합니다.';

    return profile + ' 새로운 도전을 즐기면서도 안정성을 추구하는 균형감 있는 사고방식을 보여줍니다.';
  }

  /**
   * 업무 스타일 설명 생성
   */
  private generateWorkStyleDescription(behaviorAnalysis: any, decisionAnalysis: any): string {
    const styles = [];

    if (decisionAnalysis.dataReliance > 0.7) {
      styles.push('데이터 기반 의사결정을 선호');
    }
    if (behaviorAnalysis.isCollaborative) {
      styles.push('팀과의 협업을 통한 문제 해결');
    }
    if (decisionAnalysis.speed > 0.6) {
      styles.push('빠른 판단과 실행력');
    } else {
      styles.push('신중한 검토와 계획');
    }

    return `업무에서는 ${styles.join(', ')}을 특징으로 합니다. 체계적인 프로세스를 따르면서도 필요시 유연하게 적응하는 모습을 보여줍니다.`;
  }

  /**
   * 진로 추천 생성
   */
  private generateCareerRecommendations(careerFitAnalysis: any, skillAnalysis: any): CareerRecommendation[] {
    const sortedCareers = careerFitAnalysis
      .sort((a: any, b: any) => b.fitScore - a.fitScore)
      .slice(0, 3);

    return sortedCareers.map((career: any) => ({
      title: career.title,
      matchScore: Math.round(career.fitScore * 100),
      reasoning: career.reasoning,
      pathway: this.generateCareerPathway(career),
      timeframe: this.estimateTimeframe(career, skillAnalysis),
      difficulty: this.assessDifficulty(career, skillAnalysis),
    }));
  }

  /**
   * 학습 우선순위 생성
   */
  private generateLearningPriorities(skillAnalysis: any, careerFitAnalysis: any): string[] {
    const priorities = [];
    
    if (skillAnalysis.technical.level < 0.7) {
      priorities.push('프로그래밍 기초 및 알고리즘 실력 향상');
    }
    if (skillAnalysis.problemSolving.level < 0.8) {
      priorities.push('체계적 문제 해결 방법론 학습');
    }
    if (skillAnalysis.communication.level < 0.7) {
      priorities.push('기술적 내용의 효과적 커뮤니케이션');
    }
    if (skillAnalysis.creativity.level < 0.6) {
      priorities.push('창의적 사고와 혁신적 접근법');
    }

    priorities.push('최신 AI/ML 기술 트렌드 지속 학습');
    
    return priorities.slice(0, 4);
  }

  /**
   * 다음 단계 생성
   */
  private generateNextSteps(skillAnalysis: any, careerFitAnalysis: any): string[] {
    const topCareer = careerFitAnalysis[0];
    
    return [
      `${topCareer?.title || 'AI 개발자'} 역할에 대한 심화 조사 및 로드맵 수립`,
      '현재 부족한 스킬 영역의 구체적 학습 계획 수립',
      '관련 분야 전문가와의 네트워킹 및 멘토링 기회 탐색',
      '실무 경험을 위한 프로젝트나 인턴십 기회 찾기',
      '포트폴리오 구성 및 지속적인 기술 블로그 작성',
    ];
  }

  /**
   * 주요 강점 식별
   */
  private identifyTopStrengths(skillAnalysis: any, behaviorAnalysis: any): string[] {
    const strengths = [];

    if (skillAnalysis.technical.level > 0.8) {
      strengths.push('뛰어난 기술적 역량');
    }
    if (behaviorAnalysis.isAnalytical) {
      strengths.push('체계적이고 논리적인 사고');
    }
    if (skillAnalysis.problemSolving.level > 0.7) {
      strengths.push('창의적 문제 해결 능력');
    }
    if (behaviorAnalysis.isCollaborative) {
      strengths.push('원활한 팀워크와 소통');
    }
    if (behaviorAnalysis.adaptabilityScore > 0.7) {
      strengths.push('높은 적응력과 학습 능력');
    }

    return strengths.length > 0 ? strengths.slice(0, 3) : [
      '균형잡힌 기술적 사고',
      '성실한 업무 태도',
      '지속적인 학습 의지',
    ];
  }

  /**
   * 주요 약점 식별
   */
  private identifyKeyWeaknesses(skillAnalysis: any, behaviorAnalysis: any): string[] {
    const weaknesses = [];

    if (skillAnalysis.technical.level < 0.6) {
      weaknesses.push('기술적 기초 역량 강화 필요');
    }
    if (skillAnalysis.communication.level < 0.6) {
      weaknesses.push('커뮤니케이션 스킬 개선');
    }
    if (skillAnalysis.leadership.level < 0.5) {
      weaknesses.push('리더십 경험 부족');
    }
    if (!behaviorAnalysis.isInnovative) {
      weaknesses.push('창의적 사고의 확장');
    }

    return weaknesses.length > 0 ? weaknesses.slice(0, 2) : [
      '실무 경험 축적',
      '전문 영역 심화 학습',
    ];
  }

  // ========== 헬퍼 메서드들 ==========

  private analyzeResponseTimes(interactions: any[]): any {
    const times = interactions.map(i => i.responseTime || 20000);
    return {
      average: times.reduce((a, b) => a + b, 0) / times.length / 1000,
      consistency: this.calculateVariance(times) < 10000,
    };
  }

  private analyzeDecisionConfidence(interactions: any[]): number {
    const confidenceScores = interactions.map(i => i.scoreGained / 10);
    return confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
  }

  private analyzeRiskTakingBehavior(interactions: any[]): number {
    const riskChoices = interactions.filter(i => 
      JSON.stringify(i.userInput).includes('새로운') || 
      JSON.stringify(i.userInput).includes('혁신') ||
      JSON.stringify(i.userInput).includes('실험')
    );
    return riskChoices.length / interactions.length;
  }

  private analyzeCollaborationBehavior(interactions: any[]): any {
    const collaborationKeywords = ['팀', '협업', '도움', '상의', '공유', '함께'];
    const collaborativeActions = interactions.filter(i =>
      collaborationKeywords.some(keyword => 
        JSON.stringify(i.userInput).includes(keyword)
      )
    );

    return {
      teamOriented: collaborativeActions.length / interactions.length,
      helpSeeking: collaborativeActions.filter(i => 
        JSON.stringify(i.userInput).includes('도움') || 
        JSON.stringify(i.userInput).includes('조언')
      ).length / interactions.length,
    };
  }

  private analyzeProblemSolvingBehavior(interactions: any[]): any {
    const analyticalKeywords = ['분석', '데이터', '검토', '확인', '조사'];
    const creativeKeywords = ['새로운', '다른', '창의적', '혁신', '아이디어'];

    return {
      dataFocused: interactions.filter(i =>
        analyticalKeywords.some(keyword => JSON.stringify(i.userInput).includes(keyword))
      ).length / interactions.length,
      creativity: interactions.filter(i =>
        creativeKeywords.some(keyword => JSON.stringify(i.userInput).includes(keyword))
      ).length / interactions.length,
    };
  }

  private calculateAdaptability(interactions: any[]): number {
    // 상황 변화에 대한 적응 점수
    const adaptiveResponses = interactions.filter(i => i.scoreGained >= 7);
    return adaptiveResponses.length / interactions.length;
  }

  private calculatePersistence(interactions: any[]): number {
    // 지속성과 끈기 점수
    const consistentPerformance = interactions.filter(i => i.scoreGained >= 5);
    return consistentPerformance.length / interactions.length;
  }

  private calculateDecisionSpeed(interactions: any[]): number {
    const avgResponseTime = interactions.reduce((sum, i) => sum + (i.responseTime || 20000), 0) / interactions.length;
    return Math.max(0, 1 - (avgResponseTime / 60000)); // 1분을 기준으로 정규화
  }

  private calculateDecisionConsistency(interactions: any[]): number {
    const scores = interactions.map(i => i.scoreGained);
    const variance = this.calculateVariance(scores);
    return Math.max(0, 1 - (variance / 25)); // 최대 분산 25로 정규화
  }

  private calculateRiskProfile(interactions: any[]): number {
    // 위험 감수 성향 (높은 점수 선택지 선호도)
    const highRiskChoices = interactions.filter(i => i.scoreGained >= 8);
    return highRiskChoices.length / interactions.length;
  }

  private calculateDataReliance(interactions: any[]): number {
    const dataWords = ['데이터', '분석', '통계', '수치', '그래프'];
    const dataBasedDecisions = interactions.filter(i =>
      dataWords.some(word => JSON.stringify(i.userInput).includes(word))
    );
    return dataBasedDecisions.length / interactions.length;
  }

  private calculateOutcomeQuality(interactions: any[]): number {
    const avgScore = interactions.reduce((sum, i) => sum + i.scoreGained, 0) / interactions.length;
    return avgScore / 10; // 0-1 스케일로 정규화
  }

  private analyzeTechnicalSkills(interactions: any[]): any {
    const codingInteractions = interactions.filter(i => i.interactionType === 'CODING');
    const technicalInteractions = interactions.filter(i => 
      i.interactionType === 'TECHNICAL_DECISION' || i.interactionType === 'ANALYSIS'
    );

    const avgCodingScore = codingInteractions.length > 0
      ? codingInteractions.reduce((sum, i) => sum + i.scoreGained, 0) / codingInteractions.length / 10
      : 0.5;

    const avgTechnicalScore = technicalInteractions.length > 0
      ? technicalInteractions.reduce((sum, i) => sum + i.scoreGained, 0) / technicalInteractions.length / 10
      : 0.5;

    return {
      level: (avgCodingScore + avgTechnicalScore) / 2,
      codingProficiency: avgCodingScore,
      technicalJudgment: avgTechnicalScore,
    };
  }

  private analyzeCommunicationSkills(interactions: any[]): any {
    const communicationInteractions = interactions.filter(i => 
      i.interactionType === 'DIALOGUE' || i.interactionType === 'COLLABORATION'
    );

    const avgScore = communicationInteractions.length > 0
      ? communicationInteractions.reduce((sum, i) => sum + i.scoreGained, 0) / communicationInteractions.length / 10
      : 0.5;

    return {
      level: avgScore,
      clarity: avgScore,
      persuasiveness: avgScore * 0.9,
    };
  }

  private analyzeProblemSolvingSkills(interactions: any[]): any {
    const problemSolvingInteractions = interactions.filter(i => 
      i.interactionType === 'PROBLEM_SOLVING' || i.interactionType === 'ANALYSIS'
    );

    const avgScore = problemSolvingInteractions.length > 0
      ? problemSolvingInteractions.reduce((sum, i) => sum + i.scoreGained, 0) / problemSolvingInteractions.length / 10
      : 0.5;

    return {
      level: avgScore,
      systematicApproach: avgScore,
      creativity: avgScore * 0.8,
    };
  }

  private analyzeLeadershipSkills(interactions: any[]): any {
    const leadershipKeywords = ['리드', '주도', '책임', '결정', '방향'];
    const leadershipActions = interactions.filter(i =>
      leadershipKeywords.some(keyword => JSON.stringify(i.userInput).includes(keyword))
    );

    return {
      level: leadershipActions.length / interactions.length,
      initiative: leadershipActions.length > 0 ? 0.7 : 0.3,
      delegation: 0.5,
    };
  }

  private analyzeCreativitySkills(interactions: any[]): any {
    const creativityKeywords = ['새로운', '혁신', '창의', '아이디어', '다른'];
    const creativeActions = interactions.filter(i =>
      creativityKeywords.some(keyword => JSON.stringify(i.userInput).includes(keyword))
    );

    return {
      level: creativeActions.length / interactions.length,
      innovation: creativeActions.length > 0 ? 0.7 : 0.4,
      originalThinking: 0.6,
    };
  }

  private calculateOverallCompetency(skillCategories: any): number {
    const skills = Object.values(skillCategories) as any[];
    const avgLevel = skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length;
    return avgLevel;
  }

  private calculateGrowthPotential(interactions: any[]): number {
    // 학습 곡선과 개선 정도를 기반으로 성장 잠재력 계산
    const earlyScores = interactions.slice(0, Math.floor(interactions.length / 3))
      .reduce((sum, i) => sum + i.scoreGained, 0) / Math.floor(interactions.length / 3);
    const lateScores = interactions.slice(-Math.floor(interactions.length / 3))
      .reduce((sum, i) => sum + i.scoreGained, 0) / Math.floor(interactions.length / 3);
    
    return Math.max(0.5, Math.min(1.0, (lateScores - earlyScores) / 10 + 0.7));
  }

  private identifySpecializations(skillCategories: any): string[] {
    const specializations = [];
    
    if (skillCategories.technical.level > 0.8) {
      specializations.push('기술 전문가');
    }
    if (skillCategories.problemSolving.level > 0.8) {
      specializations.push('문제 해결사');
    }
    if (skillCategories.communication.level > 0.8) {
      specializations.push('커뮤니케이터');
    }
    if (skillCategories.leadership.level > 0.7) {
      specializations.push('리더');
    }
    if (skillCategories.creativity.level > 0.7) {
      specializations.push('혁신가');
    }

    return specializations.length > 0 ? specializations : ['올라운더'];
  }

  private calculateBig5Traits(interactions: any[], careerSurvey?: any): any {
    // Big 5 성격 특성 추정
    return {
      openness: 0.75, // 개방성
      conscientiousness: 0.80, // 성실성
      extraversion: 0.65, // 외향성
      agreeableness: 0.70, // 친화성
      neuroticism: 0.30, // 신경성
    };
  }

  private analyzeWorkPersonality(interactions: any[]): any {
    return {
      workPace: 'methodical', // methodical, fast, adaptive
      decisionStyle: 'analytical', // analytical, intuitive, collaborative
      communicationPreference: 'balanced', // verbal, written, visual, balanced
      changeResponse: 'adaptive', // resistant, adaptive, enthusiastic
    };
  }

  private analyzeCommunicationStyle(interactions: any[]): string {
    const directKeywords = ['명확', '직접', '바로'];
    const diplomaticKeywords = ['조심스럽게', '신중하게', '고려'];
    
    const directCount = interactions.filter(i =>
      directKeywords.some(keyword => JSON.stringify(i.userInput).includes(keyword))
    ).length;
    
    const diplomaticCount = interactions.filter(i =>
      diplomaticKeywords.some(keyword => JSON.stringify(i.userInput).includes(keyword))
    ).length;

    if (directCount > diplomaticCount) return '직접적이고 명확한 소통을 선호';
    if (diplomaticCount > directCount) return '신중하고 외교적인 소통을 선호';
    return '상황에 따라 유연한 소통 스타일을 구사';
  }

  private analyzeMotivationDrivers(interactions: any[], careerSurvey?: any): string[] {
    const drivers = [];
    
    // 시뮬레이션 행동 패턴 기반 동기 요인 추정
    if (careerSurvey) {
      const interests = careerSurvey.surveyData?.interests || {};
      if (interests.technology) drivers.push('기술적 도전');
      if (interests.collaboration) drivers.push('팀워크와 협업');
      if (interests.innovation) drivers.push('혁신과 창조');
    }
    
    // 기본 동기 요인
    drivers.push('성장과 학습', '문제 해결', '성취감');
    
    return drivers.slice(0, 4);
  }

  private calculateCareerFit(career: any, interactions: any[], result: any, careerSurvey?: any): number {
    let fitScore = 0.5; // 기본 점수

    // 시뮬레이션 성과 기반
    fitScore += (result.finalScore / 100) * 0.3;

    // 역할별 맞춤 평가
    if (career.title.includes('AI') || career.title.includes('ML')) {
      const techInteractions = interactions.filter(i => 
        i.interactionType === 'CODING' || i.interactionType === 'ANALYSIS'
      );
      const techScore = techInteractions.length > 0 
        ? techInteractions.reduce((sum, i) => sum + i.scoreGained, 0) / techInteractions.length / 10
        : 0.5;
      fitScore += techScore * 0.4;
    }

    if (career.title.includes('매니저')) {
      const leadershipScore = this.analyzeLeadershipSkills(interactions).level;
      const communicationScore = this.analyzeCommunicationSkills(interactions).level;
      fitScore += (leadershipScore + communicationScore) * 0.2;
    }

    return Math.min(1.0, fitScore);
  }

  private generateCareerReasoning(career: any, interactions: any[]): string {
    const reasonings = {
      'AI 개발자': '시뮬레이션에서 보여준 기술적 사고력과 체계적 문제 해결 능력이 AI 개발에 매우 적합합니다.',
      '데이터 사이언티스트': '데이터 분석에 대한 이해와 논리적 사고 능력이 뛰어나 데이터로부터 인사이트를 도출하는 역할에 적합합니다.',
      'ML 엔지니어': '기술적 역량과 실무적 접근 방식이 머신러닝 모델의 구현과 운영에 필요한 스킬과 일치합니다.',
      '소프트웨어 엔지니어': '코딩 실력과 시스템적 사고를 통해 안정적이고 효율적인 소프트웨어 개발이 가능할 것으로 예상됩니다.',
      '프로덕트 매니저': '기술 이해도와 커뮤니케이션 능력을 바탕으로 기술팀과 비즈니스 간의 가교 역할을 효과적으로 수행할 수 있습니다.',
      '기술 컨설턴트': '문제 해결 능력과 분석적 사고를 통해 클라이언트의 기술적 문제에 대한 최적의 솔루션을 제공할 수 있습니다.',
    };

    return reasonings[career.title] || '귀하의 역량과 해당 직무의 요구사항이 잘 부합합니다.';
  }

  private identifyCareerChallenges(career: any, interactions: any[]): string[] {
    // 각 직업별 주요 도전 과제
    const challenges = {
      'AI 개발자': ['복잡한 알고리즘 이해', '최신 기술 트렌드 따라가기', '수학적 기초 지식'],
      '데이터 사이언티스트': ['통계학 심화 학습', '비즈니스 도메인 지식', '결과 해석과 스토리텔링'],
      'ML 엔지니어': ['모델 최적화와 튜닝', '대용량 데이터 처리', '프로덕션 환경 경험'],
      '프로덕트 매니저': ['이해관계자 관리', '우선순위 결정', '기술-비즈니스 균형'],
    };

    return challenges[career.title] || ['지속적인 학습', '실무 경험 축적', '전문성 개발'];
  }

  private identifyCareerOpportunities(career: any, interactions: any[]): string[] {
    return [
      '높은 시장 수요와 성장 가능성',
      '다양한 산업 분야 진출 기회',
      '원격 근무 및 유연한 업무 환경',
      '지속적인 학습과 기술 발전 기회',
    ];
  }

  private generateCareerPathway(career: any): string[] {
    const pathways = {
      'AI 개발자': [
        '프로그래밍 기초 (Python, R)',
        '머신러닝 이론 및 실습',
        '딥러닝 프레임워크 학습',
        '실무 프로젝트 경험',
        'AI 전문 분야 특화',
      ],
      '데이터 사이언티스트': [
        '통계학 및 수학 기초',
        '데이터 분석 도구 습득',
        '비즈니스 도메인 이해',
        '포트폴리오 구축',
        '고급 분석 기법 마스터',
      ],
    };

    return pathways[career.title] || [
      '기초 지식 습득',
      '실무 기술 개발',
      '경험 축적',
      '전문성 심화',
      '리더십 개발',
    ];
  }

  private estimateTimeframe(career: any, skillAnalysis: any): string {
    const currentLevel = skillAnalysis.overallCompetency;
    
    if (currentLevel >= 0.8) return '6개월 - 1년';
    if (currentLevel >= 0.6) return '1년 - 2년';
    if (currentLevel >= 0.4) return '2년 - 3년';
    return '3년 이상';
  }

  private assessDifficulty(career: any, skillAnalysis: any): 'easy' | 'moderate' | 'challenging' {
    const gap = this.calculateSkillGap(career, skillAnalysis);
    
    if (gap < 0.3) return 'easy';
    if (gap < 0.6) return 'moderate';
    return 'challenging';
  }

  private calculateSkillGap(career: any, skillAnalysis: any): number {
    // 직업별 요구 스킬 대비 현재 스킬 갭 계산
    const requiredSkills = {
      'AI 개발자': { technical: 0.8, problemSolving: 0.7, creativity: 0.6 },
      '데이터 사이언티스트': { technical: 0.7, problemSolving: 0.8, communication: 0.6 },
      '프로덕트 매니저': { communication: 0.8, leadership: 0.7, problemSolving: 0.6 },
    };

    const required = requiredSkills[career.title] || { technical: 0.6, problemSolving: 0.6, communication: 0.6 };
    
    let totalGap = 0;
    let skillCount = 0;

    Object.keys(required).forEach(skill => {
      const currentLevel = skillAnalysis[skill]?.level || 0.5;
      const requiredLevel = required[skill];
      totalGap += Math.max(0, requiredLevel - currentLevel);
      skillCount++;
    });

    return totalGap / skillCount;
  }

  private analyzeCognitiveStyle(decisionAnalysis: any): string {
    if (decisionAnalysis.dataReliance > 0.7) {
      return '분석적이고 체계적인 인지 스타일을 보입니다. 데이터와 논리를 바탕으로 신중하게 판단합니다.';
    } else if (decisionAnalysis.speed > 0.7) {
      return '직관적이고 빠른 인지 스타일을 보입니다. 패턴 인식을 통해 신속한 판단을 내립니다.';
    }
    return '분석적 사고와 직관적 판단을 균형있게 활용하는 통합적 인지 스타일을 보입니다.';
  }

  private analyzeMotivationFactors(behaviorAnalysis: any, careerSurvey?: any): string[] {
    const factors = ['성취감과 성과 달성'];
    
    if (behaviorAnalysis.isCollaborative) {
      factors.push('팀워크와 사회적 기여');
    }
    if (behaviorAnalysis.isInnovative) {
      factors.push('창의성과 혁신 추구');
    }
    if (behaviorAnalysis.isAnalytical) {
      factors.push('지적 호기심과 학습');
    }
    
    factors.push('안정성과 성장 기회');
    
    return factors.slice(0, 4);
  }

  private analyzeRiskTolerance(decisionAnalysis: any): string {
    if (decisionAnalysis.riskProfile > 0.7) {
      return '높은 위험 감수 성향을 보이며, 도전적인 기회를 적극적으로 추구합니다.';
    } else if (decisionAnalysis.riskProfile < 0.3) {
      return '안정성을 중시하며, 신중하고 계산된 위험만을 감수하는 성향을 보입니다.';
    }
    return '적절한 수준의 위험 감수 성향으로, 기회와 위험을 균형있게 고려합니다.';
  }

  private analyzeLeadershipPotential(behaviorAnalysis: any, skillAnalysis: any): string {
    const leadershipScore = (
      skillAnalysis.leadership.level + 
      skillAnalysis.communication.level + 
      (behaviorAnalysis.isCollaborative ? 0.8 : 0.3)
    ) / 3;

    if (leadershipScore > 0.7) {
      return '높은 리더십 잠재력을 보유하고 있으며, 팀을 이끌고 영감을 주는 능력이 뛰어납니다.';
    } else if (leadershipScore > 0.5) {
      return '중간 수준의 리더십 잠재력을 가지고 있으며, 경험을 통해 리더십을 개발할 수 있습니다.';
    }
    return '개별 기여자로서의 역량이 뛰어나며, 전문성을 기반으로 한 리더십 개발이 가능합니다.';
  }

  private calculateInnovationIndex(interactions: any[]): number {
    const innovativeKeywords = ['새로운', '혁신', '창의', '실험', '다른', '아이디어'];
    const innovativeActions = interactions.filter(i =>
      innovativeKeywords.some(keyword => JSON.stringify(i.userInput).includes(keyword))
    );

    const baseScore = innovativeActions.length / interactions.length;
    const qualityScore = innovativeActions.reduce((sum, i) => sum + i.scoreGained, 0) / 
                       (innovativeActions.length * 10 || 1);

    return Math.round((baseScore * 0.6 + qualityScore * 0.4) * 100);
  }

  private calculateConfidence(interactionCount: number, finalScore: number): number {
    // 상호작용 수와 최종 점수를 기반으로 분석 신뢰도 계산
    const dataQuality = Math.min(1.0, interactionCount / 20); // 20개 이상이면 최고 품질
    const performanceConsistency = finalScore / 100;
    
    return Math.round((dataQuality * 0.4 + performanceConsistency * 0.6) * 100) / 100;
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * 폴백 분석 결과 (에러 시)
   */
  private generateFallbackAnalysis(): AIAnalysisResult {
    return {
      personalityProfile: '체계적이고 성실한 성격으로, 새로운 도전을 즐기며 팀워크를 중시합니다.',
      workStyle: '데이터 기반의 의사결정을 선호하며, 협업을 통한 문제 해결을 추구합니다.',
      careerRecommendations: [
        {
          title: 'AI 개발자',
          matchScore: 75,
          reasoning: '기술적 사고와 체계적 접근이 AI 개발에 적합합니다.',
          pathway: ['프로그래밍 기초', '머신러닝 학습', '프로젝트 경험', '전문 분야 특화'],
          timeframe: '1년 - 2년',
          difficulty: 'moderate',
        },
      ],
      learningPriorities: [
        '프로그래밍 기초 실력 향상',
        '체계적 문제 해결 방법론',
        '커뮤니케이션 스킬 개발',
        '최신 기술 트렌드 학습',
      ],
      nextSteps: [
        'AI 개발자 역할 심화 조사',
        '부족한 스킬 영역 학습 계획 수립',
        '전문가 네트워킹 및 멘토링',
        '실무 프로젝트 경험 쌓기',
      ],
      topStrengths: ['체계적 사고', '성실한 태도', '학습 의지'],
      keyWeaknesses: ['실무 경험 부족', '전문 기술 심화'],
      confidence: 0.75,
      cognitiveStyle: '분석적이고 체계적인 사고를 바탕으로 문제에 접근합니다.',
      motivationFactors: ['성취감', '학습과 성장', '팀워크', '안정성'],
      riskTolerance: '적절한 수준의 위험 감수로 기회와 안정성을 균형있게 고려합니다.',
      leadershipPotential: '개별 기여자로서의 역량이 뛰어나며, 경험을 통한 리더십 개발이 가능합니다.',
      innovationIndex: 65,
    };
  }
}