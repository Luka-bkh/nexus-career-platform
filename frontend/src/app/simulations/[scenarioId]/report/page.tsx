"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { simulationApi } from '@/lib/api';
import { CreditBalance } from '@/components/ui/CreditBalance';
import { ReportOverview } from '@/components/reports/ReportOverview';
import { CompetencyRadar } from '@/components/reports/CompetencyRadar';
import { CareerRecommendations } from '@/components/reports/CareerRecommendations';
import { StrengthsWeaknesses } from '@/components/reports/StrengthsWeaknesses';
import { ActionPlan } from '@/components/reports/ActionPlan';
import { BenchmarkingChart } from '@/components/reports/BenchmarkingChart';

interface SimulationReport {
  id: string;
  sessionId: string;
  userId: string;
  simulationId: string;
  
  overallPerformance: {
    finalScore: number;
    grade: string;
    percentile: number;
    completionTime: number;
    accuracy: number;
  };
  
  competencyAnalysis: Record<string, {
    score: number;
    level: string;
    description: string;
    evidence: string[];
    improvement: string;
  }>;
  
  strengthsWeaknesses: {
    topStrengths: string[];
    keyWeaknesses: string[];
    improvementAreas: string[];
    naturalTalents: string[];
  };
  
  aiInsights: {
    personalityProfile: string;
    workStyle: string;
    careerRecommendations: Array<{
      title: string;
      matchScore: number;
      reasoning: string;
      pathway: string[];
      timeframe: string;
      difficulty: string;
    }>;
    learningPriorities: string[];
    nextSteps: string[];
  };
  
  detailedAnalysis: {
    decisionMakingPattern: string;
    problemApproach: string;
    collaborationStyle: string;
    learningCurve: string;
    stressResponse: string;
  };
  
  benchmarking: {
    peerComparison: {
      ranking: number;
      totalParticipants: number;
      percentile: number;
      averageScore: number;
    };
    industryStandards: {
      industryAverage: number;
      topCompaniesStandard: number;
      skillGapAnalysis: string[];
    };
    roleSpecificMetrics: {
      roleFit: number;
      skillAlignment: number;
      experienceGap: number;
      readinessLevel: string;
    };
  };
  
  actionPlan: {
    immediate: Array<{
      title: string;
      description: string;
      priority: string;
      estimatedTime: string;
      resources: string[];
      successMetrics: string[];
    }>;
    shortTerm: Array<{
      title: string;
      description: string;
      priority: string;
      estimatedTime: string;
      resources: string[];
      successMetrics: string[];
    }>;
    longTerm: Array<{
      title: string;
      description: string;
      priority: string;
      estimatedTime: string;
      resources: string[];
      successMetrics: string[];
    }>;
  };
  
  metadata: {
    generatedAt: string;
    version: string;
    confidence: number;
    analysisDepth: string;
  };
}

export default function SimulationReportPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const scenarioId = params.scenarioId as string;
  const sessionId = searchParams.get('sessionId');

  const [report, setReport] = useState<SimulationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const tabs = [
    { id: 'overview', label: '종합 분석', icon: '📊' },
    { id: 'competency', label: '역량 분석', icon: '⚡' },
    { id: 'career', label: '진로 추천', icon: '🎯' },
    { id: 'strengths', label: '강점/약점', icon: '💪' },
    { id: 'benchmarking', label: '벤치마킹', icon: '📈' },
    { id: 'action', label: '액션 플랜', icon: '📋' },
  ];

  useEffect(() => {
    if (sessionId) {
      generateReport();
    } else {
      setError('세션 ID가 필요합니다.');
      setLoading(false);
    }
  }, [sessionId]);

  const generateReport = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setIsGeneratingReport(true);
      
      const reportData = await simulationApi.getReport(sessionId);
      setReport(reportData);
      
    } catch (error: any) {
      console.error('리포트 생성 실패:', error);
      setError(error.message || '리포트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
      setIsGeneratingReport(false);
    }
  };

  const handleRefreshReport = async () => {
    if (!sessionId) return;

    try {
      setIsGeneratingReport(true);
      const reportData = await simulationApi.getReport(sessionId, true);
      setReport(reportData);
    } catch (error: any) {
      console.error('리포트 새로고침 실패:', error);
      alert('리포트 새로고침에 실패했습니다.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    
    // PDF 다운로드 기능 구현 (추후)
    alert('PDF 다운로드 기능은 곧 추가될 예정입니다.');
  };

  const handleShareReport = () => {
    if (!report) return;
    
    // 공유 기능 구현 (추후)
    navigator.clipboard.writeText(window.location.href);
    alert('리포트 링크가 클립보드에 복사되었습니다.');
  };

  if (loading && !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isGeneratingReport ? 'AI 분석 리포트 생성 중...' : '리포트를 불러오는 중...'}
          </h3>
          <p className="text-gray-600">
            {isGeneratingReport 
              ? '시뮬레이션 데이터를 분석하고 개인화된 리포트를 생성하고 있습니다.'
              : '잠시만 기다려주세요.'
            }
          </p>
          <div className="mt-4 w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
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
              onClick={generateReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
            <button
              onClick={() => router.push('/simulations')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">리포트를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/simulations')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            시뮬레이션 목록으로
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ReportOverview 
            report={report}
            onGenerateMore={handleRefreshReport}
          />
        );
      case 'competency':
        return (
          <div className="space-y-8">
            <CompetencyRadar competencies={report.competencyAnalysis} />
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">상세 역량 분석</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(report.competencyAnalysis).map(([key, competency]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {key.replace('_', ' ')}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        competency.level === 'expert' ? 'bg-purple-100 text-purple-800' :
                        competency.level === 'advanced' ? 'bg-blue-100 text-blue-800' :
                        competency.level === 'intermediate' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {competency.level}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>점수</span>
                        <span>{competency.score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${competency.score}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{competency.description}</p>
                    <p className="text-xs text-blue-600">{competency.improvement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'career':
        return <CareerRecommendations recommendations={report.aiInsights.careerRecommendations as any} />;
      case 'strengths':
        return <StrengthsWeaknesses data={report.strengthsWeaknesses} insights={report.aiInsights} />;
      case 'benchmarking':
        return <BenchmarkingChart benchmarking={report.benchmarking} />;
      case 'action':
        return <ActionPlan actionPlan={report.actionPlan as any} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/simulations')}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                시뮬레이션 목록
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">AI 분석 리포트</span>
            </div>
            <CreditBalance />
          </div>
        </div>
      </div>

      {/* 리포트 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI 분석 리포트</h1>
              <p className="text-blue-100 mb-4">
                시뮬레이션 결과를 바탕으로 생성된 종합 분석 보고서입니다
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <span className="mr-2">🏆</span>
                  <span>최종 점수: {report.overallPerformance.finalScore}점</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📊</span>
                  <span>등급: {report.overallPerformance.grade}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📈</span>
                  <span>상위 {100 - report.overallPerformance.percentile}%</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🔬</span>
                  <span>분석 신뢰도: {Math.round(report.metadata.confidence * 100)}%</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleRefreshReport}
                disabled={isGeneratingReport}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 disabled:opacity-50"
              >
                {isGeneratingReport ? '생성 중...' : '🔄 새로고침'}
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30"
              >
                📥 PDF 다운로드
              </button>
              <button
                onClick={handleShareReport}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30"
              >
                🔗 공유
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="container mx-auto px-4 py-8">
        {renderTabContent()}
      </div>

      {/* 하단 액션 */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              리포트 생성일: {new Date(report.metadata.generatedAt).toLocaleDateString('ko-KR')}
              <span className="mx-2">•</span>
              버전: {report.metadata.version}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/simulations')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                다른 시뮬레이션 체험
              </button>
              <button
                onClick={() => router.push('/onboarding/recommendation')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                진로 추천 다시 받기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}