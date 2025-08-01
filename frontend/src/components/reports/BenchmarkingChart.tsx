"use client";

import React, { useState } from 'react';

interface BenchmarkingChartProps {
  benchmarking: {
    peerComparison: {
      ranking: number;
      totalParticipants: number;
      percentile: number;
      averageScore: number;
      topPerformersProfile?: string;
    };
    industryStandards: {
      industryAverage: number;
      topCompaniesStandard: number;
      skillGapAnalysis: string[];
      marketDemand?: string;
    };
    roleSpecificMetrics: {
      roleFit: number;
      skillAlignment: number;
      experienceGap: number;
      readinessLevel: string;
    };
  };
}

export function BenchmarkingChart({ benchmarking }: BenchmarkingChartProps) {
  const [activeTab, setActiveTab] = useState<'peer' | 'industry' | 'role'>('peer');

  const { peerComparison, industryStandards, roleSpecificMetrics } = benchmarking;

  // 현재 사용자의 점수 (임시로 계산)
  const userScore = 100 - peerComparison.percentile + peerComparison.averageScore;

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-purple-600 bg-purple-100';
    if (percentile >= 80) return 'text-blue-600 bg-blue-100';
    if (percentile >= 60) return 'text-green-600 bg-green-100';
    if (percentile >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getReadinessColor = (level: string) => {
    if (level.includes('즉시')) return 'text-green-600 bg-green-100';
    if (level.includes('추가 학습')) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const ProgressBar = ({ value, max = 100, color = 'blue' }: { value: number; max?: number; color?: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className={`h-3 rounded-full bg-${color}-600 transition-all duration-500`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      ></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">📈</span>
          성과 벤치마킹 분석
        </h2>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('peer')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'peer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            동료 비교
          </button>
          <button
            onClick={() => setActiveTab('industry')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'industry'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            업계 기준
          </button>
          <button
            onClick={() => setActiveTab('role')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'role'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            직무 적합성
          </button>
        </div>

        {/* 동료 비교 탭 */}
        {activeTab === 'peer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  #{peerComparison.ranking}
                </div>
                <div className="text-sm text-blue-800 font-medium">전체 순위</div>
                <div className="text-xs text-blue-600 mt-1">
                  {peerComparison.totalParticipants}명 중
                </div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {100 - peerComparison.percentile}%
                </div>
                <div className="text-sm text-green-800 font-medium">상위 비율</div>
                <div className="text-xs text-green-600 mt-1">
                  상위권 성과
                </div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(userScore)}
                </div>
                <div className="text-sm text-purple-800 font-medium">내 점수</div>
                <div className="text-xs text-purple-600 mt-1">
                  100점 만점
                </div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {peerComparison.averageScore}
                </div>
                <div className="text-sm text-orange-800 font-medium">평균 점수</div>
                <div className="text-xs text-orange-600 mt-1">
                  전체 평균
                </div>
              </div>
            </div>

            {/* 점수 분포 시각화 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">점수 분포에서의 내 위치</h3>
              <div className="relative">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>하위</span>
                  <span>평균</span>
                  <span>상위</span>
                </div>
                <div className="w-full bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full h-8 relative">
                  <div
                    className="absolute top-0 w-4 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg transform -translate-x-2"
                    style={{ left: `${100 - peerComparison.percentile}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0점</span>
                  <span>{peerComparison.averageScore}점</span>
                  <span>100점</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPercentileColor(100 - peerComparison.percentile)}`}>
                  상위 {100 - peerComparison.percentile}% 성과
                </span>
              </div>
            </div>

            {peerComparison.topPerformersProfile && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="mr-2">🏆</span>
                  상위 성과자 프로필
                </h3>
                <p className="text-blue-800">{peerComparison.topPerformersProfile}</p>
              </div>
            )}
          </div>
        )}

        {/* 업계 기준 탭 */}
        {activeTab === 'industry' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4">업계 평균 대비</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-indigo-700">내 점수</span>
                      <span className="font-medium">{Math.round(userScore)}점</span>
                    </div>
                    <ProgressBar value={userScore} color="indigo" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">업계 평균</span>
                      <span className="font-medium">{industryStandards.industryAverage}점</span>
                    </div>
                    <ProgressBar value={industryStandards.industryAverage} color="gray" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-blue-600">상위 기업 기준</span>
                      <span className="font-medium">{industryStandards.topCompaniesStandard}점</span>
                    </div>
                    <ProgressBar value={industryStandards.topCompaniesStandard} color="blue" />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-4">시장 수요 분석</h3>
                {industryStandards.marketDemand ? (
                  <p className="text-green-800">{industryStandards.marketDemand}</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center text-green-800">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                      <span className="text-sm">높은 시장 수요</span>
                    </div>
                    <div className="flex items-center text-green-800">
                      <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
                      <span className="text-sm">지속적인 성장 전망</span>
                    </div>
                    <div className="flex items-center text-green-800">
                      <span className="w-3 h-3 bg-green-300 rounded-full mr-3"></span>
                      <span className="text-sm">경쟁력 있는 연봉</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 스킬 갭 분석 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                업계 기준 스킬 갭 분석
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {industryStandards.skillGapAnalysis.map((skill, index) => (
                  <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="text-yellow-600 mr-3">⚠️</span>
                    <span className="text-yellow-800 text-sm">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 직무 적합성 탭 */}
        {activeTab === 'role' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {roleSpecificMetrics.roleFit}%
                </div>
                <div className="text-sm text-purple-800 font-medium mb-2">직무 적합도</div>
                <ProgressBar value={roleSpecificMetrics.roleFit} color="purple" />
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {roleSpecificMetrics.skillAlignment}%
                </div>
                <div className="text-sm text-blue-800 font-medium mb-2">스킬 일치도</div>
                <ProgressBar value={roleSpecificMetrics.skillAlignment} color="blue" />
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {roleSpecificMetrics.experienceGap}%
                </div>
                <div className="text-sm text-orange-800 font-medium mb-2">경험 부족도</div>
                <ProgressBar value={100 - roleSpecificMetrics.experienceGap} color="orange" />
              </div>
            </div>

            {/* 준비도 평가 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                취업 준비도 평가
              </h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {roleSpecificMetrics.readinessLevel}
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getReadinessColor(roleSpecificMetrics.readinessLevel)}`}>
                  현재 준비 상태
                </span>
              </div>
            </div>

            {/* 직무별 상세 분석 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">직무 적합성 상세 분석</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-3">✅</span>
                    <span className="text-green-800 font-medium">강점 영역</span>
                  </div>
                  <span className="text-green-600 text-sm">논리적 사고, 문제 해결 능력</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-yellow-600 mr-3">⚠️</span>
                    <span className="text-yellow-800 font-medium">보완 필요</span>
                  </div>
                  <span className="text-yellow-600 text-sm">실무 경험, 고급 기술 스킬</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-3">🎯</span>
                    <span className="text-blue-800 font-medium">학습 우선순위</span>
                  </div>
                  <span className="text-blue-600 text-sm">프로젝트 경험, 포트폴리오 구축</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 종합 평가 및 추천 */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-3">🎯</span>
          종합 벤치마킹 결과
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">📈 현재 위치</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">동료 대비:</span>
                <span className="font-medium text-blue-600">상위 {100 - peerComparison.percentile}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">업계 평균 대비:</span>
                <span className={`font-medium ${userScore > industryStandards.industryAverage ? 'text-green-600' : 'text-orange-600'}`}>
                  {userScore > industryStandards.industryAverage ? '상회' : '하회'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">직무 적합도:</span>
                <span className="font-medium text-purple-600">{roleSpecificMetrics.roleFit}%</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">🚀 발전 방향</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start">
                <span className="mr-2">•</span>
                <span>현재 수준을 유지하며 실무 경험 축적</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2">•</span>
                <span>부족한 스킬 영역의 집중적 학습</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2">•</span>
                <span>업계 네트워킹 및 멘토링 기회 활용</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}