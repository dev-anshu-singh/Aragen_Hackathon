from typing import TypedDict


class LabInput(TypedDict):
    test_name: str
    value: str
    unit: str


class ClassifiedResult(TypedDict):
    test_name: str
    value: str
    unit: str
    status: str
    reference_range: str


class AnalyzedResult(TypedDict):
    test_name: str
    value: str
    unit: str
    status: str
    reference_range: str
    explanation: str
    next_step: str


class AgentState(TypedDict):
    labs: list[LabInput]
    classified: list[ClassifiedResult]
    routed: list[ClassifiedResult]
    results: list[AnalyzedResult]
