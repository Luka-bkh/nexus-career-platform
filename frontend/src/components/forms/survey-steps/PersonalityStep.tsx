"use client";

import { SurveyData } from "../CareerSurveyForm";

interface PersonalityStepProps {
  data: Partial<SurveyData>;
  onUpdate: (data: Partial<SurveyData>) => void;
}

const personalityTraits = [
  {
    key: "extroversion",
    label: "외향성",
    description: "사람들과의 상호작용 선호도",
    leftLabel: "내향적",
    rightLabel: "외향적",
    leftDesc: "혼자 시간을 보내며 에너지를 얻음",
    rightDesc: "사람들과 함께하며 에너지를 얻음"
  },
  {
    key: "conscientiousness",
    label: "성실성",
    description: "계획성과 자기 통제력",
    leftLabel: "유연한",
    rightLabel: "체계적",
    leftDesc: "상황에 따라 유연하게 대응",
    rightDesc: "계획을 세우고 체계적으로 진행"
  },
  {
    key: "openness",
    label: "개방성",
    description: "새로운 경험에 대한 수용도",
    leftLabel: "전통적",
    rightLabel: "혁신적",
    leftDesc: "검증된 방법을 선호",
    rightDesc: "새로운 아이디어와 변화를 추구"
  },
  {
    key: "agreeableness",
    label: "호감성",
    description: "타인에 대한 협조적 태도",
    leftLabel: "경쟁적",
    rightLabel: "협조적",
    leftDesc: "개인의 목표 달성을 우선시",
    rightDesc: "타인과의 조화를 중요시"
  },
  {
    key: "neuroticism",
    label: "안정성",
    description: "감정적 안정성과 스트레스 관리",
    leftLabel: "안정적",
    rightLabel: "민감한",
    leftDesc: "스트레스 상황에서 침착함",
    rightDesc: "감정적으로 민감하고 반응적"
  }
];

const problemSolvingStyles = [
  {
    id: "analytical",
    label: "분석적 사고",
    description: "데이터와 논리를 바탕으로 차근차근 분석",
    icon: "🔍"
  },
  {
    id: "creative",
    label: "창의적 사고",
    description: "독창적이고 새로운 관점에서 접근",
    icon: "💡"
  },
  {
    id: "practical",
    label: "실용적 사고",
    description: "현실적이고 효율적인 해결책을 추구",
    icon: "🛠️"
  },
  {
    id: "collaborative",
    label: "협력적 사고",
    description: "다른 사람들과 함께 의견을 나누며 해결",
    icon: "🤝"
  },
  {
    id: "intuitive",
    label: "직감적 사고",
    description: "경험과 직감을 바탕으로 빠른 판단",
    icon: "⚡"
  }
];

const communicationStyles = [
  {
    id: "direct",
    label: "직접적",
    description: "명확하고 솔직하게 의견을 표현",
    icon: "🎯"
  },
  {
    id: "diplomatic",
    label: "외교적",
    description: "상대방을 배려하며 신중하게 표현",
    icon: "🤝"
  },
  {
    id: "enthusiastic",
    label: "열정적",
    description: "에너지 넘치게 적극적으로 소통",
    icon: "🔥"
  },
  {
    id: "supportive",
    label: "지지적",
    description: "경청하고 격려하며 소통",
    icon: "💙"
  },
  {
    id: "analytical_comm",
    label: "분석적",
    description: "사실과 데이터를 중심으로 소통",
    icon: "📊"
  }
];

export function PersonalityStep({ data, onUpdate }: PersonalityStepProps) {
  const handlePersonalityChange = (trait: string, value: number) => {
    const personality = data.personality || {
      extroversion: 3,
      conscientiousness: 3,
      openness: 3,
      agreeableness: 3,
      neuroticism: 3,
    };
    
    onUpdate({
      personality: {
        ...personality,
        [trait]: value
      }
    });
  };

  const handleProblemSolvingChange = (style: string) => {
    onUpdate({ problemSolvingStyle: style });
  };

  const handleCommunicationChange = (style: string) => {
    onUpdate({ communicationStyle: style });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          성격 및 업무 스타일
        </h2>
        <p className="text-gray-600">
          본인의 성격과 문제해결 방식, 소통 스타일을 알려주세요
        </p>
      </div>

      {/* 성격 특성 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          성격 특성을 평가해주세요
        </h3>
        <div className="space-y-6">
          {personalityTraits.map((trait) => {
            const currentValue = data.personality?.[trait.key as keyof typeof data.personality] || 3;
            
            return (
              <div key={trait.key} className="bg-gray-50 rounded-lg p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900">{trait.label}</h4>
                  <p className="text-sm text-gray-600">{trait.description}</p>
                </div>
                
                <div className="space-y-4">
                  {/* 레이블 */}
                  <div className="flex justify-between text-sm">
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{trait.leftLabel}</div>
                      <div className="text-gray-600">{trait.leftDesc}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{trait.rightLabel}</div>
                      <div className="text-gray-600">{trait.rightDesc}</div>
                    </div>
                  </div>
                  
                  {/* 슬라이더 */}
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={currentValue}
                      onChange={(e) => handlePersonalityChange(trait.key, Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-gray-700">
                    현재 선택: <strong>{currentValue}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 문제해결 스타일 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          문제해결 스타일을 선택해주세요 *
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problemSolvingStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleProblemSolvingChange(style.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                data.problemSolvingStyle === style.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">{style.icon}</div>
                <div className="font-medium text-gray-900">{style.label}</div>
              </div>
              <div className="text-sm text-gray-600 text-center">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 소통 스타일 */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          소통 스타일을 선택해주세요 *
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communicationStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleCommunicationChange(style.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                data.communicationStyle === style.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">{style.icon}</div>
                <div className="font-medium text-gray-900">{style.label}</div>
              </div>
              <div className="text-sm text-gray-600 text-center">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 완료 안내 메시지 */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-primary-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-primary-800">
            <p className="font-medium mb-2">🎉 거의 완료되었습니다!</p>
            <p className="text-sm">
              모든 정보를 입력하시면 AI가 당신만의 맞춤형 진로를 분석하여 추천해드립니다. 
              결과를 확인하고 흥미로운 직업 시뮬레이션도 체험해보세요!
            </p>
          </div>
        </div>
      </div>

      {/* 슬라이더 스타일링 */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}