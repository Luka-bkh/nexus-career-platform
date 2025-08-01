"use client";

import React, { useState, useEffect } from 'react';
import { CodeEditor } from './CodeEditor';
import { AnalysisPanel } from './AnalysisPanel';

interface QuestData {
  id: string;
  title: string;
  content: {
    type: 'dialogue' | 'decision' | 'coding' | 'analysis' | 'collaboration' | 'technical_decision' | 'problem_solving' | 'retrospective';
    description: string;
    speaker?: string;
    backgroundImage?: string;
    options?: Array<{
      text: string;
      points: number;
    }>;
    codeTemplate?: string;
    expectedOutput?: string;
    hints?: string[];
    analysisData?: any;
    problem?: string;
    constraints?: string[];
  };
}

interface InteractionPanelProps {
  quest: QuestData;
  onInteraction: (type: string, input: any) => void;
  isLoading?: boolean;
}

export function InteractionPanel({ quest, onInteraction, isLoading = false }: InteractionPanelProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [analysisAnswer, setAnalysisAnswer] = useState<string>('');
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    // 퀘스트가 변경될 때 상태 초기화
    setSelectedOption(null);
    setUserInput('');
    setCode(quest.content.codeTemplate || '');
    setAnalysisAnswer('');
    setShowHints(false);
  }, [quest.id]);

  const handleSubmit = () => {
    if (isLoading) return;

    const interactionType = quest.content.type.toUpperCase();
    let input: any = {};

    switch (quest.content.type) {
      case 'dialogue':
        if (!selectedOption) return;
        input = { choice: selectedOption };
        break;
      
      case 'decision':
        if (!selectedOption) return;
        input = { choice: selectedOption, decision: selectedOption };
        break;
      
      case 'coding':
        if (!code.trim()) return;
        input = { code: code.trim() };
        break;
      
      case 'analysis':
        if (!analysisAnswer.trim()) return;
        input = { analysis: analysisAnswer.trim(), answer: analysisAnswer.trim() };
        break;
      
      case 'collaboration':
        if (!selectedOption) return;
        input = { approach: selectedOption, choice: selectedOption };
        break;
      
      case 'technical_decision':
        if (!selectedOption && !userInput.trim()) return;
        input = { choice: selectedOption || userInput.trim(), model: selectedOption || userInput.trim() };
        break;
      
      case 'problem_solving':
        if (!userInput.trim()) return;
        input = { solution: userInput.trim(), approach: userInput.trim() };
        break;
      
      case 'retrospective':
        if (!userInput.trim()) return;
        input = { reflection: userInput.trim(), thoughts: userInput.trim() };
        break;
      
      default:
        input = { input: userInput.trim() || selectedOption };
    }

    onInteraction(interactionType, input);
  };

  const isSubmitDisabled = () => {
    if (isLoading) return true;

    switch (quest.content.type) {
      case 'dialogue':
      case 'decision':
      case 'collaboration':
        return !selectedOption;
      case 'coding':
        return !code.trim();
      case 'analysis':
        return !analysisAnswer.trim();
      case 'technical_decision':
        return !selectedOption && !userInput.trim();
      case 'problem_solving':
      case 'retrospective':
        return !userInput.trim();
      default:
        return !selectedOption && !userInput.trim();
    }
  };

  const renderInteractionContent = () => {
    switch (quest.content.type) {
      case 'dialogue':
      case 'decision':
      case 'collaboration':
        return (
          <div className="space-y-3">
            {quest.content.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(option.text)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedOption === option.text
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm flex items-center justify-center mr-3 mt-0.5">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option.text}</span>
                  {selectedOption === option.text && (
                    <span className="text-blue-500 ml-2">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        );

      case 'coding':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">코딩 과제</h4>
              <p className="text-gray-700 text-sm mb-3">{quest.content.description}</p>
              {quest.content.expectedOutput && (
                <div className="text-xs text-gray-600">
                  <strong>예상 결과:</strong> {quest.content.expectedOutput}
                </div>
              )}
            </div>
            
            <CodeEditor
              value={code}
              onChange={setCode}
              language="python"
              placeholder="여기에 코드를 작성하세요..."
            />
            
            {quest.content.hints && quest.content.hints.length > 0 && (
              <div>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-blue-600 text-sm hover:underline flex items-center"
                >
                  💡 힌트 보기 {showHints ? '▲' : '▼'}
                </button>
                {showHints && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {quest.content.hints.map((hint, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'analysis':
        return (
          <div className="space-y-4">
            <AnalysisPanel
              data={quest.content.analysisData}
              onAnalysisChange={setAnalysisAnswer}
              value={analysisAnswer}
            />
          </div>
        );

      case 'technical_decision':
        return (
          <div className="space-y-4">
            {quest.content.options && quest.content.options.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">선택지</h4>
                {quest.content.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(option.text)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedOption === option.text
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm flex items-center justify-center mr-3 mt-0.5">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option.text}</span>
                      {selectedOption === option.text && (
                        <span className="text-blue-500 ml-2">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기술적 결정 사항을 입력하세요
                </label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="결정 내용과 그 이유를 자세히 설명해주세요..."
                />
              </div>
            )}
          </div>
        );

      case 'problem_solving':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">문제 상황</h4>
              <p className="text-gray-700 text-sm mb-3">{quest.content.problem}</p>
              {quest.content.constraints && quest.content.constraints.length > 0 && (
                <div>
                  <strong className="text-sm text-gray-600">제약사항:</strong>
                  <ul className="text-sm text-gray-600 mt-1 ml-4">
                    {quest.content.constraints.map((constraint, index) => (
                      <li key={index} className="list-disc">{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                해결 방안을 제시해주세요
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={5}
                placeholder="문제 분석과 해결 방안을 단계별로 설명해주세요..."
              />
            </div>
          </div>
        );

      case 'retrospective':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">성찰 시간</h4>
              <p className="text-blue-700 text-sm">
                지금까지의 경험을 돌아보고 배운 점과 개선할 점을 생각해보세요.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성찰 내용을 작성해주세요
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={5}
                placeholder="무엇을 배웠고, 어떤 점을 개선하고 싶은지 자유롭게 작성해주세요..."
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              응답을 입력하세요
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="여기에 응답을 입력하세요..."
            />
          </div>
        );
    }
  };

  const getSubmitButtonText = () => {
    switch (quest.content.type) {
      case 'coding':
        return '코드 제출';
      case 'analysis':
        return '분석 결과 제출';
      case 'decision':
      case 'technical_decision':
        return '결정하기';
      case 'problem_solving':
        return '해결방안 제출';
      case 'retrospective':
        return '성찰 완료';
      default:
        return '다음으로';
    }
  };

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="container mx-auto max-w-4xl p-6">
        <div className="space-y-6">
          {renderInteractionContent()}
          
          <div className="flex justify-end space-x-3">
            {quest.content.hints && quest.content.hints.length > 0 && quest.content.type === 'coding' && (
              <button
                onClick={() => setShowHints(!showHints)}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                💡 힌트
              </button>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
              className={`px-6 py-2 font-medium rounded-lg transition-all duration-200 ${
                isSubmitDisabled()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:transform active:scale-95'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  처리 중...
                </div>
              ) : (
                getSubmitButtonText()
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}