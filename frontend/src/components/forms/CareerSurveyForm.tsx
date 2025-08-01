"use client";

import { useState } from "react";
import { BasicInfoStep } from "./survey-steps/BasicInfoStep";
import { InterestStep } from "./survey-steps/InterestStep";
import { StrengthsStep } from "./survey-steps/StrengthsStep";
import { PersonalityStep } from "./survey-steps/PersonalityStep";

export interface SurveyData {
  // 기본 정보
  age: string;
  education: string;
  experience: string;
  location: string;
  
  // 관심사
  interests: string[];
  preferredIndustries: string[];
  workEnvironment: string;
  
  // 강점
  skills: string[];
  achievements: string[];
  workStyle: string;
  
  // 성격 유형
  personality: {
    extroversion: number; // 1-5 스케일
    conscientiousness: number;
    openness: number;
    agreeableness: number;
    neuroticism: number;
  };
  problemSolvingStyle: string;
  communicationStyle: string;
}

interface CareerSurveyFormProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: (data: SurveyData) => void;
}

export function CareerSurveyForm({ 
  currentStep, 
  onStepChange, 
  onComplete 
}: CareerSurveyFormProps) {
  const [surveyData, setSurveyData] = useState<Partial<SurveyData>>({
    personality: {
      extroversion: 3,
      conscientiousness: 3,
      openness: 3,
      agreeableness: 3,
      neuroticism: 3,
    }
  });

  const updateSurveyData = (newData: Partial<SurveyData>) => {
    setSurveyData(prev => ({
      ...prev,
      ...newData
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      onStepChange(currentStep + 1);
    } else {
      // 설문 완료
      onComplete(surveyData as SurveyData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return surveyData.age && surveyData.education && surveyData.experience;
      case 2:
        return surveyData.interests && surveyData.interests.length > 0;
      case 3:
        return surveyData.skills && surveyData.skills.length > 0;
      case 4:
        return surveyData.problemSolvingStyle && surveyData.communicationStyle;
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep 
            data={surveyData}
            onUpdate={updateSurveyData}
          />
        );
      case 2:
        return (
          <InterestStep 
            data={surveyData}
            onUpdate={updateSurveyData}
          />
        );
      case 3:
        return (
          <StrengthsStep 
            data={surveyData}
            onUpdate={updateSurveyData}
          />
        );
      case 4:
        return (
          <PersonalityStep 
            data={surveyData}
            onUpdate={updateSurveyData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* 단계별 컨텐츠 */}
      <div className="mb-8">
        {renderCurrentStep()}
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          이전
        </button>

        <div className="text-sm text-gray-500">
          {currentStep} / 4 단계
        </div>

        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === 4 ? "완료" : "다음"}
        </button>
      </div>
    </div>
  );
}