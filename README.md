# 🔗 넥서스 (Nexus) - 미래형 인공지능 진로체험 플랫폼

AI를 활용한 개인 맞춤형 진로 발견 및 체험 플랫폼입니다.

## 🚀 주요 기능

### 🎯 진로 발견
- AI 기반 진로 적성 분석
- 개인화된 진로 추천 시스템
- 상세한 직업 정보 및 전망

### 🗺️ 학습 로드맵
- 맞춤형 진로별 학습 계획
- 단계별 마일스톤 설정
- 진행상황 실시간 추적

### 🎮 AI 시뮬레이션
- 실무 환경 가상 체험
- AI 멘토와의 상호작용
- 역량 평가 및 피드백

### 🏆 일일 퀘스트 시스템
- 게임화된 학습 경험
- 보상 시스템으로 동기부여
- 성취감 증대를 위한 알림

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **React Hooks** - 상태 관리

### Backend
- **Node.js + Express** - 서버 사이드 런타임
- **TypeScript** - 타입 안전한 백엔드
- **Prisma** - 차세대 ORM
- **PostgreSQL** - 관계형 데이터베이스
- **Redis** - 세션 및 캐시 관리
- **JWT** - 인증 시스템

## 📁 프로젝트 구조

```
nexus-career-platform/
├── frontend/                 # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/             # Next.js 13+ App Router
│   │   ├── components/      # React 컴포넌트
│   │   └── lib/            # 유틸리티 및 API
│   ├── public/             # 정적 파일
│   └── package.json
│
├── backend/                 # Node.js 백엔드
│   ├── src/
│   │   ├── routes/         # API 라우트
│   │   ├── services/       # 비즈니스 로직
│   │   ├── middleware/     # 미들웨어
│   │   └── utils/          # 유틸리티
│   ├── prisma/             # 데이터베이스 스키마
│   └── package.json
│
└── data/                   # 시뮬레이션 데이터
```

## 🏃‍♂️ 로컬 개발 환경 설정

### 사전 요구사항
- Node.js 18.0.0 이상
- PostgreSQL
- Redis

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/nexus-career-platform.git
cd nexus-career-platform
```

### 2. 백엔드 설정
```bash
cd backend
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 및 기타 설정

# 데이터베이스 마이그레이션
npm run db:migrate
npm run db:generate

# 백엔드 서버 실행 (포트 3001)
npm run dev
```

### 3. 프론트엔드 설정
```bash
cd ../frontend
npm install

# 프론트엔드 서버 실행 (포트 3000)
npm run dev
```

### 4. 접속
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:3001/api/v1
- 헬스체크: http://localhost:3001/health

## 🚀 배포

### Vercel (프론트엔드)
1. GitHub에 푸시
2. Vercel에서 GitHub 연결
3. 자동 배포

### Railway (백엔드)
1. GitHub에 푸시
2. Railway에서 GitHub 연결
3. PostgreSQL, Redis 서비스 추가
4. 환경변수 설정 후 배포

자세한 배포 가이드는 `deployment-guide.md`를 참조하세요.

## 📋 주요 API 엔드포인트

### 인증
- `POST /api/v1/auth/signup` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/logout` - 로그아웃

### 진로 분석
- `POST /api/v1/career/analyze` - AI 진로 분석
- `GET /api/v1/career/results` - 분석 결과 조회

### 로드맵
- `POST /api/v1/roadmap/generate` - 로드맵 생성
- `GET /api/v1/roadmap/active` - 활성 로드맵 조회

### 퀘스트
- `GET /api/v1/quest/daily` - 일일 퀘스트 조회
- `POST /api/v1/quest/{id}/complete` - 퀘스트 완료

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/your-username/nexus-career-platform](https://github.com/your-username/nexus-career-platform)

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!