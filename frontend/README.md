# 넥서스 - 미래형 인공지능 진로체험 Frontend

AI 기반 진로 탐색 및 체험 서비스의 프론트엔드 애플리케이션입니다.

## 🚀 기술 스택

- **Framework**: Next.js 15.4.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Bundler**: Turbopack (개발 환경)
- **Linting**: ESLint

## 📋 주요 기능

### 1. 초기 진로 적성 검사
- 4단계 설문 시스템
- 기본 정보, 관심사, 강점, 성격 유형 분석
- 진행률 표시 및 단계별 저장
- 시니어 친화적 UI/UX

### 2. 설문 단계별 상세 기능

**1단계: 기본 정보**
- 연령대, 학력, 경력, 거주지 수집
- 개인정보 보호 안내 포함

**2단계: 관심사 및 선호도**
- 12개 분야 중 관심사 선택 (최대 5개)
- 선호 기업 유형 선택
- 근무 환경 선호도 조사

**3단계: 강점 및 경험**
- 소프트 스킬 & 기술 스킬 선택
- 주요 성취 및 경험 선택
- 업무 스타일 분석

**4단계: 성격 및 업무 스타일**
- 5가지 성격 특성 평가 (1-5 스케일)
- 문제해결 스타일 선택
- 소통 스타일 선택

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Blue (#3b82f6 ~ #1d4ed8)
- **Secondary**: Slate (#64748b ~ #475569)
- **Accent**: Red (#ef4444 ~ #dc2626)

### 접근성 고려사항
- 시니어 친화적 큰 폰트 사이즈 (기본 18px)
- 고대비 색상 및 포커스 스타일
- 터치 친화적 버튼 크기 (최소 48px)
- 명확한 레이블과 설명

## 🗂️ 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx            # 홈페이지
│   ├── globals.css         # 글로벌 스타일
│   └── onboarding/
│       └── survey/
│           └── page.tsx    # 설문 페이지
├── components/
│   ├── forms/
│   │   ├── CareerSurveyForm.tsx        # 메인 설문 폼
│   │   └── survey-steps/               # 설문 단계별 컴포넌트
│   │       ├── BasicInfoStep.tsx
│   │       ├── InterestStep.tsx
│   │       ├── StrengthsStep.tsx
│   │       └── PersonalityStep.tsx
│   └── ui/
│       └── ProgressBar.tsx             # 진행률 표시
```

## 🚦 시작하기

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### 프로덕션 서버 실행
```bash
npm run start
```

### 린팅
```bash
npm run lint
```

## 📱 반응형 디자인

- **Mobile First**: 모바일 우선 설계
- **Breakpoints**: Tailwind CSS 기본 브레이크포인트 사용
- **Grid System**: CSS Grid 및 Flexbox 활용

## ♿ 접근성 (Accessibility)

- **WCAG 2.1 AA** 준수
- **키보드 네비게이션** 지원
- **스크린 리더** 호환
- **고대비 모드** 지원
- **시니어 친화적 UI** 구현

## 🔧 개발 시 주의사항

1. **타입 안정성**: TypeScript를 활용한 타입 체크
2. **성능 최적화**: Next.js App Router 및 Turbopack 활용
3. **컴포넌트 재사용**: 모듈화된 컴포넌트 구조
4. **일관된 스타일링**: Tailwind CSS 유틸리티 클래스 활용

## 📋 향후 개발 계획

- [ ] 설문 결과 API 연동
- [ ] 진로 추천 결과 페이지
- [ ] AI 개발자 시뮬레이션 콘텐츠
- [ ] 사용자 계정 관리
- [ ] 결제 시스템 연동

## 🤝 기여 가이드

1. 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
2. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
3. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
4. Pull Request를 생성합니다