import logging
from typing import List, Dict, Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.models import AnalyzeRequest, AnalyzeResponse
from backend.agent.graph import agent
from backend.database import init_db, save_batch_results, get_latest_results, get_history, clear_all_history

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Clinical Lab Results Analyzer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    init_db()


@app.post("/analyze_labs", response_model=AnalyzeResponse)
async def analyze_labs(request: AnalyzeRequest):
    labs = [lab.model_dump() for lab in request.labs]

    if not labs:
        return AnalyzeResponse(results=[], summary="No lab results provided.")

    try:
        state = await agent.ainvoke({"labs": labs})
        results = state.get("results", [])
    except Exception as e:
        logger.error(f"Agent error: {e}")
        results = [
            {
                "test_name": lab["test_name"],
                "value": lab["value"],
                "unit": lab["unit"],
                "status": "Warning",
                "reference_range": "Error",
                "explanation": f"Error processing {lab['test_name']}: {str(e)}",
                "next_step": "Please retry or consult healthcare provider.",
                "source": "unknown",
            }
            for lab in labs
        ]

    critical = sum(1 for r in results if r["status"] == "Critical")
    warning = sum(1 for r in results if r["status"] == "Warning")
    normal = sum(1 for r in results if r["status"] == "Normal")
    summary = f"{critical} critical, {warning} warning, {normal} normal result(s) found."

    # Persist to SQLite DB
    try:
        save_batch_results(results, summary)
    except Exception as db_err:
        logger.error(f"Failed to persist results to SQLite DB: {db_err}")

    return AnalyzeResponse(results=results, summary=summary)


@app.get("/history/latest")
async def get_latest():
    """Retrieve the most recently saved analysis from SQLite."""
    latest = get_latest_results()
    if not latest:
        return {"results": [], "summary": "No saved analyses found."}
    return latest


@app.get("/history")
async def list_history(limit: int = 10):
    """List recent analysis batches from SQLite."""
    return get_history(limit=limit)


@app.delete("/history")
async def delete_history():
    """Clear all analysis history from SQLite."""
    clear_all_history()
    return {"status": "cleared"}


@app.get("/health")
async def health():
    return {"status": "ok"}
