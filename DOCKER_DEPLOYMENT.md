# 🐳 Listify Docker 배포 가이드

## 📋 필수 요구사항

- Docker 20.10 이상
- Docker Compose 2.0 이상
- Spotify API 자격증명 (Client ID, Client Secret)

## 🚀 빠른 시작

### 1. 환경 변수 설정

루트 디렉토리에 `.env` 파일을 생성하고 설정:

```bash
cp .env.example .env
```

`.env` 파일을 편집하여 다음 값을 설정:

```env
# Database
DB_PASSWORD=your_secure_password
DB_USER=listify_user
DB_DATABASE=listify

# Spotify API
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# JWT
JWT_SECRET_KEY=your_jwt_secret_key
```

### 2. Docker Compose로 실행

전체 스택 실행:

```bash
docker-compose up -d
```

빌드와 함께 실행:

```bash
docker-compose up -d --build
```

### 3. 로그 확인

모든 서비스 로그:
```bash
docker-compose logs -f
```

특정 서비스 로그:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 4. 상태 확인

서비스 상태:
```bash
docker-compose ps
```

Health Check:
```bash
curl http://localhost:5001/health
curl http://localhost/health
```

## 📦 서비스 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| Frontend | 80 | React + Nginx |
| Backend | 5001 | Flask API |
| Database | 3306 | MySQL 8.0 |

## 🔧 개발 모드

개발 환경에서는 볼륨 마운트로 코드 변경사항이 자동 반영됩니다:

```bash
# Backend 개발 모드
docker-compose up backend db

# Frontend 개발 모드 (로컬 npm dev 사용 권장)
cd frontend && npm run dev
```

## 🛠️ 유용한 명령어

### 데이터베이스 초기화

```bash
# MySQL 컨테이너 접속
docker-compose exec db mysql -u root -p

# 또는 특정 데이터베이스로
docker-compose exec db mysql -u listify_user -p listify
```

### 데이터베이스 마이그레이션

```bash
docker-compose exec backend python seed_music.py
```

### 컨테이너 재시작

```bash
docker-compose restart backend
docker-compose restart frontend
```

### 전체 스택 중지 및 제거

```bash
docker-compose down
```

데이터베이스 볼륨까지 제거:
```bash
docker-compose down -v
```

## 🧪 테스트

Backend API 테스트:
```bash
curl http://localhost:5001/test
curl http://localhost:5001/health
```

Frontend 접속:
```
http://localhost
```

## 📝 프로덕션 배포

프로덕션 환경에서는:

1. `.env` 파일에 강력한 비밀번호 설정
2. HTTPS 설정 (Let's Encrypt 권장)
3. 환경 변수에 `FLASK_ENV=production` 설정
4. 로그 모니터링 설정

### Nginx HTTPS 설정 (선택사항)

`frontend/nginx.conf`를 수정하여 SSL 인증서 추가:

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... 나머지 설정
}
```

## 🐛 문제 해결

### 포트 충돌

다른 서비스가 포트를 사용 중인 경우 `docker-compose.yml`에서 포트 변경:

```yaml
ports:
  - "8080:80"  # Frontend
  - "5002:5001"  # Backend
```

### 데이터베이스 연결 실패

1. DB 컨테이너가 정상 동작하는지 확인
2. `.env` 파일의 DB 자격증명 확인
3. Health check 대기 시간 늘리기

### 빌드 실패

캐시 없이 재빌드:
```bash
docker-compose build --no-cache
docker-compose up -d
```

## 📊 모니터링

실시간 리소스 사용량:
```bash
docker stats
```

특정 컨테이너 상세 정보:
```bash
docker inspect listify-backend
```

## 🔐 보안 체크리스트

- [ ] `.env` 파일을 `.gitignore`에 추가
- [ ] 강력한 데이터베이스 비밀번호 사용
- [ ] JWT Secret 안전하게 생성
- [ ] 프로덕션에서 DEBUG 모드 비활성화
- [ ] CORS 설정 검토
- [ ] 정기적인 보안 업데이트

## 📚 추가 리소스

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 문서](https://docs.docker.com/compose/)
- [Flask 배포 가이드](https://flask.palletsprojects.com/en/latest/deploying/)
