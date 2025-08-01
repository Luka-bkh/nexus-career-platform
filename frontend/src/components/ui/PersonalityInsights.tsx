"use client";

import { PersonalityInsight } from "@/lib/api";

interface PersonalityInsightsProps {
  insights: PersonalityInsight[];
  className?: string;
}

export function PersonalityInsights({ insights, className = "" }: PersonalityInsightsProps) {
  const getTraitIcon = (trait: string) => {
    switch (trait) {
      case '외향성':
        return '🤝';
      case '성실성':
        return '📋';
      case '개방성':
        return '🌟';
      case '호감성':
        return '❤️';
      case '신경성':
        return '🧠';
      default:
        return '🎯';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-100';
    if (score >= 3) return 'text-blue-600 bg-blue-100';
    if (score >= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4) return '높음';
    if (score >= 3) return '보통';
    if (score >= 2) return '낮음';
    return '매우 낮음';
  };

  const getRadarPoints = (insights: PersonalityInsight[]) => {
    const center = 100;
    const radius = 80;
    const angles = insights.map((_, index) => (index / insights.length) * 2 * Math.PI - Math.PI / 2);
    
    return insights.map((insight, index) => {
      const value = insight.score / 5; // 0-1 범위로 정규화
      const x = center + radius * value * Math.cos(angles[index]);
      const y = center + radius * value * Math.sin(angles[index]);
      return { x, y, value };
    });
  };

  const radarPoints = getRadarPoints(insights);
  const pathString = radarPoints.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  return (
    <div className={`card ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          🧠 성격 인사이트
        </h3>
        <p className="text-gray-600">
          성격 특성 분석 결과와 진로에 미치는 영향을 확인하세요
        </p>
      </div>

      {/* 레이더 차트 */}
      <div className="mb-8">
        <div className="flex justify-center">
          <div className="relative">
            <svg width="200" height="200" className="overflow-visible">
              {/* 배경 원들 */}
              {[1, 2, 3, 4, 5].map((level) => (
                <circle
                  key={level}
                  cx="100"
                  cy="100"
                  r={level * 16}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              
              {/* 축 선들 */}
              {insights.map((_, index) => {
                const angle = (index / insights.length) * 2 * Math.PI - Math.PI / 2;
                const x2 = 100 + 80 * Math.cos(angle);
                const y2 = 100 + 80 * Math.sin(angle);
                return (
                  <line
                    key={index}
                    x1="100"
                    y1="100"
                    x2={x2}
                    y2={y2}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* 데이터 영역 */}
              <path
                d={pathString}
                fill="rgba(59, 130, 246, 0.2)"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              
              {/* 데이터 포인트 */}
              {radarPoints.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
              
              {/* 레이블 */}
              {insights.map((insight, index) => {
                const angle = (index / insights.length) * 2 * Math.PI - Math.PI / 2;
                const labelRadius = 95;
                const x = 100 + labelRadius * Math.cos(angle);
                const y = 100 + labelRadius * Math.sin(angle);
                
                return (
                  <text
                    key={index}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium fill-gray-700"
                  >
                    {insight.trait}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 범례 */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-200 rounded-full mr-1"></div>
              낮음 (1-2)
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-1"></div>
              보통 (3)
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-1"></div>
              높음 (4-5)
            </div>
          </div>
        </div>
      </div>

      {/* 상세 분석 */}
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            {/* 특성 헤더 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getTraitIcon(insight.trait)}</div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {insight.trait}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {insight.description}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(insight.score)}`}>
                  {insight.score}/5 ({getScoreLabel(insight.score)})
                </div>
              </div>
            </div>

            {/* 진로 영향 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-2">
                💼 진로에 미치는 영향
              </h5>
              <div className="space-y-2">
                {insight.careerImplications.map((implication, impIndex) => (
                  <div key={impIndex} className="flex items-start text-sm text-gray-700">
                    <svg className="w-4 h-4 mr-2 mt-0.5 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{implication}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 전체 분석 요약 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <h4 className="text-lg font-semibold text-purple-900 mb-3">
          🎯 종합 분석 결과
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* 강점 */}
          <div>
            <h5 className="text-sm font-semibold text-purple-800 mb-2">주요 강점</h5>
            <div className="space-y-1">
              {insights
                .filter(insight => insight.score >= 4)
                .map((insight, index) => (
                  <div key={index} className="flex items-center text-sm text-purple-700">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    {insight.trait}: {insight.score}/5
                  </div>
                ))}
            </div>
          </div>

          {/* 개발 영역 */}
          <div>
            <h5 className="text-sm font-semibold text-purple-800 mb-2">개발 영역</h5>
            <div className="space-y-1">
              {insights
                .filter(insight => insight.score < 3)
                .map((insight, index) => (
                  <div key={index} className="flex items-center text-sm text-purple-700">
                    <div className="w-2 h-2 bg-purple-300 rounded-full mr-2"></div>
                    {insight.trait}: {insight.score}/5
                  </div>
                ))}
              {insights.filter(insight => insight.score < 3).length === 0 && (
                <div className="text-sm text-purple-700 italic">
                  균형잡힌 성격 특성을 보여줍니다
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 추천 사항 */}
        <div className="mt-4 p-3 bg-white bg-opacity-70 rounded-lg">
          <h6 className="text-sm font-semibold text-purple-900 mb-1">💡 맞춤 추천</h6>
          <p className="text-xs text-purple-800">
            분석 결과를 바탕으로 팀워크 중심의 협업 환경에서 창의적인 업무를 수행하는 직무가 잘 맞을 것 같습니다. 
            지속적인 학습과 도전을 통해 전문성을 키워나가세요.
          </p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="mt-6">
        <button className="btn-primary w-full">
          📊 상세 성격 리포트 다운로드
        </button>
      </div>
    </div>
  );
}