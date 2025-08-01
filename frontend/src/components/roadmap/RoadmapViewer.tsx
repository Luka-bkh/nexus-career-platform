"use client";

import React, { useState } from 'react';

interface RoadmapViewerProps {
  roadmap: any;
  onMilestoneComplete: (milestoneId: string, notes?: string) => void;
}

export function RoadmapViewer({ roadmap, onMilestoneComplete }: RoadmapViewerProps) {
  const [selectedPhase, setSelectedPhase] = useState<string>(roadmap.phases[0]?.id || '');
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  const getCurrentPhase = () => {
    return roadmap.phases.find((phase: any) => phase.id === selectedPhase) || roadmap.phases[0];
  };

  const calculatePhaseProgress = (phase: any) => {
    const totalMilestones = phase.milestones.length;
    const completedMilestones = phase.milestones.filter((m: any) => m.isCompleted).length;
    return totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  };

  const getNextMilestone = (phase: any) => {
    return phase.milestones.find((m: any) => !m.isCompleted);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill': return '🎓';
      case 'project': return '🛠️';
      case 'certification': return '📜';
      case 'experience': return '💼';
      case 'networking': return '🤝';
      default: return '📋';
    }
  };

  const currentPhase = getCurrentPhase();
  const nextMilestone = getNextMilestone(currentPhase);

  return (
    <div className="space-y-8">
      {/* 로드맵 요약 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {roadmap.phases.length}
          </div>
          <div className="text-sm text-gray-600">총 단계</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {roadmap.phases.reduce((sum: number, phase: any) => sum + phase.milestones.length, 0)}
          </div>
          <div className="text-sm text-gray-600">총 마일스톤</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {roadmap.totalSkills.length}
          </div>
          <div className="text-sm text-gray-600">습득 스킬</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {roadmap.phases.reduce((sum: number, phase: any) => 
              sum + phase.milestones.reduce((mSum: number, m: any) => mSum + m.estimatedHours, 0), 0
            )}
          </div>
          <div className="text-sm text-gray-600">총 학습 시간</div>
        </div>
      </div>

      {/* 현재 단계 하이라이트 */}
      {nextMilestone && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-3">🎯</span>
            다음 마일스톤
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{getTypeIcon(nextMilestone.type)}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{nextMilestone.title}</h3>
                  <p className="text-gray-600 mb-3">{nextMilestone.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm mb-3">
                    <span className={`px-2 py-1 rounded-full border ${getPriorityColor(nextMilestone.priority)}`}>
                      {nextMilestone.priority === 'high' ? '높음' : 
                       nextMilestone.priority === 'medium' ? '보통' : '낮음'} 우선순위
                    </span>
                    <span className="text-gray-600">⏱️ {nextMilestone.estimatedHours}시간</span>
                    <span className="text-gray-600">🏆 {nextMilestone.skills.join(', ')}</span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">성공 기준</h4>
                    <ul className="space-y-1">
                      {nextMilestone.successCriteria.slice(0, 3).map((criteria: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">추천 리소스</h4>
              {nextMilestone.resources.slice(0, 2).map((resource: any, index: number) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-900 text-sm">{resource.title}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      resource.cost === 'free' ? 'bg-green-100 text-green-800' : 
                      resource.cost === 'paid' ? 'bg-blue-100 text-blue-800' : 
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {resource.cost === 'free' ? '무료' : 
                       resource.cost === 'paid' ? '유료' : '구독'}
                    </span>
                  </div>
                  {resource.description && (
                    <p className="text-gray-600 text-xs mb-2">{resource.description}</p>
                  )}
                  {resource.provider && (
                    <p className="text-gray-500 text-xs">제공: {resource.provider}</p>
                  )}
                </div>
              ))}
              
              <button
                onClick={() => onMilestoneComplete(nextMilestone.id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                완료 처리하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 단계별 로드맵 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">🗺️</span>
          단계별 학습 경로
        </h2>

        {/* 단계 선택 탭 */}
        <div className="flex space-x-4 mb-6 overflow-x-auto">
          {roadmap.phases.map((phase: any) => (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedPhase === phase.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {phase.order + 1}단계: {phase.title}
            </button>
          ))}
        </div>

        {/* 선택된 단계 상세 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{currentPhase.title}</h3>
              <p className="text-gray-600 mb-3">{currentPhase.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>📅 {currentPhase.duration}개월</span>
                <span>🎯 {currentPhase.milestones.length}개 마일스톤</span>
                <span>🏆 {currentPhase.skills.join(', ')}</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round(calculatePhaseProgress(currentPhase))}%
              </div>
              <div className="text-sm text-gray-600">진행률</div>
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${calculatePhaseProgress(currentPhase)}%` }}
              ></div>
            </div>
          </div>

          {/* 마일스톤 목록 */}
          <div className="space-y-4">
            {currentPhase.milestones.map((milestone: any, index: number) => (
              <div
                key={milestone.id}
                className={`border rounded-lg p-4 transition-all ${
                  milestone.isCompleted 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-xl">{getTypeIcon(milestone.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className={`font-medium ${milestone.isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                          {milestone.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(milestone.priority)}`}>
                          {milestone.priority === 'high' ? '높음' : 
                           milestone.priority === 'medium' ? '보통' : '낮음'}
                        </span>
                        {milestone.isCompleted && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            완료됨
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                        <span>⏱️ {milestone.estimatedHours}시간</span>
                        <span>🎯 {milestone.skills.join(', ')}</span>
                        <span>📚 {milestone.resources.length}개 리소스</span>
                      </div>
                      
                      {expandedMilestone === milestone.id && (
                        <div className="mt-4 space-y-3">
                          {/* 성공 기준 */}
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">성공 기준</h5>
                            <ul className="space-y-1">
                              {milestone.successCriteria.map((criteria: string, criteriaIndex: number) => (
                                <li key={criteriaIndex} className="text-sm text-gray-600 flex items-start">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* 리소스 */}
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">학습 리소스</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {milestone.resources.map((resource: any, resourceIndex: number) => (
                                <div key={resourceIndex} className="p-3 border border-gray-200 rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <h6 className="font-medium text-gray-900 text-sm">{resource.title}</h6>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      resource.cost === 'free' ? 'bg-green-100 text-green-800' : 
                                      resource.cost === 'paid' ? 'bg-blue-100 text-blue-800' : 
                                      'bg-purple-100 text-purple-800'
                                    }`}>
                                      {resource.cost === 'free' ? '무료' : 
                                       resource.cost === 'paid' ? '유료' : '구독'}
                                    </span>
                                  </div>
                                  {resource.description && (
                                    <p className="text-gray-600 text-xs mb-2">{resource.description}</p>
                                  )}
                                  <div className="flex justify-between items-center">
                                    {resource.provider && (
                                      <span className="text-gray-500 text-xs">{resource.provider}</span>
                                    )}
                                    {resource.url && (
                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                      >
                                        바로가기 →
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setExpandedMilestone(
                        expandedMilestone === milestone.id ? null : milestone.id
                      )}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      {expandedMilestone === milestone.id ? '접기' : '자세히'}
                    </button>
                    
                    {!milestone.isCompleted && (
                      <button
                        onClick={() => onMilestoneComplete(milestone.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        완료
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 학습 팁과 추천사항 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            학습 팁
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">학습 스타일 맞춤</h4>
              <p className="text-blue-800 text-sm">
                {roadmap.personalizedFor.learningStyle === 'visual' ? '시각적 자료와 다이어그램을 활용하세요' :
                 roadmap.personalizedFor.learningStyle === 'auditory' ? '팟캐스트와 강의를 들으며 학습하세요' :
                 roadmap.personalizedFor.learningStyle === 'kinesthetic' ? '실습과 프로젝트 중심으로 학습하세요' :
                 '읽기와 노트 정리를 통해 학습하세요'}
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-1">시간 관리</h4>
              <p className="text-green-800 text-sm">
                주 {roadmap.personalizedFor.timeCommitment}으로 꾸준히 학습하시면 목표를 달성할 수 있습니다.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-1">동기 부여</h4>
              <p className="text-purple-800 text-sm">
                작은 성취라도 축하하고, 진행 상황을 정기적으로 확인하세요.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            다음 액션
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => window.open('/simulations', '_blank')}
              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg text-left hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-900 mb-1">시뮬레이션 체험하기</div>
              <div className="text-blue-700 text-sm">실무 역량을 테스트하고 스킬을 향상시키세요</div>
            </button>
            
            <button
              onClick={() => window.open('/community', '_blank')}
              className="w-full p-3 bg-green-50 border border-green-200 rounded-lg text-left hover:bg-green-100 transition-colors"
            >
              <div className="font-medium text-green-900 mb-1">커뮤니티 참여하기</div>
              <div className="text-green-700 text-sm">동료들과 소통하고 경험을 공유하세요</div>
            </button>
            
            <button
              onClick={() => window.open('/resources', '_blank')}
              className="w-full p-3 bg-purple-50 border border-purple-200 rounded-lg text-left hover:bg-purple-100 transition-colors"
            >
              <div className="font-medium text-purple-900 mb-1">학습 자료 탐색</div>
              <div className="text-purple-700 text-sm">추천 강의와 자료를 확인하세요</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}