"""
POST /api/ai/* — the AI interaction layer (Backboard, with an Anthropic
fallback). These endpoints only ever explain numbers already produced by
app/portfolio/engine.py; see app/services/ai_service.py's module docstring
for the enforcement of that rule.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.schemas.portfolio import (
    AiChatRequest,
    AiChatResponse,
    AiInsightsRequest,
    AiInsightsResponse,
)
from app.services import ai_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/insights", response_model=AiInsightsResponse)
async def get_insights(payload: AiInsightsRequest) -> AiInsightsResponse:
    """Replaces app/api/insights/route.ts. Same behavior: try the AI
    backend, fall back to deterministic rule-based insights on any
    failure or missing config — the client never sees an error either way."""
    insights, reason = await ai_service.get_insights(payload.metrics)
    return AiInsightsResponse(insights=insights, reason=reason)


@router.post("/chat", response_model=AiChatResponse)
async def chat(payload: AiChatRequest) -> AiChatResponse:
    """Backs AiChatPanel. `metrics` grounds the reply in verified numbers
    already computed by the portfolio engine."""
    reply = await ai_service.chat(payload.message, payload.metrics, payload.history)
    return AiChatResponse(reply=reply)
