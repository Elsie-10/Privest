# Privest AI

Turn broker notes into a live AI-powered investment command center — upload a CSV statement, get computed cost basis, P&L, ROI, fees, diversification, risk scoring, and plain-language AI insights.

## Architecture

```
Next.js + TypeScript  (UI, dashboard, charts, AI panels)
        │  REST API (JSON, camelCase)
        ▼
Python + FastAPI      (backend/)
        │
        ▼
Portfolio Engine      (backend/app/portfolio/engine.py)
        │
        ▼
Pandas + NumPy        (analytics)
        │
        ▼
PostgreSQL             (optional — statement history)
        │
        ▼
Backboard AI / Anthropic  (explanation & chat only, never computes numbers)
```

**The core rule this migration enforces:** the Python Portfolio Engine is the *only* place financial metrics are calculated. The AI layer (Backboard, falling back to Anthropic directly) only ever explains numbers the engine already computed — it never invents or estimates a figure. See `backend/app/services/ai_service.py`'s module docstring.

```
Transaction data → Python Portfolio Engine → Verified metrics → Backboard AI → Explanation / conversation
```

### Repo layout

```
privest-ai/
├── app/                  # Next.js App Router pages
├── components/           # UI components (unchanged visually from the original app)
├── domains/              # Thin barrels the UI imports from — now call the FastAPI backend
├── lib/                  # Client-side helpers (CSV parsing, history, apiClient)
├── services/             # portfolioService — the single orchestration layer components use
├── types/portfolio.ts    # The frontend/backend shared contract (see backend/app/schemas)
└── backend/               # Python/FastAPI service — see backend/README below
    └── app/
        ├── main.py
        ├── api/          # transactions.py, portfolio.py, ai.py — route handlers
        ├── schemas/       # Pydantic mirror of types/portfolio.ts (camelCase on the wire)
        ├── portfolio/     # engine.py (the analytics engine) + projections.py
        ├── analytics/     # fees.py, roi.py, expectation.py — small pure helpers
        ├── risk/          # rules.py — deterministic recommendation engine
        ├── parsers/       # csv_parser.py
        ├── services/      # ai_service.py, snapshot_service.py
        ├── models/        # SQLAlchemy models (Postgres persistence)
        └── ml/            # placeholder — no ML models yet (see below)
```

## Architecture & privacy — what changed

The original app's pitch was **"nothing leaves your browser"**: CSV parsing and all financial calculations ran entirely client-side, with a simulated "Midnight confidential-compute" animation (`components/PrivacyFlow`) standing in for a future real integration.

This migration moves all financial calculation to a Python backend, which means **parsed transactions are now sent to the FastAPI server** on every analysis (`POST /api/portfolio/metrics`) — a standard architecture, but a real change from the original privacy claim. I updated the UI copy (`PrivacyFlow.tsx`, `Hero.tsx`, `DashboardView.tsx`, `lib/midnight.ts`) so it no longer says raw data stays local. What's still true:

- Raw transactions are computed and then **discarded from server memory** — they're only written to Postgres if you explicitly save a snapshot to history (`POST /api/portfolio/snapshots`).
- CSV *parsing* still defaults to client-side (`lib/csvParser.ts`) — only the resulting structured transaction list is sent to the backend for calculation. A server-side parse path also exists (`POST /api/transactions/import`) for cases where that's preferable.
- The Midnight confidential-compute integration is still unbuilt (same as before this migration) — `PrivacyFlow` remains a UI simulation of that intended future state, now honestly labeled as such.

If you want the original all-client-side model back, that's a valid direction too — it would mean keeping `computePortfolioMetrics` running in the browser and using the Python backend only for optional history/AI. Ask if you'd like that variant instead.

## Setup

### Backend (Python / FastAPI)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL / AI keys as needed — both are optional for local dev
uvicorn app.main:app --reload --port 8000
```

Runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

Without `DATABASE_URL` set, everything works except statement history (`/api/portfolio/snapshots/*`), which returns `503`. Without `BACKBOARD_API_KEY`/`ANTHROPIC_API_KEY`, `/api/ai/*` returns deterministic rule-based insights instead of LLM-generated ones — the app still fully functions.

### Frontend (Next.js)

```bash
npm install
cp .env.local.example .env.local   # points NEXT_PUBLIC_API_URL at the backend
npm run dev
```

Runs at `http://localhost:3000`.

### Running both

Two terminals: `uvicorn app.main:app --reload --port 8000` in `backend/`, `npm run dev` in the project root. The frontend calls the backend directly via `NEXT_PUBLIC_API_URL` (see `lib/apiClient.ts`).

## Verification performed during migration

- **Numeric parity**: the ported Python engine (`backend/app/portfolio/engine.py`) was cross-checked against a line-by-line JS transcription of the original `lib/calculations.ts`, run through Node on the app's sample CSV — every output field matched exactly (total invested, realized gains, ROI, risk score, allocations, recommendations).
- `cd backend && python3 -m pytest tests/ -v` — 5/5 pass.
- `npx tsc --noEmit` — 0 errors.
- `npm run build` — production build succeeds, all routes generate.
- Live smoke test: started uvicorn, POSTed a CSV to `/api/transactions/import`, chained the result into `/api/portfolio/metrics`, and hit `/api/ai/insights` — full round trip confirmed working.

## What deliberately did NOT change

Per the migration brief:
- No ML models were added (`backend/app/ml/` is an empty placeholder) — no concrete, validated use case yet.
- UI components, styling, and layout are untouched except where a prop needed to become async or a component needed real data instead of hardcoded demo data (`AiChatPanel`, `/ai` page).
- `app/api/upload/route.ts` (the alternative server-side CSV parse path) still uses the TypeScript parser rather than proxying to the Python one, so "parse without a backend connection" keeps working.
- `utils/expectationComparator.ts` stays client-side (mirrors `backend/app/analytics/expectation.py`) since it's a free synchronous comparison over data already in memory — no reason to pay for a network round trip.

## Known limitations / next steps

- **Market price**: neither the original app nor this migration integrates a real market-data feed — `market_price` is a deterministic heuristic derived from average cost (see comments in `engine.py`). Wiring a real price feed is the highest-value next step for accuracy.
- **No Alembic migrations yet** — `init_db()` uses `Base.metadata.create_all`, fine for a single-environment deploy but should move to versioned migrations before multiple environments/teams touch the schema.
- **No auth** — history endpoints are single-tenant (no `user_id`). Add one before this is multi-user.
- **AWS deployment** is not yet configured (no Dockerfile/IaC included) — the target architecture names AWS as the deploy target; that's a follow-up task.
