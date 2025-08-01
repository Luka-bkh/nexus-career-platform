"use client";

import React, { useState, useEffect, useRef } from 'react';
import { simulationApi } from '@/lib/api';
import { InteractionPanel } from './InteractionPanel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CreditBalance } from '@/components/ui/CreditBalance';

interface SimulationSceneProps {
  sessionData: {
    sessionId: string;
    currentState: any;
    currentQuest: any;
    resumed: boolean;
    message: string;
  };
  scenarioDetail: any;
  onSessionEnd: () => void;
}

interface GameState {
  sessionId: string;
  currentChapter: string;
  currentQuest: string;
  progress: number;
  score: number;
  skillLevels: Record<string, number>;
  badges: string[];
  gameVariables: Record<string, any>;
}

interface QuestData {
  id: string;
  title: string;
  content: {
    type: 'dialogue' | 'decision' | 'coding' | 'analysis';
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
  };
}

interface AIResponse {
  type: 'positive' | 'neutral' | 'negative' | 'guidance';
  message: string;
  score: number;
  skillsGained?: Record<string, number>;
  nextSuggestion?: string;
  encouragement?: string;
  learningPoint?: string;
  characterResponse?: {
    speaker: string;
    dialogue: string;
    emotion: string;
  };
}

export function SimulationScene({ sessionData, scenarioDetail, onSessionEnd }: SimulationSceneProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentQuest, setCurrentQuest] = useState<QuestData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [typingEffect, setTypingEffect] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeSimulation();
  }, [sessionData]);

  useEffect(() => {
    if (currentQuest?.content?.description) {
      startTypingEffect(currentQuest.content.description);
    }
  }, [currentQuest]);

  const initializeSimulation = async () => {
    try {
      setIsLoading(true);
      
      // 세션 상태 로드
      const state = await simulationApi.getSimulationState(sessionData.sessionId);
      setGameState(state.currentState);
      
      // 현재 퀘스트 데이터 로드 (실제로는 시나리오 데이터에서 가져와야 함)
      const mockQuest: QuestData = {
        id: 'quest-1-1',
        title: '첫 출근과 팀 미팅',
        content: {
          type: 'dialogue',
          description: '안녕하세요! 오늘부터 함께 일하게 된 신입 개발자님이시죠? 저는 박현수 팀장입니다. 오늘 새로운 프로젝트가 시작되는데, 감정 분석 모델을 개발하는 업무를 맡게 될 예정입니다. 어떤 질문이 있으시나요?',
          speaker: '박현수 팀장',
          backgroundImage: '/images/scenarios/office-meeting.jpg',
          options: [
            { text: '프로젝트의 목표와 요구사항에 대해 자세히 알려주세요.', points: 8 },
            { text: '사용할 기술 스택과 개발 환경에 대해 궁금합니다.', points: 7 },
            { text: '팀원들과 역할 분담은 어떻게 되나요?', points: 6 },
            { text: '네, 잘 부탁드립니다!', points: 3 }
          ]
        }
      };
      
      setCurrentQuest(mockQuest);
      
    } catch (error) {
      console.error('시뮬레이션 초기화 실패:', error);
      setError('시뮬레이션을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const startTypingEffect = (text: string) => {
    setIsTyping(true);
    setTypingEffect('');
    
    let index = 0;
    const typeNextChar = () => {
      if (index < text.length) {
        setTypingEffect(prev => prev + text[index]);
        index++;
        typingTimeoutRef.current = setTimeout(typeNextChar, 50);
      } else {
        setIsTyping(false);
      }
    };
    
    typeNextChar();
  };

  const handleInteraction = async (interactionType: string, userInput: any) => {
    if (!gameState || !currentQuest) return;

    try {
      setIsLoading(true);
      
      const response = await simulationApi.interact(gameState.sessionId, {
        questId: currentQuest.id,
        interactionType,
        userInput,
      });

      const aiResponse: AIResponse = response.interaction.aiResponse;
      setLastResponse(aiResponse);

      // 게임 상태 업데이트
      setGameState(response.updatedState);

      // 다음 퀘스트로 이동
      if (response.nextQuest && !response.isSimulationCompleted) {
        setTimeout(() => {
          setCurrentQuest(response.nextQuest.quest);
          setLastResponse(null);
        }, 3000); // 3초 후 다음 퀘스트로
      } else if (response.isSimulationCompleted) {
        // 시뮬레이션 완료
        setTimeout(() => {
          handleSimulationComplete();
        }, 3000);
      }

    } catch (error: any) {
      console.error('상호작용 처리 실패:', error);
      setError(error.message || '상호작용 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulationComplete = async () => {
    if (!gameState) return;

    try {
      const result = await simulationApi.completeSimulation(gameState.sessionId);
      onSessionEnd();
      // 결과 페이지로 이동하거나 결과 표시
    } catch (error) {
      console.error('시뮬레이션 완료 처리 실패:', error);
    }
  };

  const handlePause = async () => {
    if (!gameState) return;

    try {
      await simulationApi.pauseSimulation(gameState.sessionId);
      setIsPaused(true);
      setShowPauseMenu(true);
    } catch (error) {
      console.error('일시정지 실패:', error);
    }
  };

  const handleResume = async () => {
    if (!gameState) return;

    try {
      await simulationApi.resumeSimulation(gameState.sessionId);
      setIsPaused(false);
      setShowPauseMenu(false);
    } catch (error) {
      console.error('재개 실패:', error);
    }
  };

  const handleExit = () => {
    setShowPauseMenu(false);
    onSessionEnd();
  };

  const getBackgroundStyle = () => {
    if (currentQuest?.content?.backgroundImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${currentQuest.content.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    };
  };

  if (isLoading && !gameState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>시뮬레이션을 시작하는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button
            onClick={onSessionEnd}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            나가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={getBackgroundStyle()}>
      {/* 상단 HUD */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-white font-semibold">{scenarioDetail.title}</h2>
              {gameState && (
                <ProgressBar 
                  current={(gameState.progress * 100)} 
                  total={100} 
                  className="w-40"
                />
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <CreditBalance />
              
              {gameState && (
                <div className="flex items-center space-x-4 text-white text-sm">
                  <div className="flex items-center">
                    <span className="mr-1">🏆</span>
                    <span>{gameState.score}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">🎖️</span>
                    <span>{gameState.badges.length}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handlePause}
                className="px-3 py-1 bg-white bg-opacity-20 text-white rounded hover:bg-opacity-30"
              >
                ⏸️ 일시정지
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 시뮬레이션 영역 */}
      <div className="pt-16 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col justify-end">
          {/* 스토리 텍스트 영역 */}
          <div className="bg-black bg-opacity-70 backdrop-blur-sm text-white p-8">
            <div className="container mx-auto max-w-4xl">
              {currentQuest && (
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    {currentQuest.content.speaker && (
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold">
                            {currentQuest.content.speaker.charAt(0)}
                          </span>
                        </div>
                        <span className="text-blue-300 font-medium">
                          {currentQuest.content.speaker}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4">{currentQuest.title}</h3>
                  
                  <div className="text-lg leading-relaxed min-h-[60px]">
                    {typingEffect}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </div>
                </div>
              )}

              {/* AI 응답 표시 */}
              {lastResponse && (
                <div className="mb-6 p-4 rounded-lg bg-blue-900 bg-opacity-50 border border-blue-400">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {lastResponse.type === 'positive' && <span className="text-green-400 text-xl">✅</span>}
                      {lastResponse.type === 'neutral' && <span className="text-blue-400 text-xl">ℹ️</span>}
                      {lastResponse.type === 'guidance' && <span className="text-yellow-400 text-xl">💡</span>}
                      {lastResponse.type === 'negative' && <span className="text-red-400 text-xl">❌</span>}
                    </div>
                    <div className="flex-1">
                      <p className="text-white mb-2">{lastResponse.message}</p>
                      {lastResponse.encouragement && (
                        <p className="text-green-300 text-sm">💪 {lastResponse.encouragement}</p>
                      )}
                      {lastResponse.learningPoint && (
                        <p className="text-blue-300 text-sm">📚 {lastResponse.learningPoint}</p>
                      )}
                      {lastResponse.nextSuggestion && (
                        <p className="text-yellow-300 text-sm">💡 {lastResponse.nextSuggestion}</p>
                      )}
                      
                      <div className="flex items-center mt-2 space-x-4 text-sm">
                        <span className="text-yellow-400">+{lastResponse.score} 점</span>
                        {lastResponse.skillsGained && Object.keys(lastResponse.skillsGained).length > 0 && (
                          <span className="text-purple-400">
                            스킬 UP: {Object.keys(lastResponse.skillsGained).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 상호작용 패널 */}
          {currentQuest && !lastResponse && (
            <InteractionPanel
              quest={currentQuest}
              onInteraction={handleInteraction}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* 일시정지 메뉴 */}
      {showPauseMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">게임 일시정지</h3>
            
            <div className="space-y-4">
              <button
                onClick={handleResume}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                계속하기
              </button>
              
              <button
                onClick={handleExit}
                className="w-full py-3 px-4 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700"
              >
                나가기
              </button>
            </div>
            
            {gameState && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>진행률:</span>
                    <span>{Math.round(gameState.progress * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>현재 점수:</span>
                    <span>{gameState.score}점</span>
                  </div>
                  <div className="flex justify-between">
                    <span>획득 배지:</span>
                    <span>{gameState.badges.length}개</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">처리 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}