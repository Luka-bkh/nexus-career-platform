"use client";

import React, { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';

export function CreditBalance() {
  const [credits, setCredits] = useState<{ free: number; paid: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const profile = await userApi.getProfile();
      setCredits({
        free: profile.credits || 0,
        paid: profile.paidCredits || 0,
        total: (profile.credits || 0) + (profile.paidCredits || 0),
      });
    } catch (error) {
      console.error('Credits loading failed:', error);
      setCredits({ free: 0, paid: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getCreditColor = (total: number) => {
    if (total >= 5) return 'text-green-600 bg-green-100';
    if (total >= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCreditIcon = (total: number) => {
    if (total >= 5) return '💎';
    if (total >= 2) return '⭐';
    if (total >= 1) return '🪙';
    return '❌';
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!credits) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
        <span>❌</span>
        <span className="text-gray-600 text-sm">크레딧 정보 없음</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* 크레딧 표시 */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getCreditColor(credits.total)}`}>
        <span className="text-lg">{getCreditIcon(credits.total)}</span>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {credits.total} 크레딧
          </span>
          {credits.paid > 0 && (
            <span className="text-xs opacity-75">
              무료 {credits.free} + 유료 {credits.paid}
            </span>
          )}
        </div>
      </div>

      {/* 크레딧 충전 버튼 */}
      {credits.total < 3 && (
        <button
          onClick={() => {
            // TODO: 크레딧 충전 모달 또는 페이지로 이동
            alert('크레딧 충전 기능은 준비 중입니다.');
          }}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          충전하기
        </button>
      )}
    </div>
  );
}