# GenAI + Full-Stack Assignment: Clinical Lab Results Analyzer

**Duration:** ~8 hours | **Tech Stack:** Python FastAPI + MCP + React + GenAI | **Deadline:** 6:30 PM

---

## Problem Statement

Clinical laboratories produce hundreds of lab test results daily. Healthcare providers need to quickly identify abnormal results, understand their clinical significance, and decide on the next steps.

Build a full-stack web application that:
1. Accepts lab results (test name, value, unit)
2. Uses AI via API calls to LLMs to classify results (Normal / Warning / Critical)
3. Routes by severity
4. Explains abnormalities in clinically relevant language
5. Suggests next steps (e.g., "Schedule hematology consult")

**Key Constraint:** Results must be shown on the principles of Explainable AI. Users should understand why a result was flagged and what it means—not just "abnormal."

---

## Expected Outcomes

### Backend (Python FastAPI)
- Endpoint: POST /analyze_labs — accepts labs, returns classifications + explanations
- Agent logic: Classify → Route → Explain
- Optional tool: Reference range lookup
- Error handling: Invalid lab names, missing data, out-of-range values
- Ensure MCP server is built and for all the communication by Agent

### Frontend (React)
- Input: Form or CSV upload for lab results
- Display: Color-coded results (🚨 Critical / ⚠️ Warning / ✓ Normal)
- Show: AI explanations for abnormal results
- Action: Suggested next steps

### Data Source: Kaggle Dataset
You must use the Kaggle dataset: [Laboratory Test Results – Anonymized Dataset](https://www.kaggle.com/datasets/pinuto/laboratory-test-results-anonymized-dataset)

---

## Technical Specifications

### Backend Endpoint: POST /analyze_labs
Accepts JSON with lab data. Returns structured response with classifications and explanations.

### Agent Logic: Classify → Route → Explain
- **Classify:** Compare lab value to reference range. Determine status (Normal/Warning/Critical)
- **Route:** Group results by severity (critical first, then warnings, then normal)
- **Explain:** Call LLM to generate clinical explanation
- **Optional Tool:** Call reference_range_lookup(test_name) if test not in hardcoded dict

### Frontend: React Components
- **LabInput.jsx:** Form or CSV upload
- **ResultsDisplay.jsx:** Render classified results with severity colors
- **SeverityBadge.jsx:** Color-coded status (Red=Critical, Yellow=Warning, Green=Normal)

---

## Implementation Hints (~8 Hours)

| # | Task |
|---|------|
| 1 | FastAPI setup. React setup. Create .env. |
| 2 | Integrate free AI provider. Test basic LLM call. |
| 3 | Agent logic: classify + route + explain. |
| 4 | React components. Connect to backend API. |
| 5 | Styling, error handling, test with all 3 CSVs. |
| 6 | README, git commits, final demo. |

---

## Evaluation Rubric

| Criteria | Weight | Passing Bar |
|----------|--------|-------------|
| Agent Classification Logic | 30% | Correctly classifies Normal/Warning/Critical. Handles edge cases. |
| AI Explanation Quality | 25% | Clinically sensible explanations. Proper LLM usage. |
| Frontend UI & Integration | 20% | Clean React. Input → Backend → Display works. Proper colors. |
| Full-Stack Completion | 15% | End-to-end works without crashes. |
| Code Quality & Documentation | 10% | Clear structure. Meaningful commits. Good README. |

---

## Deliverables
- GitHub repo (public access)
- README: setup, architecture, AI provider chosen, how to test
- Frontend: proper React structure
- Working demo: test with one CSV, see results
- Synthetic test data: 3 CSVs in /test_data folder
- Git history: shows iteration with meaningful messages

**Submit by: 6:30 PM**

---

## Free AI Providers (Choose as per convenience)
- **Claude:** console.anthropic.com (free credits, structured outputs)
- **Gemini:** makersuite.google.com (free tier, good for reasoning)
- **Ollama:** ollama.ai (local, no API key)

**Recommendation:** Start with Claude or Gemini free tier (easier setup).

---

## FAQ

**Q: Do I have to call the LLM for every result?**
A: Yes. Use LLM for explanations, even if you classify locally.

**Q: Can I hardcode explanations?**
A: No. Assignment requires LLM integration.

**Q: Do I need all 10 tests?**
A: No. At least 5 is fine. Quality > quantity.

**Q: Can I skip CSV and just use a form?**
A: Yes. Either input method is fine.
