"use client";

import React, { useState } from 'react';

interface MilestoneTrackerProps {
  roadmap: any;
  onMilestoneComplete: (milestoneId: string, notes?: string) => void;
}

export function MilestoneTracker({ roadmap, onMilestoneComplete }: MilestoneTrackerProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // 모든 마일스톤 수집 및 필터링
  const getAllMilestones = () => {
    const milestones: any[] = [];
    
    roadmap.phases.forEach((phase: any) => {
      phase.milestones.forEach((milestone: any) => {
        milestones.push({
          ...milestone,
          phaseTitle: phase.title,
          phaseId: phase.id,
          phaseOrder: phase.order,
        });
      });
    });

    return milestones.filter(milestone => {
      const statusMatch = filterStatus === 'all' || 
        (filterStatus === 'completed' && milestone.isCompleted) ||
        (filterStatus === 'pending' && !milestone.isCompleted);
      
      const priorityMatch = filterPriority === 'all' || milestone.priority === filterPriority;
      
      return statusMatch && priorityMatch;
    });
  };

  const milestones = getAllMilestones();

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusStats = () => {
    const allMilestones = getAllMilestones();
    const completed = allMilestones.filter(m => m.isCompleted).length;
    const pending = allMilestones.length - completed;
    const percentage = allMilestones.length > 0 ? Math.round((completed / allMilestones.length) * 100) : 0;
    
    return { completed, pending, total: allMilestones.length, percentage };
  };

  const handleCompleteClick = (milestoneId: string) => {
    setShowCompleteModal(milestoneId);
    setCompletionNotes('');
  };

  const handleCompleteConfirm = () => {
    if (showCompleteModal) {
      onMilestoneComplete(showCompleteModal, completionNotes);
      setShowCompleteModal(null);
      setCompletionNotes('');
    }
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-8">
      {/* 마일스톤 트래커 헤더 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">🎯</span>
          마일스톤 트래커
        </h2>

        {/* 통계 대시보드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
            <div className="text-sm text-blue-800">총 마일스톤</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.completed}</div>
            <div className="text-sm text-green-800">완료됨</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pending}</div>
            <div className="text-sm text-orange-800">진행 중</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.percentage}%</div>
            <div className="text-sm text-purple-800">완료율</div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">전체 진행률</span>
            <span className="font-medium">{stats.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* 필터 옵션 */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태별 필터</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="pending">진행 중</option>
              <option value="completed">완료됨</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">우선순위별 필터</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
          </div>
        </div>
      </div>

      {/* 마일스톤 목록 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          마일스톤 목록 ({milestones.length}개)
        </h3>

        {milestones.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">해당하는 마일스톤이 없습니다</h4>
            <p className="text-gray-600">다른 필터 옵션을 선택해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`border rounded-xl p-6 transition-all ${
                  milestone.isCompleted 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* 타입 아이콘 */}
                    <div className="text-2xl">{getTypeIcon(milestone.type)}</div>
                    
                    <div className="flex-1">
                      {/* 마일스톤 헤더 */}
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className={`text-lg font-semibold ${
                          milestone.isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                        }`}>
                          {milestone.title}
                        </h4>
                        
                        <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(milestone.priority)}`}>
                          {milestone.priority === 'high' ? '높음' : 
                           milestone.priority === 'medium' ? '보통' : '낮음'} 우선순위
                        </span>
                        
                        {milestone.isCompleted && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            ✅ 완료됨
                          </span>
                        )}
                      </div>

                      {/* 소속 단계 */}
                      <div className="mb-3">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          📋 {milestone.phaseTitle}
                        </span>
                      </div>

                      {/* 설명 */}
                      <p className="text-gray-600 mb-4">{milestone.description}</p>

                      {/* 메타 정보 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">타입</span>
                          <div className="font-medium capitalize">{milestone.type}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">예상 시간</span>
                          <div className="font-medium">{milestone.estimatedHours}시간</div>
                        </div>
                        <div>
                          <span className="text-gray-500">스킬</span>
                          <div className="font-medium">{milestone.skills.join(', ')}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">리소스</span>
                          <div className="font-medium">{milestone.resources.length}개</div>
                        </div>
                      </div>

                      {/* 완료 일시 */}
                      {milestone.isCompleted && milestone.completedAt && (
                        <div className="mb-4 p-3 bg-green-100 rounded-lg">
                          <span className="text-green-800 text-sm">
                            ✅ {new Date(milestone.completedAt).toLocaleDateString('ko-KR')}에 완료됨
                          </span>
                        </div>
                      )}

                      {/* 확장 영역 */}
                      {selectedMilestone === milestone.id && (
                        <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
                          {/* 성공 기준 */}
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3">성공 기준</h5>
                            <ul className="space-y-2">
                              {milestone.successCriteria.map((criteria: string, index: number) => (
                                <li key={index} className="flex items-start text-sm">
                                  <span className="text-green-500 mr-2 mt-0.5">✓</span>
                                  <span className="text-gray-700">{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* 학습 리소스 */}
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3">학습 리소스</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {milestone.resources.map((resource: any, index: number) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <h6 className="font-medium text-gray-900">{resource.title}</h6>
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
                                    <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
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
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                      >
                                        바로가기 →
                                      </a>
                                    )}
                                  </div>
                                  
                                  {resource.rating && (
                                    <div className="mt-2 flex items-center">
                                      <span className="text-yellow-500 text-sm">
                                        {'★'.repeat(Math.floor(resource.rating))}
                                        {'☆'.repeat(5 - Math.floor(resource.rating))}
                                      </span>
                                      <span className="text-gray-500 text-xs ml-2">({resource.rating})</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => setSelectedMilestone(
                        selectedMilestone === milestone.id ? null : milestone.id
                      )}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                    >
                      {selectedMilestone === milestone.id ? '접기' : '상세보기'}
                    </button>
                    
                    {!milestone.isCompleted && (
                      <button
                        onClick={() => handleCompleteClick(milestone.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        완료 처리
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 다음 마일스톤 추천 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">🎯</span>
          다음 추천 마일스톤
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 높은 우선순위 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">높은 우선순위</h4>
            <div className="space-y-3">
              {milestones
                .filter(m => !m.isCompleted && m.priority === 'high')
                .slice(0, 3)
                .map((milestone) => (
                  <div key={milestone.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-red-900">{milestone.title}</h5>
                        <p className="text-red-700 text-sm">{milestone.phaseTitle}</p>
                      </div>
                      <button
                        onClick={() => handleCompleteClick(milestone.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        시작하기
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 빠른 완료 가능 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">빠른 완료 가능</h4>
            <div className="space-y-3">
              {milestones
                .filter(m => !m.isCompleted)
                .sort((a, b) => a.estimatedHours - b.estimatedHours)
                .slice(0, 3)
                .map((milestone) => (
                  <div key={milestone.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-green-900">{milestone.title}</h5>
                        <p className="text-green-700 text-sm">{milestone.estimatedHours}시간 • {milestone.phaseTitle}</p>
                      </div>
                      <button
                        onClick={() => handleCompleteClick(milestone.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        시작하기
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 완료 처리 모달 */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">마일스톤 완료</h3>
            <p className="text-gray-600 mb-6">
              이 마일스톤을 완료로 처리하시겠습니까?
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                완료 노트 (선택사항)
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="완료에 대한 간단한 메모를 남겨주세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCompleteModal(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
              <button
                onClick={handleCompleteConfirm}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                완료 처리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}