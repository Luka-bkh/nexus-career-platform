"use client";

import React, { useState } from 'react';

interface CareerProgressionProps {
  roadmap: any;
}

export function CareerProgression({ roadmap }: CareerProgressionProps) {
  const [selectedProgression, setSelectedProgression] = useState<number>(0);
  const [showSalaryDetails, setShowSalaryDetails] = useState(false);

  const calculateCurrentPosition = () => {
    const totalMilestones = roadmap.phases.reduce((sum: number, phase: any) => sum + phase.milestones.length, 0);
    const completedMilestones = roadmap.phases.reduce((sum: number, phase: any) => 
      sum + phase.milestones.filter((m: any) => m.isCompleted).length, 0
    );
    
    const progress = totalMilestones > 0 ? completedMilestones / totalMilestones : 0;
    
    // 진행률에 따른 현재 위치 결정
    if (progress < 0.3) return 0; // 초급
    if (progress < 0.7) return 0.5; // 중급 진입
    if (progress < 1.0) return 1; // 중급
    return roadmap.careerProgression.length - 1; // 최고 단계
  };

  const currentPosition = calculateCurrentPosition();

  const getPositionColor = (index: number, current: number) => {
    if (index < current) return 'bg-green-500 text-white'; // 달성
    if (index === Math.floor(current)) return 'bg-blue-500 text-white'; // 현재
    return 'bg-gray-300 text-gray-600'; // 미래
  };

  const getPositionBorderColor = (index: number, current: number) => {
    if (index < current) return 'border-green-500';
    if (index === Math.floor(current)) return 'border-blue-500';
    return 'border-gray-300';
  };

  const formatSalary = (salary: string) => {
    return salary.replace(/(\d+)-(\d+)만원/, '$1-$2만원');
  };

  const getSkillsNeeded = (progression: any) => {
    // 해당 단계에 필요한 스킬들을 로드맵에서 추출
    const allSkills = roadmap.totalSkills;
    const requirements = progression.requirements || [];
    
    return requirements.filter((req: string) => 
      allSkills.some((skill: string) => skill.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(skill.toLowerCase()))
    );
  };

  const getEstimatedTimeToReach = (targetIndex: number) => {
    const currentProgress = calculateCurrentPosition();
    if (targetIndex <= currentProgress) return '달성 완료';
    
    const remaining = targetIndex - currentProgress;
    const monthsPerLevel = roadmap.estimatedDuration / roadmap.careerProgression.length;
    const estimatedMonths = Math.ceil(remaining * monthsPerLevel);
    
    if (estimatedMonths < 12) return `약 ${estimatedMonths}개월`;
    return `약 ${Math.ceil(estimatedMonths / 12)}년`;
  };

  return (
    <div className="space-y-8">
      {/* 진로 발전 헤더 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">🚀</span>
          진로 발전 경로
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            {roadmap.targetRole} 분야에서의 체계적인 커리어 발전 경로입니다. 
            현재 학습 진도에 따라 예상 도달 시점을 확인할 수 있습니다.
          </p>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>달성 완료</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
              <span>현재 수준</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
              <span>목표 수준</span>
            </div>
          </div>
        </div>
      </div>

      {/* 진로 경로 타임라인 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">커리어 타임라인</h3>
        
        <div className="relative">
          {/* 연결선 */}
          <div className="absolute left-8 top-8 bottom-8 w-1 bg-gray-200 rounded-full"></div>
          
          <div className="space-y-8">
            {roadmap.careerProgression.map((progression: any, index: number) => (
              <div key={index} className="relative flex items-start">
                {/* 포지션 아이콘 */}
                <div className={`w-16 h-16 rounded-full border-4 ${getPositionBorderColor(index, currentPosition)} ${getPositionColor(index, currentPosition)} flex items-center justify-center font-bold text-lg z-10`}>
                  {index + 1}
                </div>
                
                {/* 포지션 정보 */}
                <div className="ml-6 flex-1">
                  <div 
                    className="cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors"
                    onClick={() => setSelectedProgression(selectedProgression === index ? -1 : index)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{progression.position}</h4>
                        <p className="text-gray-600">{progression.timeline}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {getEstimatedTimeToReach(index)}
                        </div>
                        <div className="text-sm text-gray-500">예상 달성</div>
                      </div>
                    </div>
                    
                    {progression.averageSalary && (
                      <div className="mb-3">
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          💰 {formatSalary(progression.averageSalary)}
                        </span>
                      </div>
                    )}
                    
                    {/* 현재 포지션 표시 */}
                    {index === Math.floor(currentPosition) && (
                      <div className="mb-3">
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          📍 현재 목표 수준
                        </span>
                      </div>
                    )}
                    
                    {/* 필요 역량 미리보기 */}
                    <div className="mb-3">
                      <span className="text-sm text-gray-600">필요 역량: </span>
                      <span className="text-sm font-medium">{progression.requirements.slice(0, 3).join(', ')}</span>
                      {progression.requirements.length > 3 && (
                        <span className="text-sm text-gray-500"> 외 {progression.requirements.length - 3}개</span>
                      )}
                    </div>
                    
                    <div className="text-blue-600 text-sm font-medium">
                      {selectedProgression === index ? '접기 ↑' : '자세히 보기 ↓'}
                    </div>
                  </div>
                  
                  {/* 확장된 상세 정보 */}
                  {selectedProgression === index && (
                    <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 필요 역량 */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-3">필요 역량</h5>
                          <div className="space-y-2">
                            {progression.requirements.map((req: string, reqIndex: number) => {
                              const isAcquired = roadmap.totalSkills.some((skill: string) => 
                                skill.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(skill.toLowerCase())
                              );
                              
                              return (
                                <div key={reqIndex} className="flex items-center">
                                  <span className={`mr-2 ${isAcquired ? 'text-green-500' : 'text-gray-400'}`}>
                                    {isAcquired ? '✅' : '⭕'}
                                  </span>
                                  <span className={isAcquired ? 'text-green-700' : 'text-gray-700'}>
                                    {req}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* 주요 회사 */}
                        {progression.companies && (
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3">주요 채용 기업</h5>
                            <div className="flex flex-wrap gap-2">
                              {progression.companies.map((company: string, companyIndex: number) => (
                                <span key={companyIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                  {company}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* 다음 단계 */}
                        {progression.nextSteps && (
                          <div className="md:col-span-2">
                            <h5 className="font-semibold text-gray-900 mb-3">다음 단계 발전 방향</h5>
                            <ul className="space-y-1">
                              {progression.nextSteps.map((step: string, stepIndex: number) => (
                                <li key={stepIndex} className="flex items-start text-sm">
                                  <span className="text-blue-500 mr-2">→</span>
                                  <span className="text-gray-700">{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 현재 상태 분석 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">📊</span>
          현재 상태 분석
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 진행 상황 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">학습 진행 상황</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">전체 진행률</span>
                <span className="font-medium">{Math.round(calculateCurrentPosition() * 100 / (roadmap.careerProgression.length - 1))}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(calculateCurrentPosition() * 100 / (roadmap.careerProgression.length - 1))}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {roadmap.phases.reduce((sum: number, phase: any) => 
                      sum + phase.milestones.filter((m: any) => m.isCompleted).length, 0
                    )}
                  </div>
                  <div className="text-sm text-blue-800">완료된 마일스톤</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {roadmap.totalSkills.filter((skill: string) => 
                      roadmap.phases.some((phase: any) => 
                        phase.milestones.some((m: any) => m.isCompleted && m.skills.includes(skill))
                      )
                    ).length}
                  </div>
                  <div className="text-sm text-green-800">습득한 스킬</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 다음 목표 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">다음 목표</h4>
            
            {Math.floor(currentPosition) < roadmap.careerProgression.length - 1 && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-900 mb-2">
                  {roadmap.careerProgression[Math.floor(currentPosition) + 1]?.position}
                </h5>
                <p className="text-purple-800 text-sm mb-3">
                  {getEstimatedTimeToReach(Math.floor(currentPosition) + 1)} 후 도달 예상
                </p>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-purple-700 font-medium">부족한 역량:</span>
                    <div className="mt-1">
                      {roadmap.careerProgression[Math.floor(currentPosition) + 1]?.requirements
                        .filter((req: string) => !roadmap.totalSkills.some((skill: string) => 
                          skill.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(skill.toLowerCase())
                        ))
                        .slice(0, 3)
                        .map((req: string, index: number) => (
                          <span key={index} className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs mr-1 mb-1">
                            {req}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {Math.floor(currentPosition) >= roadmap.careerProgression.length - 1 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-900 mb-2">🎉 최고 수준 달성!</h5>
                <p className="text-green-800 text-sm">
                  모든 커리어 단계를 완료했습니다. 이제 전문가로서 다른 사람들을 도와주거나 
                  새로운 분야에 도전해보세요!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 연봉 정보 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="mr-3">💰</span>
            예상 연봉 정보
          </h3>
          <button
            onClick={() => setShowSalaryDetails(!showSalaryDetails)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            {showSalaryDetails ? '간단히 보기' : '자세히 보기'}
          </button>
        </div>
        
        {!showSalaryDetails ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roadmap.careerProgression
              .filter((p: any) => p.averageSalary)
              .map((progression: any, index: number) => (
                <div key={index} className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">{progression.position}</h4>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {formatSalary(progression.averageSalary)}
                  </div>
                  <div className="text-sm text-green-800">{progression.timeline}</div>
                </div>
              ))}
          </div>
        ) : (
          <div className="space-y-6">
            {roadmap.careerProgression
              .filter((p: any) => p.averageSalary)
              .map((progression: any, index: number) => (
                <div key={index} className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{progression.position}</h4>
                      <p className="text-gray-600">{progression.timeline}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatSalary(progression.averageSalary)}
                      </div>
                      <div className="text-sm text-gray-500">연봉 범위</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">필요 역량:</span>
                      <div className="mt-1">
                        {progression.requirements.slice(0, 4).map((req: string, reqIndex: number) => (
                          <span key={reqIndex} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs mr-1 mb-1">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {progression.companies && (
                      <div>
                        <span className="text-gray-600">주요 기업:</span>
                        <div className="mt-1">
                          {progression.companies.slice(0, 3).map((company: string, companyIndex: number) => (
                            <span key={companyIndex} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mr-1 mb-1">
                              {company}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 액션 플랜 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">🎯</span>
          커리어 발전 액션 플랜
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">단기 목표 (3-6개월)</h4>
            <ul className="space-y-2">
              <li className="flex items-start text-sm">
                <span className="text-blue-500 mr-2">→</span>
                <span>현재 단계의 마일스톤 완료에 집중</span>
              </li>
              <li className="flex items-start text-sm">
                <span className="text-blue-500 mr-2">→</span>
                <span>부족한 핵심 스킬 우선 학습</span>
              </li>
              <li className="flex items-start text-sm">
                <span className="text-blue-500 mr-2">→</span>
                <span>실무 프로젝트 경험 축적</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">장기 목표 (1-2년)</h4>
            <ul className="space-y-2">
              <li className="flex items-start text-sm">
                <span className="text-purple-500 mr-2">→</span>
                <span>다음 커리어 단계 준비</span>
              </li>
              <li className="flex items-start text-sm">
                <span className="text-purple-500 mr-2">→</span>
                <span>전문 분야 심화 학습</span>
              </li>
              <li className="flex items-start text-sm">
                <span className="text-purple-500 mr-2">→</span>
                <span>네트워킹 및 개인 브랜딩</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}