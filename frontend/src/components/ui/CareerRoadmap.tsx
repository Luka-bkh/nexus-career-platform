"use client";

interface RoadmapData {
  shortTerm: string[];
  mediumTerm: string[];
  longTerm: string[];
  timeline: Record<string, string>;
}

interface CareerRoadmapProps {
  careerTitle: string;
  roadmap: RoadmapData;
  className?: string;
}

export function CareerRoadmap({ careerTitle, roadmap, className = "" }: CareerRoadmapProps) {
  const timelineEntries = Object.entries(roadmap.timeline);

  const getPhaseIcon = (index: number) => {
    const icons = ["🚀", "📈", "🎯", "👑"];
    return icons[index] || "⭐";
  };

  const getPhaseColor = (index: number) => {
    const colors = [
      "border-green-500 bg-green-50 text-green-700",
      "border-blue-500 bg-blue-50 text-blue-700", 
      "border-purple-500 bg-purple-50 text-purple-700",
      "border-yellow-500 bg-yellow-50 text-yellow-700"
    ];
    return colors[index] || "border-gray-500 bg-gray-50 text-gray-700";
  };

  return (
    <div className={`card ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          🗺️ {careerTitle} 진로 로드맵
        </h3>
        <p className="text-gray-600">
          체계적인 단계별 계획으로 목표 직업에 도달하세요
        </p>
      </div>

      {/* 타임라인 시각화 */}
      <div className="relative">
        {/* 중앙 라인 */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-200 h-full"></div>

        <div className="space-y-8">
          {timelineEntries.map(([period, description], index) => (
            <div key={period} className="relative">
              {/* 타임라인 포인트 */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-4">
                <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-lg ${getPhaseColor(index)}`}>
                  {getPhaseIcon(index)}
                </div>
              </div>

              {/* 컨텐츠 */}
              <div className={`ml-auto w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 ml-0 w-5/12'}`}>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-lg font-semibold ${index % 2 === 0 ? 'order-2' : 'order-1'}`}>
                      {period}
                    </h4>
                    <div className={`px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700 ${index % 2 === 0 ? 'order-1' : 'order-2'}`}>
                      {index === 0 ? '시작' : index === timelineEntries.length - 1 ? '목표' : `${index}단계`}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 단계별 상세 목표 */}
      <div className="mt-8 space-y-6">
        {/* 단기 목표 */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <h4 className="text-lg font-semibold text-green-800">단기 목표 (0-6개월)</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {roadmap.shortTerm.map((goal, index) => (
              <div key={index} className="flex items-center text-sm text-green-700">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {goal}
              </div>
            ))}
          </div>
        </div>

        {/* 중기 목표 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">2</span>
            </div>
            <h4 className="text-lg font-semibold text-blue-800">중기 목표 (6-18개월)</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {roadmap.mediumTerm.map((goal, index) => (
              <div key={index} className="flex items-center text-sm text-blue-700">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {goal}
              </div>
            ))}
          </div>
        </div>

        {/* 장기 목표 */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">3</span>
            </div>
            <h4 className="text-lg font-semibold text-purple-800">장기 목표 (18개월+)</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {roadmap.longTerm.map((goal, index) => (
              <div key={index} className="flex items-center text-sm text-purple-700">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {goal}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="mt-6 flex space-x-3">
        <button className="btn-primary flex-1">
          📅 상세 계획 다운로드
        </button>
        <button className="btn-outline flex-1">
          🔔 진행 상황 알림 설정
        </button>
      </div>

      {/* 팁 섹션 */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <div className="text-yellow-500 mr-3 mt-0.5">💡</div>
          <div>
            <h5 className="text-sm font-semibold text-yellow-800 mb-1">성공 팁</h5>
            <p className="text-xs text-yellow-700">
              각 단계별 목표를 달성하면서 포트폴리오를 지속적으로 업데이트하고, 
              네트워킹 활동을 통해 업계 전문가들과 관계를 구축하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}