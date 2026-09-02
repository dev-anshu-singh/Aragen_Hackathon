import sqlite3
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

from backend.config import BASE_DIR

DB_PATH = str(BASE_DIR / "lab_results.db")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database tables if they do not exist."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS batches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                batch_id TEXT UNIQUE NOT NULL,
                created_at TEXT NOT NULL,
                summary TEXT NOT NULL,
                total_count INTEGER NOT NULL,
                critical_count INTEGER NOT NULL,
                warning_count INTEGER NOT NULL,
                normal_count INTEGER NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                batch_id TEXT NOT NULL,
                test_name TEXT NOT NULL,
                value TEXT NOT NULL,
                unit TEXT NOT NULL,
                status TEXT NOT NULL,
                reference_range TEXT NOT NULL,
                explanation TEXT NOT NULL,
                next_step TEXT NOT NULL,
                source TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE
            )
        """)
        conn.commit()


def save_batch_results(results: List[Dict[str, Any]], summary: str) -> str:
    """Save analysis results to SQLite and return batch_id."""
    init_db()
    batch_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()

    critical = sum(1 for r in results if r.get("status") == "Critical")
    warning = sum(1 for r in results if r.get("status") == "Warning")
    normal = sum(1 for r in results if r.get("status") == "Normal")
    total = len(results)

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO batches (batch_id, created_at, summary, total_count, critical_count, warning_count, normal_count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (batch_id, created_at, summary, total, critical, warning, normal))

        for r in results:
            cursor.execute("""
                INSERT INTO results (batch_id, test_name, value, unit, status, reference_range, explanation, next_step, source, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                batch_id,
                r.get("test_name", ""),
                str(r.get("value", "")),
                r.get("unit", "-"),
                r.get("status", "Normal"),
                r.get("reference_range", ""),
                r.get("explanation", ""),
                r.get("next_step", ""),
                r.get("source", "verified"),
                created_at
            ))
        conn.commit()

    return batch_id


def get_latest_results() -> Optional[Dict[str, Any]]:
    """Retrieve the most recent analyzed batch and its results."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM batches ORDER BY id DESC LIMIT 1")
        batch_row = cursor.fetchone()
        if not batch_row:
            return None

        batch_id = batch_row["batch_id"]
        cursor.execute("SELECT * FROM results WHERE batch_id = ? ORDER BY id ASC", (batch_id,))
        result_rows = cursor.fetchall()

        results = [
            {
                "test_name": row["test_name"],
                "value": row["value"],
                "unit": row["unit"],
                "status": row["status"],
                "reference_range": row["reference_range"],
                "explanation": row["explanation"],
                "next_step": row["next_step"],
                "source": row["source"]
            }
            for row in result_rows
        ]

        return {
            "batch_id": batch_id,
            "created_at": batch_row["created_at"],
            "summary": batch_row["summary"],
            "results": results
        }


def get_history(limit: int = 10) -> List[Dict[str, Any]]:
    """Retrieve recent analysis batches."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM batches ORDER BY id DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


def clear_all_history():
    """Clear all saved analyses."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM results")
        cursor.execute("DELETE FROM batches")
        conn.commit()
