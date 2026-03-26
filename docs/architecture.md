# Architecture

## 개요

포모도로 타이머 웹앱. 집중/휴식 세션을 타이머로 측정하고 SQLite에 기록한다.

---

## 기술 선택

| 항목 | 선택 | 이유 |
|------|------|------|
| Backend | FastAPI | 비동기 지원, Pydantic 검증, 자동 OpenAPI 문서 |
| DB | SQLite | 외부 DB 불필요, 단일 파일로 간단 운영 |
| Frontend | Vanilla JS | 프레임워크 없이 경량 유지, 의존성 최소화 |
| Template | Jinja2 | FastAPI 기본 지원, SSR로 초기 로딩 단순화 |
| Runtime | Python 3.12 (mise) | 최신 안정 버전, mise로 버전 고정 |

---

## 디렉토리 구조

```
src/
├── main.py       # FastAPI 앱 생성, 라우터 등록, startup 이벤트
├── models.py     # SQLite 연결(컨텍스트 매니저), DB 초기화
├── routes.py     # /api/* 엔드포인트 (Pydantic 입력 검증)
├── static/
│   ├── style.css # 다크 테마 CSS (CSS 변수 기반)
│   └── app.js    # 타이머 로직 + API 호출 (IIFE, Vanilla JS)
└── templates/
    └── index.html
```

---

## 데이터 흐름

```
브라우저 타이머 완료
  → POST /api/sessions  (type, duration_minutes, label)
  → routes.py 검증
  → SQLite INSERT
  → 응답 반환
  → JS에서 히스토리·통계 재조회
```

---

## 주요 설계 결정

- **DB 경로 `/data/pomodoro.db`**: Docker volume에 마운트해 컨테이너 재시작 후에도 데이터 유지
- **타이머는 클라이언트 사이드**: 서버 부하 없이 `setInterval`로 처리, 완료 시에만 API 호출
- **세션 기록 시점**: 타이머가 0에 도달했을 때만 저장 (중간 취소는 기록 안 함)
