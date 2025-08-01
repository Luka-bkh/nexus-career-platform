"use client";

import { SurveyData } from "../CareerSurveyForm";

interface InterestStepProps {
  data: Partial<SurveyData>;
  onUpdate: (data: Partial<SurveyData>) => void;
}

const interestOptions = [
  { id: "technology", label: "기술/IT", icon: "💻" },
  { id: "business", label: "비즈니스/경영", icon: "📊" },
  { id: "creative", label: "창작/예술", icon: "🎨" },
  { id: "education", label: "교육/연구", icon: "📚" },
  { id: "healthcare", label: "의료/보건", icon: "⚕️" },
  { id: "service", label: "서비스/접객", icon: "🤝" },
  { id: "manufacturing", label: "제조/생산", icon: "🏭" },
  { id: "construction", label: "건설/건축", icon: "🏗️" },
  { id: "agriculture", label: "농업/환경", icon: "🌱" },
  { id: "finance", label: "금융/보험", icon: "💰" },
  { id: "media", label: "미디어/방송", icon: "📺" },
  { id: "sports", label: "스포츠/레저", icon: "⚽" }
];

const industryOptions = [
  { id: "startup", label: "스타트업", icon: "🚀" },
  { id: "large_corp", label: "대기업", icon: "🏢" },
  { id: "public", label: "공공기관", icon: "🏛️" },
  { id: "ngo", label: "비영리단체", icon: "🤲" },
  { id: "freelance", label: "프리랜서", icon: "💼" },
  { id: "education_inst", label: "교육기관", icon: "🎓" }
];

const workEnvironmentOptions = [
  { id: "office", label: "사무실 근무", description: "안정적인 사무환경에서 근무" },
  { id: "remote", label: "재택근무", description: "집에서 자유롭게 근무" },
  { id: "hybrid", label: "하이브리드", description: "사무실과 재택을 혼합" },
  { id: "field", label: "현장근무", description: "다양한 현장에서 근무" },
  { id: "travel", label: "출장/여행", description: "여행하며 근무" }
];

export function InterestStep({ data, onUpdate }: InterestStepProps) {
  const handleInterestToggle = (interestId: string) => {
    const currentInterests = data.interests || [];
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter(id => id !== interestId)
      : [...currentInterests, interestId];
    
    onUpdate({ interests: newInterests });
  };

  const handleIndustryToggle = (industryId: string) => {
    const currentIndustries = data.preferredIndustries || [];
    const newIndustries = currentIndustries.includes(industryId)
      ? currentIndustries.filter(id => id !== industryId)
      : [...currentIndustries, industryId];
    
    onUpdate({ preferredIndustries: newIndustries });
  };

  const handleWorkEnvironmentChange = (environmentId: string) => {
    onUpdate({ workEnvironment: environmentId });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          관심사 및 선호도
        </h2>
        <p className="text-gray-600">
          어떤 분야에 관심이 있으시며, 어떤 환경에서 일하고 싶으신가요?
        </p>
      </div>

      {/* 관심 분야 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          관심 있는 분야를 선택해주세요 (최소 1개, 최대 5개) *
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {interestOptions.map((interest) => (
            <button
              key={interest.id}
              onClick={() => handleInterestToggle(interest.id)}
              className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                data.interests?.includes(interest.id)
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <div className="text-2xl mb-2">{interest.icon}</div>
              <div className="text-sm font-medium">{interest.label}</div>
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          선택됨: {data.interests?.length || 0}/5개
        </p>
      </div>

      {/* 선호 업종 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          선호하는 기업 유형을 선택해주세요 (복수 선택 가능)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {industryOptions.map((industry) => (
            <button
              key={industry.id}
              onClick={() => handleIndustryToggle(industry.id)}
              className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                data.preferredIndustries?.includes(industry.id)
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <div className="text-2xl mb-2">{industry.icon}</div>
              <div className="text-sm font-medium">{industry.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 근무 환경 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          선호하는 근무 환경을 선택해주세요 *
        </h3>
        <div className="space-y-3">
          {workEnvironmentOptions.map((env) => (
            <button
              key={env.id}
              onClick={() => handleWorkEnvironmentChange(env.id)}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                data.workEnvironment === env.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{env.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{env.description}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  data.workEnvironment === env.id
                    ? "border-primary-500 bg-primary-500"
                    : "border-gray-300"
                }`}>
                  {data.workEnvironment === env.id && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">선택 팁</p>
            <p>현재 관심사뿐만 아니라 앞으로 관심을 가질 수 있는 분야도 포함해서 선택해보세요. AI가 더 다양한 진로를 추천해드립니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}