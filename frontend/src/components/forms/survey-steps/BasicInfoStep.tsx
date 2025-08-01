"use client";

import { SurveyData } from "../CareerSurveyForm";

interface BasicInfoStepProps {
  data: Partial<SurveyData>;
  onUpdate: (data: Partial<SurveyData>) => void;
}

export function BasicInfoStep({ data, onUpdate }: BasicInfoStepProps) {
  const handleInputChange = (field: keyof SurveyData, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          기본 정보
        </h2>
        <p className="text-gray-600">
          맞춤형 진로 추천을 위해 기본 정보를 알려주세요
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 연령대 */}
        <div>
          <label className="form-label">
            연령대 *
          </label>
          <select
            value={data.age || ""}
            onChange={(e) => handleInputChange("age", e.target.value)}
            className="form-input"
            required
          >
            <option value="">선택해주세요</option>
            <option value="10대">10대</option>
            <option value="20대">20대</option>
            <option value="30대">30대</option>
            <option value="40대">40대</option>
            <option value="50대">50대</option>
            <option value="60대 이상">60대 이상</option>
          </select>
        </div>

        {/* 최종 학력 */}
        <div>
          <label className="form-label">
            최종 학력 *
          </label>
          <select
            value={data.education || ""}
            onChange={(e) => handleInputChange("education", e.target.value)}
            className="form-input"
            required
          >
            <option value="">선택해주세요</option>
            <option value="중학교 졸업">중학교 졸업</option>
            <option value="고등학교 졸업">고등학교 졸업</option>
            <option value="전문대학 졸업">전문대학 졸업</option>
            <option value="대학교 졸업">대학교 졸업</option>
            <option value="대학원 졸업">대학원 졸업</option>
          </select>
        </div>

        {/* 경력 */}
        <div>
          <label className="form-label">
            직장 경력 *
          </label>
          <select
            value={data.experience || ""}
            onChange={(e) => handleInputChange("experience", e.target.value)}
            className="form-input"
            required
          >
            <option value="">선택해주세요</option>
            <option value="없음">없음 (신입)</option>
            <option value="1년 미만">1년 미만</option>
            <option value="1-3년">1-3년</option>
            <option value="3-5년">3-5년</option>
            <option value="5-10년">5-10년</option>
            <option value="10년 이상">10년 이상</option>
          </select>
        </div>

        {/* 거주 지역 */}
        <div>
          <label className="form-label">
            거주 지역
          </label>
          <select
            value={data.location || ""}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="form-input"
          >
            <option value="">선택해주세요</option>
            <option value="서울">서울</option>
            <option value="경기">경기</option>
            <option value="인천">인천</option>
            <option value="부산">부산</option>
            <option value="대구">대구</option>
            <option value="광주">광주</option>
            <option value="대전">대전</option>
            <option value="울산">울산</option>
            <option value="세종">세종</option>
            <option value="강원">강원</option>
            <option value="충북">충북</option>
            <option value="충남">충남</option>
            <option value="전북">전북</option>
            <option value="전남">전남</option>
            <option value="경북">경북</option>
            <option value="경남">경남</option>
            <option value="제주">제주</option>
            <option value="해외">해외</option>
          </select>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">개인정보 보호 안내</p>
            <p>입력하신 정보는 진로 추천 목적으로만 사용되며, 별도 동의 없이 외부에 제공되지 않습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}