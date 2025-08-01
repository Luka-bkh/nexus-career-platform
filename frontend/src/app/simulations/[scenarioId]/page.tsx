"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { simulationApi } from '@/lib/api';
import { CreditBalance } from '@/components/ui/CreditBalance';
import { SimulationScene } from '@/components/simulations/SimulationScene';

interface ScenarioDetail {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  duration: string;
  difficulty: string;
  creditsRequired: number;
  chapters: Array<{
    id: string;
    title: string;
    description: string;
    estimatedTime: string;
  }>;
  learningObjectives: string[];
  skillsGained: Array<{
    name: string;
    description: string;
  }>;
  prerequisites: string[];
  gameFeatures: string[];
  completionStats: {
    totalPlayers: number;
    averageScore: number;
    completionRate: number;
    averagePlayTime: number;
    topPerformers: Array<{
      name: string;
      score: number;
      grade: string;
    }>;
  };
  reviews: Array<{
    userId: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

interface SimulationSession {
  sessionId: string;
  currentState: any;
  currentQuest: any;
  resumed: boolean;
  message: string;
}

export default function SimulationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params.scenarioId as string;

  const [scenarioDetail, setScenarioDetail] = useState<ScenarioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [currentSession, setCurrentSession] = useState<SimulationSession | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  useEffect(() => {
    if (scenarioId) {
      fetchScenarioDetail();
    }
  }, [scenarioId]);

  const fetchScenarioDetail = async () => {
    try {
      setLoading(true);
      const detail = await simulationApi.getScenarioDetails(scenarioId);
      setScenarioDetail(detail);
    } catch (error) {
      console.error('시나리오 상세 정보 로딩 실패:', error);
      setError('시나리오 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSimulation = async () => {
    if (!scenarioDetail) return;

    try {
      setIsStarting(true);
      const session = await simulationApi.startSimulation({
        simulationId: scenarioId,
        difficulty: selectedDifficulty,
        personalizations: {},
      });

      setCurrentSession(session);
    } catch (error: any) {
      console.error('시뮬레이션 시작 실패:', error);
      alert(error.message || '시뮬레이션 시작에 실패했습니다.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSessionEnd = () => {
    setCurrentSession(null);
    // 결과 페이지로 이동하거나 다시 시작할 수 있도록 처리
  };

  const getDifficultyDescription = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '힌트 제공, 기본 개념 설명, 여유로운 진행';
      case 'intermediate':
        return '표준 진행, 적절한 도전, 실무 중심';
      case 'advanced':
        return '고급 문제, 시간 제한, 오픈엔드 과제';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">시나리오를 불러오는 중...</p>
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
            onClick={fetchScenarioDetail}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!scenarioDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">시나리오를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/simulations')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 시뮬레이션이 시작된 경우 SimulationScene 컴포넌트 렌더링
  if (currentSession) {
    return (
      <SimulationScene
        sessionData={currentSession}
        scenarioDetail={scenarioDetail}
        onSessionEnd={handleSessionEnd}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/simulations')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              시뮬레이션 목록
            </button>
            <CreditBalance />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2">
            {/* 시나리오 헤더 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h1 className="text-3xl font-bold mb-2">{scenarioDetail.title}</h1>
                  <p className="text-blue-100">{scenarioDetail.description}</p>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-6">{scenarioDetail.fullDescription}</p>
                
                {/* 기본 정보 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{scenarioDetail.duration}</div>
                    <div className="text-sm text-gray-600">예상 시간</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{scenarioDetail.creditsRequired}</div>
                    <div className="text-sm text-gray-600">필요 크레딧</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{scenarioDetail.completionStats.averageScore}</div>
                    <div className="text-sm text-gray-600">평균 점수</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{scenarioDetail.completionStats.completionRate}%</div>
                    <div className="text-sm text-gray-600">완주율</div>
                  </div>
                </div>

                {/* 챕터 목록 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">시나리오 구성</h3>
                  <div className="space-y-3">
                    {scenarioDetail.chapters.map((chapter, index) => (
                      <div key={chapter.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{chapter.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{chapter.description}</p>
                          <span className="text-xs text-blue-600 mt-2 inline-block">{chapter.estimatedTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 학습 목표 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">학습 목표</h3>
                  <ul className="space-y-2">
                    {scenarioDetail.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 획득 가능한 스킬 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">획득 가능한 스킬</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {scenarioDetail.skillsGained.map((skill, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900">{skill.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 게임 특징 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">시뮬레이션 특징</h3>
                  <div className="flex flex-wrap gap-2">
                    {scenarioDetail.gameFeatures.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 시작 카드 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">시뮬레이션 시작</h3>
              
              {/* 난이도 선택 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">난이도 선택</label>
                <div className="space-y-2">
                  {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                    <label key={difficulty} className="flex items-center">
                      <input
                        type="radio"
                        value={difficulty}
                        checked={selectedDifficulty === difficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">
                          {difficulty === 'beginner' && '초급'}
                          {difficulty === 'intermediate' && '중급'}
                          {difficulty === 'advanced' && '고급'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {getDifficultyDescription(difficulty)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartSimulation}
                disabled={isStarting}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting ? '시작하는 중...' : `${scenarioDetail.creditsRequired} 크레딧으로 시작`}
              </button>

              <p className="text-xs text-gray-500 mt-2 text-center">
                시뮬레이션 시작 시 크레딧이 차감됩니다
              </p>
            </div>

            {/* 통계 카드 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">체험 통계</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">총 체험자</span>
                  <span className="font-medium">{scenarioDetail.completionStats.totalPlayers.toLocaleString()}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">평균 플레이 시간</span>
                  <span className="font-medium">{Math.round(scenarioDetail.completionStats.averagePlayTime)}분</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">완주율</span>
                  <span className="font-medium">{scenarioDetail.completionStats.completionRate}%</span>
                </div>
              </div>
            </div>

            {/* 리뷰 카드 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 리뷰</h3>
              <div className="space-y-4">
                {scenarioDetail.reviews.slice(0, 2).map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 text-sm mr-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}