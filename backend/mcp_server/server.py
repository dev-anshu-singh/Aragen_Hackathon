import os
import sys
import json
import logging
import asyncio

try:
    from backend.config import GEMINI_API_KEY, GEMINI_MODEL_NAME, FALLBACK_MODELS
except ImportError:
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
    from backend.config import GEMINI_API_KEY, GEMINI_MODEL_NAME, FALLBACK_MODELS

from fastmcp import FastMCP
from google import genai
from google.genai import types

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mcp = FastMCP("lab-analyzer")

REFERENCE_RANGES = {
    "Hemoglobin": {
        "min": 12.0, "max": 17.5, "unit": "g/dL",
        "description": "Oxygen-carrying protein in red blood cells",
        "test_type": "quantitative",
        "panic_low": 7.0, "panic_high": 20.0
    },
    "Glucose": {
        "min": 70, "max": 100, "unit": "mg/dL",
        "description": "Blood sugar level (fasting)",
        "test_type": "quantitative",
        "panic_low": 40, "panic_high": 400
    },
    "HbA1c": {
        "min": 4.0, "max": 5.6, "unit": "%",
        "description": "Average blood sugar over 2-3 months",
        "test_type": "quantitative",
        "panic_low": None, "panic_high": 9.0
    },
    "TSH": {
        "min": 0.4, "max": 4.0, "unit": "mU/L",
        "description": "Thyroid stimulating hormone",
        "test_type": "quantitative",
        "panic_low": 0.01, "panic_high": 10.0
    },
    "Free T4": {
        "min": 0.8, "max": 1.8, "unit": "ng/dL",
        "description": "Free thyroxine hormone level",
        "test_type": "quantitative",
        "panic_low": 0.3, "panic_high": 5.0
    },
    "Insulin": {
        "min": 2.6, "max": 24.9, "unit": "mU/L",
        "description": "Hormone regulating blood sugar",
        "test_type": "quantitative",
        "panic_low": None, "panic_high": 50.0
    },
    "Ferritin": {
        "min": 12, "max": 150, "unit": "ug/L",
        "description": "Iron storage protein",
        "test_type": "quantitative",
        "panic_low": 5, "panic_high": 1000
    },
    "WBC": {
        "min": 4.5, "max": 11.0, "unit": "10^3/uL",
        "description": "White blood cell count",
        "test_type": "quantitative",
        "panic_low": 2.0, "panic_high": 30.0
    },
    "Platelets": {
        "min": 150, "max": 400, "unit": "10^3/uL",
        "description": "Blood clotting cell count",
        "test_type": "quantitative",
        "panic_low": 50, "panic_high": 1000
    },
    "Total IgE": {
        "min": 0, "max": 100, "unit": "KU/L",
        "description": "Immunoglobulin E antibody level",
        "test_type": "quantitative",
        "panic_low": None, "panic_high": 1000
    },
    "Protein (Strip)": {
        "expected": "Negatif",
        "unit": "-",
        "description": "Urine protein dipstick test",
        "test_type": "qualitative"
    },
    "Glucose (Strip)": {
        "expected": "Normal",
        "unit": "-",
        "description": "Urine glucose dipstick test",
        "test_type": "qualitative"
    },
    "Bilirubin (Strip)": {
        "expected": "Negatif",
        "unit": "-",
        "description": "Urine bilirubin dipstick test",
        "test_type": "qualitative"
    },
    "Nitrit (Strip)": {
        "expected": "Negatif",
        "unit": "-",
        "description": "Urine nitrite test for bacterial infection",
        "test_type": "qualitative"
    },
    "Keton (Strip)": {
        "expected": "Negatif",
        "unit": "-",
        "description": "Urine ketone dipstick test",
        "test_type": "qualitative"
    },
}

TEST_ALIASES = {
    "hemoglobin": "Hemoglobin",
    "hb": "Hemoglobin",
    "hgb": "Hemoglobin",
    "glucose": "Glucose",
    "fasting glucose": "Glucose",
    "blood sugar": "Glucose",
    "hba1c": "HbA1c",
    "glycated hemoglobin": "HbA1c",
    "glikozile hemoglobin (hba1c)": "HbA1c",
    "tsh": "TSH",
    "thyroid stimulating hormone": "TSH",
    "free t4": "Free T4",
    "serbest t4": "Free T4",
    "ft4": "Free T4",
    "insulin": "Insulin",
    "insülin": "Insulin",
    "ferritin": "Ferritin",
    "wbc": "WBC",
    "lökosit": "WBC",
    "white blood cell": "WBC",
    "platelets": "Platelets",
    "trombosit": "Platelets",
    "plt": "Platelets",
    "total ige": "Total IgE",
    "protein (strip)": "Protein (Strip)",
    "glucose (strip)": "Glucose (Strip)",
    "glukoz (strip)": "Glucose (Strip)",
    "bilirubin (strip)": "Bilirubin (Strip)",
    "nitrit (strip)": "Nitrit (Strip)",
    "keton (strip)": "Keton (Strip)",
}


def _resolve_test_name(test_name: str) -> str | None:
    if test_name in REFERENCE_RANGES:
        return test_name
    lower = test_name.lower().strip()
    if lower in TEST_ALIASES:
        return TEST_ALIASES[lower]
    return None


@mcp.tool()
def reference_range_lookup(test_name: str) -> dict:
    """Look up the reference range for a given lab test by name."""
    resolved = _resolve_test_name(test_name)
    if resolved is None:
        return {"error": f"Unknown test: {test_name}"}
    data = REFERENCE_RANGES[resolved]
    result = {"test_name": resolved, "unit": data["unit"], "description": data["description"], "test_type": data["test_type"]}
    if data["test_type"] == "quantitative":
        result["min"] = data["min"]
        result["max"] = data["max"]
        result["reference_range"] = f"{data['min']}-{data['max']} {data['unit']}"
    else:
        result["expected"] = data["expected"]
        result["reference_range"] = data["expected"]
    return result


async def _call_gemini_json(prompt: str) -> dict | None:
    """Shared helper to call Gemini with fallback models and parse JSON."""
    api_key = GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    client = genai.Client(api_key=api_key)
    config = types.GenerateContentConfig(
        temperature=0.2,
        response_mime_type="application/json"
    )

    for model_name in FALLBACK_MODELS:
        try:
            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config
                ),
                timeout=10.0
            )
            text = response.text.strip()
            if "```json" in text:
                text = text.split("```json", 1)[1].split("```", 1)[0].strip()
            elif "```" in text:
                text = text.split("```", 1)[1].split("```", 1)[0].strip()
            return json.loads(text)
        except Exception as e:
            logger.warning(f"Model {model_name} failed or timed out: {e}. Trying next fallback model...")
            continue
    return None


@mcp.tool()
async def llm_classify_unknown(test_name: str, value: str, unit: str) -> dict:
    """Classify a lab test not present in REFERENCE_RANGES using LLM medical knowledge."""
    prompt = (
        f"Lab test: '{test_name}' with result value '{value}' and unit '{unit}'.\n"
        f"You are an expert clinical laboratory pathologist. Based on standard clinical reference ranges:\n"
        f"1. Determine if this value is 'Normal', 'Warning' (mild/moderate abnormality), or 'Critical' (severe/life-threatening panic value requiring immediate attention).\n"
        f"2. Provide the standard typical reference range as a human-readable string (e.g. '30-100 ng/mL' or '0.7-1.3 mg/dL').\n"
        f"3. State your clinical confidence level: 'high', 'medium', or 'low'.\n"
        f"Respond ONLY with strict JSON with exactly these keys: 'status', 'reference_range', 'confidence'."
    )

    result = await _call_gemini_json(prompt)
    if result and isinstance(result, dict):
        status = result.get("status", "Warning")
        if status not in {"Normal", "Warning", "Critical"}:
            status = "Warning"
        ref_range = str(result.get("reference_range", "Unknown (AI Estimated)"))
        confidence = str(result.get("confidence", "medium"))
        return {
            "status": status,
            "reference_range": ref_range,
            "confidence": confidence,
            "source": "llm_estimated"
        }

    return {
        "status": "Warning",
        "reference_range": "Unknown (Standard medical reference not in database)",
        "confidence": "low",
        "source": "llm_estimated"
    }


@mcp.tool()
async def classify_value(test_name: str, value: str, unit: str) -> dict:
    """Classify a lab test result as Normal, Warning, or Critical."""
    ref = reference_range_lookup(test_name)
    if "error" in ref:
        return await llm_classify_unknown(test_name, value, unit)

    resolved = ref["test_name"]
    data = REFERENCE_RANGES[resolved]
    ref_range = ref["reference_range"]

    if data["test_type"] == "qualitative":
        return _classify_qualitative(value, ref_range)

    try:
        num_val = float(value)
    except (ValueError, TypeError):
        return _classify_qualitative(value, ref_range)

    return _classify_quantitative(num_val, data, ref_range)


def _classify_qualitative(value: str, ref_range: str) -> dict:
    val_lower = value.strip().lower()
    normal_values = {"negatif", "normal", "negative", "trace", "norm"}
    warning_values = {"1+", "pozitif", "positive", "+"}
    critical_values = {"2+", "3+", "4+"}

    if val_lower in normal_values:
        status = "Normal"
    elif val_lower in warning_values or value.strip() in warning_values:
        status = "Warning"
    elif val_lower in critical_values or value.strip() in critical_values:
        status = "Critical"
    else:
        status = "Warning"

    return {"status": status, "reference_range": ref_range, "source": "verified"}


def _classify_quantitative(value: float, data: dict, ref_range: str) -> dict:
    min_val = data["min"]
    max_val = data["max"]
    panic_low = data.get("panic_low")
    panic_high = data.get("panic_high")

    if panic_low is not None and value <= panic_low:
        return {"status": "Critical", "reference_range": ref_range, "source": "verified"}
    if panic_high is not None and value >= panic_high:
        return {"status": "Critical", "reference_range": ref_range, "source": "verified"}

    if min_val <= value <= max_val:
        return {"status": "Normal", "reference_range": ref_range, "source": "verified"}

    range_width = max_val - min_val
    if range_width == 0:
        range_width = 1

    if value < min_val:
        deviation = (min_val - value) / range_width
    else:
        deviation = (value - max_val) / range_width

    if deviation > 0.5:
        status = "Critical"
    else:
        status = "Warning"

    return {"status": status, "reference_range": ref_range, "source": "verified"}


@mcp.tool()
async def generate_explanation(test_name: str, value: str, unit: str, status: str, reference_range: str, source: str = "verified") -> dict:
    """Generate a clinical explanation for a lab result using AI."""
    caveat = " (Note: Classification and reference range estimated via AI medical knowledge; please verify against specific laboratory reference standards.)" if source == "llm_estimated" else ""

    if status == "Normal":
        next_step = "Continue routine health maintenance and periodic monitoring."
        if caveat:
            next_step += caveat
        return {
            "explanation": f"{test_name} result of {value} {unit} is within normal reference limits ({reference_range}).",
            "next_step": next_step
        }

    prompt = (
        f"Lab result: {test_name} = {value} {unit}. Reference range: {reference_range}. Status: {status}.\n"
        f"You are an expert clinical lab advisor. Provide:\n"
        f"1. A clinical explanation (2-3 sentences) explaining why this is {status} compared to reference range, underlying clinical causes, and symptoms.\n"
        f"2. A specific recommended medical next step (e.g., 'Schedule urgent nephrology consult', 'Repeat fasting lipid panel in 4 weeks').\n"
        f"Respond in JSON with keys 'explanation' and 'next_step'."
    )

    result = await _call_gemini_json(prompt)
    if result and isinstance(result, dict):
        explanation = result.get("explanation", f"{test_name} is {status}.")
        next_step = result.get("next_step", "Consult healthcare provider.")
        if caveat:
            next_step += caveat
        return {
            "explanation": explanation,
            "next_step": next_step
        }

    fallback_next_step = "Consult healthcare provider for comprehensive diagnostic evaluation."
    if caveat:
        fallback_next_step += caveat
    return {
        "explanation": f"{test_name} at {value} {unit} is classified as {status} (Reference: {reference_range}). Potential physiological anomaly detected.",
        "next_step": fallback_next_step
    }


if __name__ == "__main__":
    import asyncio
    asyncio.run(mcp.run_stdio_async())
