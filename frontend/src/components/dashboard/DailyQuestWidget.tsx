"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questApi } from '@/lib/api';
import { useToast } from '@/components/common/ToastNotification';

interface Quest {
  id: string;
  quest: {
    name: string;
    description: string;
    type: string;
    targetValue: number;
    rewardCredits: number;
    rewardXp: number;
  };
  progress: number;
  isCompleted: boolean;
}

interface QuestStats {
  today: {
    total: number;
    completed: number;
    completionRate: number;
  };
  thisWeek: {
    completed: number;
  };
  allTime: {
    completed: number;
  };
}

interface DailyQuestWidgetProps {
  dailyQuests?: Quest[];
  questStats?: QuestStats;
  onQuestsUpdate?: () => void;
}

export const DailyQuestWidget: React.FC<DailyQuestWidgetProps> = ({
  dailyQuests: initialQuests = [],
  questStats: initialStats,
  onQuestsUpdate,
}) => {
  const router = useRouter();
  const { showReward, showSuccess, showError } = useToast();
  const [dailyQuests, setDailyQuests] = useState<Quest[]>(initialQuests);
  const [questStats, setQuestStats] = useState<QuestStats>(
    initialStats || {
      today: { total: 0, completed: 0, completionRate: 0 },
      thisWeek: { completed: 0 },
      allTime: { completed: 0 },
    }
  );
  const [loading, setLoading] = useState(false);
  const [completingQuests, setCompletingQuests] = useState<Set<string>>(new Set());

  // 퀘스트 데이터 새로고침
  const refreshQuests = async () => {
    try {
      setLoading(true);
      const [questsData, statsData] = await Promise.all([
        questApi.getDailyQuests().catch(() => ({ quests: [], total: 0, completed: 0 })),
        questApi.getQuestStats().catch(() => null),
      ]);

      setDailyQuests(questsData.quests || []);
      if (statsData) {
        setQuestStats(statsData);
      }
      
      onQuestsUpdate?.();
    } catch (error) {
      console.error('Failed to refresh quests:', error);
    } finally {
      setLoading(false);
    }
  };

  // 퀘스트 완료 처리
  const handleCompleteQuest = async (userQuest: Quest) => {
    if (userQuest.isCompleted || completingQuests.has(userQuest.id)) {
      return;
    }

    try {
      setCompletingQuests(prev => new Set(prev).add(userQuest.id));
      
      const result = await questApi.completeQuest(userQuest.id);
      
      // 성공 시 보상 알림 표시
      if (result.success) {
        // 시각적 효과를 위한 약간의 지연
        setTimeout(() => {
          showReward(
            '🎉 퀘스트 완료!',
            `"${userQuest.quest.name}" 퀘스트를 완료했습니다!`,
            {
              credits: userQuest.quest.rewardCredits,
              xp: userQuest.quest.rewardXp,
              type: userQuest.quest.type,
            }
          );
        }, 300);

        // 퀘스트 목록 새로고침
        await refreshQuests();
      }
    } catch (error: any) {
      console.error('Quest completion failed:', error);
      showError(
        '퀘스트 완료 실패',
        error.message || '퀘스트 완료 중 오류가 발생했습니다.'
      );
    } finally {
      setCompletingQuests(prev => {
        const newSet = new Set(prev);
        newSet.delete(userQuest.id);
        return newSet;
      });
    }
  };

  // 퀘스트 생성
  const handleGenerateQuests = async () => {
    try {
      setLoading(true);
      await questApi.generateDailyQuests();
      showSuccess('퀘스트 생성 완료', '새로운 일일 퀘스트가 생성되었습니다!');
      await refreshQuests();
    } catch (error: any) {
      console.error('Quest generation failed:', error);
      showError('퀘스트 생성 실패', error.message || '퀘스트 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 퀘스트 타입별 아이콘
  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'LOGIN': return '🔑';
      case 'SIMULATION': return '🎮';
      case 'SURVEY': return '📝';
      case 'ROADMAP': return '🗺️';
      case 'MILESTONE': return '🎯';
      case 'EXPLORATION': return '🔍';
      case 'STREAK': return '🔥';
      default: return '📋';
    }
  };

  // 퀘스트 진행률 계산
  const getProgressPercentage = (progress: number, targetValue: number) => {
    return Math.min((progress / targetValue) * 100, 100);
  };

  // 완료 가능한 퀘스트 체크
  const isQuestCompletable = (userQuest: Quest) => {
    return !userQuest.isCompleted && userQuest.progress >= userQuest.quest.targetValue;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">🎯</span>
          오늘의 퀘스트
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {questStats.today.completed}/{questStats.today.total}
          </span>
          {questStats.today.total > 0 && (
            <div className="text-xs text-green-600 font-medium">
              {questStats.today.completionRate}% 완료
            </div>
          )}
        </div>
      </div>
      
      {/* 로딩 상태 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">퀘스트를 불러오는 중...</span>
        </div>
      )}

      {/* 퀘스트 목록 */}
      {!loading && dailyQuests.length > 0 && (
        <div className="space-y-3">
          {dailyQuests.slice(0, 4).map((userQuest) => {
            const progressPercentage = getProgressPercentage(userQuest.progress, userQuest.quest.targetValue);
            const isCompletable = isQuestCompletable(userQuest);
            const isCompleting = completingQuests.has(userQuest.id);

            return (
              <div 
                key={userQuest.id} 
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  userQuest.isCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : isCompletable
                    ? 'bg-yellow-50 border-yellow-200 shadow-md'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">
                        {getQuestIcon(userQuest.quest.type)}
                      </span>
                      <span className="font-medium text-sm text-gray-900">
                        {userQuest.quest.name}
                      </span>
                      {isCompletable && !userQuest.isCompleted && (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          완료 가능!
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3">
                      {userQuest.quest.description}
                    </p>
                    
                    {/* 진행률 바 */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">진행률</span>
                        <span className="font-medium">
                          {userQuest.progress}/{userQuest.quest.targetValue}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            userQuest.isCompleted 
                              ? 'bg-green-500' 
                              : isCompletable
                              ? 'bg-yellow-500 animate-pulse'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 보상 정보 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        {userQuest.quest.rewardCredits > 0 && (
                          <span className="flex items-center">
                            <span className="mr-1">💎</span>
                            {userQuest.quest.rewardCredits} 크레딧
                          </span>
                        )}
                        {userQuest.quest.rewardXp > 0 && (
                          <span className="flex items-center">
                            <span className="mr-1">⭐</span>
                            {userQuest.quest.rewardXp} XP
                          </span>
                        )}
                      </div>

                      {/* 완료 버튼 */}
                      {isCompletable && !userQuest.isCompleted && (
                        <button
                          onClick={() => handleCompleteQuest(userQuest)}
                          disabled={isCompleting}
                          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCompleting ? (
                            <span className="flex items-center">
                              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                              완료 중...
                            </span>
                          ) : (
                            '완료하기'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-3">
                    {userQuest.isCompleted ? (
                      <div className="text-green-500 text-xl animate-bounce">✅</div>
                    ) : isCompletable ? (
                      <div className="text-yellow-500 text-xl animate-pulse">🎉</div>
                    ) : (
                      <div className="text-gray-400 text-xl">⏳</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* 더 보기 버튼 */}
          {dailyQuests.length > 4 && (
            <button
              onClick={() => router.push('/quests')}
              className="w-full py-3 px-4 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 text-sm font-medium rounded-lg transition-colors"
            >
              더 많은 퀘스트 보기 ({dailyQuests.length - 4}개 더) →
            </button>
          )}
        </div>
      )}

      {/* 퀘스트가 없는 경우 */}
      {!loading && dailyQuests.length === 0 && (
        <div className="text-center py-6">
          <div className="text-gray-400 text-4xl mb-3">🎯</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            오늘의 퀘스트가 없습니다
          </h4>
          <p className="text-gray-600 text-sm mb-4">
            새로운 일일 퀘스트를 생성하여 시작해보세요!
          </p>
          <button
            onClick={handleGenerateQuests}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent mr-2"></div>
                생성 중...
              </span>
            ) : (
              '퀘스트 생성하기'
            )}
          </button>
        </div>
      )}

      {/* 주간 통계 */}
      {questStats.thisWeek.completed > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">이번 주 완료</span>
            <span className="font-medium text-indigo-600">
              {questStats.thisWeek.completed}개
            </span>
          </div>
        </div>
      )}
    </div>
  );
};