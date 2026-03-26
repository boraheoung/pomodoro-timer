# 진행 현황

## 완료

- [x] 프로젝트 디렉토리 구조 생성
- [x] FastAPI 앱 기본 설정 (`main.py`)
- [x] SQLite 모델 및 DB 초기화 (`models.py`)
- [x] API 라우터 구현 (`routes.py`)
  - POST /api/sessions
  - GET /api/sessions
  - GET /api/sessions/stats
  - DELETE /api/sessions/{id}
- [x] 프론트엔드 구현
  - 다크 테마 CSS
  - 포모도로 타이머 (집중 25분 / 휴식 5분)
  - 모드 전환 탭
  - 작업 이름 입력
  - 오늘 세션/분 통계 표시
  - 세션 히스토리 목록 + 삭제
- [x] Docker 환경 구성 (Dockerfile, docker-compose.yml)
- [x] 문서 작성 (architecture.md, api.md, progress.md)

## 다음 할 일

- [ ] 타이머 완료 알림음 추가
- [ ] 커스텀 시간 설정 (25분/5분 외 변경 가능)
- [ ] 세션 통계 차트 (주간/월간)
- [ ] PWA 지원 (오프라인, 홈 화면 추가)
