"use client";

import React from 'react';

interface StrengthsWeaknessesProps {
  data: {
    topStrengths: string[];
    keyWeaknesses: string[];
    improvementAreas: string[];
    naturalTalents: string[];
  };
  insights: {
    personalityProfile: string;
    workStyle: string;
    learningPriorities: string[];
  };
}

export function StrengthsWeaknesses({ data, insights }: StrengthsWeaknessesProps) {
  return (
    <div className="space-y-8">
      {/* 강점 vs 약점 비교 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 주요 강점 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">💪</span>
            주요 강점
          </h2>
          
          <div className="space-y-4">
            {data.topStrengths.map((strength, index) => (
              <div key={index} className="flex items-start p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{strength}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-green-600 text-xl">✓</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-green-100 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2 flex items-center">
              <span className="mr-2">🌟</span>
              천재적 재능
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.naturalTalents.map((talent, index) => (
                <span key={index} className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                  {talent}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 개선 영역 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">🎯</span>
            개선 영역
          </h2>
          
          <div className="space-y-4">
            {data.keyWeaknesses.map((weakness, index) => (
              <div key={index} className="flex items-start p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  !
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{weakness}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-orange-600 text-xl">→</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-100 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center">
              <span className="mr-2">🚀</span>
              성장 기회 영역
            </h3>
            <div className="space-y-2">
              {data.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-center text-blue-800 text-sm">
                  <span className="mr-2">▶</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 강점 활용 전략 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">⚡</span>
          강점 활용 전략
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              즉시 활용 가능
            </h3>
            <div className="space-y-3">
              {data.topStrengths.slice(0, 2).map((strength, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium text-green-800 mb-1">{strength}</div>
                  <div className="text-green-700 text-xs">
                    → 현재 프로젝트에서 리더십 역할 담당
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">🔧</span>
              개발 필요
            </h3>
            <div className="space-y-3">
              {data.improvementAreas.slice(0, 2).map((area, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium text-blue-800 mb-1">{area}</div>
                  <div className="text-blue-700 text-xs">
                    → 관련 교육 과정 수강 추천
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
              <span className="mr-2">🌟</span>
              장기 발전
            </h3>
            <div className="space-y-3">
              {data.naturalTalents.slice(0, 2).map((talent, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium text-purple-800 mb-1">{talent}</div>
                  <div className="text-purple-700 text-xs">
                    → 전문가 수준까지 심화 발전
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 개인 성향 분석 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">🧠</span>
          개인 성향 분석
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">성격 특성</h3>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <p className="text-gray-700 leading-relaxed mb-4">
                {insights.personalityProfile}
              </p>
              <div className="pt-4 border-t border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">업무 스타일</h4>
                <p className="text-blue-800 text-sm">{insights.workStyle}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">학습 우선순위</h3>
            <div className="space-y-3">
              {insights.learningPriorities.map((priority, index) => (
                <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 text-sm">{priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SWOT 분석 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">📋</span>
          SWOT 분석
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-bold text-green-900 mb-4 flex items-center">
              <span className="mr-2">💪</span>
              강점 (Strengths)
            </h3>
            <ul className="space-y-2">
              {data.topStrengths.slice(0, 3).map((strength, index) => (
                <li key={index} className="text-green-800 text-sm flex items-start">
                  <span className="mr-2">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="p-6 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-bold text-red-900 mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              약점 (Weaknesses)
            </h3>
            <ul className="space-y-2">
              {data.keyWeaknesses.map((weakness, index) => (
                <li key={index} className="text-red-800 text-sm flex items-start">
                  <span className="mr-2">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center">
              <span className="mr-2">🚀</span>
              기회 (Opportunities)
            </h3>
            <ul className="space-y-2">
              {data.improvementAreas.slice(0, 3).map((area, index) => (
                <li key={index} className="text-blue-800 text-sm flex items-start">
                  <span className="mr-2">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-bold text-yellow-900 mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              위협 (Threats)
            </h3>
            <ul className="space-y-2 text-yellow-800 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>빠르게 변화하는 기술 트렌드</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>경쟁이 치열한 취업 시장</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>지속적인 학습 요구</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 발전 방향 요약 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-3">🎯</span>
          종합 발전 방향
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">강점 극대화</h3>
            <p className="text-gray-600 text-sm">
              기존 강점을 더욱 발전시켜 차별화된 경쟁력을 구축하세요
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">약점 보완</h3>
            <p className="text-gray-600 text-sm">
              체계적인 학습을 통해 부족한 영역을 단계적으로 개선하세요
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">기회 활용</h3>
            <p className="text-gray-600 text-sm">
              새로운 영역에 도전하여 성장 가능성을 극대화하세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}