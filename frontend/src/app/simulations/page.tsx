"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { simulationApi } from '@/lib/api';
import { CreditBalance } from '@/components/ui/CreditBalance';

interface Scenario {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  creditsRequired: number;
  tags: string[];
  thumbnail: string;
  learningObjectives: string[];
  prerequisites: string[];
  completionStats: {
    totalPlayers: number;
    averageScore: number;
    completionRate: number;
  };
}

export default function SimulationsPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await simulationApi.getScenarios();
      setScenarios(response.scenarios || []);
    } catch (error) {
      console.error('시나리오 목록 로딩 실패:', error);
      setError('시나리오를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-blue-600 bg-blue-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '초급';
      case 'intermediate':
        return '중급';
      case 'advanced':
        return '고급';
      default:
        return difficulty;
    }
  };

  const handleStartSimulation = (scenarioId: string) => {
    router.push(`/simulations/${scenarioId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={fetchScenarios}
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">진로 체험 시뮬레이션</h1>
              <p className="text-gray-600 mt-2">실제 업무를 체험하며 나에게 맞는 진로를 찾아보세요</p>
            </div>
            <CreditBalance />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 시나리오 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* 썸네일 */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                    {getDifficultyLabel(scenario.difficulty)}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{scenario.title}</h3>
                  <p className="text-blue-100 text-sm">{scenario.duration}</p>
                </div>
              </div>

              {/* 콘텐츠 */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">{scenario.description}</p>

                {/* 태그 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {scenario.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* 학습 목표 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">학습 목표</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {scenario.learningObjectives.slice(0, 2).map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-1">•</span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 통계 */}
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>{scenario.completionStats.totalPlayers.toLocaleString()}명 체험</span>
                  <span>완주율 {scenario.completionStats.completionRate}%</span>
                  <span>평균 {scenario.completionStats.averageScore}점</span>
                </div>

                {/* 시작 버튼 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                    {scenario.creditsRequired} 크레딧
                  </div>
                  <button
                    onClick={() => handleStartSimulation(scenario.id)}
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    체험 시작
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 빈 상태 */}
        {scenarios.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-4">아직 사용 가능한 시뮬레이션이 없습니다</div>
            <p className="text-gray-500 text-sm">곧 다양한 진로 체험 콘텐츠가 추가될 예정입니다!</p>
          </div>
        )}
      </div>

      {/* 하단 정보 섹션 */}
      <div className="bg-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">실시간 AI 피드백</h3>
              <p className="text-gray-600 text-sm">
                선택하는 순간마다 AI가 맞춤형 피드백을 제공합니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">체계적인 평가</h3>
              <p className="text-gray-600 text-sm">
                5개 영역에서 종합적인 역량 평가를 받아보세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">개인맞춤 학습</h3>
              <p className="text-gray-600 text-sm">
                체험 결과를 바탕으로 개인화된 학습 로드맵을 제공합니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}