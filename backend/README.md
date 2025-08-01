# 넥서스 백엔드 API

넥서스 진로체험 플랫폼의 백엔드 API 서버입니다.

## 🚀 기술 스택

- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT
- **Security**: bcryptjs, helmet, cors
- **Validation**: Joi
- **Logging**: Winston
- **Documentation**: 자동 생성 예정

## 📁 프로젝트 구조

```
src/
├── index.ts                 # 메인 서버 진입점
├── config/
│   └── environment.ts       # 환경 설정
├── middleware/
│   ├── auth.ts             # 인증 미들웨어
│   ├── errorHandler.ts     # 에러 처리
│   ├── requestLogger.ts    # 요청 로깅
│   └── validation.ts       # 요청 검증
├── routes/
│   ├── auth.ts             # 인증 관련 API
│   ├── onboarding.ts       # 온보딩/설문 API
│   ├── career.ts           # 진로 분석 API
│   ├── simulation.ts       # 시뮬레이션 API
│   └── user.ts             # 사용자 관리 API
├── utils/
│   ├── logger.ts           # 로깅 유틸리티
│   └── encryption.ts       # 암호화 유틸리티
└── database/
    └── seed.ts             # DB 시드 데이터
```

## 🔧 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp env.example .env
# .env 파일을 편집하여 실제 값들로 설정
```

### 3. 데이터베이스 설정
```bash
# Prisma 마이그레이션
npm run db:migrate

# Prisma 클라이언트 생성
npm run db:generate

# 시드 데이터 삽입 (선택사항)
npm run db:seed
```

### 4. 개발 서버 실행
```bash
npm run dev
```

### 5. 프로덕션 빌드 및 실행
```bash
npm run build
npm start
```

## 📋 API 엔드포인트

### 🔐 인증 (Authentication)
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/refresh` - 토큰 갱신
- `POST /api/v1/auth/logout` - 로그아웃
- `GET /api/v1/auth/check` - 인증 상태 확인

### 📝 온보딩/설문 (Onboarding)
- `POST /api/v1/onboarding/survey` - 설문 저장 (완료)
- `POST /api/v1/onboarding/survey/draft` - 설문 임시 저장
- `GET /api/v1/onboarding/survey/draft` - 임시 저장된 설문 조회
- `GET /api/v1/onboarding/survey/history` - 설문 기록 조회
- `DELETE /api/v1/onboarding/survey/draft/:id` - 임시 설문 삭제

### 🎯 진로 분석 (Career)
- `POST /api/v1/career/analyze` - AI 진로 분석 및 추천
- `GET /api/v1/career/results` - 진로 분석 결과 목록
- `GET /api/v1/career/results/:id` - 특정 분석 결과 상세

### 🎮 시뮬레이션 (Simulation)
- `GET /api/v1/simulation/scenarios` - 시나리오 목록
- `POST /api/v1/simulation/start` - 시뮬레이션 시작
- `GET /api/v1/simulation/results` - 시뮬레이션 결과 목록

### 👤 사용자 (User)
- `GET /api/v1/user/profile` - 프로필 조회
- `PUT /api/v1/user/profile` - 프로필 업데이트
- `POST /api/v1/user/change-password` - 비밀번호 변경
- `GET /api/v1/user/credits` - 크레딧 현황
- `GET /api/v1/user/referrals` - 추천인 현황
- `GET /api/v1/user/activity` - 활동 내역

## 🔒 보안 기능

### 데이터 암호화
- 설문 데이터 암호화 저장 (AES-256-GCM)
- 비밀번호 해싱 (bcryptjs)
- JWT 토큰 기반 인증

### API 보안
- CORS 설정
- Rate Limiting (IP별 요청 제한)
- Helmet을 통한 보안 헤더
- 요청 검증 및 SQL Injection 방지

### 로깅 및 모니터링
- 모든 API 요청/응답 로깅
- 에러 추적 및 알림
- 사용자 활동 로그

## 💳 크레딧 시스템

### 크레딧 종류
- **무료 크레딧**: 가입 시 3개 (추천인 있으면 5개)
- **유료 크레딧**: 결제를 통해 구매

### 크레딧 사용
- 설문 완료: 1 크레딧
- 진로 분석: 1 크레딧
- 시뮬레이션: 2 크레딧

### 추천인 시스템
- 추천받은 사용자: +2 크레딧 보너스
- 추천한 사용자: 추천 성공 시 +2 크레딧

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- `users` - 사용자 정보
- `career_surveys` - 진로 적성 설문 (암호화)
- `career_results` - AI 진로 분석 결과
- `simulation_results` - 시뮬레이션 결과
- `payments` - 결제 내역
- `activity_logs` - 활동 로그

### 데이터 관계
- 사용자 ↔ 설문 (1:N)
- 설문 ↔ 분석결과 (1:N)
- 사용자 ↔ 시뮬레이션 (1:N)
- 사용자 ↔ 추천인 (1:N)

## 🔍 개발 도구

### 린팅 및 포맷팅
```bash
npm run lint          # ESLint 실행
```

### 테스트
```bash
npm test              # Jest 테스트 실행
```

### 데이터베이스 관리
```bash
npm run db:migrate    # 마이그레이션 실행
npm run db:generate   # Prisma 클라이언트 생성
npm run db:seed       # 시드 데이터 삽입
```

## 🚀 배포

### Docker 설정 (예정)
```dockerfile
# Dockerfile 예시
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### 환경별 설정
- **Development**: 로컬 개발 환경
- **Staging**: 테스트 환경
- **Production**: 운영 환경

## 📊 모니터링

### 로그 레벨
- `error`: 에러 발생
- `warn`: 경고 상황
- `info`: 일반 정보
- `debug`: 디버그 정보

### 메트릭스
- API 응답 시간
- 에러율
- 크레딧 사용량
- 사용자 활동량

## 🤝 기여 가이드

1. 브랜치 생성 (`git checkout -b feature/amazing-feature`)
2. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
3. 브랜치 푸시 (`git push origin feature/amazing-feature`)
4. Pull Request 생성

## 🤖 AI 추천 시스템

### 초기 AI 모델 (규칙 기반)
- 관심사 기반 직업 매칭 (40% 가중치)
- 강점 기반 직업 필터링 (40% 가중치)
- 성격 기반 직업 보정 (20% 가중치)
- 경력 수준별 적합도 조정
- 근무 환경 선호도 반영

### 추천 결과 구성
- **추천 직업**: 최대 8개, 매치 스코어 포함
- **스킬 갭 분석**: 현재 vs 필요 스킬 레벨
- **학습 경로**: 단계별 교육 과정 추천
- **진로 로드맵**: 단기/중기/장기 목표
- **성격 인사이트**: 5가지 성격 특성 분석

### 크레딧 시스템 확장
- 첫 분석 완료 시 보너스 크레딧 지급
- 크레딧 트랜잭션 상세 추적
- 만료 예정 크레딧 알림
- 사용량 통계 제공

## 📝 향후 개발 계획

- [x] 초기 AI 진로 분석 로직 구현 (규칙 기반)
- [x] 크레딧 관리 시스템 구현
- [ ] OpenAI API 연동으로 AI 모델 고도화
- [ ] 실시간 시뮬레이션 시스템
- [ ] 결제 시스템 연동
- [ ] 이메일 알림 시스템
- [ ] 관리자 대시보드
- [ ] API 문서 자동 생성
- [ ] 성능 최적화
- [ ] 테스트 커버리지 확대