# Listify - 음악 큐레이션 플레이리스트 플랫폼

Spotify API를 활용한 음악 검색 및 플레이리스트 큐레이션 서비스

## 주요 기능

- **음악 검색** - Spotify API 연동, 아티스트 관련성 기반 정렬
- **플레이리스트 관리** - 생성, 수정, 삭제 및 곡 추가/제거
- **큐레이션 장바구니** - 곡을 담아두고 한번에 플레이리스트 생성
- **사용자 통계 분석** - 장르 분포, 주간 활동 패턴(스택 바 차트), 오디오 특성(레이더 차트)
- **JWT 인증** - 로그인/회원가입, 역할 기반 권한 관리

## 기술 스택

### Frontend
- React + TypeScript
- Tailwind CSS
- Recharts (데이터 시각화)
- Vite

### Backend
- Flask (Python)
- MySQL (PyMySQL)
- JWT 인증
- Spotify Web API (spotipy)

### 인프라
- Docker / Docker Compose
- Nginx (프론트엔드 서빙)

## 프로젝트 구조

```
Listify/
├── frontend/           # React + TypeScript 프론트엔드
│   ├── components/     # UI 컴포넌트
│   ├── pages/          # 페이지 컴포넌트
│   ├── services/       # API 호출 서비스
│   └── types/          # TypeScript 타입 정의
├── backend/            # Flask 백엔드
│   ├── controllers/    # 컨트롤러 (라우트 핸들러)
│   ├── model/          # 데이터베이스 모델
│   ├── services/       # 비즈니스 로직
│   ├── routes/         # URL 라우팅
│   └── middleware/     # 인증 미들웨어
└── docker-compose.yml  # Docker 컨테이너 구성
```

## 실행 방법

### 환경 변수 설정
```bash
cp .env.example .env
# .env 파일에 다음 항목 설정:
# - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# - JWT_SECRET_KEY
# - SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
```

### Docker로 실행
```bash
docker-compose up -d --build
```

- 프론트엔드: `http://localhost:3000`
- 백엔드 API: `http://localhost:5000`

## 시연 영상

[![Listify Demo](https://img.youtube.com/vi/HyaSthYfuFM/0.jpg)](https://youtu.be/HyaSthYfuFM)
