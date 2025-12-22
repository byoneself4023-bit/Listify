# Multi-stage build for Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# 빌드 인자 정의
ARG VITE_API_URL=http://localhost:5001
ENV VITE_API_URL=$VITE_API_URL

# 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]
