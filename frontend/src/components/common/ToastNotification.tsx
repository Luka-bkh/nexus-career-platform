"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ToastNotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'reward';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  reward?: {
    credits?: number;
    xp?: number;
    type?: string;
  };
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  reward,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 마운트 후 애니메이션 시작
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // 자동 닫기
    const autoClose = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoClose);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'reward':
        return 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'reward':
        return '🎉';
      default:
        return 'ℹ️';
    }
  };

  const toastContent = (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform ${
        isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className={`rounded-lg border shadow-lg p-4 ${getTypeStyles()}`}>
        <div className="flex items-start space-x-3">
          <div className="text-2xl flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold truncate">
                {title}
              </h4>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 ml-2"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm opacity-90 mb-2">
              {message}
            </p>
            
            {/* 보상 정보 */}
            {type === 'reward' && reward && (
              <div className="flex items-center space-x-3 mt-2 p-2 bg-white bg-opacity-50 rounded-lg">
                {reward.credits && reward.credits > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">💎</span>
                    <span className="text-sm font-medium">+{reward.credits}</span>
                  </div>
                )}
                {reward.xp && reward.xp > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">⭐</span>
                    <span className="text-sm font-medium">+{reward.xp} XP</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* 진행 바 */}
        <div className="mt-3">
          <div 
            className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden"
          >
            <div 
              className="h-full bg-current opacity-60 transition-all duration-300 ease-linear"
              style={{
                animation: `toast-progress ${duration}ms linear forwards`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // 포털을 통해 body에 렌더링
  if (typeof window === 'undefined') return null;
  
  return createPortal(toastContent, document.body);
};

// 토스트 관리자 컴포넌트
interface Toast extends ToastNotificationProps {
  id: string;
}

interface ToastManagerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ toasts, removeToast }) => {
  return (
    <>
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
      <style jsx global>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </>
  );
};

// 토스트 훅
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id' | 'onClose'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    const newToast: Toast = {
      ...toast,
      id,
      onClose: removeToast,
    };
    
    setToasts(prev => [...prev, newToast]);

    // 성취감을 위한 사운드 효과 (옵션)
    if (toast.type === 'reward') {
      try {
        // Web Audio API를 사용한 간단한 성공 사운드
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        // 사운드 재생 실패는 조용히 무시
        console.debug('Audio playback failed:', error);
      }
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title: string, message: string, duration?: number) => 
    addToast({ type: 'success', title, message, duration });

  const showError = (title: string, message: string, duration?: number) => 
    addToast({ type: 'error', title, message, duration });

  const showWarning = (title: string, message: string, duration?: number) => 
    addToast({ type: 'warning', title, message, duration });

  const showInfo = (title: string, message: string, duration?: number) => 
    addToast({ type: 'info', title, message, duration });

  const showReward = (
    title: string, 
    message: string, 
    reward: { credits?: number; xp?: number; type?: string },
    duration: number = 7000
  ) => addToast({ type: 'reward', title, message, reward, duration });

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showReward,
  };
};