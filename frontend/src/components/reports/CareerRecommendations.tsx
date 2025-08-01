"use client";

import React, { useState } from 'react';

interface CareerRecommendation {
  title: string;
  matchScore: number;
  reasoning: string;
  pathway: string[];
  timeframe: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
}

interface CareerRecommendationsProps {
  recommendations: CareerRecommendation[];
}

export function CareerRecommendations({ recommendations }: CareerRecommendationsProps) {
  const [selectedCareer, setSelectedCareer] = useState<number>(0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'moderate': return '보통';
      case 'challenging': return '어려움';
      default: return difficulty;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-purple-600 bg-purple-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">추천 진로 정보가 없습니다</div>
          <p className="text-gray-500 text-sm">시뮬레이션 데이터를 분석 중입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 추천 진로 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((career, index) => (
          <div
            key={index}
            onClick={() => setSelectedCareer(index)}
            className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-200 ${
              selectedCareer === index
                ? 'ring-2 ring-blue-500 shadow-xl'
                : 'hover:shadow-xl hover:scale-105'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">{career.title}</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(career.matchScore)}`}>
                {career.matchScore}%
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    career.matchScore >= 90 ? 'bg-purple-600' :
                    career.matchScore >= 80 ? 'bg-blue-600' :
                    career.matchScore >= 70 ? 'bg-green-600' :
                    career.matchScore >= 60 ? 'bg-yellow-600' :
                    'bg-gray-600'
                  }`}
                  style={{ width: `${career.matchScore}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{career.timeframe}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(career.difficulty)}`}>
                  {getDifficultyLabel(career.difficulty)}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-3">
                {career.reasoning}
              </p>
              
              {selectedCareer === index && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-xs text-blue-600 font-medium">← 선택됨</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 선택된 진로 상세 정보 */}
      {recommendations[selectedCareer] && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">🎯</span>
              {recommendations[selectedCareer].title} 상세 분석
            </h2>
            <div className={`px-4 py-2 rounded-full text-lg font-bold ${getMatchScoreColor(recommendations[selectedCareer].matchScore)}`}>
              매치도 {recommendations[selectedCareer].matchScore}%
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 왜 이 직업이 추천되는가 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💡</span>
                추천 이유
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-gray-700 leading-relaxed">
                  {recommendations[selectedCareer].reasoning}
                </p>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {recommendations[selectedCareer].timeframe}
                  </div>
                  <div className="text-sm text-gray-600">예상 준비 기간</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-lg font-bold mb-1 ${
                    recommendations[selectedCareer].difficulty === 'easy' ? 'text-green-600' :
                    recommendations[selectedCareer].difficulty === 'moderate' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {getDifficultyLabel(recommendations[selectedCareer].difficulty)}
                  </div>
                  <div className="text-sm text-gray-600">진입 난이도</div>
                </div>
              </div>
            </div>

            {/* 진로 로드맵 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🛤️</span>
                진로 로드맵
              </h3>
              <div className="space-y-3">
                {recommendations[selectedCareer].pathway.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-gray-700">{step}</p>
                      </div>
                      {index < recommendations[selectedCareer].pathway.length - 1 && (
                        <div className="w-px h-4 bg-gray-300 ml-4 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 진로별 비교 차트 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">📊</span>
          진로별 매치도 비교
        </h2>
        
        <div className="space-y-4">
          {recommendations.map((career, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-40 text-sm font-medium text-gray-900 truncate">
                {career.title}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">매치도</span>
                  <span className="font-medium">{career.matchScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      career.matchScore >= 90 ? 'bg-purple-600' :
                      career.matchScore >= 80 ? 'bg-blue-600' :
                      career.matchScore >= 70 ? 'bg-green-600' :
                      career.matchScore >= 60 ? 'bg-yellow-600' :
                      'bg-gray-600'
                    }`}
                    style={{ width: `${career.matchScore}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-20 text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(career.difficulty)}`}>
                  {getDifficultyLabel(career.difficulty)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 진로 선택 가이드 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-3">🧭</span>
          진로 선택 가이드
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">🎯 즉시 시작 가능한 진로</h3>
            <div className="space-y-2">
              {recommendations
                .filter(career => career.difficulty === 'easy')
                .slice(0, 2)
                .map((career, index) => (
                  <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-sm text-gray-700">{career.title}</span>
                    <span className="ml-auto text-xs text-green-600">({career.timeframe})</span>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">🚀 장기 목표 진로</h3>
            <div className="space-y-2">
              {recommendations
                .filter(career => career.matchScore >= 85)
                .slice(0, 2)
                .map((career, index) => (
                  <div key={index} className="flex items-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-blue-600 mr-2">🎯</span>
                    <span className="text-sm text-gray-700">{career.title}</span>
                    <span className="ml-auto text-xs text-blue-600">{career.matchScore}% 매치</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg border border-indigo-200">
          <h4 className="font-medium text-gray-900 mb-2">💡 추천 전략</h4>
          <p className="text-sm text-gray-600">
            먼저 매치도가 높고 진입 장벽이 낮은 직업부터 시작하여 경험을 쌓은 후, 
            장기적으로 가장 적합도가 높은 진로로 발전시켜 나가세요. 
            각 단계마다 관련 스킬을 체계적으로 개발하는 것이 중요합니다.
          </p>
        </div>
      </div>
    </div>
  );
}