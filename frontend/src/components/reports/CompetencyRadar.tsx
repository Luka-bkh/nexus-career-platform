"use client";

import React from 'react';

interface CompetencyRadarProps {
  competencies: Record<string, {
    score: number;
    level: string;
    description: string;
    evidence: string[];
    improvement: string;
  }>;
}

export function CompetencyRadar({ competencies }: CompetencyRadarProps) {
  // 레이더 차트를 위한 SVG 좌표 계산
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const maxScore = 100;

  const competencyKeys = Object.keys(competencies);
  const competencyLabels = {
    technical: '기술 역량',
    collaboration: '협업 능력',
    problemSolving: '문제 해결',
    communication: '커뮤니케이션',
    adaptability: '적응력',
  };

  // 각 역량의 각도 계산 (360도를 역량 개수로 나눔)
  const angleStep = (2 * Math.PI) / competencyKeys.length;

  const getPoint = (index: number, score: number) => {
    const angle = index * angleStep - Math.PI / 2; // -90도부터 시작
    const normalizedScore = (score / maxScore) * radius;
    return {
      x: centerX + Math.cos(angle) * normalizedScore,
      y: centerY + Math.sin(angle) * normalizedScore,
    };
  };

  const getAxisPoint = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  };

  // 데이터 포인트들을 연결하는 경로 생성
  const dataPoints = competencyKeys.map((key, index) => 
    getPoint(index, competencies[key].score)
  );

  const pathData = dataPoints.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-purple-600';
      case 'advanced': return 'text-blue-600';
      case 'intermediate': return 'text-green-600';
      case 'beginner': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="mr-3">⚡</span>
        역량 레이더 차트
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 레이더 차트 */}
        <div className="flex justify-center">
          <svg width="300" height="300" viewBox="0 0 300 300" className="max-w-full">
            {/* 배경 원들 (점수 구간) */}
            {[20, 40, 60, 80, 100].map((value) => (
              <circle
                key={value}
                cx={centerX}
                cy={centerY}
                r={(value / 100) * radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
                opacity="0.5"
              />
            ))}
            
            {/* 축선들 */}
            {competencyKeys.map((_, index) => {
              const axisPoint = getAxisPoint(index);
              return (
                <line
                  key={index}
                  x1={centerX}
                  y1={centerY}
                  x2={axisPoint.x}
                  y2={axisPoint.y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              );
            })}

            {/* 데이터 영역 */}
            <path
              d={pathData}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth="2"
            />

            {/* 데이터 포인트들 */}
            {dataPoints.map((point, index) => (
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

            {/* 역량 라벨들 */}
            {competencyKeys.map((key, index) => {
              const axisPoint = getAxisPoint(index);
              const labelOffset = 20;
              const labelX = centerX + Math.cos(index * angleStep - Math.PI / 2) * (radius + labelOffset);
              const labelY = centerY + Math.sin(index * angleStep - Math.PI / 2) * (radius + labelOffset);
              
              return (
                <text
                  key={key}
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-medium fill-gray-700"
                >
                  {(competencyLabels as any)[key] || key}
                </text>
              );
            })}

            {/* 점수 표시 (중심에서 바깥쪽으로) */}
            <text x={centerX} y={centerY - 85} textAnchor="middle" className="text-xs fill-gray-500">100</text>
            <text x={centerX} y={centerY - 65} textAnchor="middle" className="text-xs fill-gray-500">80</text>
            <text x={centerX} y={centerY - 45} textAnchor="middle" className="text-xs fill-gray-500">60</text>
            <text x={centerX} y={centerY - 25} textAnchor="middle" className="text-xs fill-gray-500">40</text>
            <text x={centerX} y={centerY - 5} textAnchor="middle" className="text-xs fill-gray-500">20</text>
          </svg>
        </div>

        {/* 역량 상세 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">역량별 상세 분석</h3>
          
          {competencyKeys.map((key) => {
            const competency = competencies[key];
            return (
              <div key={key} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">
                    {(competencyLabels as any)[key] || key.replace('_', ' ')}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {competency.score}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      competency.level === 'expert' ? 'bg-purple-100 text-purple-800' :
                      competency.level === 'advanced' ? 'bg-blue-100 text-blue-800' :
                      competency.level === 'intermediate' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {competency.level}
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${competency.score}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{competency.description}</p>
                
                {competency.evidence.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 font-medium">증거:</span>
                    <ul className="text-xs text-gray-500 mt-1">
                      {competency.evidence.slice(0, 2).map((evidence, index) => (
                        <li key={index} className="ml-2">• {evidence}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 {competency.improvement}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 종합 평가 */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">종합 역량 평가</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {Math.round(Object.values(competencies).reduce((sum, comp) => sum + comp.score, 0) / competencyKeys.length)}
            </div>
            <div className="text-sm text-gray-600">평균 점수</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Object.values(competencies).filter(comp => comp.level === 'advanced' || comp.level === 'expert').length}
            </div>
            <div className="text-sm text-gray-600">고급 이상 역량</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {Object.values(competencies).filter(comp => comp.score >= 80).length}
            </div>
            <div className="text-sm text-gray-600">우수 역량 (80점+)</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {Object.values(competencies).filter(comp => comp.score < 60).length}
            </div>
            <div className="text-sm text-gray-600">개선 필요 역량</div>
          </div>
        </div>
      </div>

      {/* 역량 발전 방향 */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <span className="mr-2">🎯</span>
          역량 발전 방향
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">강화할 역량</h4>
            <div className="space-y-1">
              {Object.entries(competencies)
                .filter(([_, comp]) => comp.score >= 70)
                .slice(0, 2)
                .map(([key, comp]) => (
                  <div key={key} className="text-sm text-green-700">
                    ✓ {(competencyLabels as any)[key] || key} ({comp.score}점)
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">우선 개선 역량</h4>
            <div className="space-y-1">
              {Object.entries(competencies)
                .filter(([_, comp]) => comp.score < 70)
                .slice(0, 2)
                .map(([key, comp]) => (
                  <div key={key} className="text-sm text-orange-700">
                    → {(competencyLabels as any)[key] || key} ({comp.score}점)
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}