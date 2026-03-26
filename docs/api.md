# API 엔드포인트

Base URL: `http://localhost:8000`

---

## POST /api/sessions
세션 완료 기록 저장

**Request body**
```json
{
  "type": "work",          // "work" | "break"
  "duration_minutes": 25,  // 양의 정수
  "label": "독서"           // optional
}
```

**Response 201**
```json
{
  "id": 1,
  "type": "work",
  "label": "독서",
  "duration_minutes": 25,
  "completed_at": "2026-03-26 14:00:00"
}
```

---

## GET /api/sessions
세션 목록 조회 (최신순)

**Query params**
- `limit` (default: 50)
- `offset` (default: 0)

**Response 200**
```json
{
  "total": 12,
  "sessions": [
    {
      "id": 12,
      "type": "work",
      "label": "코딩",
      "duration_minutes": 25,
      "completed_at": "2026-03-26 14:00:00"
    }
  ]
}
```

---

## GET /api/sessions/stats
통계 조회

**Response 200**
```json
{
  "all_time": {
    "work_sessions": 42,
    "work_minutes": 1050,
    "break_sessions": 38,
    "break_minutes": 190
  },
  "today": {
    "work_sessions": 3,
    "work_minutes": 75
  }
}
```

---

## DELETE /api/sessions/{id}
세션 삭제

**Response 204** (No Content)

**Response 404**
```json
{ "detail": "Session not found" }
```
