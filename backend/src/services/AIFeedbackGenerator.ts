import { InteractionType } from '@prisma/client';
import logger from '../utils/logger';

export interface FeedbackRequest {
  quest: any;
  userInput: any;
  interactionType: InteractionType;
  sessionContext: any;
  scenarioData: any;
}

export interface AIFeedback {
  type: 'positive' | 'neutral' | 'negative' | 'guidance';
  message: string;
  score: number;
  skillsGained?: Record<string, number>;
  nextSuggestion?: string;
  encouragement?: string;
  learningPoint?: string;
  characterResponse?: {
    speaker: string;
    dialogue: string;
    emotion: string;
  };
}

export class AIFeedbackGenerator {
  private responseTemplates: Record<string, any>;
  private characterPersonalities: Record<string, any>;

  constructor() {
    this.initializeTemplates();
    this.initializeCharacterPersonalities();
  }

  /**
   * AI 피드백 생성 (메인 함수)
   */
  async generateFeedback(request: FeedbackRequest): Promise<AIFeedback> {
    const { quest, userInput, interactionType, sessionContext, scenarioData } = request;

    try {
      // 퀘스트 타입에 따른 분기 처리
      switch (interactionType) {
        case InteractionType.DIALOGUE:
          return this.generateDialogueFeedback(quest, userInput, sessionContext);
        
        case InteractionType.DECISION:
          return this.generateDecisionFeedback(quest, userInput, sessionContext);
        
        case InteractionType.CODING:
          return this.generateCodingFeedback(quest, userInput, sessionContext);
        
        case InteractionType.ANALYSIS:
          return this.generateAnalysisFeedback(quest, userInput, sessionContext);
        
        case InteractionType.COLLABORATION:
          return this.generateCollaborationFeedback(quest, userInput, sessionContext);
        
        case InteractionType.TECHNICAL_DECISION:
          return this.generateTechnicalDecisionFeedback(quest, userInput, sessionContext);
        
        case InteractionType.PROBLEM_SOLVING:
          return this.generateProblemSolvingFeedback(quest, userInput, sessionContext);
        
        case InteractionType.RETROSPECTIVE:
          return this.generateRetrospectiveFeedback(quest, userInput, sessionContext);
        
        default:
          return this.generateGenericFeedback(quest, userInput, sessionContext);
      }
    } catch (error) {
      logger.error('AI feedback generation failed', { quest: quest.id, error });
      return this.generateFallbackFeedback();
    }
  }

  /**
   * 대화 상호작용 피드백
   */
  private generateDialogueFeedback(quest: any, userInput: any, context: any): AIFeedback {
    const selectedOption = quest.content?.options?.find((opt: any) => opt.text === userInput.choice);
    
    if (!selectedOption) {
      return this.generateFallbackFeedback();
    }

    const score = selectedOption.points || 5;
    const isHighScore = score >= 7;
    
    let feedback: AIFeedback;

    if (isHighScore) {
      feedback = {
        type: 'positive',
        message: this.getRandomTemplate('dialogue_positive'),
        score,
        skillsGained: { communication: 2, teamwork: 1 },
        encouragement: '훌륭한 커뮤니케이션 능력을 보여주었습니다!',
        learningPoint: '적극적인 질문과 경청은 팀워크의 핵심입니다.',
      };
    } else if (score >= 4) {
      feedback = {
        type: 'neutral',
        message: this.getRandomTemplate('dialogue_neutral'),
        score,
        skillsGained: { communication: 1 },
        nextSuggestion: '더 구체적인 질문을 해보는 것은 어떨까요?',
        learningPoint: '상황에 맞는 적절한 소통 방식을 고려해보세요.',
      };
    } else {
      feedback = {
        type: 'guidance',
        message: this.getRandomTemplate('dialogue_guidance'),
        score: Math.max(2, score),
        nextSuggestion: '팀 미팅에서는 적극적인 참여가 중요합니다.',
        learningPoint: '새로운 환경에서는 질문을 통해 이해도를 높이는 것이 좋습니다.',
      };
    }

    // 캐릭터 응답 추가
    feedback.characterResponse = this.generateCharacterResponse(quest, userInput, score);

    return feedback;
  }

  /**
   * 의사결정 피드백
   */
  private generateDecisionFeedback(quest: any, userInput: any, context: any): AIFeedback {
    const choice = userInput.choice || userInput.decision;
    const isOptimalChoice = this.evaluateDecisionQuality(quest, choice);
    
    let score = 5;
    let type: 'positive' | 'neutral' | 'negative' | 'guidance' = 'neutral';
    let skillsGained: Record<string, number> = { decision_making: 1 };

    if (isOptimalChoice) {
      score = 8;
      type = 'positive';
      skillsGained = { decision_making: 3, business_understanding: 2 };
    } else if (choice.includes('데이터') || choice.includes('분석')) {
      score = 6;
      type = 'neutral';
      skillsGained = { decision_making: 2, analytical_thinking: 1 };
    }

    return {
      type,
      message: this.getDecisionFeedbackMessage(type, choice),
      score,
      skillsGained,
      learningPoint: this.getDecisionLearningPoint(quest, choice),
      nextSuggestion: type === 'positive' ? '다음 단계로 진행해보세요.' : '다른 접근 방법도 고려해보세요.',
    };
  }

  /**
   * 코딩 실습 피드백
   */
  private generateCodingFeedback(quest: any, userInput: any, context: any): AIFeedback {
    const code = userInput.code || '';
    const codeQuality = this.evaluateCodeQuality(code, quest.content?.expectedOutputs);
    
    let score = Math.max(3, Math.floor(codeQuality.score * 10));
    let skillsGained: Record<string, number> = { 
      technical_skills: 2,
      programming: codeQuality.score >= 0.7 ? 3 : 2 
    };

    if (codeQuality.score >= 0.8) {
      return {
        type: 'positive',
        message: '완벽한 코드입니다! 문법과 로직이 모두 정확합니다.',
        score,
        skillsGained,
        encouragement: '프로그래밍 실력이 뛰어납니다!',
        learningPoint: codeQuality.strengths.join(', ') + '을(를) 잘 활용했습니다.',
      };
    } else if (codeQuality.score >= 0.5) {
      return {
        type: 'neutral',
        message: '좋은 시도입니다. 몇 가지 개선점이 있어요.',
        score,
        skillsGained: { technical_skills: 1, programming: 2 },
        nextSuggestion: codeQuality.suggestions.join(' '),
        learningPoint: '코드 최적화와 가독성을 고려해보세요.',
      };
    } else {
      return {
        type: 'guidance',
        message: '코딩 로직에 문제가 있습니다. 다시 시도해보세요.',
        score: 3,
        skillsGained: { technical_skills: 1 },
        nextSuggestion: '힌트: ' + (quest.content?.hints?.[0] || '기본 문법부터 다시 확인해보세요.'),
        learningPoint: '단계별로 문제를 분해해서 접근해보세요.',
      };
    }
  }

  /**
   * 데이터 분석 피드백
   */
  private generateAnalysisFeedback(quest: any, userInput: any, context: any): AIFeedback {
    const analysis = userInput.analysis || userInput.answer;
    const correctAnswers = quest.content?.correctAnswers || [];
    const analysisQuality = this.evaluateAnalysisQuality(analysis, correctAnswers);

    let score = Math.max(4, Math.floor(analysisQuality.accuracy * 10));
    
    if (analysisQuality.accuracy >= 0.8) {
      return {
        type: 'positive',
        message: '정확한 분석입니다! 데이터의 핵심 문제를 잘 파악했어요.',
        score,
        skillsGained: { data_science: 4, analytical_thinking: 3 },
        encouragement: '데이터 사이언티스트의 자질을 보여주었습니다!',
        learningPoint: '체계적인 분석 접근법이 인상적입니다.',
      };
    } else if (analysisQuality.accuracy >= 0.6) {
      return {
        type: 'neutral',
        message: '기본적인 분석은 정확합니다. 더 깊이 있는 인사이트를 찾아보세요.',
        score,
        skillsGained: { data_science: 2, analytical_thinking: 2 },
        nextSuggestion: '데이터의 패턴과 이상치를 더 자세히 살펴보세요.',
        learningPoint: '가설을 세우고 검증하는 과정이 중요합니다.',
      };
    } else {
      return {
        type: 'guidance',
        message: '분석 방향을 다시 생각해보세요. 데이터를 더 자세히 관찰해보세요.',
        score: 4,
        skillsGained: { data_science: 1, analytical_thinking: 1 },
        nextSuggestion: '힌트: 먼저 데이터의 기본 통계부터 확인해보세요.',
        learningPoint: '데이터 분석은 가설 → 검증 → 결론의 순서로 진행됩니다.',
      };
    }
  }

  /**
   * 협업 상황 피드백
   */
  private generateCollaborationFeedback(quest: any, userInput: any, context: any): AIFeedback {
    const approach = userInput.approach || userInput.choice;
    const isCollaborative = approach.includes('조언') || approach.includes('도움') || approach.includes('협력');
    
    if (isCollaborative) {
      return {
        type: 'positive',
        message: '훌륭한 협업 자세입니다! 동료와의 소통을 중시하는 모습이 좋습니다.',
        score: 8,
        skillsGained: { teamwork: 4, communication: 3 },
        encouragement: '팀워크의 진정한 의미를 이해하고 있습니다!',
        learningPoint: '개방적인 소통은 팀 성과 향상의 핵심입니다.',
        characterResponse: {
          speaker: '이소영 시니어',
          dialogue: '정말 좋은 접근이에요. 이런 태도라면 팀에서 빠르게 성장할 수 있을 거예요.',
          emotion: 'encouraging'
        }
      };
    } else {
      return {
        type: 'guidance',
        message: '독립적인 자세도 좋지만, 팀워크도 중요합니다.',
        score: 5,
        skillsGained: { teamwork: 1, communication: 1 },
        nextSuggestion: '어려운 문제일 때는 동료의 도움을 받는 것도 좋은 전략입니다.',
        learningPoint: '협업 환경에서는 지식 공유가 전체 팀의 성장을 돕습니다.',
      };
    }
  }

  /**
   * 기술적 의사결정 피드백
   */
  private generateTechnicalDecisionFeedback(quest: any, userInput: any, context: any): AIFeedback {
    const choice = userInput.choice || userInput.model;
    const technicalSoundness = this.evaluateTechnicalDecision(quest, choice);
    
    let score = Math.max(4, technicalSoundness.score);
    
    if (technicalSoundness.score >= 8) {
      return {
        type: 'positive',
        message: '기술적으로 매우 합리적인 선택입니다!',
        score,
        skillsGained: { technical_skills: 4, decision_making: 3 },
        encouragement: '복잡한 기술적 트레이드오프를 잘 이해하고 있습니다!',
        learningPoint: technicalSoundness.reasoning,
      };
    } else if (technicalSoundness.score >= 6) {
      return {
        type: 'neutral',
        message: '합리적인 선택입니다. 다른 요소들도 고려해볼 수 있어요.',
        score,
        skillsGained: { technical_skills: 2, decision_making: 2 },
        nextSuggestion: technicalSoundness.alternatives,
        learningPoint: '프로젝트 제약사항과 목표를 균형있게 고려하는 것이 중요합니다.',
      };
    } else {
      return {
        type: 'guidance',
        message: '기술적 선택을 다시 검토해보세요.',
        score: 4,
        skillsGained: { technical_skills: 1, decision_making: 1 },
        nextSuggestion: '프로젝트 요구사항과 제약사항을 다시 확인해보세요.',
        learningPoint: '기술 선택은 성능, 복잡도, 개발시간을 모두 고려해야 합니다.',
      };
    }
  }

  /**
   * 문제 해결 피드백
   */
  private generateProblemSolvingFeedback(quest: any, userInput: any, context: any): AIFeedback {
    const solution = userInput.solution || userInput.approach;
    const creativity = this.evaluateCreativity(solution);
    const effectiveness = this.evaluateEffectiveness(quest, solution);
    
    const score = Math.max(3, Math.floor((creativity + effectiveness) * 5));
    
    if (score >= 8) {
      return {
        type: 'positive',
        message: '창의적이고 실용적인 해결책입니다!',
        score,
        skillsGained: { problem_solving: 4, creativity: 3 },
        encouragement: '복잡한 문제를 체계적으로 해결하는 능력이 뛰어납니다!',
        learningPoint: '문제의 본질을 파악하고 효과적인 솔루션을 제시했습니다.',
      };
    } else {
      return {
        type: 'neutral',
        message: '기본적인 해결 방향은 맞습니다.',
        score,
        skillsGained: { problem_solving: 2 },
        nextSuggestion: '다양한 관점에서 문제를 바라보고 대안을 생각해보세요.',
        learningPoint: '문제 해결은 분석 → 가설 → 검증 → 실행의 과정입니다.',
      };
    }
  }

  /**
   * 회고 피드백
   */
  private generateRetrospectiveFeedback(quest: any, userInput: any, context: any): AIFeedback {
    const reflection = userInput.reflection || userInput.thoughts;
    const depthOfReflection = this.evaluateReflectionDepth(reflection);
    
    return {
      type: 'positive',
      message: '성찰적 사고를 보여주었습니다.',
      score: Math.max(6, depthOfReflection * 10),
      skillsGained: { self_reflection: 3, growth_mindset: 2 },
      encouragement: '지속적인 학습과 성장 의지가 인상적입니다!',
      learningPoint: '자기 성찰은 전문가로 성장하는 핵심 역량입니다.',
    };
  }

  /**
   * 일반적인 피드백
   */
  private generateGenericFeedback(quest: any, userInput: any, context: any): AIFeedback {
    return {
      type: 'neutral',
      message: '좋은 시도입니다. 계속 진행해보세요.',
      score: 5,
      skillsGained: { general: 1 },
      nextSuggestion: '다음 단계를 진행해주세요.',
      learningPoint: '모든 경험이 학습의 기회입니다.',
    };
  }

  /**
   * 대체 피드백 (에러 시)
   */
  private generateFallbackFeedback(): AIFeedback {
    return {
      type: 'neutral',
      message: '입력을 받았습니다. 계속 진행해주세요.',
      score: 3,
      skillsGained: {},
      nextSuggestion: '다음 단계로 이동하겠습니다.',
    };
  }

  // ========== 평가 헬퍼 메서드들 ==========

  private evaluateDecisionQuality(quest: any, choice: string): boolean {
    // 질문별 최적 선택 평가 로직
    const optimalKeywords = ['데이터', '분석', '체계적', '협업', '단계적'];
    return optimalKeywords.some(keyword => choice.includes(keyword));
  }

  private evaluateCodeQuality(code: string, expectedOutputs?: string[]): any {
    const score = code.length > 10 ? 0.8 : 0.4; // 간단한 길이 기반 평가
    const strengths = ['기본 문법', '논리적 구조'];
    const suggestions = ['주석 추가', '변수명 개선'];
    
    return { score, strengths, suggestions };
  }

  private evaluateAnalysisQuality(analysis: string, correctAnswers: string[]): any {
    const keywords = ['결측값', '중복', '불균형', '데이터'];
    const foundKeywords = keywords.filter(k => analysis.includes(k));
    const accuracy = foundKeywords.length / keywords.length;
    
    return { accuracy };
  }

  private evaluateTechnicalDecision(quest: any, choice: string): any {
    // 기술적 의사결정 평가
    if (choice.includes('LSTM') || choice.includes('점진적')) {
      return {
        score: 8,
        reasoning: '프로젝트 제약사항을 잘 고려한 현실적인 선택입니다.',
        alternatives: ''
      };
    }
    
    return {
      score: 6,
      reasoning: '기본적으로 타당한 선택입니다.',
      alternatives: '다른 옵션들도 고려해보세요.'
    };
  }

  private evaluateCreativity(solution: string): number {
    // 창의성 평가 (0-1)
    const creativityKeywords = ['새로운', '다른', '혁신적', '독창적'];
    return creativityKeywords.some(k => solution.includes(k)) ? 0.8 : 0.6;
  }

  private evaluateEffectiveness(quest: any, solution: string): number {
    // 효과성 평가 (0-1)  
    const effectivenessKeywords = ['효율적', '최적화', '개선', '해결'];
    return effectivenessKeywords.some(k => solution.includes(k)) ? 0.9 : 0.7;
  }

  private evaluateReflectionDepth(reflection: string): number {
    // 성찰 깊이 평가 (0-1)
    const depthKeywords = ['배운', '깨달은', '개선', '성장', '발전'];
    return depthKeywords.some(k => reflection.includes(k)) ? 0.8 : 0.6;
  }

  private generateCharacterResponse(quest: any, userInput: any, score: number): any {
    const speaker = quest.content?.speaker || '팀장';
    const personality = this.characterPersonalities[speaker] || this.characterPersonalities['default'];
    
    let emotion = 'neutral';
    let dialogue = '좋습니다.';
    
    if (score >= 7) {
      emotion = 'positive';
      dialogue = personality.positiveResponses[Math.floor(Math.random() * personality.positiveResponses.length)];
    } else if (score <= 3) {
      emotion = 'concerned';
      dialogue = personality.guidanceResponses[Math.floor(Math.random() * personality.guidanceResponses.length)];
    } else {
      dialogue = personality.neutralResponses[Math.floor(Math.random() * personality.neutralResponses.length)];
    }

    return { speaker, dialogue, emotion };
  }

  private getDecisionFeedbackMessage(type: string, choice: string): string {
    const messages = {
      positive: [
        '훌륭한 판단입니다! 데이터 기반 의사결정의 좋은 예시입니다.',
        '프로젝트 성공을 위한 현명한 선택이었습니다.',
        '체계적인 접근 방식이 인상적입니다.'
      ],
      neutral: [
        '합리적인 선택입니다. 다른 관점도 고려해볼 수 있어요.',
        '기본적인 방향은 맞습니다. 추가적인 요소들도 생각해보세요.',
        '좋은 시작입니다. 더 구체적인 계획을 세워보세요.'
      ],
      guidance: [
        '다시 한 번 생각해보세요. 프로젝트 목표를 고려해보세요.',
        '다른 접근 방법은 없을까요? 팀과 상의해보는 것은 어떨까요?',
        '문제의 우선순위를 다시 정리해보세요.'
      ]
    };

    const typeMessages = messages[type] || messages.neutral;
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  }

  private getDecisionLearningPoint(quest: any, choice: string): string {
    const learningPoints = [
      '데이터 품질 문제는 항상 우선적으로 해결해야 합니다.',
      '프로젝트 초기에 체계적인 계획을 세우는 것이 중요합니다.',
      '팀워크와 소통은 성공적인 프로젝트의 핵심요소입니다.',
      '기술적 제약사항과 비즈니스 요구사항의 균형을 맞춰야 합니다.'
    ];

    return learningPoints[Math.floor(Math.random() * learningPoints.length)];
  }

  private getRandomTemplate(category: string): string {
    const templates = this.responseTemplates[category] || ['좋습니다.'];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // ========== 초기화 메서드들 ==========

  private initializeTemplates(): void {
    this.responseTemplates = {
      dialogue_positive: [
        '적극적인 질문이 인상적입니다!',
        '팀워크를 중시하는 좋은 자세입니다.',
        '명확한 커뮤니케이션을 보여주었습니다.'
      ],
      dialogue_neutral: [
        '기본적인 소통은 잘 했습니다.',
        '조금 더 적극적으로 참여해보세요.',
        '다음엔 더 구체적인 질문을 해보세요.'
      ],
      dialogue_guidance: [
        '팀 미팅에서는 적극적인 참여가 중요합니다.',
        '질문을 통해 이해도를 높여보세요.',
        '동료들과의 소통을 늘려보세요.'
      ]
    };
  }

  private initializeCharacterPersonalities(): void {
    this.characterPersonalities = {
      '박현수': {
        positiveResponses: [
          '훌륭합니다! 이런 자세라면 프로젝트가 성공적일 것 같아요.',
          '정확히 제가 기대했던 접근입니다.',
          '신입이라고 생각할 수 없을 정도로 체계적이네요.'
        ],
        neutralResponses: [
          '좋은 시도입니다. 계속 진행해보세요.',
          '기본기는 잘 되어 있네요.',
          '다음 단계로 넘어가겠습니다.'
        ],
        guidanceResponses: [
          '조금 더 신중하게 접근해보세요.',
          '팀의 목표를 다시 한 번 생각해보세요.',
          '다른 방법은 없을까요?'
        ]
      },
      '이소영': {
        positiveResponses: [
          '와, 정말 잘했어요! 저도 신입 때 이렇게 못했는데.',
          '완전 센스있네요! 이해도가 높아요.',
          '이런 식으로 접근하면 빠르게 성장할 수 있을 거예요.'
        ],
        neutralResponses: [
          '좋아요, 차근차근 해보세요.',
          '기본은 잘 되어 있어요.',
          '조금만 더 신경쓰면 될 것 같아요.'
        ],
        guidanceResponses: [
          '괜찮아요, 처음엔 다들 그래요. 천천히 해봐요.',
          '다른 관점에서도 생각해보세요.',
          '궁금한 게 있으면 언제든 물어보세요.'
        ]
      },
      default: {
        positiveResponses: ['잘했습니다.'],
        neutralResponses: ['계속 진행하세요.'],
        guidanceResponses: ['다시 생각해보세요.']
      }
    };
  }
}