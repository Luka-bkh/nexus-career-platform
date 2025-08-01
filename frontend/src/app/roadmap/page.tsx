"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { roadmapApi } from '@/lib/api';
import { CreditBalance } from '@/components/ui/CreditBalance';

interface RoadmapSummary {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  difficulty: string;
  estimatedDuration: number;
  progress: number;
  currentPhase: string;
  isActive: boolean;
  phaseCount: number;
  totalMilestones: number;
  completedMilestones: number;
  createdAt: string;
}

interface RoadmapStats {
  totalRoadmaps: number;
  averageProgress: number;
  hasActiveRoadmap: boolean;
  currentProgress: number;
  currentTargetRole: string | null;
  estimatedCompletion: string | null;
}

export default function RoadmapPage() {
  const router = useRouter();
  
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>([]);
  const [stats, setStats] = useState<RoadmapStats | null>(null);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRoadmapData();
  }, []);

  const loadRoadmapData = async () => {
    try {
      setLoading(true);
      
      // 병렬로 데이터 로드
      const [roadmapListResult, statsResult, activeResult] = await Promise.all([
        roadmapApi.getRoadmapList({ includeInactive: true, limit: 10 }),
        roadmapApi.getRoadmapStats(),
        roadmapApi.getActiveRoadmap(),
      ]);

      setRoadmaps(roadmapListResult.roadmaps || []);
      setStats(statsResult);
      setActiveRoadmap(activeResult);

    } catch (error: any) {
      console.error('로드맵 데이터 로드 실패:', error);
      setError(error.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoadmap = () => {
    setShowCreateModal(true);
  };

  const handleViewRoadmap = (roadmapId: string) => {
    router.push(`/roadmap/${roadmapId}`);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">로드맵을 불러오는 중...</h3>
          <p className="text-gray-600">개인화된 진로 로드맵을 준비하고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={loadRoadmapData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">진로 로드맵</h1>
              <p className="text-gray-600">개인화된 학습 계획으로 목표를 달성하세요</p>
            </div>
            <CreditBalance />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 로드맵 통계 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalRoadmaps}
              </div>
              <div className="text-sm text-gray-600">생성된 로드맵</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.currentProgress}%
              </div>
              <div className="text-sm text-gray-600">현재 진행률</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-lg font-bold text-purple-600 mb-2">
                {stats.currentTargetRole || '미설정'}
              </div>
              <div className="text-sm text-gray-600">목표 직무</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-lg font-bold text-orange-600 mb-2">
                {stats.estimatedCompletion ? formatDate(stats.estimatedCompletion) : '미정'}
              </div>
              <div className="text-sm text-gray-600">예상 완료일</div>
            </div>
          </div>
        )}

        {/* 활성 로드맵 */}
        {activeRoadmap && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              현재 진행 중인 로드맵
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{activeRoadmap.title}</h3>
                  <p className="text-gray-600 mb-2">{activeRoadmap.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`px-2 py-1 rounded-full ${getDifficultyColor(activeRoadmap.difficulty)}`}>
                      {getDifficultyLabel(activeRoadmap.difficulty)}
                    </span>
                    <span className="text-gray-600">📅 {activeRoadmap.estimatedDuration}개월</span>
                    <span className="text-gray-600">🎯 {activeRoadmap.targetRole}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleViewRoadmap(activeRoadmap.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  자세히 보기
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">진행 상황</span>
                  <span className="font-medium">{Math.round(activeRoadmap.progress * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(activeRoadmap.progress * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                현재 단계: <span className="font-medium text-blue-600">{activeRoadmap.currentPhase || 'phase-1'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 로드맵 생성 버튼 */}
        {!activeRoadmap && (
          <div className="text-center mb-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">진로 로드맵을 생성해보세요</h2>
              <p className="text-gray-600 mb-6">
                설문조사와 시뮬레이션 결과를 바탕으로 개인화된 학습 계획을 만들어드립니다.
              </p>
              <button
                onClick={handleCreateRoadmap}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                AI 로드맵 생성하기
              </button>
            </div>
          </div>
        )}

        {/* 로드맵 목록 */}
        {roadmaps.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">📋</span>
                모든 로드맵
              </h2>
              {activeRoadmap && (
                <button
                  onClick={handleCreateRoadmap}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  새 로드맵 생성
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => (
                <div
                  key={roadmap.id}
                  className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-xl ${
                    roadmap.isActive ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleViewRoadmap(roadmap.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{roadmap.title}</h3>
                    {roadmap.isActive && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        활성
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {roadmap.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">목표 직무</span>
                      <span className="font-medium">{roadmap.targetRole}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">난이도</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(roadmap.difficulty)}`}>
                        {getDifficultyLabel(roadmap.difficulty)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">예상 기간</span>
                      <span className="font-medium">{roadmap.estimatedDuration}개월</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">진행률</span>
                      <span className="font-medium">{Math.round(roadmap.progress * 100)}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.round(roadmap.progress * 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      생성일: {formatDate(roadmap.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 로드맵 생성 모달 */}
      {showCreateModal && (
        <CreateRoadmapModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newRoadmap) => {
            setShowCreateModal(false);
            loadRoadmapData();
          }}
        />
      )}
    </div>
  );
}

// 로드맵 생성 모달 컴포넌트
function CreateRoadmapModal({ 
  onClose, 
  onCreated 
}: { 
  onClose: () => void; 
  onCreated: (roadmap: any) => void; 
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    targetRole: '',
    difficulty: 'BEGINNER',
    forceRegenerate: false,
  });

  const targetRoles = [
    'AI 개발자',
    '데이터 사이언티스트',
    'ML 엔지니어',
    '소프트웨어 엔지니어',
    '프로덕트 매니저',
    '기술 컨설턴트',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const roadmap = await roadmapApi.generateRoadmap({
        targetRole: formData.targetRole || undefined,
        difficulty: formData.difficulty as any,
        forceRegenerate: formData.forceRegenerate,
      });
      
      onCreated(roadmap);
      
    } catch (error: any) {
      console.error('로드맵 생성 실패:', error);
      alert(error.message || '로드맵 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">새 로드맵 생성</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              목표 직무 (선택사항)
            </label>
            <select
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">AI가 추천하는 직무</option>
              {targetRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              난이도
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="BEGINNER">초급 - 기초부터 시작</option>
              <option value="INTERMEDIATE">중급 - 기본 지식 보유</option>
              <option value="ADVANCED">고급 - 상당한 경험 보유</option>
              <option value="EXPERT">전문가 - 분야 전환/심화</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="forceRegenerate"
              checked={formData.forceRegenerate}
              onChange={(e) => setFormData({ ...formData, forceRegenerate: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="forceRegenerate" className="ml-2 text-sm text-gray-700">
              기존 로드맵이 있어도 새로 생성
            </label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '생성 중...' : '생성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}