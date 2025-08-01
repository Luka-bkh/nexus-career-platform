# Node.js 18 Alpine 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 종속성 설치
RUN npm ci --only=production

# Prisma 설치
RUN npm install -g prisma

# 애플리케이션 소스 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# Prisma 클라이언트 생성
RUN npx prisma generate

# 포트 노출
EXPOSE 3001

# 헬스 체크 엔드포인트 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 애플리케이션 시작
CMD ["npm", "start"]