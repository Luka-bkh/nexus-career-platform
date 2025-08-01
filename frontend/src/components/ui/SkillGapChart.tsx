"use client";

import { SkillGap } from "@/lib/api";

interface SkillGapChartProps {
  skillGaps: SkillGap[];
  className?: string;
}

export function SkillGapChart({ skillGaps, className = "" }: SkillGapChartProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return '보통';
    }
  };

  const getGapLevel = (gap: number) => {
    if (gap >= 3) return { label: '큰 차이', color: 'text-red-600' };
    if (gap >= 2) return { label: '보통 차이', color: 'text-yellow-600' };
    if (gap >= 1) return { label: '작은 차이', color: 'text-green-600' };
    return { label: '충족', color: 'text-blue-600' };
  };

  // 우선순위별로 정렬
  const sortedSkillGaps = [...skillGaps].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  if (skillGaps.length === 0) {
    return (
      <div className={`card text-center ${className}`}>
        <div className="py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">완벽한 스킬 매치!</h3>
          <p className="text-gray-600">
            현재 보유한 스킬이 추천 직업과 잘 맞습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">스킬 갭 분석</h3>
        <p className="text-gray-600">
          추천 직업에 필요한 스킬과 현재 수준의 차이를 분석했습니다.
        </p>
      </div>

      <div className="space-y-6">
        {sortedSkillGaps.map((skillGap, index) => {
          const gap = skillGap.requiredLevel - skillGap.currentLevel;
          const gapLevel = getGapLevel(gap);
          const currentPercentage = (skillGap.currentLevel / 5) * 100;
          const requiredPercentage = (skillGap.requiredLevel / 5) * 100;

          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              {/* 스킬 정보 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {skillGap.skill}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(skillGap.priority)}`}>
                    우선순위 {getPriorityLabel(skillGap.priority)}
                  </span>
                </div>
                <div className={`text-sm font-medium ${gapLevel.color}`}>
                  {gapLevel.label}
                </div>
              </div>

              {/* 스킬 레벨 바 차트 */}
              <div className="space-y-3">
                {/* 현재 레벨 */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">현재 레벨</span>
                    <span className="font-medium">{skillGap.currentLevel}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${currentPercentage}%` }}
                    />
                  </div>
                </div>

                {/* 목표 레벨 */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">목표 레벨</span>
                    <span className="font-medium">{skillGap.requiredLevel}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getPriorityColor(skillGap.priority)}`}
                      style={{ width: `${requiredPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 스킬 갭 요약 */}
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary-600">
                        +{gap}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {gap}레벨 향상 필요
                      </div>
                      <div className="text-xs text-gray-600">
                        {gap === 1 ? '조금만 더 노력하면 달성 가능!' : 
                         gap === 2 ? '체계적인 학습이 필요합니다.' :
                         '집중적인 교육과 실습이 필요합니다.'}
                      </div>
                    </div>
                  </div>
                  
                  <button className="btn-outline text-sm py-2 px-4">
                    학습 계획 보기
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 전체 요약 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900 mb-1">
              스킬 개발 우선순위
            </div>
            <div className="text-sm text-gray-600">
              높은 우선순위 스킬부터 집중해서 개발하세요
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {skillGaps.filter(s => s.priority === 'high').length}
              </div>
              <div className="text-xs text-gray-600">높은 우선순위</div>
            </div>
          </div>
        </div>
      </div>

      {/* 학습 추천 버튼 */}
      <div className="mt-6">
        <button className="btn-primary w-full">
          📚 맞춤형 학습 계획 받기
        </button>
      </div>
    </div>
  );
}