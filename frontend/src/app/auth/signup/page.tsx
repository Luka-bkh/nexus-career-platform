"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthYear: '',
    gender: '',
    agreeTerms: false,
    agreePrivacy: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }

    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    if (!formData.password) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    if (!formData.agreeTerms) {
      setError('이용약관에 동의해주세요.');
      return false;
    }

    if (!formData.agreePrivacy) {
      setError('개인정보처리방침에 동의해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
        gender: formData.gender || undefined,
      };

      const response = await authApi.signup(signupData);
      
      // 토큰 저장
      localStorage.setItem('token', response.token);
      
      // 온보딩으로 리다이렉트
      router.push('/onboarding');
      
    } catch (error: any) {
      console.error('Signup failed:', error);
      setError(error.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const birthYears = Array.from({ length: 60 }, (_, i) => currentYear - 15 - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-md w-full mx-auto px-4">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="text-3xl font-bold text-blue-600">🔗</div>
            <h1 className="text-2xl font-bold text-gray-900">Nexus Career</h1>
          </Link>
          <p className="text-gray-600 mt-2">AI와 함께하는 진로 설계를 시작하세요</p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">회원가입</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="이름을 입력하세요"
                required
              />
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 *
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

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="8자 이상의 비밀번호"
                required
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인 *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>

            {/* 선택 정보 구분선 */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">추가 정보 (선택사항)</span>
                </div>
              </div>
            </div>

            {/* 휴대폰 번호 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                휴대폰 번호
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="010-1234-5678"
              />
            </div>

            {/* 출생연도와 성별 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-2">
                  출생연도
                </label>
                <select
                  id="birthYear"
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">선택</option>
                  {birthYears.map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  성별
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">선택</option>
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                  <option value="OTHER">기타</option>
                </select>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="space-y-3 pt-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-700">
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                    이용약관
                  </Link>에 동의합니다. *
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreePrivacy"
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleChange}
                  className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <label htmlFor="agreePrivacy" className="ml-2 text-sm text-gray-700">
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                    개인정보처리방침
                  </Link>에 동의합니다. *
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  가입 중...
                </div>
              ) : (
                '🎉 무료 회원가입'
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

          {/* 소셜 회원가입 */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => alert('Google 회원가입은 준비 중입니다.')}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 가입하기
            </button>

            <button
              type="button"
              onClick={() => alert('카카오 회원가입은 준비 중입니다.')}
              className="w-full py-3 px-4 bg-yellow-400 rounded-lg font-medium text-gray-900 hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <span className="text-lg mr-2">💬</span>
              카카오로 가입하기
            </button>
          </div>

          {/* 하단 링크 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                로그인
              </Link>
            </p>
          </div>
        </div>

        {/* 가입 혜택 */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            🎁 가입 즉시 혜택
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>무료 크레딧 3개 지급</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>AI 진로 적성 분석 무료 체험</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>개인화된 진로 로드맵 생성</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>실무 시뮬레이션 체험 기회</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}