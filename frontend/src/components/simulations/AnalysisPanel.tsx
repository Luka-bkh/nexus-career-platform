"use client";

import React, { useState } from 'react';

interface AnalysisPanelProps {
  data: any;
  onAnalysisChange: (analysis: string) => void;
  value: string;
}

export function AnalysisPanel({ data, onAnalysisChange, value }: AnalysisPanelProps) {
  const [selectedTab, setSelectedTab] = useState<'data' | 'chart' | 'analysis'>('data');
  
  // 목업 데이터 - 실제로는 props로 받아올 데이터
  const mockData = data || {
    title: '고객 리뷰 데이터셋',
    description: '전자상거래 사이트의 제품 리뷰 데이터입니다. 감정 분석 모델 개발을 위해 분석해주세요.',
    rows: 10000,
    columns: 5,
    sample: [
      { id: 1, review: '정말 좋은 제품이에요! 배송도 빠르고 품질이 우수합니다.', rating: 5, sentiment: null },
      { id: 2, review: '가격 대비 괜찮은 것 같아요. 그런데 포장이 좀...', rating: 3, sentiment: null },
      { id: 3, review: '최악입니다. 돈 아까워요. 환불 요청했습니다.', rating: 1, sentiment: null },
      { id: 4, review: '배송이 너무 늦어요ㅠㅠ 다음엔 다른 곳에서 사야겠어요', rating: 2, sentiment: null },
      { id: 5, review: '완전 만족! 친구들에게도 추천했어요 ^^', rating: 5, sentiment: null },
    ],
    statistics: {
      avg_rating: 3.2,
      total_reviews: 10000,
      missing_values: {
        review: 45,
        rating: 12,
        sentiment: 10000
      },
      rating_distribution: {
        1: 1500,
        2: 1200,
        3: 2800,
        4: 2200,
        5: 2300
      }
    }
  };

  const renderDataView = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">{mockData.title}</h4>
        <p className="text-sm text-gray-600 mb-3">{mockData.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">행 수:</span>
            <span className="ml-2 font-medium">{mockData.rows.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">열 수:</span>
            <span className="ml-2 font-medium">{mockData.columns}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left border-b">ID</th>
              <th className="px-3 py-2 text-left border-b">리뷰 텍스트</th>
              <th className="px-3 py-2 text-left border-b">평점</th>
              <th className="px-3 py-2 text-left border-b">감정</th>
            </tr>
          </thead>
          <tbody>
            {mockData.sample.map((row: any) => (
              <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2">{row.id}</td>
                <td className="px-3 py-2 max-w-xs truncate">{row.review}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    row.rating >= 4 ? 'bg-green-100 text-green-800' :
                    row.rating >= 3 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {row.rating}⭐
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-400">null</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderChartView = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">평점 분포</h4>
      
      <div className="bg-white p-4 border border-gray-200 rounded-lg">
        <div className="space-y-3">
          {Object.entries(mockData.statistics.rating_distribution).map(([rating, count]) => (
            <div key={rating} className="flex items-center">
              <span className="w-8 text-sm text-gray-600">{rating}⭐</span>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      parseInt(rating) >= 4 ? 'bg-green-500' :
                      parseInt(rating) >= 3 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${(count / mockData.statistics.total_reviews) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="w-16 text-sm text-gray-600 text-right">
                {count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-blue-900">
            {mockData.statistics.avg_rating}
          </div>
          <div className="text-sm text-blue-700">평균 평점</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-purple-900">
            {mockData.statistics.total_reviews.toLocaleString()}
          </div>
          <div className="text-sm text-purple-700">총 리뷰 수</div>
        </div>
      </div>
    </div>
  );

  const renderAnalysisView = () => (
    <div className="space-y-4">
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h4 className="font-medium text-red-900 mb-2">⚠️ 데이터 품질 이슈</h4>
        <div className="text-sm text-red-700 space-y-1">
          <div>• 결측값: 리뷰 텍스트 {mockData.statistics.missing_values.review}개, 평점 {mockData.statistics.missing_values.rating}개</div>
          <div>• 감정 라벨 없음: {mockData.statistics.missing_values.sentiment.toLocaleString()}개 (전체)</div>
          <div>• 데이터 불균형: 낮은 평점(1-2점)이 상대적으로 적음</div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-2">💡 분석 포인트</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <div>• 텍스트 전처리 필요 (이모티콘, 오타, 줄임말)</div>
          <div>• 평점과 텍스트 내용 간 불일치 케이스 존재 가능</div>
          <div>• 짧은 리뷰와 긴 리뷰의 품질 차이</div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          데이터 분석 결과를 작성해주세요
        </label>
        <textarea
          value={value}
          onChange={(e) => onAnalysisChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={6}
          placeholder="데이터에서 발견한 문제점과 해결 방안을 작성해주세요.

예시:
1. 주요 문제점
   - 감정 라벨이 전혀 없어 지도학습 불가
   - 결측값 존재로 데이터 품질 저하
   
2. 해결 방안
   - 평점을 기반으로 감정 라벨 생성
   - 결측값 처리 및 데이터 정제 수행"
        />
      </div>
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('data')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'data'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          📊 데이터 보기
        </button>
        <button
          onClick={() => setSelectedTab('chart')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'chart'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          📈 통계 분석
        </button>
        <button
          onClick={() => setSelectedTab('analysis')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            selectedTab === 'analysis'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          🔍 분석 작성
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="p-4">
        {selectedTab === 'data' && renderDataView()}
        {selectedTab === 'chart' && renderChartView()}
        {selectedTab === 'analysis' && renderAnalysisView()}
      </div>
    </div>
  );
}

// 데이터 시각화 컴포넌트
interface DataVisualizationProps {
  data: any[];
  type: 'bar' | 'pie' | 'line';
  title: string;
}

export function DataVisualization({ data, type, title }: DataVisualizationProps) {
  const renderBarChart = () => (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <span className="w-16 text-sm text-gray-600">{item.label}</span>
            <div className="flex-1 mx-3">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="h-4 bg-blue-500 rounded-full"
                  style={{ width: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%` }}
                ></div>
              </div>
            </div>
            <span className="w-12 text-sm text-gray-600 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPieChart = () => (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
            ></div>
            <span className="text-sm text-gray-600">{item.label}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  switch (type) {
    case 'bar':
      return renderBarChart();
    case 'pie':
      return renderPieChart();
    default:
      return renderBarChart();
  }
}