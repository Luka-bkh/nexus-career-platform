"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CareerSurveyForm } from "@/components/forms/CareerSurveyForm";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Link from "next/link";

export default function SurveyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleSurveyComplete = async (data: any) => {
    try {
      console.log("설문 완료:", data);
      
      // 설문 데이터 저장 (실제 API 연동은 추후 구현)
      // const { surveyId } = await surveyApi.submitSurvey(data);
      
      // 임시로 결과 페이지로 이동 (설문 데이터와 함께)
      const mockSurveyId = 'survey_' + Date.now();
      router.push(`/onboarding/recommendation?surveyId=${mockSurveyId}`);
      
    } catch (error) {
      console.error('설문 제출 실패:', error);
      alert('설문 제출에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              홈으로 돌아가기
            </Link>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              진로 적성 검사
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              당신의 관심사, 강점, 성격을 분석하여 최적의 진로를 추천해드립니다
            </p>
            
            {/* 진행률 표시 */}
            <div className="max-w-md mx-auto">
              <ProgressBar 
                current={currentStep} 
                total={totalSteps}
                className="mb-4"
              />
              <p className="text-sm text-gray-500">
                {currentStep} / {totalSteps} 단계
              </p>
            </div>
          </div>

          {/* 설문 폼 */}
          <div className="card max-w-3xl mx-auto">
            <CareerSurveyForm 
              currentStep={currentStep}
              onStepChange={handleStepChange}
              onComplete={handleSurveyComplete}
            />
          </div>

          {/* 도움말 */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    설문 작성 안내
                  </h3>
                  <ul className="text-blue-800 space-y-1">
                    <li>• 정확한 분석을 위해 솔직하게 답변해주세요</li>
                    <li>• 각 단계마다 저장되므로 언제든 중단 후 이어서 진행 가능합니다</li>
                    <li>• 모든 설문 완료 시 개인 맞춤형 진로 결과를 받아보실 수 있습니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}