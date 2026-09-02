from pydantic import BaseModel
from typing import List


class LabItem(BaseModel):
    test_name: str
    value: str
    unit: str = "-"


class AnalyzeRequest(BaseModel):
    labs: List[LabItem]


class ResultItem(BaseModel):
    test_name: str
    value: str
    unit: str
    status: str
    reference_range: str
    explanation: str
    next_step: str
    source: str = "verified"


class AnalyzeResponse(BaseModel):
    results: List[ResultItem]
    summary: str