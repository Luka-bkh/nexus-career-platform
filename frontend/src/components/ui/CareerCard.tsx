"use client";

import { CareerRecommendation } from "@/lib/api";

interface CareerCardProps {
  career: CareerRecommendation;
  rank: number;
  onSelect?: (career: CareerRecommendation) => void;
  onSimulate?: (career: CareerRecommendation) => void;
}

export function CareerCard({ career, rank, onSelect, onSimulate }: CareerCardProps) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  const getGrowthProspectIcon = (prospect: string) => {
    switch (prospect) {
      case 'high':
        return { icon: "📈", color: "text-green-600", label: "높음" };
      case 'medium':
        return { icon: "📊", color: "text-yellow-600", label: "보통" };
      case 'low':
        return { icon: "📉", color: "text-red-600", label: "낮음" };
      default:
        return { icon: "📊", color: "text-gray-600", label: "보통" };
    }
  };

  const getDemandIcon = (demand: string) => {
    switch (demand) {
      case 'high':
        return { icon: "🔥", color: "text-red-500", label: "높은 수요" };
      case 'medium':
        return { icon: "⭐", color: "text-yellow-500", label: "보통 수요" };
      case 'low':
        return { icon: "💼", color: "text-blue-500", label: "제한적 수요" };
      default:
        return { icon: "💼", color: "text-gray-500", label: "보통 수요" };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technology':
        return "💻";
      case 'Business':
        return "📊";
      case 'Design':
        return "🎨";
      case 'Education':
        return "📚";
      case 'Healthcare':
        return "⚕️";
      default:
        return "💼";
    }
  };

  const growthProspect = getGrowthProspectIcon(career.growthProspect);
  const demand = getDemandIcon(career.jobMarketDemand);

  return (
    <div className="card hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden">
      {/* 순위 배지 */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
          rank === 1 ? 'bg-yellow-500' : 
          rank === 2 ? 'bg-gray-400' : 
          rank === 3 ? 'bg-amber-600' : 
          'bg-primary-500'
        }`}>
          {rank}
        </div>
      </div>

      {/* 매치 스코어 */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(career.matchScore)}`}>
          {career.matchScore}% 매치
        </div>
      </div>

      <div className="pt-16 pb-6 px-6">
        {/* 직업 정보 */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">{getCategoryIcon(career.category)}</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {career.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {career.description}
          </p>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">💰</div>
            <div className="text-sm text-gray-600 mt-1">평균 연봉</div>
            <div className="text-sm font-medium text-gray-800">{career.averageSalary}</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-lg ${growthProspect.color}`}>{growthProspect.icon}</div>
            <div className="text-sm text-gray-600 mt-1">성장 전망</div>
            <div className="text-sm font-medium text-gray-800">{growthProspect.label}</div>
          </div>
        </div>

        {/* 시장 수요 */}
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-50 ${demand.color}`}>
            <span className="text-lg">{demand.icon}</span>
            <span className="text-sm font-medium">{demand.label}</span>
          </div>
        </div>

        {/* 필요 스킬 */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">주요 스킬</h4>
          <div className="flex flex-wrap gap-2">
            {career.requiredSkills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
            {career.requiredSkills.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{career.requiredSkills.length - 4}개 더
              </span>
            )}
          </div>
        </div>

        {/* 근무 환경 */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">근무 환경</h4>
          <div className="flex flex-wrap gap-2">
            {career.workEnvironment.map((env, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs font-medium rounded-full"
              >
                {env}
              </span>
            ))}
          </div>
        </div>

        {/* 학력 요구사항 */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            <span>{career.educationLevel}</span>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={() => onSelect?.(career)}
            className="btn-primary w-full"
          >
            상세 정보 보기
          </button>
          
          <button
            onClick={() => onSimulate?.(career)}
            className="btn-outline w-full"
          >
            🎮 시뮬레이션 체험하기
          </button>
        </div>
      </div>

      {/* 호버 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}