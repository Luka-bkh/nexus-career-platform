"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { roadmapApi } from '@/lib/api';
import { CreditBalance } from '@/components/ui/CreditBalance';
import { RoadmapViewer } from '@/components/roadmap/RoadmapViewer';
import { ProgressTimeline } from '@/components/roadmap/ProgressTimeline';
import { SkillTree } from '@/components/roadmap/SkillTree';
import { MilestoneTracker } from '@/components/roadmap/MilestoneTracker';
import { CareerProgression } from '@/components/roadmap/CareerProgression';

interface RoadmapDetail {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetRole: string;
  difficulty: string;
  estimatedDuration: number;
  
  phases: Array<{
    id: string;
    title: string;
    description: string;
    duration: number;
    prerequisites: string[];
    milestones: Array<{
      id: string;
      title: string;
      description: string;
      type: string;
      priority: string;
      estimatedHours: number;
      resources: Array<{
        type: string;
        title: string;
        description?: string;
        url?: string;
        provider?: string;
        cost: string;
        rating?: number;
      }>;
      skills: string[];
      successCriteria: string[];
      isCompleted?: boolean;
      completedAt?: string;
    }>;
    skills: string[];
    order: number;
  }>;
  
  totalSkills: string[];
  careerProgression: Array<{
    position: string;
    timeline: string;
    requirements: string[];
    averageSalary?: string;
    companies?: string[];
    nextSteps?: string[];
  }>;
  
  personalizedFor: {
    learningStyle: string;
    availability: string;
    preferredLearningMethods: string[];
    currentSkillLevel: string;
    budget: string;
    timeCommitment: string;
    priorities: string[];
    constraints: string[];
  };
  
  aiAnalysis: {
    strengthsConsidered: string[];
    weaknessesAddressed: string[];
    surveyInfluence: number;
    simulationInfluence: number;
    confidence: number;
    adaptationLevel: string;
    recommendationReason: string;
  };
  
  dataSourceIds: string[];
  basedOnSurvey: boolean;
  basedOnSimulation: boolean;
}

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const roadmapId = params.roadmapId as string;
  
  const [roadmap, setRoadmap] = useState<RoadmapDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showAdaptModal, setShowAdaptModal] = useState(false);

  const tabs = [
    { id: 'overview', label: '전체 개요', icon: '🗺️' },
    { id: 'timeline', label: '학습 타임라인', icon: '📅' },
    { id: 'skills', label: '스킬 트리', icon: '🌳' },
    { id: 'milestones', label: '마일스톤', icon: '🎯' },
    { id: 'progression', label: '진로 발전', icon: '🚀' },
    { id: 'personalization', label: '개인화 분석', icon: '👤' },
  ];

  useEffect(() => {
    loadRoadmapDetail();
  }, [roadmapId]);

  const loadRoadmapDetail = async () => {
    try {
      setLoading(true);
      const roadmapData = await roadmapApi.getRoadmapById(roadmapId);
      setRoadmap(roadmapData);
    } catch (error: any) {
      console.error('로드맵 상세 조회 실패:', error);
      setError(error.message || '로드맵을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneComplete = async (milestoneId: string, notes?: string) => {
    try {
      await roadmapApi.completeMilestone(roadmapId, milestoneId, { notes });
      await loadRoadmapDetail(); // 데이터 새로고침
    } catch (error: any) {
      console.error('마일스톤 완료 처리 실패:', error);
      alert('마일스톤 완료 처리에 실패했습니다.');
    }
  };

  const handleAdaptRoadmap = async (trigger: string, reason?: string) => {
    try {
      await roadmapApi.adaptRoadmap(roadmapId, { trigger: trigger as any, reason });
      await loadRoadmapDetail();
      setShowAdaptModal(false);
      alert('로드맵이 성공적으로 적응되었습니다!');
    } catch (error: any) {
      console.error('로드맵 적응 실패:', error);
      alert('로드맵 적응에 실패했습니다.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-blue-100 text-blue-800';
      case 'ADVANCED': return 'bg-purple-100 text-purple-800';
      case 'EXPERT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return '초급';
      case 'INTERMEDIATE': return '중급';
      case 'ADVANCED': return '고급';
      case 'EXPERT': return '전문가';
      default: return difficulty;
    }
  };

  const calculateProgress = () => {
    if (!roadmap) return 0;
    
    const totalMilestones = roadmap.phases.reduce((sum, phase) => sum + phase.milestones.length, 0);
    const completedMilestones = roadmap.phases.reduce((sum, phase) => 
      sum + phase.milestones.filter(m => m.isCompleted).length, 0
    );
    
    return totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">로드맵을 불러오는 중...</h3>
          <p className="text-gray-600">상세 정보를 준비하고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <div className="space-x-4">
            <button
              onClick={loadRoadmapDetail}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
            <button
              onClick={() => router.push('/roadmap')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              로드맵 목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">로드맵을 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/roadmap')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            로드맵 목록으로
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <RoadmapViewer roadmap={roadmap} onMilestoneComplete={handleMilestoneComplete} />;
      case 'timeline':
        return <ProgressTimeline roadmap={roadmap} />;
      case 'skills':
        return <SkillTree roadmap={roadmap} />;
      case 'milestones':
        return (
          <MilestoneTracker 
            roadmap={roadmap} 
            onMilestoneComplete={handleMilestoneComplete}
          />
        );
      case 'progression':
        return <CareerProgression roadmap={roadmap} />;
      case 'personalization':
        return (
          <div className="space-y-8">
            {/* 개인화 분석 */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">👤</span>
                개인화 분석
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">학습 프로필</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">학습 스타일</span>
                      <span className="font-medium">{roadmap.personalizedFor.learningStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">학습 가능 시간</span>
                      <span className="font-medium">{roadmap.personalizedFor.availability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">현재 스킬 레벨</span>
                      <span className="font-medium">{roadmap.personalizedFor.currentSkillLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">예산</span>
                      <span className="font-medium">{roadmap.personalizedFor.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">시간 투자</span>
                      <span className="font-medium">{roadmap.personalizedFor.timeCommitment}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 분석</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">분석 신뢰도</span>
                      <span className="font-medium">{Math.round(roadmap.aiAnalysis.confidence * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">설문 영향도</span>
                      <span className="font-medium">{Math.round(roadmap.aiAnalysis.surveyInfluence * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">시뮬레이션 영향도</span>
                      <span className="font-medium">{Math.round(roadmap.aiAnalysis.simulationInfluence * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">적응 수준</span>
                      <span className="font-medium">{roadmap.aiAnalysis.adaptationLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">추천 근거</h4>
                <p className="text-blue-800 text-sm">{roadmap.aiAnalysis.recommendationReason}</p>
              </div>
            </div>

            {/* 고려된 강점과 해결할 약점 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💪</span>
                  고려된 강점
                </h3>
                <div className="space-y-2">
                  {roadmap.aiAnalysis.strengthsConsidered.map((strength, index) => (
                    <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-green-800 text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  해결할 약점
                </h3>
                <div className="space-y-2">
                  {roadmap.aiAnalysis.weaknessesAddressed.map((weakness, index) => (
                    <div key={index} className="flex items-center p-2 bg-orange-50 rounded-lg">
                      <span className="text-orange-600 mr-2">→</span>
                      <span className="text-orange-800 text-sm">{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/roadmap')}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                로드맵 목록
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">로드맵 상세</span>
            </div>
            <CreditBalance />
          </div>
        </div>
      </div>

      {/* 로드맵 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{roadmap.title}</h1>
              <p className="text-blue-100 mb-4">{roadmap.description}</p>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <span className="mr-2">🎯</span>
                  <span>{roadmap.targetRole}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📅</span>
                  <span>{roadmap.estimatedDuration}개월</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📊</span>
                  <span>{Math.round(calculateProgress())}% 완료</span>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(roadmap.difficulty)}`}>
                    {getDifficultyLabel(roadmap.difficulty)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAdaptModal(true)}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30"
              >
                🔄 로드맵 적응
              </button>
              <button
                onClick={() => router.push(`/simulations`)}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30"
              >
                🎮 시뮬레이션 체험
              </button>
            </div>
          </div>
          
          {/* 진행률 바 */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>전체 진행률</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="container mx-auto px-4 py-8">
        {renderTabContent()}
      </div>

      {/* 로드맵 적응 모달 */}
      {showAdaptModal && (
        <AdaptRoadmapModal
          onClose={() => setShowAdaptModal(false)}
          onAdapt={handleAdaptRoadmap}
        />
      )}
    </div>
  );
}

// 로드맵 적응 모달 컴포넌트
function AdaptRoadmapModal({ 
  onClose, 
  onAdapt 
}: { 
  onClose: () => void; 
  onAdapt: (trigger: string, reason?: string) => void; 
}) {
  const [selectedTrigger, setSelectedTrigger] = useState('');
  const [reason, setReason] = useState('');

  const triggers = [
    { id: 'new_simulation', label: '새로운 시뮬레이션 완료', description: '최근 시뮬레이션 결과를 반영하여 로드맵을 조정합니다.' },
    { id: 'skill_update', label: '스킬 향상', description: '현재 보유한 스킬이 향상되어 로드맵을 업데이트합니다.' },
    { id: 'goal_change', label: '목표 변경', description: '진로 목표가 변경되어 새로운 방향으로 로드맵을 수정합니다.' },
  ];

  const handleSubmit = () => {
    if (!selectedTrigger) {
      alert('적응 사유를 선택해주세요.');
      return;
    }
    onAdapt(selectedTrigger, reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">로드맵 적응</h2>
        <p className="text-gray-600 mb-6 text-sm">
          최신 데이터를 바탕으로 로드맵을 개인화하여 업데이트합니다.
        </p>
        
        <div className="space-y-4 mb-6">
          {triggers.map((trigger) => (
            <label key={trigger.id} className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="trigger"
                value={trigger.id}
                checked={selectedTrigger === trigger.id}
                onChange={(e) => setSelectedTrigger(e.target.value)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-3">
                <div className="font-medium text-gray-900">{trigger.label}</div>
                <div className="text-gray-600 text-sm">{trigger.description}</div>
              </div>
            </label>
          ))}
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            추가 설명 (선택사항)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="적응이 필요한 구체적인 이유를 설명해주세요..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            적응하기
          </button>
        </div>
      </div>
    </div>
  );
}