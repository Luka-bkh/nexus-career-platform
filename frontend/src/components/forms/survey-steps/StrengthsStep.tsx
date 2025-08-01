"use client";

import { SurveyData } from "../CareerSurveyForm";

interface StrengthsStepProps {
  data: Partial<SurveyData>;
  onUpdate: (data: Partial<SurveyData>) => void;
}

const skillOptions = [
  { id: "communication", label: "의사소통", icon: "💬", category: "소프트 스킬" },
  { id: "leadership", label: "리더십", icon: "👑", category: "소프트 스킬" },
  { id: "problem_solving", label: "문제해결", icon: "🧩", category: "소프트 스킬" },
  { id: "creativity", label: "창의성", icon: "💡", category: "소프트 스킬" },
  { id: "analytical", label: "분석력", icon: "📊", category: "소프트 스킬" },
  { id: "teamwork", label: "팀워크", icon: "🤝", category: "소프트 스킬" },
  { id: "programming", label: "프로그래밍", icon: "💻", category: "기술 스킬" },
  { id: "design", label: "디자인", icon: "🎨", category: "기술 스킬" },
  { id: "marketing", label: "마케팅", icon: "📢", category: "기술 스킬" },
  { id: "finance", label: "재무관리", icon: "💰", category: "기술 스킬" },
  { id: "writing", label: "글쓰기", icon: "✍️", category: "기술 스킬" },
  { id: "languages", label: "외국어", icon: "🌍", category: "기술 스킬" }
];

const achievementOptions = [
  { id: "academic", label: "학업 성취", description: "우수한 성적, 졸업장, 자격증 등" },
  { id: "project", label: "프로젝트 성공", description: "개인/팀 프로젝트 완성 및 성과" },
  { id: "award", label: "수상 경력", description: "공모전, 대회, 인증 등에서 수상" },
  { id: "volunteer", label: "봉사활동", description: "지속적인 사회봉사 및 기여" },
  { id: "work", label: "업무 성과", description: "직장에서의 성과 및 승진" },
  { id: "entrepreneurship", label: "창업/사업", description: "사업 시작 및 운영 경험" },
  { id: "skill_cert", label: "기술 자격증", description: "전문 기술 관련 자격증 취득" },
  { id: "hobby", label: "취미 성취", description: "개인 취미에서의 특별한 성과" }
];

const workStyleOptions = [
  { 
    id: "independent", 
    label: "독립적", 
    description: "혼자서도 능률적으로 일할 수 있음",
    icon: "🚀"
  },
  { 
    id: "collaborative", 
    label: "협력적", 
    description: "팀과 함께 일할 때 최고의 성과를 냄",
    icon: "🤝"
  },
  { 
    id: "detail_oriented", 
    label: "세심함", 
    description: "꼼꼼하고 정확한 작업을 선호함",
    icon: "🔍"
  },
  { 
    id: "big_picture", 
    label: "큰 그림", 
    description: "전체적인 흐름과 방향을 보는 것을 선호함",
    icon: "🗺️"
  },
  { 
    id: "innovative", 
    label: "혁신적", 
    description: "새로운 아이디어와 방법을 추구함",
    icon: "💡"
  },
  { 
    id: "systematic", 
    label: "체계적", 
    description: "정해진 프로세스와 규칙을 따르는 것을 선호함",
    icon: "📋"
  }
];

export function StrengthsStep({ data, onUpdate }: StrengthsStepProps) {
  const handleSkillToggle = (skillId: string) => {
    const currentSkills = data.skills || [];
    const newSkills = currentSkills.includes(skillId)
      ? currentSkills.filter(id => id !== skillId)
      : [...currentSkills, skillId];
    
    onUpdate({ skills: newSkills });
  };

  const handleAchievementToggle = (achievementId: string) => {
    const currentAchievements = data.achievements || [];
    const newAchievements = currentAchievements.includes(achievementId)
      ? currentAchievements.filter(id => id !== achievementId)
      : [...currentAchievements, achievementId];
    
    onUpdate({ achievements: newAchievements });
  };

  const handleWorkStyleChange = (styleId: string) => {
    onUpdate({ workStyle: styleId });
  };

  // 스킬을 카테고리별로 그룹화
  const skillsByCategory = skillOptions.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skillOptions>);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          강점 및 경험
        </h2>
        <p className="text-gray-600">
          본인의 강점과 주요 성취, 선호하는 업무 스타일을 알려주세요
        </p>
      </div>

      {/* 보유 스킬 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          보유하고 있는 스킬을 선택해주세요 (최소 1개, 최대 8개) *
        </h3>
        
        {Object.entries(skillsByCategory).map(([category, skills]) => (
          <div key={category} className="mb-6">
            <h4 className="text-lg font-medium text-gray-700 mb-3">{category}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => handleSkillToggle(skill.id)}
                  className={`p-3 border-2 rounded-lg text-center transition-all duration-200 ${
                    data.skills?.includes(skill.id)
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div className="text-xl mb-1">{skill.icon}</div>
                  <div className="text-sm font-medium">{skill.label}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
        
        <p className="text-sm text-gray-500 mt-2">
          선택됨: {data.skills?.length || 0}/8개
        </p>
      </div>

      {/* 주요 성취 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          주요 성취나 경험을 선택해주세요 (복수 선택 가능)
        </h3>
        <div className="space-y-3">
          {achievementOptions.map((achievement) => (
            <button
              key={achievement.id}
              onClick={() => handleAchievementToggle(achievement.id)}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                data.achievements?.includes(achievement.id)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{achievement.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{achievement.description}</div>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  data.achievements?.includes(achievement.id)
                    ? "border-primary-500 bg-primary-500"
                    : "border-gray-300"
                }`}>
                  {data.achievements?.includes(achievement.id) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 업무 스타일 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          선호하는 업무 스타일을 선택해주세요 *
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {workStyleOptions.map((style) => (
            <button
              key={style.id}
              onClick={() => handleWorkStyleChange(style.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                data.workStyle === style.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start">
                <div className="text-2xl mr-3">{style.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{style.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{style.description}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-3 ${
                  data.workStyle === style.id
                    ? "border-primary-500 bg-primary-500"
                    : "border-gray-300"
                }`}>
                  {data.workStyle === style.id && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">강점 발견하기</p>
            <p>작은 성취도 소중합니다. 자신을 과소평가하지 말고 객관적으로 강점을 인정해보세요. 이는 진로 선택에 중요한 지표가 됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}