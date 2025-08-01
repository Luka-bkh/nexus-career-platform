"use client";

import React from 'react';

interface ReportOverviewProps {
  report: any;
  onGenerateMore?: () => void;
}

export function ReportOverview({ report, onGenerateMore }: ReportOverviewProps) {
  const { overallPerformance, aiInsights, detailedAnalysis, benchmarking } = report;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-purple-600 bg-purple-100';
      case 'A': return 'text-blue-600 bg-blue-100';
      case 'B+': return 'text-green-600 bg-green-100';
      case 'B': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  return (
    <div className="space-y-8">
      {/* 핵심 성과 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏆</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {overallPerformance.finalScore}
          </div>
          <div className="text-sm text-gray-600 mb-2">최종 점수</div>
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(overallPerformance.grade)}`}>
            {overallPerformance.grade} 등급
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {100 - overallPerformance.percentile}%
          </div>
          <div className="text-sm text-gray-600 mb-2">상위 순위</div>
          <div className="text-xs text-gray-500">
            {benchmarking.peerComparison.totalParticipants}명 중 {benchmarking.peerComparison.ranking}위
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏱️</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {Math.round(overallPerformance.completionTime / 60)}
          </div>
          <div className="text-sm text-gray-600 mb-2">완료 시간 (분)</div>
          <div className="text-xs text-gray-500">
            정확도 {overallPerformance.accuracy}%
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-lg font-bold text-gray-900 mb-2">
            {Math.round(benchmarking.roleSpecificMetrics.roleFit)}%
          </div>
          <div className="text-sm text-gray-600 mb-2">직무 적합도</div>
          <div className="text-xs text-gray-500">
            {benchmarking.roleSpecificMetrics.readinessLevel}
          </div>
        </div>
      </div>

      {/* AI 인사이트 섹션 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">🤖</span>
          AI 종합 분석
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 성격 프로필 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">👤</span>
              성격 프로필
            </h3>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700">{aiInsights.personalityProfile}</p>
            </div>
            
            <h4 className="font-medium text-gray-900 mb-2">업무 스타일</h4>
            <p className="text-gray-600 text-sm">{aiInsights.workStyle}</p>
          </div>

          {/* 주요 강점 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">💪</span>
              주요 강점
            </h3>
            <div className="space-y-3">
              {report.strengthsWeaknesses.topStrengths.slice(0, 3).map((strength: string, index: number) => (
                <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 상세 분석 섹션 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">🔍</span>
          상세 행동 분석
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">의사결정 패턴</h4>
              <p className="text-gray-600 text-sm">{detailedAnalysis.decisionMakingPattern}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">문제 해결 접근법</h4>
              <p className="text-gray-600 text-sm">{detailedAnalysis.problemApproach}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">학습 곡선</h4>
              <p className="text-gray-600 text-sm">{detailedAnalysis.learningCurve}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">협업 스타일</h4>
              <p className="text-gray-600 text-sm">{detailedAnalysis.collaborationStyle}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">스트레스 대응</h4>
              <p className="text-gray-600 text-sm">{detailedAnalysis.stressResponse}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 학습 우선순위 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">📚</span>
          학습 우선순위
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">우선 학습 영역</h3>
            <div className="space-y-3">
              {aiInsights.learningPriorities.map((priority: string, index: number) => (
                <div key={index} className="flex items-start p-3 border border-gray-200 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{priority}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">다음 단계</h3>
            <div className="space-y-3">
              {aiInsights.nextSteps.slice(0, 4).map((step: string, index: number) => (
                <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <span className="text-blue-500 mr-3">→</span>
                  <span className="text-gray-700 text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 진로 추천 미리보기 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-3">🎯</span>
            추천 진로 (미리보기)
          </h2>
          <button
            onClick={onGenerateMore}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            상세 분석 보기
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.careerRecommendations.slice(0, 3).map((career: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{career.title}</h4>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {career.matchScore}% 매치
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{career.reasoning.substring(0, 100)}...</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{career.timeframe}</span>
                <span className={`px-2 py-1 rounded-full ${
                  career.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  career.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {career.difficulty === 'easy' ? '쉬움' : 
                   career.difficulty === 'moderate' ? '보통' : '어려움'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주요 인사이트 요약 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-3">💡</span>
          핵심 인사이트
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">가장 큰 강점</h3>
            <p className="text-blue-700 font-medium">
              {report.strengthsWeaknesses.topStrengths[0]}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">우선 개선 영역</h3>
            <p className="text-purple-700 font-medium">
              {report.strengthsWeaknesses.improvementAreas[0]}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">최적 진로</h3>
            <p className="text-green-700 font-medium">
              {aiInsights.careerRecommendations[0]?.title}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">예상 준비 기간</h3>
            <p className="text-orange-700 font-medium">
              {aiInsights.careerRecommendations[0]?.timeframe}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}