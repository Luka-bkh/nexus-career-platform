"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi, roadmapApi, simulationApi, questApi } from '@/lib/api';
import { CreditBalance } from '@/components/ui/CreditBalance';
import { DailyQuestWidget } from '@/components/dashboard/DailyQuestWidget';
import { ToastManager, useToast } from '@/components/common/ToastNotification';

interface DashboardData {
  user: any;
  roadmapStats: any;
  recentSimulations: any[];
  activeRoadmap: any;
  recommendations: any[];
  dailyQuests: any[];
  questStats: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toasts, removeToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 병렬로 데이터 로드
      const [profile, roadmapStats, activeRoadmap, dailyQuests, questStats] = await Promise.all([
        userApi.getProfile(),
        roadmapApi.getRoadmapStats().catch(() => null),
        roadmapApi.getActiveRoadmap().catch(() => null),
        questApi.getDailyQuests().catch(() => ({ quests: [], total: 0, completed: 0 })),
        questApi.getQuestStats().catch(() => null),
      ]);

      // 시뮬레이션 데이터는 실패해도 괜찮음
      let recentSimulations = [];
      try {
        const simulations = await simulationApi.getSessions({ limit: 3, status: 'completed' });
        recentSimulations = simulations.sessions || [];
      } catch (e) {
        console.log('No simulations found');
      }

      setData({
        user: profile,
        roadmapStats: roadmapStats || { totalRoadmaps: 0, currentProgress: 0 },
        recentSimulations,
        activeRoadmap,
        recommendations: generateRecommendations(profile, roadmapStats, activeRoadmap),
        dailyQuests: dailyQuests.quests || [],
        questStats: questStats || { today: { total: 0, completed: 0, completionRate: 0 }, thisWeek: { completed: 0 }, allTime: { completed: 0 } },
      });

    } catch (error: any) {
      console.error('Dashboard data loading failed:', error);
      setError(error.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (user: any, roadmapStats: any, activeRoadmap: any) => {
    const recommendations = [];

    // 로드맵이 없으면 생성 추천
    if (!activeRoadmap) {
      recommendations.push({
        id: 'create-roadmap',
        title: '진로 로드맵 생성하기',
        description: 'AI 분석을 통해 개인화된 학습 계획을 만들어보세요.',
        action: '시작하기',
        link: '/roadmap',
        icon: '🗺️',
        priority: 'high',
      });
    }

    // 크레딧이 많으면 시뮬레이션 추천
    if ((user.credits || 0) + (user.paidCredits || 0) > 1) {
      recommendations.push({
        id: 'try-simulation',
        title: 'AI 시뮬레이션 체험',
        description: '실무 환경을 체험하며 역량을 확인해보세요.',
        action: '체험하기',
        link: '/simulations',
        icon: '🎮',
        priority: 'medium',
      });
    }

    // 활성 로드맵이 있으면 진행 추천
    if (activeRoadmap && roadmapStats?.currentProgress < 100) {
      recommendations.push({
        id: 'continue-roadmap',
        title: '학습 계속하기',
        description: `현재 ${roadmapStats.currentProgress}% 진행 중입니다.`,
        action: '계속하기',
        link: `/roadmap/${activeRoadmap.id}`,
        icon: '📚',
        priority: 'high',
      });
    }

    return recommendations.slice(0, 3); // 최대 3개만
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후에요';
    return '좋은 저녁이에요';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">대시보드를 불러오는 중...</h3>
          <p className="text-gray-600">개인 맞춤 정보를 준비하고 있습니다.</p>
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
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-blue-600">🔗</div>
                <h1 className="text-xl font-bold text-gray-900">Nexus Career</h1>
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">대시보드</span>
            </div>
            <CreditBalance />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 환영 메시지 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {data.user.name || '사용자'}님! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            오늘도 성장을 위한 여정을 함께 시작해보세요.
          </p>
        </div>

        {/* 핵심 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {(data.user.credits || 0) + (data.user.paidCredits || 0)}
            </div>
            <div className="text-sm text-gray-600">보유 크레딧</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {data.roadmapStats.currentProgress || 0}%
            </div>
            <div className="text-sm text-gray-600">로드맵 진행률</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {data.recentSimulations.length}
            </div>
            <div className="text-sm text-gray-600">완료한 시뮬레이션</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {data.roadmapStats.totalRoadmaps || 0}
            </div>
            <div className="text-sm text-gray-600">생성한 로드맵</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {data.questStats.today.completed}/{data.questStats.today.total}
            </div>
            <div className="text-sm text-gray-600">오늘 퀘스트</div>
            <div className="text-xs text-gray-500 mt-1">
              {data.questStats.today.completionRate}% 완료
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 추천 액션 */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">🎯</span>
              추천 액션
            </h2>
            
            {data.recommendations.length > 0 ? (
              <div className="space-y-4">
                {data.recommendations.map((rec) => (
                  <div key={rec.id} className={`border rounded-xl p-6 ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{rec.icon}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{rec.title}</h3>
                          <p className="text-gray-600 mb-3">{rec.description}</p>
                        </div>
                      </div>
                      <Link
                        href={rec.link}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                      >
                        {rec.action}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">🎉</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">모든 추천 액션을 완료했습니다!</h3>
                <p className="text-gray-600">새로운 기능을 탐색하거나 학습을 계속해보세요.</p>
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 일일 퀘스트 위젯 */}
            <DailyQuestWidget
              dailyQuests={data.dailyQuests}
              questStats={data.questStats}
              onQuestsUpdate={loadDashboardData}
            />

            {/* 활성 로드맵 */}
            {data.activeRoadmap && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🗺️</span>
                  활성 로드맵
                </h3>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">{data.activeRoadmap.title}</h4>
                  <p className="text-sm text-gray-600">{data.activeRoadmap.targetRole}</p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">진행률</span>
                      <span className="font-medium">{data.roadmapStats.currentProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${data.roadmapStats.currentProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Link
                    href={`/roadmap/${data.activeRoadmap.id}`}
                    className="block w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-lg text-center hover:bg-blue-200 transition-colors"
                  >
                    자세히 보기 →
                  </Link>
                </div>
              </div>
            )}

            {/* 최근 시뮬레이션 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🎮</span>
                최근 시뮬레이션
              </h3>
              
              {data.recentSimulations.length > 0 ? (
                <div className="space-y-3">
                  {data.recentSimulations.map((sim) => (
                    <div key={sim.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{sim.simulationId}</h4>
                          <p className="text-xs text-gray-600">
                            {new Date(sim.completedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">{sim.finalScore}점</div>
                          <div className="text-xs text-gray-600">{sim.grade}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Link
                    href="/simulations"
                    className="block w-full py-2 px-4 bg-purple-100 text-purple-700 rounded-lg text-center hover:bg-purple-200 transition-colors text-sm"
                  >
                    더 많은 시뮬레이션 →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-400 text-3xl mb-2">🎮</div>
                  <p className="text-gray-600 text-sm mb-3">
                    아직 완료한 시뮬레이션이 없습니다.
                  </p>
                  <Link
                    href="/simulations"
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    시뮬레이션 체험하기 →
                  </Link>
                </div>
              )}
            </div>

            {/* 빠른 액세스 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                빠른 액세스
              </h3>
              
              <div className="space-y-3">
                <Link
                  href="/survey"
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="text-xl mr-3">📝</span>
                  <span className="font-medium text-blue-900">진로 적성 설문</span>
                </Link>
                
                <Link
                  href="/simulations"
                  className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <span className="text-xl mr-3">🎮</span>
                  <span className="font-medium text-purple-900">AI 시뮬레이션</span>
                </Link>
                
                <Link
                  href="/roadmap"
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="text-xl mr-3">🗺️</span>
                  <span className="font-medium text-green-900">진로 로드맵</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 학습 팁 */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-3">💡</span>
            오늘의 학습 팁
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-medium text-gray-900 mb-2">목표 설정</h4>
              <p className="text-gray-600 text-sm">
                작은 목표부터 시작하여 점진적으로 확장해나가세요.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">⏰</div>
              <h4 className="font-medium text-gray-900 mb-2">꾸준한 학습</h4>
              <p className="text-gray-600 text-sm">
                매일 조금씩이라도 꾸준히 학습하는 것이 중요합니다.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">📚</div>
              <h4 className="font-medium text-gray-900 mb-2">실습 중심</h4>
              <p className="text-gray-600 text-sm">
                이론보다는 실습과 프로젝트를 통해 실력을 키워보세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 토스트 알림 */}
      <ToastManager toasts={toasts} removeToast={removeToast} />
    </div>
  );
}