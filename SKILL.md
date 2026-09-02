---
name: lab-analyzer
description: Clinical Lab Results Analyzer — FastAPI + LangGraph agent + MCP server (stdio) + React (Vite). Read before touching any code in this repo.
---

# Clinical Lab Results Analyzer

Hackathon build, 6hr window. FastAPI backend, LangGraph agent (classify -> route -> explain), MCP server as separate stdio process with ALL agent tools, React+Vite frontend.

## Stack
- Backend: FastAPI, LangGraph, FastMCP SDK (separate process, stdio transport), Gemini (google-generativeai)
- Frontend: React + Vite, PapaParse for CSV upload
- No DB — stateless request/response
- LLM: Gemini free tier (key in .env as GEMINI_API_KEY)

## Architecture
```
React form -> POST /analyze_labs -> FastAPI (main.py)
  -> LangGraph agent (agent/graph.py)
     classify_node -> route_node -> explain_node
     ALL three nodes call MCP server tools via stdio
  -> JSON response -> color-coded React display

MCP runs as separate process:
  FastAPI process                    MCP Server process
  ┌──────────────┐                  ┌──────────────────────────────┐
  │  main.py     │                  │  server.py                   │
  │  ↓           │   stdio pipe     │                              │
  │  LangGraph   │ ◄══════════════► │  Tools:                      │
  │  agent       │                  │  - reference_range_lookup    │
  │              │                  │  - classify_value            │
  └──────────────┘                  │  - generate_explanation (LLM)│
                                    └──────────────────────────────┘
```

MCP server is the ONLY gateway for agent logic. All tool calls — range lookup, classification, AND LLM explanation — go through MCP. The agent graph nodes are thin wrappers that call MCP tools, nothing more.

## Project structure
```
Aragen_Hackathon/
├── SKILL.md                       # This file — read first
├── ASSIGNMENT.md                  # Original assignment text
├── README.md
├── .env                           # GEMINI_API_KEY=...
├── .gitignore
├── backend/
│   ├── requirements.txt
│   ├── main.py                    # FastAPI app, POST /analyze_labs, CORS
│   ├── agent/
│   │   ├── graph.py               # LangGraph graph (classify → route → explain)
│   │   ├── state.py               # TypedDict for agent state
│   │   └── llm.py                 # Gemini API wrapper (called by MCP server)
│   └── mcp_server/
│       └── server.py              # FastMCP server (runs as subprocess via stdio)
│                                  #   ALL tools + reference range data live here
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       └── components/
│           ├── LabInput.jsx        # Form + CSV upload (PapaParse)
│           ├── ResultsDisplay.jsx  # Severity-sorted results list
│           └── SeverityBadge.jsx   # Red/Yellow/Green badge
└── test_data/
    ├── normal_panel.csv
    ├── warning_panel.csv
    └── critical_panel.csv
```

## Endpoint
`POST /analyze_labs`
- in: `{ labs: [{ test_name, value, unit }] }`
- out: `{ results: [{ test_name, value, unit, status, explanation, next_step }] }`, sorted Critical -> Warning -> Normal
- errors: invalid test name -> MCP reference_range_lookup fallback; missing/malformed value -> per-item error, not a 500

## MCP tools (backend/mcp_server/server.py)
All three tools are MCP tools. The agent NEVER bypasses MCP.

1. `reference_range_lookup(test_name: str) -> dict`
   - Returns {min, max, unit, description} for known tests
   - For unknown test names: returns error dict, agent handles gracefully
   - This is the "optional tool" from the assignment — we ARE implementing it

2. `classify_value(test_name: str, value: str, unit: str) -> str`
   - Returns "Normal" | "Warning" | "Critical"
   - Quantitative: compares to min/max with deviation thresholds (20% = Warning, 50%+ or panic values = Critical)
   - Qualitative: string matching (Negatif/Normal -> Normal, 1+/Pozitif -> Warning, 2+/3+ -> Critical)
   - Calls reference_range_lookup internally if needed

3. `generate_explanation(test_name: str, value: str, unit: str, status: str, reference_range: str) -> dict`
   - Calls Gemini API to produce clinical explanation + next steps
   - Returns {explanation: str, next_step: str}
   - Called for ALL results (Normal gets brief confirmation, Warning/Critical get detailed explanations)

## Data quirks (from actual Kaggle sample)
- `Result` is mixed type: numeric (28.9) AND qualitative strings (Negatif, Normal, 1+). classify_value must branch on type, not assume float.
- Source `Status` column is Turkish ("Yüksek" = High) — never use it as output. Output is always Normal/Warning/Critical.
- Source `Comment`/`Recommended_Followup` are Turkish — reference only for prompt calibration, never return directly.
- Sample data has no Critical examples — critical_panel.csv must be hand-authored with panic values.

## Coding style (FOLLOW THESE — they apply regardless of which AI model is used)

### Python (backend)
- Use type hints on all function signatures
- snake_case for variables and functions
- Keep functions short — one function, one job
- Use Pydantic models for request/response schemas
- Use `async def` for FastAPI endpoints
- Handle errors with try/except per item, never crash the whole request
- Imports: stdlib first, third-party second, local third, separated by blank lines
- No wildcard imports
- f-strings for string formatting
- No print() for logging — use Python's `logging` module if needed

### JavaScript/React (frontend)
- Functional components only, no class components
- Use hooks (useState, useEffect) for state management
- Destructure props
- camelCase for variables and functions, PascalCase for components
- Use async/await with fetch or axios for API calls
- Keep components small — if it's over 80 lines, split it
- CSS classes in App.css, no inline styles except dynamic values
- Use `const` by default, `let` only when reassignment is needed, never `var`

### General
- No unused imports or variables
- No console.log in final code (use sparingly for debug, remove before commit)
- .env for all secrets, never hardcode API keys
- Consistent error response format: `{ error: string, details?: string }`
- Every file should be understandable on its own — no implicit dependencies

## Priority if time runs short
Agent classify/route/explain > explanation quality > frontend polish. Working backend + plain form beats broken agent + polished UI.