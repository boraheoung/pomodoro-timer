from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from .models import get_db

router = APIRouter()


class SessionCreate(BaseModel):
    type: str  # 'work' or 'break'
    label: Optional[str] = None
    duration_minutes: int


@router.post("/api/sessions", status_code=201)
def create_session(body: SessionCreate):
    if body.type not in ("work", "break"):
        raise HTTPException(status_code=400, detail="type must be 'work' or 'break'")
    if body.duration_minutes <= 0:
        raise HTTPException(status_code=400, detail="duration_minutes must be positive")

    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO sessions (type, label, duration_minutes) VALUES (?, ?, ?)",
            (body.type, body.label, body.duration_minutes),
        )
        session_id = cur.lastrowid
        row = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
        return dict(row)


@router.get("/api/sessions")
def list_sessions(limit: int = 50, offset: int = 0):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM sessions ORDER BY completed_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        ).fetchall()
        total = conn.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]
    return {"total": total, "sessions": [dict(r) for r in rows]}


@router.get("/api/sessions/stats")
def get_stats():
    with get_db() as conn:
        total_work = conn.execute(
            "SELECT COUNT(*), COALESCE(SUM(duration_minutes), 0) FROM sessions WHERE type='work'"
        ).fetchone()
        total_break = conn.execute(
            "SELECT COUNT(*), COALESCE(SUM(duration_minutes), 0) FROM sessions WHERE type='break'"
        ).fetchone()
        today_work = conn.execute(
            "SELECT COUNT(*), COALESCE(SUM(duration_minutes), 0) FROM sessions "
            "WHERE type='work' AND date(completed_at) = date('now', 'localtime')"
        ).fetchone()
    return {
        "all_time": {
            "work_sessions": total_work[0],
            "work_minutes": total_work[1],
            "break_sessions": total_break[0],
            "break_minutes": total_break[1],
        },
        "today": {
            "work_sessions": today_work[0],
            "work_minutes": today_work[1],
        },
    }


@router.delete("/api/sessions/{session_id}", status_code=204)
def delete_session(session_id: int):
    with get_db() as conn:
        row = conn.execute("SELECT id FROM sessions WHERE id = ?", (session_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Session not found")
        conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
