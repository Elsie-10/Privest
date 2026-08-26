"""
FastAPI entrypoint.

    Next.js + TypeScript
            v REST API
    Python + FastAPI            <- you are here
            v
    Portfolio Engine (app/portfolio/engine.py)
            v
    Pandas + NumPy
            v
    PostgreSQL (optional, for history — see app/db.py)
            v
    Backboard AI (app/services/ai_service.py)

Run locally with: uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ai, portfolio, transactions
from app.config import get_settings
from app.db import init_db

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.db_enabled:
        init_db()
    yield


app = FastAPI(
    title="Privest AI Backend",
    description="Financial analytics, ML, and AI-orchestration layer for Privest AI.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router)
app.include_router(portfolio.router)
app.include_router(ai.router)


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "environment": settings.environment,
        "dbEnabled": settings.db_enabled,
        "aiEnabled": settings.ai_enabled,
    }
