"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await authApi.login(formData);
      
      // 토큰 저장
      localStorage.setItem('token', response.token);
      
      // 대시보드로 리다이렉트
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="text-3xl font-bold text-blue-600">🔗</div>
            <h1 className="text-2xl font-bold text-gray-900">Nexus Career</h1>
          </Link>
          <p className="text-gray-600 mt-2">로그인하여 진로 여정을 계속하세요</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">로그인</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* 구분선 */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>
          </div>

          {/* 소셜 로그인 (추후 구현) */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => alert('Google 로그인은 준비 중입니다.')}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 로그인
            </button>

            <button
              type="button"
              onClick={() => alert('카카오 로그인은 준비 중입니다.')}
              className="w-full py-3 px-4 bg-yellow-400 rounded-lg font-medium text-gray-900 hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <span className="text-lg mr-2">💬</span>
              카카오로 로그인
            </button>
          </div>

          {/* 하단 링크 */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              아직 계정이 없으신가요?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                회원가입
              </Link>
            </p>
            
            <button
              onClick={() => alert('비밀번호 재설정은 준비 중입니다.')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            로그인하면{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
              개인정보처리방침
            </Link>
            과{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-800">
              이용약관
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}