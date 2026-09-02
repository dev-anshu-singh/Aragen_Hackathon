# 🧪 Clinical Lab Results Analyzer

**Explainable AI · MCP Protocol · LangGraph Agent · SQLite Persistence**

> A full-stack clinical intelligence system that ingests lab results, classifies them against medical reference ranges, routes by severity, generates **Explainable AI** insights, and recommends actionable next steps — all powered by an agentic LangGraph pipeline communicating over the Model Context Protocol (MCP).

---

## ✨ What Makes This Submission Different

| Differentiator | What we built | Why it matters |
|---|---|---|
| **True MCP Architecture** | FastMCP server with 5 registered tools, called over stdio by the LangGraph agent | Not just a wrapper around an API — the agent *discovers and invokes* tools through the MCP protocol exactly as designed |
| **3-Tier Classification** | Panic values → deviation-based severity → LLM fallback for unknown tests | Unknown tests (e.g., Creatinine, Vitamin D) don't crash — they get classified via AI medical knowledge with a `source: "llm_estimated"` transparency tag |
| **Async Parallel Pipeline** | `asyncio.gather` with `return_exceptions=True` and per-call 10s timeouts | One stuck Gemini call can't stall the whole batch. Each lab is error-isolated — one failure doesn't kill the rest |
| **Explainable AI (XAI)** | Every result shows *why* it was flagged, the physiological mechanism, associated symptoms, and a specific next step | Judges and users understand the reasoning, not just "abnormal" |
| **SQLite Persistence** | Every analysis batch is saved with severity counts and full result history | Reload the app, your past analyses are still there. History drawer shows all past runs |
| **Qualitative + Quantitative** | Handles both numeric values (14.2 g/dL) and urine strip results (Negatif, 1+, 2+, 3+) | Matches the Kaggle dataset format exactly — no test type is ignored |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React 19 + Vite Frontend                               │
│  CSV Upload · Manual Entry · Demo Presets               │
│  Loading Overlay · Auto-scroll · Severity Filters       │
└───────────────────┬─────────────────────────────────────┘
                    │ POST /analyze_labs (JSON)
                    ▼
┌─────────────────────────────────────────────────────────┐
│  FastAPI Backend (Uvicorn)                               │
│  Pydantic validation · CORS · SQLite persistence        │
└───────────────────┬─────────────────────────────────────┘
                    │ await agent.ainvoke()
                    ▼
┌─────────────────────────────────────────────────────────┐
│  LangGraph Agent (Deterministic DAG)                    │
│                                                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐           │
│  │ Classify  │──▶│  Route   │──▶│ Explain  │           │
│  │   Node    │   │   Node   │   │   Node   │           │
│  └─────┬─────┘   └──────────┘   └─────┬─────┘          │
│        │ MCP stdio                     │ MCP stdio      │
│        ▼                               ▼                │
│  ┌─────────────────────────────────────────────┐        │
│  │  FastMCP Server (5 Tools)                   │        │
│  │                                             │        │
│  │  • reference_range_lookup  — dict lookup    │        │
│  │  • classify_value          — rules + LLM    │        │
│  │  • llm_classify_unknown    — Gemini fallback│        │
│  │  • generate_explanation    — XAI generation │        │
│  │  • _call_gemini_json       — shared helper  │        │
│  └──────────────────┬──────────────────────────┘        │
│                     │                                    │
└─────────────────────┼────────────────────────────────────┘
                      │ Async + 10s timeout per call
                      ▼
              ┌───────────────┐
              │ Google Gemini │
              │ Multi-model   │
              │ Failover      │
              └───────────────┘
```

---

## 🔬 Classification Logic (30% of rubric)

The classification pipeline handles **every edge case** through a 3-layer system:

### Layer 1: Deterministic Reference Ranges (Verified)
15 lab tests with clinically accurate reference intervals including **panic values** (critical thresholds):

```
Hemoglobin: Normal 12.0–17.5 g/dL | Panic ≤7.0 or ≥20.0
Glucose:    Normal 70–100 mg/dL   | Panic ≤40 or ≥400
Platelets:  Normal 150–400 K/uL   | Panic ≤50 or ≥1000
```

**Severity is calculated, not guessed:**
- Value within range → `Normal`
- Value hits panic threshold → `Critical` (immediate)
- Value outside range → deviation ratio computed: `>50%` of range width = `Critical`, else `Warning`

### Layer 2: Qualitative Strip Tests
Urine dipstick results (Protein, Glucose, Bilirubin, Nitrit, Keton strips):
- `Negatif` / `Normal` / `Negative` → `Normal`
- `1+` / `Pozitif` / `Positive` → `Warning`  
- `2+` / `3+` / `4+` → `Critical`

### Layer 3: LLM Fallback for Unknown Tests
Tests **not in our reference dictionary** (e.g., Creatinine, Vitamin D, ALT) are classified by calling `llm_classify_unknown`:
- Gemini acts as a clinical pathologist
- Returns `status`, `reference_range`, and `confidence` level
- Tagged with `source: "llm_estimated"` for full transparency
- Safe fallback if all models fail: defaults to `Warning` (never crashes)

### Test Alias Resolution
Handles alternate names from the Kaggle dataset:
```
"hb", "hgb" → Hemoglobin    |  "lökosit" → WBC
"serbest t4" → Free T4      |  "trombosit" → Platelets  
"insülin" → Insulin          |  "glukoz (strip)" → Glucose (Strip)
```

---

## 🧠 AI Explanation Quality (25% of rubric)

Every abnormal result gets a **real-time LLM-generated explanation** with:

1. **Clinical reasoning** — Why this value is abnormal relative to the reference range
2. **Physiological mechanism** — What's happening in the body (e.g., "elevated TSH indicates the pituitary is compensating for low thyroid output")
3. **Associated symptoms** — What the patient might experience
4. **Specific next step** — Not generic "see a doctor" but actionable (e.g., "Schedule urgent nephrology consult", "Repeat fasting lipid panel in 4 weeks")

**Normal results** get deterministic explanations (no LLM call needed — saves time and API quota).

**Transparency:** LLM-estimated results include a caveat: *"Classification and reference range estimated via AI medical knowledge; please verify against specific laboratory reference standards."*

---

## 💻 Frontend UI (20% of rubric)

| Feature | Implementation |
|---|---|
| **Dual Input** | CSV drag-and-drop file upload + manual entry table with autocomplete |
| **Top Action Bar** | Prominent "Run AI Analysis" button with live test count |
| **Loading Overlay** | Full-screen animated progress ring with status messages ("Connecting to MCP server...", "Running severity classification...") |
| **Auto-scroll** | Smooth scroll to results section on analysis completion |
| **Severity Cards** | Color-coded result cards: 🔴 Critical (red glow) · 🟡 Warning (amber) · 🟢 Normal (green) |
| **Metrics Dashboard** | 4-card grid: Total Analyzed, Critical Alerts, Warnings, Normal |
| **Filter Tabs** | Click to filter by severity: All / Critical / Warning / Normal |
| **Critical Alert Banner** | Red emergency banner when critical results are detected |
| **Demo Presets** | 3 pre-built test panels (Normal/Warning/Critical) clearly labeled as demos |
| **History Drawer** | Modal showing all past analyses from SQLite with severity breakdowns |
| **Design System** | Glassmorphism cards, CSS custom properties, Outfit + JetBrains Mono fonts |

---

## 🔧 Full-Stack Completion (15% of rubric)

### Backend Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/analyze_labs` | Core analysis pipeline — accepts labs JSON, returns classified results |
| `GET` | `/health` | Backend status check |
| `GET` | `/history` | List past analysis batches from SQLite |
| `GET` | `/history/latest` | Retrieve most recent saved analysis |
| `DELETE` | `/history` | Clear all saved analysis history |

### Error Handling
- **Invalid test names** → LLM fallback classification (never crashes)
- **Missing data** → Pydantic validation at API boundary
- **Gemini timeout** → 10-second `asyncio.wait_for` per call, auto-fallback to next model
- **All models fail** → Safe hardcoded fallback response (Warning status, "Consult healthcare provider")
- **Per-item isolation** → `return_exceptions=True` in `asyncio.gather` — one bad lab can't kill the batch

### Resilience: Multi-Model Failover
```python
FALLBACK_MODELS = [
    "gemini-3.7-flash",       # Primary (fast + capable)
    "gemini-3.5-flash-lite",  # Fallback 1 (lighter)
    "gemini-3.5-flash",       # Fallback 2
    "gemini-flash-latest",    # Fallback 3
    "gemini-3.1-flash-lite",  # Fallback 4
]
```
Each model is tried in order. If one fails or times out (10s), the next is attempted automatically.

---

## 📂 Project Structure

```
Aragen_Hackathon/
├── backend/
│   ├── agent/
│   │   ├── graph.py              # LangGraph DAG: Classify → Route → Explain
│   │   └── state.py              # TypedDict state definitions
│   ├── mcp_server/
│   │   └── server.py             # FastMCP server (5 tools, async Gemini)
│   ├── main.py                   # FastAPI endpoints + CORS + SQLite integration
│   ├── models.py                 # Pydantic request/response schemas
│   ├── config.py                 # Environment config + model failover list
│   ├── database.py               # SQLite persistence (batches + results tables)
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Navbar, backend status, history button
│   │   │   ├── SamplePresets.jsx  # Pre-built demo panel loaders
│   │   │   ├── CsvUploader.jsx   # Drag-and-drop CSV parser
│   │   │   ├── LabEntryForm.jsx  # Dynamic manual entry table
│   │   │   ├── SummaryBanner.jsx # Metrics grid + critical alert banner
│   │   │   ├── SeverityFilter.jsx# Severity tab filter bar
│   │   │   ├── ResultCard.jsx    # Explainable AI detail card
│   │   │   └── HistoryDrawer.jsx # SQLite analysis history modal
│   │   ├── App.jsx               # Main coordinator + action bar + loading overlay
│   │   ├── App.css               # Component styles (action bar, loading, cards)
│   │   └── index.css             # Design system tokens + global theme
│   ├── index.html
│   └── vite.config.js
├── test_data/
│   ├── normal_panel.csv          # 11 tests — all within normal range
│   ├── warning_panel.csv         # 8 tests — prediabetes, mild anemia, subclinical thyroid
│   └── critical_panel.csv        # 8 tests — severe anemia, DKA glucose, thrombocytopenia
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+, Node.js 18+, Gemini API Key

### 1. Backend

```bash
git clone https://github.com/dev-anshu-singh/Aragen_Hackathon.git
cd Aragen_Hackathon

python -m venv venv
.\venv\Scripts\Activate.ps1          # Windows
# source venv/bin/activate           # Linux/macOS

pip install -r backend/requirements.txt

echo "GEMINI_API_KEY=your_key_here" > .env

python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** → Load a demo preset or upload a CSV → Click **Run AI Analysis**.

---

## 🧪 Test Data

Three synthetic clinical panels in `test_data/` for verification:

| CSV File | Clinical Scenario | Expected Output |
|---|---|---|
| `normal_panel.csv` | Healthy baseline (Hemoglobin 14.5, Glucose 85, WBC 7.0) | 0 Critical, 0 Warning, 3 Normal |
| `warning_panel.csv` | Mild anomalies (TSH 5.5, Glucose 112, Platelets 130) | 0 Critical, 3 Warning, 0 Normal |
| `critical_panel.csv` | Acute panic values (Hemoglobin 6.0, Glucose 450, Platelets 30) | 3 Critical, 0 Warning, 0 Normal |

You can also load these instantly via the **Pre-built Test Cases** buttons in the UI.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Lucide Icons, Vanilla CSS |
| Backend API | Python, FastAPI, Uvicorn, Pydantic |
| AI Agent | LangGraph (deterministic DAG), LangChain Core |
| Tool Protocol | FastMCP (Model Context Protocol over stdio) |
| LLM | Google Gemini (async client, multi-model failover) |
| Database | SQLite3 (zero-config, file-based persistence) |
| AI Provider | Google GenAI SDK (`gemini-3.7-flash` primary) |
