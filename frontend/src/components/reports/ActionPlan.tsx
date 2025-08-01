"use client";

import React, { useState } from 'react';

interface ActionItem {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  resources: string[];
  successMetrics: string[];
}

interface ActionPlanProps {
  actionPlan: {
    immediate: ActionItem[];
    shortTerm: ActionItem[];
    longTerm: ActionItem[];
  };
}

export function ActionPlan({ actionPlan }: ActionPlanProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return priority;
    }
  };

  const ActionItemCard = ({ item, itemId, timeframe }: { item: ActionItem, itemId: string, timeframe: string }) => {
    const isExpanded = expandedItems.has(itemId);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
            <p className="text-gray-600 text-sm mb-3">{item.description}</p>
            
            <div className="flex items-center space-x-4 text-sm">
              <span className={`px-2 py-1 rounded-full border font-medium ${getPriorityColor(item.priority)}`}>
                {getPriorityLabel(item.priority)} 우선순위
              </span>
              <span className="text-gray-500 flex items-center">
                <span className="mr-1">⏱️</span>
                {item.estimatedTime}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => toggleExpand(itemId)}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* 필요한 리소스 */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-2">📚</span>
                필요한 리소스
              </h5>
              <div className="flex flex-wrap gap-2">
                {item.resources.map((resource, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {resource}
                  </span>
                ))}
              </div>
            </div>

            {/* 성공 지표 */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="mr-2">🎯</span>
                성공 지표
              </h5>
              <ul className="space-y-1">
                {item.successMetrics.map((metric, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 액션 버튼 */}
            <div className="flex space-x-3 pt-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                시작하기
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                나중에 하기
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 액션 플랜 개요 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-3">📋</span>
          개인 맞춤 액션 플랜
        </h2>
        <p className="text-gray-700 mb-6">
          시뮬레이션 결과를 바탕으로 생성된 체계적인 발전 계획입니다. 
          각 단계별로 우선순위에 따라 실행하여 목표 진로에 한 걸음씩 다가가세요.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {actionPlan.immediate.length}
            </div>
            <div className="text-sm text-gray-600">즉시 실행 과제</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {actionPlan.shortTerm.length}
            </div>
            <div className="text-sm text-gray-600">단기 목표 과제</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {actionPlan.longTerm.length}
            </div>
            <div className="text-sm text-gray-600">장기 목표 과제</div>
          </div>
        </div>
      </div>

      {/* 즉시 실행 (1-2주) */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">🚀</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">즉시 실행 과제</h2>
            <p className="text-gray-600">1-2주 내에 시작할 수 있는 과제들</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {actionPlan.immediate.map((item, index) => (
            <ActionItemCard
              key={`immediate-${index}`}
              item={item}
              itemId={`immediate-${index}`}
              timeframe="immediate"
            />
          ))}
        </div>
      </div>

      {/* 단기 목표 (1-3개월) */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">단기 목표 과제</h2>
            <p className="text-gray-600">1-3개월 내에 완료할 목표들</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {actionPlan.shortTerm.map((item, index) => (
            <ActionItemCard
              key={`shortterm-${index}`}
              item={item}
              itemId={`shortterm-${index}`}
              timeframe="shortterm"
            />
          ))}
        </div>
      </div>

      {/* 장기 목표 (6-12개월) */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">장기 목표 과제</h2>
            <p className="text-gray-600">6-12개월에 걸쳐 달성할 목표들</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {actionPlan.longTerm.map((item, index) => (
            <ActionItemCard
              key={`longterm-${index}`}
              item={item}
              itemId={`longterm-${index}`}
              timeframe="longterm"
            />
          ))}
        </div>
      </div>

      {/* 실행 가이드 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">💡</span>
          성공적인 실행을 위한 가이드
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 실행 원칙</h3>
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-600 mr-3">1.</span>
                <div>
                  <div className="font-medium text-blue-900">우선순위 준수</div>
                  <div className="text-blue-700 text-sm">높은 우선순위 과제부터 차례대로 진행</div>
                </div>
              </div>
              <div className="flex items-start p-3 bg-green-50 rounded-lg">
                <span className="text-green-600 mr-3">2.</span>
                <div>
                  <div className="font-medium text-green-900">단계적 진행</div>
                  <div className="text-green-700 text-sm">한 번에 하나씩, 완료 후 다음 단계로</div>
                </div>
              </div>
              <div className="flex items-start p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-600 mr-3">3.</span>
                <div>
                  <div className="font-medium text-purple-900">진행 상황 점검</div>
                  <div className="text-purple-700 text-sm">주간 단위로 성과를 측정하고 조정</div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ 주의사항</h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="font-medium text-yellow-900 mb-1">과도한 목표 설정 금지</div>
                <div className="text-yellow-800 text-sm">현실적이고 달성 가능한 목표로 설정</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="font-medium text-red-900 mb-1">완벽주의 지양</div>
                <div className="text-red-800 text-sm">80% 완성도로도 다음 단계 진행</div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="font-medium text-indigo-900 mb-1">지속적인 학습</div>
                <div className="text-indigo-800 text-sm">변화하는 환경에 맞춰 계획 조정</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 타임라인 시각화 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">📅</span>
          실행 타임라인
        </h2>
        
        <div className="relative">
          {/* 타임라인 라인 */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          <div className="space-y-8">
            {/* 즉시 실행 */}
            <div className="relative flex items-start">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center border-4 border-white shadow-md z-10">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="ml-6 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">1-2주: 즉시 실행</h3>
                <p className="text-gray-600 mb-2">기초 역량 점검 및 학습 계획 수립</p>
                <div className="text-sm text-red-600">
                  {actionPlan.immediate.length}개 과제 • 높은 우선순위
                </div>
              </div>
            </div>
            
            {/* 단기 목표 */}
            <div className="relative flex items-start">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center border-4 border-white shadow-md z-10">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-6 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">1-3개월: 단기 목표</h3>
                <p className="text-gray-600 mb-2">실무 경험 축적 및 포트폴리오 구축</p>
                <div className="text-sm text-yellow-600">
                  {actionPlan.shortTerm.length}개 과제 • 중간 우선순위
                </div>
              </div>
            </div>
            
            {/* 장기 목표 */}
            <div className="relative flex items-start">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center border-4 border-white shadow-md z-10">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-6 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">6-12개월: 장기 목표</h3>
                <p className="text-gray-600 mb-2">전문 역량 개발 및 커리어 전환</p>
                <div className="text-sm text-green-600">
                  {actionPlan.longTerm.length}개 과제 • 전략적 우선순위
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}