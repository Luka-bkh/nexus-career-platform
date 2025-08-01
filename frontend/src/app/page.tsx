"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const profile = await userApi.getProfile();
        setUser(profile);
      }
    } catch (error) {
      // 비로그인 상태
      console.log('User not logged in');
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      router.push('/onboarding');
    } else {
      router.push('/auth/signup');
    }
  };

  const features = [
    {
      icon: '📝',
      title: '진로 적성 설문',
      description: '개인의 성향, 관심사, 강점을 종합 분석하여 최적의 진로 방향을 제시합니다.',
      link: '/survey',
      color: 'blue',
    },
    {
      icon: '🎮',
      title: 'AI 시뮬레이션',
      description: '실무 환경을 체험하며 진로 적합성을 확인하고 실전 역량을 향상시킵니다.',
      link: '/simulations',
      color: 'purple',
    },
    {
      icon: '🗺️',
      title: '개인화 로드맵',
      description: 'AI가 분석한 데이터를 바탕으로 체계적인 학습 계획을 자동 생성합니다.',
      link: '/roadmap',
      color: 'green',
    },
  ];

  const steps = [
    {
      step: '01',
      title: '진로 적성 분석',
      description: '간단한 설문을 통해 나의 성향과 관심 분야를 파악합니다.',
      icon: '🧭',
    },
    {
      step: '02',
      title: '실무 시뮬레이션',
      description: 'AI 기반 시뮬레이션으로 실제 업무 환경을 체험합니다.',
      icon: '🎯',
    },
    {
      step: '03',
      title: '맞춤 학습 계획',
      description: '개인화된 로드맵으로 체계적인 성장을 시작합니다.',
      icon: '🚀',
    },
  ];

  const stats = [
    { number: '10,000+', label: '누적 사용자' },
    { number: '95%', label: '만족도' },
    { number: '500+', label: '취업 성공' },
    { number: '50+', label: '파트너 기업' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-600">🔗</div>
              <h1 className="text-xl font-bold text-gray-900">Nexus Career</h1>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">기능</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">사용법</Link>
              <Link href="#success" className="text-gray-600 hover:text-blue-600 transition-colors">성과</Link>
            </div>
            
            <div className="flex space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">안녕하세요, {user.name}님!</span>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    대시보드
                  </Link>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                <span className="mr-2">✨</span>
                AI 기반 진로 설계 플랫폼
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                나만의 진로를
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  스마트하게 설계
                </span>
                하세요
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                AI 분석을 통한 진로 적성 진단부터 실무 시뮬레이션, 
                개인화된 학습 로드맵까지. 체계적인 커리어 성장을 시작하세요.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  🚀 무료로 시작하기
                </button>
                
                <Link
                  href="#how-it-works"
                  className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors text-center"
                >
                  📖 사용법 보기
                </Link>
              </div>
              
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  무료 사용
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  개인정보 보호
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  24/7 지원
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">진로 발견 여정</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-800 font-medium">진로 적성 분석</span>
                      <span className="text-blue-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-800 font-medium">AI 시뮬레이션</span>
                      <span className="text-purple-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800 font-medium">맞춤 로드맵</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 배경 장식 */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-200 rounded-full opacity-40"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI가 제안하는 진로 설계
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              첨단 AI 기술과 전문가 지식을 결합하여 개인 맞춤형 진로 솔루션을 제공합니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`text-6xl mb-6 text-center`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  {feature.description}
                </p>
                
                {user ? (
                  <Link
                    href={feature.link}
                    className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                      feature.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                      feature.color === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                      'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    체험하기 →
                  </Link>
                ) : (
                  <button
                    onClick={() => router.push('/auth/signup')}
                    className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                      feature.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                      feature.color === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                      'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    시작하기 →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              3단계로 완성하는 진로 설계
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              간단하고 체계적인 과정을 통해 나만의 진로를 발견하고 계획할 수 있습니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* 연결선 */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-24 -right-4 w-8 h-px bg-gray-300"></div>
                )}
                
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {step.step}
                    </div>
                    <div className="absolute -top-2 -right-2 text-3xl">
                      {step.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              지금 시작하기 🚀
            </button>
          </div>
        </div>
      </section>

      {/* Success Stats Section */}
      <section id="success" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              함께 성장하는 커리어 여정
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              수많은 사용자들이 넥서스와 함께 꿈을 이루어가고 있습니다.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              사용자 성공 스토리
            </h2>
            <p className="text-xl text-gray-600">
              실제 사용자들의 생생한 후기를 들어보세요.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">김</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">김**님</h4>
                  <p className="text-gray-600 text-sm">AI 개발자 취업 성공</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "설문 분석과 시뮬레이션을 통해 AI 개발자가 적성에 맞다는 걸 알았어요. 
                체계적인 로드맵 덕분에 6개월 만에 원하는 회사에 취업했습니다!"
              </p>
              <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">박</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">박**님</h4>
                  <p className="text-gray-600 text-sm">데이터 사이언티스트</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "진로를 고민하던 중 넥서스를 발견했어요. 
                AI 시뮬레이션이 너무 재미있고 실무와 비슷해서 
                자신감을 얻을 수 있었습니다."
              </p>
              <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">이</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">이**님</h4>
                  <p className="text-gray-600 text-sm">커리어 전환 성공</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "30대에 커리어를 바꾸기가 쉽지 않았는데, 
                개인화된 로드맵 덕분에 체계적으로 준비할 수 있었어요. 
                지금은 행복하게 일하고 있습니다."
              </p>
              <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              지금 시작하면
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                미래가 달라집니다
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8">
              AI 기반 진로 설계로 더 나은 내일을 만들어보세요. 
              지금 시작하면 무료 크레딧 3개를 드립니다!
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🎉 무료로 시작하기
              </button>
              
              <Link
                href="/auth/login"
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-gray-900 transition-colors"
              >
                로그인하기
              </Link>
            </div>
            
            <div className="mt-8 text-gray-400 text-sm">
              ✓ 신용카드 불필요 &nbsp; ✓ 언제든 취소 가능 &nbsp; ✓ 개인정보 안전 보장
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-2xl font-bold text-blue-400">🔗</div>
                <h3 className="text-xl font-bold">Nexus Career</h3>
              </div>
              <p className="text-gray-400">
                AI 기반 진로 설계 플랫폼으로 
                더 나은 미래를 만들어갑니다.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/survey" className="hover:text-white transition-colors">진로 적성 설문</Link></li>
                <li><Link href="/simulations" className="hover:text-white transition-colors">AI 시뮬레이션</Link></li>
                <li><Link href="/roadmap" className="hover:text-white transition-colors">개인화 로드맵</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">회사</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">회사 소개</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">채용</Link></li>
                <li><Link href="/partners" className="hover:text-white transition-colors">파트너십</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">도움말</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">문의하기</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Nexus Career Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}