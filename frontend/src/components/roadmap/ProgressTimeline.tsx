"use client";

import React, { useState } from 'react';

interface ProgressTimelineProps {
  roadmap: any;
}

export function ProgressTimeline({ roadmap }: ProgressTimelineProps) {
  const [viewMode, setViewMode] = useState<'phases' | 'milestones'>('phases');
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  // 현재 날짜부터 시작하여 각 단계의 예상 완료일 계산
  const calculateTimeline = () => {
    const startDate = new Date();
    const timeline: any[] = [];
    let currentDate = new Date(startDate);

    roadmap.phases.forEach((phase: any, index: number) => {
      const phaseEndDate = new Date(currentDate);
      phaseEndDate.setMonth(phaseEndDate.getMonth() + phase.duration);
      
      const progress = calculatePhaseProgress(phase);
      const isCompleted = progress === 100;
      const isCurrent = !isCompleted && (index === 0 || roadmap.phases.slice(0, index).every((p: any) => calculatePhaseProgress(p) === 100));

      timeline.push({
        ...phase,
        startDate: new Date(currentDate),
        endDate: phaseEndDate,
        progress,
        isCompleted,
        isCurrent,
        status: isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'
      });

      currentDate = new Date(phaseEndDate);
    });

    return timeline;
  };

  const calculatePhaseProgress = (phase: any) => {
    const totalMilestones = phase.milestones.length;
    const completedMilestones = phase.milestones.filter((m: any) => m.isCompleted).length;
    return totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'current': return 'bg-blue-500';
      case 'upcoming': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'current': return 'text-blue-600';
      case 'upcoming': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const timeline = calculateTimeline();

  return (
    <div className="space-y-8">
      {/* 타임라인 헤더 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-3">📅</span>
            학습 타임라인
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('phases')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                viewMode === 'phases'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              단계별 보기
            </button>
            <button
              onClick={() => setViewMode('milestones')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                viewMode === 'milestones'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              마일스톤 보기
            </button>
          </div>
        </div>

        {/* 전체 진행률 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {Math.round(timeline.reduce((sum, phase) => sum + phase.progress, 0) / timeline.length)}%
            </div>
            <div className="text-sm text-blue-800">전체 진행률</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {timeline.filter(phase => phase.status === 'completed').length}
            </div>
            <div className="text-sm text-green-800">완료된 단계</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {Math.ceil(roadmap.estimatedDuration - (roadmap.estimatedDuration * 
                timeline.reduce((sum, phase) => sum + phase.progress, 0) / timeline.length / 100))}
            </div>
            <div className="text-sm text-orange-800">남은 개월</div>
          </div>
        </div>
      </div>

      {/* 단계별 타임라인 */}
      {viewMode === 'phases' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">단계별 진행 현황</h3>
          
          <div className="space-y-6">
            {timeline.map((phase, index) => (
              <div key={phase.id} className="relative">
                {/* 연결선 */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-6 top-16 w-px h-20 bg-gray-300"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* 단계 아이콘 */}
                  <div className={`w-12 h-12 rounded-full ${getStatusColor(phase.status)} flex items-center justify-center text-white font-bold text-lg z-10`}>
                    {index + 1}
                  </div>
                  
                  {/* 단계 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className={`text-lg font-semibold ${getStatusTextColor(phase.status)}`}>
                          {phase.title}
                        </h4>
                        <p className="text-gray-600 text-sm">{phase.description}</p>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className={`text-lg font-bold ${getStatusTextColor(phase.status)}`}>
                          {Math.round(phase.progress)}%
                        </div>
                        <div className="text-xs text-gray-500">완료율</div>
                      </div>
                    </div>
                    
                    {/* 진행률 바 */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            phase.status === 'completed' ? 'bg-green-500' :
                            phase.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                          style={{ width: `${phase.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* 기간 및 세부 정보 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">시작일</span>
                        <div className="font-medium">{formatDate(phase.startDate)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">완료 예정</span>
                        <div className="font-medium">{formatDate(phase.endDate)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">기간</span>
                        <div className="font-medium">{phase.duration}개월</div>
                      </div>
                      <div>
                        <span className="text-gray-500">마일스톤</span>
                        <div className="font-medium">
                          {phase.milestones.filter((m: any) => m.isCompleted).length}/{phase.milestones.length}
                        </div>
                      </div>
                    </div>
                    
                    {/* 핵심 스킬 */}
                    <div className="mt-3">
                      <span className="text-gray-500 text-sm">핵심 스킬: </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {phase.skills.map((skill: string, skillIndex: number) => (
                          <span key={skillIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* 현재 단계인 경우 상세 정보 */}
                    {phase.status === 'current' && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-900 mb-2">현재 진행 중인 마일스톤</h5>
                        <div className="space-y-2">
                          {phase.milestones
                            .filter((m: any) => !m.isCompleted)
                            .slice(0, 3)
                            .map((milestone: any, mIndex: number) => (
                            <div key={mIndex} className="flex items-center text-sm">
                              <span className="text-blue-600 mr-2">→</span>
                              <span className="flex-1">{milestone.title}</span>
                              <span className="text-blue-600 text-xs">
                                {milestone.priority === 'high' ? '높음' : 
                                 milestone.priority === 'medium' ? '보통' : '낮음'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 확장 버튼 */}
                    <button
                      onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
                      className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {selectedPhase === phase.id ? '접기' : '마일스톤 상세보기'} →
                    </button>
                    
                    {/* 확장된 마일스톤 목록 */}
                    {selectedPhase === phase.id && (
                      <div className="mt-4 space-y-3">
                        {phase.milestones.map((milestone: any, mIndex: number) => (
                          <div 
                            key={mIndex} 
                            className={`p-3 rounded-lg border ${
                              milestone.isCompleted 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className={milestone.isCompleted ? 'text-green-600' : 'text-gray-400'}>
                                  {milestone.isCompleted ? '✅' : '⭕'}
                                </span>
                                <div>
                                  <h6 className={`font-medium ${milestone.isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                                    {milestone.title}
                                  </h6>
                                  <p className="text-gray-600 text-xs">{milestone.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500">{milestone.estimatedHours}시간</div>
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  milestone.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  milestone.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {milestone.priority === 'high' ? '높음' : 
                                   milestone.priority === 'medium' ? '보통' : '낮음'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 마일스톤별 타임라인 */}
      {viewMode === 'milestones' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">마일스톤별 진행 현황</h3>
          
          <div className="space-y-4">
            {roadmap.phases.map((phase: any) => (
              <div key={phase.id}>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">📋</span>
                  {phase.title}
                </h4>
                
                <div className="ml-6 space-y-3">
                  {phase.milestones.map((milestone: any, index: number) => (
                    <div key={milestone.id} className="relative flex items-center space-x-4">
                      {/* 연결선 */}
                      {index < phase.milestones.length - 1 && (
                        <div className="absolute left-3 top-8 w-px h-16 bg-gray-300"></div>
                      )}
                      
                      {/* 마일스톤 아이콘 */}
                      <div className={`w-6 h-6 rounded-full border-2 z-10 ${
                        milestone.isCompleted 
                          ? 'bg-green-500 border-green-500' 
                          : 'bg-white border-gray-300'
                      }`}>
                        {milestone.isCompleted && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      {/* 마일스톤 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className={`font-medium ${milestone.isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                              {milestone.title}
                            </h5>
                            <p className="text-gray-600 text-sm">{milestone.description}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>⏱️ {milestone.estimatedHours}시간</span>
                              <span>🎯 {milestone.skills.join(', ')}</span>
                              <span className={`px-2 py-1 rounded-full ${
                                milestone.priority === 'high' ? 'bg-red-100 text-red-800' :
                                milestone.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {milestone.priority === 'high' ? '높음' : 
                                 milestone.priority === 'medium' ? '보통' : '낮음'}
                              </span>
                            </div>
                          </div>
                          
                          {milestone.isCompleted && milestone.completedAt && (
                            <div className="text-right ml-4">
                              <div className="text-green-600 text-sm font-medium">완료됨</div>
                              <div className="text-gray-500 text-xs">
                                {new Date(milestone.completedAt).toLocaleDateString('ko-KR')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 예상 완료 일정 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">🎯</span>
          예상 완료 일정
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">단계별 완료 예정일</h4>
            <div className="space-y-2">
              {timeline.map((phase, index) => (
                <div key={phase.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50">
                  <span className="text-gray-700">{phase.title}</span>
                  <span className={`text-sm ${getStatusTextColor(phase.status)}`}>
                    {formatDate(phase.endDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">학습 통계</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">총 학습 기간</span>
                <span className="font-medium">{roadmap.estimatedDuration}개월</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">주간 학습 시간</span>
                <span className="font-medium">{roadmap.personalizedFor.timeCommitment}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">총 마일스톤</span>
                <span className="font-medium">
                  {roadmap.phases.reduce((sum: number, phase: any) => sum + phase.milestones.length, 0)}개
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">습득 스킬</span>
                <span className="font-medium">{roadmap.totalSkills.length}개</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}