# 🚀 넥서스 진로체험 플랫폼 배포 가이드

## 개요
이 가이드는 넥서스 진로체험 플랫폼을 온라인에 배포하는 방법을 설명합니다.

### 아키텍처
- **프론트엔드**: Next.js → Vercel
- **백엔드**: Node.js + Express → Railway
- **데이터베이스**: PostgreSQL → Railway
- **캐시**: Redis → Railway

---

## 🎯 1단계: 백엔드 배포 (Railway)

### 1.1 Railway 계정 생성
1. [Railway](https://railway.app)에 접속
2. GitHub 계정으로 회원가입
3. 새 프로젝트 생성

### 1.2 PostgreSQL 데이터베이스 추가
1. Railway 대시보드에서 "Add Service" → "Database" → "PostgreSQL"
2. 자동으로 `DATABASE_URL` 환경변수가 설정됨

### 1.3 Redis 추가
1. Railway 대시보드에서 "Add Service" → "Database" → "Redis"
2. 자동으로 `REDIS_URL` 환경변수가 설정됨

### 1.4 백엔드 서비스 배포
1. Railway에서 "Add Service" → "GitHub Repo"
2. 넥서스 프로젝트 레포지토리 선택
3. Root Directory를 `backend`로 설정
4. 환경변수 설정:

```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-minimum-32-characters
ENCRYPTION_KEY=your-32-character-encryption-key123
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

5. 배포 완료 후 Railway URL 복사 (예: `https://abc123.up.railway.app`)

### 1.5 데이터베이스 마이그레이션
Railway 콘솔에서 실행:
```bash
npx prisma migrate deploy
npx prisma generate
```

---

## 🌐 2단계: 프론트엔드 배포 (Vercel)

### 2.1 Vercel 계정 생성
1. [Vercel](https://vercel.com)에 접속
2. GitHub 계정으로 회원가입

### 2.2 프로젝트 배포
1. Vercel 대시보드에서 "New Project"
2. 넥서스 프로젝트 레포지토리 선택
3. Framework Preset: "Next.js"
4. Root Directory를 `frontend`로 설정
5. 환경변수 설정:

```bash
NEXT_PUBLIC_API_URL=https://your-railway-backend-url.up.railway.app/api/v1
```

6. "Deploy" 클릭

### 2.3 도메인 설정 (선택사항)
1. Vercel에서 자동 생성된 URL을 사용하거나
2. 커스텀 도메인 연결 가능

---

## 🔧 3단계: 설정 업데이트

### 3.1 백엔드 CORS 설정 업데이트
Railway 환경변수에서 `ALLOWED_ORIGINS`를 실제 Vercel URL로 업데이트:
```bash
ALLOWED_ORIGINS=https://your-actual-vercel-url.vercel.app
```

### 3.2 프론트엔드 API URL 업데이트
Vercel 환경변수에서 `NEXT_PUBLIC_API_URL`을 실제 Railway URL로 업데이트:
```bash
NEXT_PUBLIC_API_URL=https://your-actual-railway-url.up.railway.app/api/v1
```

---

## ✅ 4단계: 배포 확인

### 4.1 백엔드 헬스체크
```bash
curl https://your-railway-url.up.railway.app/health
```

### 4.2 프론트엔드 접속
브라우저에서 Vercel URL 접속하여 정상 작동 확인

---

## 🔄 자동 배포 설정

### GitHub Actions (선택사항)
- GitHub에 코드 푸시 시 자동 배포
- Railway와 Vercel 모두 Git 연동 지원

---

## 💰 비용 정보

### Railway (백엔드 + DB)
- **무료 티어**: $5 크레딧/월 제공
- **Pro 플랜**: $20/월 (더 많은 리소스)

### Vercel (프론트엔드)
- **무료 티어**: 개인 프로젝트 무제한
- **Pro 플랜**: $20/월 (팀 기능)

---

## 🚨 보안 주의사항

1. **환경변수 보안**: JWT_SECRET과 ENCRYPTION_KEY를 강력하게 설정
2. **CORS 설정**: 정확한 도메인만 허용
3. **API 키**: 외부 서비스 API 키는 환경변수로 관리
4. **HTTPS 사용**: 운영환경에서는 반드시 HTTPS 사용

---

## 🔍 트러블슈팅

### 일반적인 문제들

1. **CORS 오류**
   - Railway의 `ALLOWED_ORIGINS`에 정확한 Vercel URL 설정
   
2. **데이터베이스 연결 오류**
   - `DATABASE_URL` 환경변수 확인
   - Railway 데이터베이스 서비스 상태 확인

3. **빌드 오류**
   - `package.json`의 `engines` 필드 확인
   - Node.js 버전 호환성 확인

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Railway 서비스 로그
2. Vercel 함수 로그
3. 브라우저 개발자 도구 네트워크 탭

배포 완료 후 실제 URL로 업데이트하는 것을 잊지 마세요! 🎉