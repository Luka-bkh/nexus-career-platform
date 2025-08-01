"use client";

import React, { useState } from 'react';

interface SkillTreeProps {
  roadmap: any;
}

interface SkillNode {
  id: string;
  name: string;
  level: number;
  isLearned: boolean;
  isAvailable: boolean;
  prerequisites: string[];
  relatedMilestones: string[];
  category: string;
  importance: 'core' | 'important' | 'useful';
  estimatedHours: number;
}

export function SkillTree({ roadmap }: SkillTreeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');

  // 스킬 노드 생성 및 분석
  const generateSkillNodes = (): SkillNode[] => {
    const skillMap = new Map<string, SkillNode>();
    const completedMilestones = new Set<string>();

    // 완료된 마일스톤 수집
    roadmap.phases.forEach((phase: any) => {
      phase.milestones.forEach((milestone: any) => {
        if (milestone.isCompleted) {
          completedMilestones.add(milestone.id);
        }
      });
    });

    // 모든 스킬 수집 및 노드 생성
    roadmap.phases.forEach((phase: any, phaseIndex: number) => {
      phase.milestones.forEach((milestone: any) => {
        milestone.skills.forEach((skill: string) => {
          if (!skillMap.has(skill)) {
            // 스킬 카테고리 분류
            const category = categorizeSkill(skill);
            
            // 선행 스킬 결정 (이전 단계의 관련 스킬들)
            const prerequisites = getSkillPrerequisites(skill, roadmap.phases, phaseIndex);
            
            // 중요도 결정
            const importance = determineSkillImportance(skill, roadmap.phases);
            
            skillMap.set(skill, {
              id: skill.toLowerCase().replace(/\s+/g, '-'),
              name: skill,
              level: phaseIndex,
              isLearned: milestone.isCompleted,
              isAvailable: isSkillAvailable(skill, prerequisites, skillMap, completedMilestones),
              prerequisites,
              relatedMilestones: [milestone.id],
              category,
              importance,
              estimatedHours: milestone.estimatedHours || 20,
            });
          } else {
            // 기존 스킬 업데이트
            const existingSkill = skillMap.get(skill)!;
            existingSkill.relatedMilestones.push(milestone.id);
            existingSkill.isLearned = existingSkill.isLearned || milestone.isCompleted;
            existingSkill.estimatedHours += milestone.estimatedHours || 20;
          }
        });
      });
    });

    return Array.from(skillMap.values());
  };

  const categorizeSkill = (skill: string): string => {
    const categories = {
      'Programming': ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'React', 'Node.js'],
      'AI/ML': ['머신러닝', 'Machine Learning', '딥러닝', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn'],
      'Data': ['데이터 분석', 'Data Analysis', 'SQL', 'PostgreSQL', 'MongoDB', 'Pandas', 'NumPy'],
      'Tools': ['Git', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Jenkins', 'Linux'],
      'Soft Skills': ['커뮤니케이션', '팀워크', '문제 해결', '프로젝트 관리', '리더십'],
      'Math': ['선형대수', '확률통계', '미적분학', '최적화'],
    };

    for (const [category, skills] of Object.entries(categories)) {
      if (skills.some(s => skill.includes(s) || s.includes(skill))) {
        return category;
      }
    }
    return 'Other';
  };

  const getSkillPrerequisites = (skill: string, phases: any[], currentPhaseIndex: number): string[] => {
    const prerequisites: string[] = [];
    
    // 기본 선행 관계 정의
    const prereqMap: Record<string, string[]> = {
      '딥러닝': ['머신러닝', 'Python'],
      'TensorFlow': ['Python', '딥러닝'],
      'PyTorch': ['Python', '딥러닝'],
      'MLOps': ['머신러닝', 'Docker'],
      'Kubernetes': ['Docker'],
      '데이터 시각화': ['데이터 분석', 'Python'],
    };

    if (prereqMap[skill]) {
      prerequisites.push(...prereqMap[skill]);
    }

    return prerequisites;
  };

  const determineSkillImportance = (skill: string, phases: any[]): 'core' | 'important' | 'useful' => {
    const coreSkills = ['Python', '머신러닝', 'SQL', '데이터 분석'];
    const importantSkills = ['딥러닝', 'TensorFlow', 'Git', '문제 해결'];

    if (coreSkills.some(s => skill.includes(s) || s.includes(skill))) return 'core';
    if (importantSkills.some(s => skill.includes(s) || s.includes(skill))) return 'important';
    return 'useful';
  };

  const isSkillAvailable = (
    skill: string, 
    prerequisites: string[], 
    skillMap: Map<string, SkillNode>,
    completedMilestones: Set<string>
  ): boolean => {
    if (prerequisites.length === 0) return true;
    
    return prerequisites.every(prereq => {
      const prereqSkill = skillMap.get(prereq);
      return prereqSkill?.isLearned || false;
    });
  };

  const skillNodes = generateSkillNodes();
  const categories = ['all', ...new Set(skillNodes.map(node => node.category))];

  const filteredSkills = selectedCategory === 'all' 
    ? skillNodes 
    : skillNodes.filter(node => node.category === selectedCategory);

  const getSkillColor = (skill: SkillNode) => {
    if (skill.isLearned) return 'bg-green-500 text-white border-green-600';
    if (!skill.isAvailable) return 'bg-gray-300 text-gray-500 border-gray-400';
    
    switch (skill.importance) {
      case 'core': return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
      case 'important': return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
      case 'useful': return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200';
    }
  };

  const getCategoryStats = (category: string) => {
    const categorySkills = category === 'all' ? skillNodes : skillNodes.filter(s => s.category === category);
    const learned = categorySkills.filter(s => s.isLearned).length;
    const total = categorySkills.length;
    const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;
    
    return { learned, total, percentage };
  };

  return (
    <div className="space-y-8">
      {/* 스킬 트리 헤더 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-3">🌳</span>
            스킬 트리
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                viewMode === 'tree'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              트리 보기
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              그리드 보기
            </button>
          </div>
        </div>

        {/* 전체 스킬 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {skillNodes.filter(s => s.isLearned).length}
            </div>
            <div className="text-sm text-green-800">습득 완료</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {skillNodes.filter(s => s.isAvailable && !s.isLearned).length}
            </div>
            <div className="text-sm text-blue-800">학습 가능</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {skillNodes.filter(s => !s.isAvailable).length}
            </div>
            <div className="text-sm text-yellow-800">잠금 상태</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {Math.round((skillNodes.filter(s => s.isLearned).length / skillNodes.length) * 100)}%
            </div>
            <div className="text-sm text-purple-800">전체 진행률</div>
          </div>
        </div>

        {/* 범례 */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>핵심 스킬</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>중요 스킬</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>유용한 스킬</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>습득 완료</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span>잠금 상태</span>
          </div>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 진행 상황</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {categories.map((category) => {
            const stats = getCategoryStats(category);
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCategory === category
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {category === 'all' ? '전체' : category}
                  </h4>
                  <div className="text-sm text-gray-600 mb-2">
                    {stats.learned}/{stats.total} 완료
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{stats.percentage}%</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 스킬 트리 시각화 */}
      {viewMode === 'tree' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {selectedCategory === 'all' ? '전체 스킬 트리' : `${selectedCategory} 스킬 트리`}
          </h3>
          
          {/* 레벨별 스킬 배치 */}
          <div className="space-y-8">
            {Array.from(new Set(filteredSkills.map(s => s.level))).sort().map((level) => {
              const levelSkills = filteredSkills.filter(s => s.level === level);
              return (
                <div key={level} className="relative">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    {level + 1}단계 ({roadmap.phases[level]?.title || `Level ${level + 1}`})
                  </h4>
                  
                  <div className="flex flex-wrap gap-4">
                    {levelSkills.map((skill, index) => (
                      <div key={skill.id} className="relative">
                        {/* 선행 스킬과의 연결선 (간단화) */}
                        {skill.prerequisites.length > 0 && level > 0 && (
                          <div className="absolute -top-4 left-1/2 w-px h-4 bg-gray-300"></div>
                        )}
                        
                        <button
                          onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
                          className={`px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all ${getSkillColor(skill)} ${
                            !skill.isAvailable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                          }`}
                          disabled={!skill.isAvailable}
                        >
                          <div className="flex items-center space-x-2">
                            {skill.isLearned && <span className="text-white">✓</span>}
                            {!skill.isAvailable && <span>🔒</span>}
                            <span>{skill.name}</span>
                          </div>
                          
                          {selectedSkill === skill.id && (
                            <div className="absolute z-10 top-full left-0 mt-2 w-80 p-4 bg-white border border-gray-300 rounded-lg shadow-lg">
                              <h5 className="font-medium text-gray-900 mb-2">{skill.name}</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">카테고리:</span>
                                  <span>{skill.category}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">중요도:</span>
                                  <span className={
                                    skill.importance === 'core' ? 'text-red-600' :
                                    skill.importance === 'important' ? 'text-blue-600' :
                                    'text-yellow-600'
                                  }>
                                    {skill.importance === 'core' ? '핵심' :
                                     skill.importance === 'important' ? '중요' : '유용'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">예상 시간:</span>
                                  <span>{skill.estimatedHours}시간</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">상태:</span>
                                  <span className={
                                    skill.isLearned ? 'text-green-600' :
                                    skill.isAvailable ? 'text-blue-600' : 'text-gray-500'
                                  }>
                                    {skill.isLearned ? '완료' :
                                     skill.isAvailable ? '학습 가능' : '잠금'}
                                  </span>
                                </div>
                                {skill.prerequisites.length > 0 && (
                                  <div>
                                    <span className="text-gray-600">선행 스킬:</span>
                                    <div className="mt-1">
                                      {skill.prerequisites.map((prereq, i) => (
                                        <span key={i} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs mr-1 mb-1">
                                          {prereq}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 그리드 보기 */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {selectedCategory === 'all' ? '전체 스킬 목록' : `${selectedCategory} 스킬 목록`}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className={`p-4 rounded-lg border-2 transition-all ${getSkillColor(skill)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{skill.name}</h4>
                  <div className="flex space-x-1">
                    {skill.isLearned && <span className="text-green-600">✓</span>}
                    {!skill.isAvailable && <span>🔒</span>}
                  </div>
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>카테고리:</span>
                    <span>{skill.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>단계:</span>
                    <span>{skill.level + 1}단계</span>
                  </div>
                  <div className="flex justify-between">
                    <span>예상 시간:</span>
                    <span>{skill.estimatedHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>중요도:</span>
                    <span className={
                      skill.importance === 'core' ? 'text-red-600' :
                      skill.importance === 'important' ? 'text-blue-600' :
                      'text-yellow-600'
                    }>
                      {skill.importance === 'core' ? '핵심' :
                       skill.importance === 'important' ? '중요' : '유용'}
                    </span>
                  </div>
                </div>
                
                {skill.prerequisites.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">선행 스킬:</div>
                    <div className="flex flex-wrap gap-1">
                      {skill.prerequisites.map((prereq, i) => (
                        <span key={i} className="px-1 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 학습 추천 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">🎯</span>
          추천 학습 순서
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">다음에 학습할 스킬</h4>
            <div className="space-y-2">
              {filteredSkills
                .filter(skill => skill.isAvailable && !skill.isLearned)
                .sort((a, b) => {
                  const importanceOrder = { core: 0, important: 1, useful: 2 };
                  return importanceOrder[a.importance] - importanceOrder[b.importance];
                })
                .slice(0, 5)
                .map((skill, index) => (
                  <div key={skill.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{skill.name}</div>
                      <div className="text-xs text-gray-600">{skill.category} • {skill.estimatedHours}시간</div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      skill.importance === 'core' ? 'bg-red-100 text-red-800' :
                      skill.importance === 'important' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {skill.importance === 'core' ? '핵심' :
                       skill.importance === 'important' ? '중요' : '유용'}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">잠금 해제 예정</h4>
            <div className="space-y-2">
              {filteredSkills
                .filter(skill => !skill.isAvailable)
                .slice(0, 5)
                .map((skill) => (
                  <div key={skill.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm mr-3">
                      🔒
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">{skill.name}</div>
                      <div className="text-xs text-gray-500">
                        선행: {skill.prerequisites.join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}