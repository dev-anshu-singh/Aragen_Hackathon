import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.models import AnalyzeRequest, AnalyzeResponse

from backend.agent.graph import agent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Clinical Lab Results Analyzer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
            }
            for lab in labs
        ]

    critical = sum(1 for r in results if r["status"] == "Critical")
    warning = sum(1 for r in results if r["status"] == "Warning")
    normal = sum(1 for r in results if r["status"] == "Normal")
    summary = f"{critical} critical, {warning} warning, {normal} normal result(s) found."

    return AnalyzeResponse(results=results, summary=summary)


@app.get("/health")
async def health():
    return {"status": "ok"}
