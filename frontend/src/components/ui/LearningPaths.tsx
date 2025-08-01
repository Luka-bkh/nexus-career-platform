"use client";

import { LearningPath } from "@/lib/api";

interface LearningPathsProps {
  learningPaths: LearningPath[];
  className?: string;
}

export function LearningPaths({ learningPaths, className = "" }: LearningPathsProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '초급';
      case 'intermediate':
        return '중급';
      case 'advanced':
        return '고급';
      default:
        return '일반';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '🌱';
      case 'intermediate':
        return '🌿';
      case 'advanced':
        return '🌳';
      default:
        return '📚';
    }
  };

  if (learningPaths.length === 0) {
    return (
      <div className={`card text-center ${className}`}>
        <div className="py-8">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">학습 경로 준비 중</h3>
          <p className="text-gray-600">
            맞춤형 학습 경로를 준비하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          📚 추천 학습 경로
        </h3>
        <p className="text-gray-600">
          목표 직업에 도달하기 위한 체계적인 학습 과정을 제안합니다
        </p>
      </div>

      <div className="space-y-6">
        {learningPaths.map((path, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-2xl">{getDifficultyIcon(path.difficulty)}</div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {path.title}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(path.difficulty)}`}>
                    {getDifficultyLabel(path.difficulty)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {path.duration}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    예상 비용: {path.estimatedCost}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">
                  #{index + 1}
                </div>
                <div className="text-xs text-gray-500">추천 순서</div>
              </div>
            </div>

            {/* 학습 모듈들 */}
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">
                📖 학습 모듈 ({path.modules.length}개)
              </h5>
              
              <div className="grid md:grid-cols-2 gap-3">
                {path.modules.map((module, moduleIndex) => (
                  <div 
                    key={moduleIndex}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                      {moduleIndex + 1}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {module}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 진행률 표시 (가상) */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">예상 진행률</span>
                <span className="text-sm text-gray-600">0% 완료</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
              </div>
            </div>

            {/* 학습 혜택 */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h6 className="text-sm font-semibold text-blue-900 mb-2">
                🎯 학습 완료 시 얻는 혜택
              </h6>
              <div className="space-y-1 text-xs text-blue-800">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  실무 프로젝트 경험 2-3개
                </div>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  업계 인정 수료증
                </div>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  취업 지원 및 멘토링
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex space-x-3">
              <button className="btn-primary flex-1">
                📋 상세 커리큘럼 보기
              </button>
              <button className="btn-outline flex-1">
                🚀 학습 시작하기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 전체 학습 통계 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {learningPaths.length}
          </div>
          <div className="text-sm text-green-700">추천 과정</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {learningPaths.reduce((total, path) => total + path.modules.length, 0)}
          </div>
          <div className="text-sm text-blue-700">학습 모듈</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            6-12
          </div>
          <div className="text-sm text-purple-700">예상 개월</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            85%
          </div>
          <div className="text-sm text-orange-700">성공률</div>
        </div>
      </div>

      {/* 추가 지원 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-1">
              🎓 학습 지원 서비스
            </h5>
            <p className="text-xs text-gray-600">
              1:1 멘토링, 스터디 그룹, 취업 지원 등 추가 서비스를 제공합니다
            </p>
          </div>
          <button className="btn-outline text-sm py-2 px-4">
            자세히 보기
          </button>
        </div>
      </div>
    </div>
  );
}