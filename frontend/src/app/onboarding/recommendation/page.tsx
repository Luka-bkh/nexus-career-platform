"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { careerApi, CareerAnalysisResult, CareerRecommendation } from "@/lib/api";
import { CreditBalance } from "@/components/ui/CreditBalance";
import { CareerCard } from "@/components/ui/CareerCard";
import { SkillGapChart } from "@/components/ui/SkillGapChart";
import { CareerRoadmap } from "@/components/ui/CareerRoadmap";
import { LearningPaths } from "@/components/ui/LearningPaths";
import { PersonalityInsights } from "@/components/ui/PersonalityInsights";

export default function RecommendationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyId = searchParams.get('surveyId');
  const resultId = searchParams.get('resultId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CareerAnalysisResult | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<CareerRecommendation | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'roadmap' | 'learning' | 'personality'>('overview');

  useEffect(() => {
    if (!surveyId && !resultId) {
      router.push('/onboarding/survey');
      return;
    }

    fetchAnalysisResult();
  }, [surveyId, resultId]);

  const fetchAnalysisResult = async () => {
    try {
      setLoading(true);
      setError(null);

      let result: CareerAnalysisResult;

      if (resultId) {
        // 기존 결과 조회
        const data = await careerApi.getResult(resultId);
        result = data;
      } else if (surveyId) {
        // 새로운 분석 실행
        try {
          result = await careerApi.analyzeCareer(surveyId);
        } catch (error) {
          // API가 아직 준비되지 않았으므로 목업 데이터 사용
          result = getMockAnalysisResult();
        }
      } else {
        throw new Error('설문 ID 또는 결과 ID가 필요합니다.');
      }

      setAnalysisResult(result);
      if (result.recommendedCareers && result.recommendedCareers.length > 0) {
        setSelectedCareer(result.recommendedCareers[0]);
      }
    } catch (err: any) {
      setError(err.message || '분석 결과를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalysisResult = (): CareerAnalysisResult => {
    return {
      recommendedCareers: [
        {
          title: "AI 개발자",
          matchScore: 92,
          description: "인공지능 모델 개발 및 구현을 담당하는 전문가",
          category: "Technology",
          averageSalary: "6000-8000만원",
          growthProspect: "high",
          requiredSkills: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch"],
          workEnvironment: ["Remote", "Hybrid", "Tech Office"],
          educationLevel: "대학교 졸업 (컴공/수학/통계)",
          jobMarketDemand: "high"
        },
        {
          title: "데이터 사이언티스트",
          matchScore: 87,
          description: "데이터 분석을 통한 비즈니스 인사이트 도출",
          category: "Technology",
          averageSalary: "5000-7000만원",
          growthProspect: "high",
          requiredSkills: ["Python", "SQL", "Statistics", "Pandas", "Visualization"],
          workEnvironment: ["Remote", "Hybrid", "Office"],
          educationLevel: "대학교 졸업 (통계/수학/컴공)",
          jobMarketDemand: "high"
        },
        {
          title: "UX/UI 디자이너",
          matchScore: 83,
          description: "사용자 경험과 인터페이스 디자인",
          category: "Design",
          averageSalary: "4000-6000만원",
          growthProspect: "medium",
          requiredSkills: ["Figma", "Sketch", "Prototyping", "User Research", "HTML/CSS"],
          workEnvironment: ["Remote", "Hybrid", "Creative Space"],
          educationLevel: "대학교 졸업 또는 디자인 교육",
          jobMarketDemand: "medium"
        }
      ],
      skillGaps: [
        {
          skill: "Python",
          currentLevel: 2,
          requiredLevel: 5,
          priority: "high"
        },
        {
          skill: "Machine Learning",
          currentLevel: 1,
          requiredLevel: 4,
          priority: "high"
        },
        {
          skill: "SQL",
          currentLevel: 2,
          requiredLevel: 4,
          priority: "medium"
        }
      ],
      learningPaths: [
        {
          title: "AI 개발자 완성 과정",
          duration: "6-9개월",
          difficulty: "advanced",
          modules: ["Python 마스터 과정", "Machine Learning 마스터 과정", "Deep Learning 마스터 과정", "TensorFlow 실습", "프로젝트 포트폴리오"],
          estimatedCost: "200-500만원"
        },
        {
          title: "데이터 사이언티스트 트랙",
          duration: "3-6개월",
          difficulty: "intermediate",
          modules: ["Python 마스터 과정", "SQL 마스터 과정", "Statistics 마스터 과정", "데이터 시각화"],
          estimatedCost: "150-400만원"
        }
      ],
      careerRoadmaps: {
        "AI 개발자": {
          shortTerm: ["Python 기초 학습", "머신러닝 입문 과정", "기본 프로젝트 완성"],
          mediumTerm: ["딥러닝 전문화", "실무 프로젝트 경험", "포트폴리오 구축"],
          longTerm: ["AI 아키텍트", "연구 개발 리더", "기술 전문가"],
          timeline: {
            "0-6개월": "기초 학습 및 입문 프로젝트",
            "6-18개월": "실무 경험 축적 및 전문성 개발",
            "18개월-3년": "시니어 개발자로 성장",
            "3년+": "리더십 및 전문가 역할"
          }
        }
      },
      personalityInsights: [
        {
          trait: "외향성",
          score: 3,
          description: "상황에 따라 내향적/외향적 특성을 보임",
          careerImplications: ["팀워크와 개인 업무의 균형", "다양한 업무 환경 적응 가능"]
        },
        {
          trait: "성실성",
          score: 4,
          description: "계획적이고 체계적인 성향",
          careerImplications: ["장기 프로젝트 적합", "품질 관리에 강점", "체계적인 업무 진행"]
        },
        {
          trait: "개방성",
          score: 5,
          description: "새로운 아이디어와 변화를 추구",
          careerImplications: ["혁신적인 업무 환경에 적합", "새로운 기술 학습에 적극적", "창의적 문제 해결"]
        }
      ],
      matchScore: 87.3,
      confidence: 0.91,
      creditsRemaining: 4,
      analysisCompletedAt: new Date().toISOString()
    };
  };

  const handleCareerSelect = (career: CareerRecommendation) => {
    setSelectedCareer(career);
    setActiveTab('roadmap');
  };

  const handleSimulation = (career: CareerRecommendation) => {
    // TODO: 시뮬레이션 페이지로 이동
    console.log('시뮬레이션 시작:', career.title);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">AI가 당신의 진로를 분석하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="card max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">분석 실패</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <button 
                onClick={fetchAnalysisResult}
                className="btn-primary w-full"
              >
                다시 시도
              </button>
              <Link href="/onboarding/survey" className="btn-secondary w-full">
                설문으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: '개요', icon: '📊' },
    { id: 'skills', label: '스킬 분석', icon: '🎯' },
    { id: 'roadmap', label: '진로 로드맵', icon: '🗺️' },
    { id: 'learning', label: '학습 경로', icon: '📚' },
    { id: 'personality', label: '성격 분석', icon: '🧠' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link 
                href="/" 
                className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                홈으로 돌아가기
              </Link>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                🎉 AI 진로 분석 완료!
              </h1>
              <p className="text-lg text-gray-600">
                당신에게 맞는 진로를 추천해드립니다
              </p>
            </div>
            
            <CreditBalance />
          </div>

          {/* 분석 결과 요약 */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {analysisResult.matchScore?.toFixed(1) || '88.5'}%
              </div>
              <div className="text-sm text-gray-600">전체 적합도</div>
            </div>
            
            <div className="card text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analysisResult.recommendedCareers.length}
              </div>
              <div className="text-sm text-gray-600">추천 직업</div>
            </div>
            
            <div className="card text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round((analysisResult.confidence || 0.85) * 100)}%
              </div>
              <div className="text-sm text-gray-600">분석 신뢰도</div>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="card mb-8">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="space-y-8">
            {/* 개요 탭 */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">추천 직업 목록</h2>
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {analysisResult.recommendedCareers.map((career, index) => (
                    <CareerCard
                      key={index}
                      career={career}
                      rank={index + 1}
                      onSelect={handleCareerSelect}
                      onSimulate={handleSimulation}
                    />
                  ))}
                </div>

                {/* 다음 단계 안내 */}
                <div className="mt-8 card">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    🚀 다음 단계
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <h4 className="font-semibold mb-2">스킬 분석</h4>
                      <p className="text-sm text-gray-600">필요한 스킬과 현재 수준의 차이를 확인하세요</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">📚</span>
                      </div>
                      <h4 className="font-semibold mb-2">학습 계획</h4>
                      <p className="text-sm text-gray-600">체계적인 학습 경로를 확인하세요</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🎮</span>
                      </div>
                      <h4 className="font-semibold mb-2">시뮬레이션</h4>
                      <p className="text-sm text-gray-600">관심 직업을 직접 체험해보세요</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 스킬 분석 탭 */}
            {activeTab === 'skills' && (
              <SkillGapChart skillGaps={analysisResult.skillGaps} />
            )}

            {/* 진로 로드맵 탭 */}
            {activeTab === 'roadmap' && selectedCareer && (
              <CareerRoadmap
                careerTitle={selectedCareer.title}
                roadmap={analysisResult.careerRoadmaps[selectedCareer.title]}
              />
            )}

            {/* 학습 경로 탭 */}
            {activeTab === 'learning' && (
              <LearningPaths learningPaths={analysisResult.learningPaths} />
            )}

            {/* 성격 분석 탭 */}
            {activeTab === 'personality' && (
              <PersonalityInsights insights={analysisResult.personalityInsights} />
            )}
          </div>

          {/* 추가 액션 */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="card text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🎮 직업 시뮬레이션 체험
              </h3>
              <p className="text-gray-600 mb-6">
                실제 업무를 체험하며 적성을 확인해보세요
              </p>
              <button className="btn-primary w-full">
                시뮬레이션 시작하기
              </button>
            </div>

            <div className="card text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                📊 상세 리포트 다운로드
              </h3>
              <p className="text-gray-600 mb-6">
                분석 결과를 PDF로 다운로드하여 보관하세요
              </p>
              <button className="btn-outline w-full">
                리포트 다운로드
              </button>
            </div>
          </div>

          {/* 공유 및 저장 */}
          <div className="mt-8 card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  결과 공유 및 저장
                </h3>
                <p className="text-sm text-gray-600">
                  분석 결과를 친구나 가족과 공유하거나 나중에 다시 확인하세요
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button className="btn-outline">
                  🔗 링크 복사
                </button>
                <button className="btn-outline">
                  💾 즐겨찾기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}