// API 클라이언트 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

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

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
}

export interface LearningPath {
  title: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modules: string[];
  estimatedCost: string;
}

export interface PersonalityInsight {
  trait: string;
  score: number;
  description: string;
  careerImplications: string[];
}

export interface CareerAnalysisResult {
  recommendedCareers: CareerRecommendation[];
  careerRoadmaps: Record<string, any>;
  skillGaps: SkillGap[];
  learningPaths: LearningPath[];
  personalityInsights: PersonalityInsight[];
  matchScore?: number;
  confidence?: number;
  creditsRemaining?: number;
  analysisCompletedAt?: string;
}

export interface CreditBalance {
  freeCredits: number;
  paidCredits: number;
  totalCredits: number;
  subscriptionType: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionType: string;
  credits: number;
  isActive: boolean;
}

// API 에러 클래스
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 기본 fetch 래퍼
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { ...defaultHeaders, ...options.headers },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error?.message || 'API 요청에 실패했습니다.',
      response.status,
      data.error?.code
    );
  }

  return data;
}



// 설문 API
export const surveyApi = {
  // 설문 저장
  async submitSurvey(surveyData: any): Promise<{ surveyId: string; creditsRemaining: number }> {
    const response = await apiRequest<{ surveyId: string; creditsRemaining: number }>('/onboarding/survey', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    });
    return response.data;
  },

  // 임시 저장
  async saveDraft(stepData: any, currentStep: number): Promise<{ surveyId: string }> {
    const response = await apiRequest<{ surveyId: string }>('/onboarding/survey/draft', {
      method: 'POST',
      body: JSON.stringify({ stepData, currentStep }),
    });
    return response.data;
  },

  // 임시 저장된 설문 조회
  async getDraft(): Promise<any> {
    const response = await apiRequest<any>('/onboarding/survey/draft');
    return response.data;
  },
};

// 진로 분석 API
export const careerApi = {
  // AI 분석 요청
  async analyzeCareer(surveyId: string): Promise<CareerAnalysisResult> {
    const response = await apiRequest<CareerAnalysisResult>('/career/analyze', {
      method: 'POST',
      body: JSON.stringify({ surveyId }),
    });
    return response.data;
  },

  // 분석 결과 목록
  async getResults(page: number = 1, limit: number = 10): Promise<any> {
    const response = await apiRequest<any>(`/career/results?page=${page}&limit=${limit}`);
    return response.data;
  },

  // 특정 분석 결과 조회
  async getResult(resultId: string): Promise<any> {
    const response = await apiRequest<any>(`/career/results/${resultId}`);
    return response.data;
  },
};

// 크레딧 API
export const creditApi = {
  // 크레딧 잔액 조회
  async getBalance(): Promise<CreditBalance> {
    const response = await apiRequest<CreditBalance>('/user/credits');
    return response.data;
  },

  // 트랜잭션 히스토리
  async getTransactions(page: number = 1, limit: number = 20): Promise<any> {
    const response = await apiRequest<any>(`/user/credits/transactions?page=${page}&limit=${limit}`);
    return response.data;
  },

  // 사용량 통계
  async getStats(startDate: string, endDate: string): Promise<any> {
    const response = await apiRequest<any>(`/user/credits/stats?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
};

// 시뮬레이션 API
export const simulationApi = {
  // 시나리오 정보
  async getScenarios(): Promise<any> {
    const response = await apiRequest<any>('/simulation/scenarios');
    return response.data;
  },

  async getScenarioDetails(scenarioId: string): Promise<any> {
    const response = await apiRequest<any>(`/simulation/scenarios/${scenarioId}`);
    return response.data;
  },

  // 시뮬레이션 세션 관리
  async startSimulation(params: {
    simulationId: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    personalizations?: Record<string, any>;
  }): Promise<any> {
    const response = await apiRequest<any>('/simulation/start', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.data;
  },

  async getSimulationState(sessionId: string): Promise<any> {
    const response = await apiRequest<any>(`/simulation/${sessionId}/state`);
    return response.data;
  },

  async pauseSimulation(sessionId: string): Promise<any> {
    const response = await apiRequest<any>(`/simulation/${sessionId}/pause`, {
      method: 'POST',
    });
    return response.data;
  },

  async resumeSimulation(sessionId: string): Promise<any> {
    const response = await apiRequest<any>(`/simulation/${sessionId}/resume`, {
      method: 'POST',
    });
    return response.data;
  },

  async completeSimulation(sessionId: string): Promise<any> {
    const response = await apiRequest<any>(`/simulation/${sessionId}/complete`, {
      method: 'POST',
    });
    return response.data;
  },

  // 상호작용 처리
  async interact(sessionId: string, params: {
    questId: string;
    interactionType: string;
    userInput: any;
  }): Promise<any> {
    const response = await apiRequest<any>(`/simulation/${sessionId}/interact`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.data;
  },

  // 세션 및 결과 조회
  async getSessions(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const response = await apiRequest<any>(`/simulation/sessions${queryString}`);
    return response.data;
  },

  async getResult(resultId: string): Promise<any> {
    const response = await apiRequest<any>(`/simulation/results/${resultId}`);
    return response.data;
  },

  async getLeaderboard(scenarioId: string, params?: {
    period?: 'all' | 'week' | 'month';
    limit?: number;
  }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const response = await apiRequest<any>(`/simulation/leaderboard/${scenarioId}${queryString}`);
    return response.data;
  },

  // 리포트 관련
  async getReport(sessionId: string, refresh: boolean = false): Promise<any> {
    const queryString = refresh ? '?refresh=true' : '';
    const response = await apiRequest<any>(`/simulation/${sessionId}/report${queryString}`);
    return response.data;
  },

  async getReportSummary(sessionId: string): Promise<any> {
    const response = await apiRequest<any>(`/simulation/${sessionId}/report/summary`);
    return response.data;
  },
};

// 진로 로드맵 API
export const roadmapApi = {
  // 로드맵 생성
  async generateRoadmap(params: {
    targetRole?: string;
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    forceRegenerate?: boolean;
  }): Promise<any> {
    const response = await apiRequest<any>('/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.data;
  },

  // 활성 로드맵 조회
  async getActiveRoadmap(): Promise<any> {
    const response = await apiRequest<any>('/roadmap/active');
    return response.data;
  },

  // 로드맵 목록 조회
  async getRoadmapList(params?: {
    includeInactive?: boolean;
    limit?: number;
  }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const response = await apiRequest<any>(`/roadmap/list${queryString}`);
    return response.data;
  },

  // 로드맵 상세 조회
  async getRoadmapById(roadmapId: string): Promise<any> {
    const response = await apiRequest<any>(`/roadmap/${roadmapId}`);
    return response.data;
  },

  // 진행상황 업데이트
  async updateProgress(roadmapId: string, progressData: {
    phaseId?: string;
    milestoneId?: string;
    isCompleted?: boolean;
    customProgress?: number;
  }): Promise<any> {
    const response = await apiRequest<any>(`/roadmap/${roadmapId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
    return response.data;
  },

  // 로드맵 적응형 업데이트
  async adaptRoadmap(roadmapId: string, params: {
    trigger: 'new_simulation' | 'skill_update' | 'goal_change';
    reason?: string;
  }): Promise<any> {
    const response = await apiRequest<any>(`/roadmap/${roadmapId}/adapt`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response.data;
  },

  // 로드맵 삭제
  async deleteRoadmap(roadmapId: string): Promise<any> {
    const response = await apiRequest<any>(`/roadmap/${roadmapId}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  // 로드맵 통계 조회
  async getRoadmapStats(): Promise<any> {
    const response = await apiRequest<any>('/roadmap/stats');
    return response.data;
  },

  // 로드맵 요약 조회
  async getRoadmapSummary(roadmapId: string): Promise<any> {
    const response = await apiRequest<any>(`/roadmap/${roadmapId}/summary`);
    return response.data;
  },

  // 단계 상세 조회
  async getPhaseDetail(roadmapId: string, phaseId: string): Promise<any> {
    const response = await apiRequest<any>(`/roadmap/${roadmapId}/phases/${phaseId}`);
    return response.data;
  },

  // 마일스톤 상세 조회
  async getMilestoneDetail(roadmapId: string, milestoneId: string): Promise<any> {
    const response = await apiRequest<any>(`/roadmap/${roadmapId}/milestones/${milestoneId}`);
    return response.data;
  },

  // 마일스톤 완료 처리
  async completeMilestone(roadmapId: string, milestoneId: string, data?: {
    notes?: string;
    evidence?: string;
  }): Promise<any> {
    const response = await apiRequest<any>(`/roadmap/${roadmapId}/milestones/${milestoneId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(data || {}),
    });
    return response.data;
  },

  // 로드맵 템플릿 조회
  async getTemplates(params?: {
    role?: string;
    difficulty?: string;
  }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const response = await apiRequest<any>(`/roadmap/templates${queryString}`);
    return response.data;
  },

  // 로드맵 피드백 제출
  async submitFeedback(roadmapId: string, feedback: {
    rating: number;
    feedback?: string;
    suggestions?: string;
    categories?: string[];
  }): Promise<any> {
    const response = await apiRequest<any>(`/roadmap/${roadmapId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
    return response.data;
  },
};

// 인증 API
export const authApi = {
  // 회원가입
  async signup(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    birthYear?: number;
    gender?: string;
  }): Promise<any> {
    const response = await apiRequest<any>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // 토큰 저장
    if (typeof window !== 'undefined' && response.data.tokens) {
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }
    
    return response;
  },

  // 로그인
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<any> {
    const response = await apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // 토큰 저장
    if (typeof window !== 'undefined' && response.data.tokens) {
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }
    
    return response;
  },

  // 로그아웃
  async logout(): Promise<any> {
    const response = await apiRequest<any>('/auth/logout', {
      method: 'POST',
    });
    
    // 토큰 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    
    return response;
  },

  // 인증 상태 확인
  async checkAuth(): Promise<{ authenticated: boolean; user?: User }> {
    try {
      const response = await apiRequest<{ authenticated: boolean; user?: User }>('/auth/check');
      return response.data;
    } catch (error) {
      return { authenticated: false };
    }
  },

  // 토큰 검증
  async verifyToken(): Promise<any> {
    const response = await apiRequest<any>('/auth/verify');
    return response;
  },

  // 비밀번호 재설정 요청
  async requestPasswordReset(email: string): Promise<any> {
    const response = await apiRequest<any>('/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response;
  },

  // 비밀번호 재설정
  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<any> {
    const response = await apiRequest<any>('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  // 이메일 인증
  async verifyEmail(token: string): Promise<any> {
    const response = await apiRequest<any>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    return response;
  },

  // 이메일 인증 재전송
  async resendVerificationEmail(): Promise<any> {
    const response = await apiRequest<any>('/auth/resend-verification', {
      method: 'POST',
    });
    return response;
  },
};

// 퀘스트 API
export const questApi = {
  // 오늘의 일일 퀘스트 조회
  async getDailyQuests(): Promise<any> {
    const response = await apiRequest<any>('/quest/daily');
    return response.data;
  },

  // 일일 퀘스트 생성/갱신
  async generateDailyQuests(): Promise<any> {
    const response = await apiRequest<any>('/quest/generate', {
      method: 'POST',
    });
    return response.data;
  },

  // 퀘스트 완료 처리
  async completeQuest(questId: string, data?: {
    metadata?: any;
    notes?: string;
  }): Promise<any> {
    const response = await apiRequest<any>(`/quest/${questId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
    return response.data;
  },

  // 퀘스트 진행 상황 업데이트
  async updateQuestProgress(questId: string, data: {
    increment?: number;
    metadata?: any;
  }): Promise<any> {
    const response = await apiRequest<any>(`/quest/${questId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // 퀘스트 트리거 (자동 진행)
  async triggerQuest(type: string, data?: {
    increment?: number;
    metadata?: any;
  }): Promise<any> {
    const response = await apiRequest<any>('/quest/trigger', {
      method: 'POST',
      body: JSON.stringify({
        type,
        ...data,
      }),
    });
    return response.data;
  },

  // 퀘스트 통계 조회
  async getQuestStats(): Promise<any> {
    const response = await apiRequest<any>('/quest/stats');
    return response.data;
  },

  // 퀘스트 완료 이력 조회
  async getQuestHistory(params?: {
    limit?: number;
    offset?: number;
    type?: string;
    completed?: boolean;
  }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const response = await apiRequest<any>(`/quest/history${queryString}`);
    return response.data;
  },

  // 퀘스트 리더보드 조회
  async getQuestLeaderboard(params?: {
    period?: 'daily' | 'weekly' | 'monthly';
    limit?: number;
  }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const response = await apiRequest<any>(`/quest/leaderboard${queryString}`);
    return response.data;
  },

  // 퀘스트 템플릿 조회
  async getQuestTemplates(params?: {
    type?: string;
    active?: boolean;
  }): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const response = await apiRequest<any>(`/quest/templates${queryString}`);
    return response.data;
  },

  // 퀘스트 피드백 제출
  async submitQuestFeedback(feedback: {
    questId?: string;
    questType?: string;
    rating: number;
    feedback?: string;
    difficulty?: 'too_easy' | 'just_right' | 'too_hard';
    suggestions?: string;
  }): Promise<any> {
    const response = await apiRequest<any>('/quest/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
    return response.data;
  },
};

// 사용자 API
export const userApi = {
  // 프로필 조회
  async getProfile(): Promise<any> {
    const response = await apiRequest<any>('/user/profile');
    return response.data;
  },

  // 프로필 업데이트
  async updateProfile(profileData: any): Promise<any> {
    const response = await apiRequest<any>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data;
  },

  // 비밀번호 변경
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiRequest('/user/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};