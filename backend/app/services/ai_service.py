"""
AI layer for explanation/conversation ONLY — this module must never
compute or invent a financial figure. Every number it sees was already
produced by app/portfolio/engine.py; its job is to describe those numbers
in plain language, per the migration's core architecture rule:

    Transaction data -> Python Portfolio Engine -> Verified metrics
        -> Backboard AI -> Explanation / conversation

Two backends are supported:
  - Backboard AI (BACKBOARD_API_URL + BACKBOARD_API_KEY) — the target
    architecture's AI layer: contextual explanations, RAG, memory, tool
    calling. Point this at your Backboard project's chat-completions
    endpoint.
  - Anthropic directly (ANTHROPIC_API_KEY) — same integration the old
    app/api/insights/route.ts used, kept as a zero-config fallback for
    local dev / before Backboard is provisioned.

If neither is configured, both functions return a deterministic,
rule-based fallback instead of failing the request.
"""

from __future__ import annotations

import json
import logging
import re

import httpx

from app.config import get_settings
from app.risk.rules import generate_recommendations
from app.schemas.portfolio import Insight, PortfolioMetrics

settings = get_settings()
logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are a financial analyst assistant inside an investment app called "
    "Privest AI. You are given portfolio numbers that have already been "
    "computed by a deterministic Python engine — treat every figure as "
    "verified ground truth. Never calculate, estimate, or invent a metric "
    "yourself. Never give financial advice, recommendations, or tell the "
    "user what to buy/sell/do — only observe and explain what the numbers "
    "show, in plain language with no jargon."
)


def _summarize_metrics(m: PortfolioMetrics) -> dict:
    return {
        "currency": m.currency,
        "totalInvested": round(m.total_invested),
        "totalSales": round(m.total_sales),
        "grossRealizedGain": round(m.gross_realized_gain),
        "totalFees": round(m.total_fees),
        "netProfit": round(m.net_profit),
        "roiPercent": round(m.roi_percent, 1),
        "leakagePercent": round(m.leakage_percent, 1) if m.leakage_percent is not None else None,
        "topPerformer": m.top_performer,
        "topPerformerSharePercent": round(m.top_performer_share_percent, 1)
        if m.top_performer_share_percent is not None
        else None,
        "mostConcentratedHolding": m.most_concentrated_holding,
        "concentrationSharePercent": round(m.concentration_share_percent, 1)
        if m.concentration_share_percent is not None
        else None,
        "tradeFrequencyTrendPercent": round(m.trade_frequency_trend_percent, 1)
        if m.trade_frequency_trend_percent is not None
        else None,
        "feeTrend": m.fee_trend,
        "monthsOfActivity": m.months_of_activity,
        "feesByCategory": m.fees_by_category.model_dump(),
    }


async def _call_backboard(prompt: str) -> str | None:
    if not (settings.backboard_api_key and settings.backboard_api_url):
        return None
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            resp = await client.post(
                settings.backboard_api_url,
                headers={"Authorization": f"Bearer {settings.backboard_api_key}"},
                json={
                    "messages": [
                        {"role": "system", "content": _SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ]
                },
            )
            resp.raise_for_status()
            data = resp.json()
            # Backboard's response shape can vary by project config; support
            # the two most common shapes (OpenAI-style and {reply: str}).
            if "choices" in data:
                return data["choices"][0]["message"]["content"]
            return data.get("reply") or data.get("content")
        except (httpx.HTTPError, KeyError, IndexError, ValueError):
            return None


async def _call_anthropic(prompt: str) -> str | None:
    if not settings.anthropic_api_key:
        return None
    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": settings.anthropic_api_key,
                    "anthropic-version": "2023-06-01",
                },
                json={
                    "model": settings.anthropic_model,
                    "max_tokens": 1000,
                    "system": _SYSTEM_PROMPT,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return "".join(block.get("text", "") for block in data.get("content", []))
        except (httpx.HTTPError, KeyError, IndexError, ValueError):
            return None


async def _call_ai(prompt: str) -> str | None:
    """Tries Backboard first (target architecture's AI layer), falls back
    to Anthropic directly."""
    reply = await _call_backboard(prompt)
    if reply:
        return reply
    return await _call_anthropic(prompt)


async def get_insights(metrics: PortfolioMetrics) -> tuple[list[Insight], str | None]:
    """Returns (insights, reason). reason is set only when we fell back."""
    summary = _summarize_metrics(metrics)
    logger.info(
        "ai.insights.request",
        extra={
            "event": "ai.insights.request",
            "currency": summary["currency"],
            "transactionCount": metrics.transaction_count,
        },
    )
    if not settings.ai_enabled:
        logger.info(
            "ai.insights.fallback",
            extra={"event": "ai.insights.fallback", "reason": "no_api_key"},
        )
        return _fallback_insights(metrics), "no_api_key"

    prompt = (
        "Given this computed portfolio summary (already calculated, treat as "
        "ground truth), write 4 to 6 short observational insights about the "
        "portfolio. Respond ONLY with a JSON array of objects, no markdown "
        'fences, no preamble, in this exact shape: '
        '[{"tag":"short 2-3 word category label","text":"the insight sentence"}]. '
        f"Portfolio summary: {json.dumps(summary)}"
    )

    text = await _call_ai(prompt)
    if not text:
        logger.info(
            "ai.insights.fallback",
            extra={"event": "ai.insights.fallback", "reason": "ai_unavailable"},
        )
        return _fallback_insights(metrics), "ai_unavailable"

    try:
        cleaned = text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned)
        if isinstance(parsed, list) and parsed:
            validated = _validate_insights(parsed, summary)
            if validated:
                logger.info(
                    "ai.insights.success",
                    extra={
                        "event": "ai.insights.success",
                        "insightCount": len(validated),
                        "responseLength": len(cleaned),
                    },
                )
                return validated, None
    except (json.JSONDecodeError, KeyError, TypeError):
        pass

    reason = "invalid_insight_payload"
    logger.info("ai.insights.fallback", extra={"event": "ai.insights.fallback", "reason": reason})
    return _fallback_insights(metrics), reason


async def chat(message: str, metrics: PortfolioMetrics | None, history: list[dict]) -> str:
    """Conversational endpoint backing AiChatPanel. `metrics` (if provided)
    grounds the reply in verified numbers; the model is never asked to
    compute anything new."""
    context = f"Portfolio summary (verified, computed server-side): {json.dumps(_summarize_metrics(metrics))}\n\n" if metrics else ""
    prompt = f"{context}User question: {message}"

    reply = await _call_ai(prompt)
    if reply:
        logger.info("ai.chat.success", extra={"event": "ai.chat.success", "responseLength": len(reply)})
        return reply.strip()

    # Deterministic fallback so the chat panel still responds if no AI
    # backend is configured, using only the same verified metrics/rules
    # the rest of the app relies on.
    if metrics is None:
        logger.info("ai.chat.fallback", extra={"event": "ai.chat.fallback", "reason": "missing_metrics"})
        return (
            "I don't have your portfolio metrics for this session yet — "
            "upload and analyze a statement first, then ask me again."
        )
    recs = generate_recommendations(metrics)
    top = recs[0] if recs else None
    if top:
        logger.info("ai.chat.fallback", extra={"event": "ai.chat.fallback", "reason": "rules_recommendation"})
        return f"{top.rationale} (Priority: {top.priority})."
    logger.info("ai.chat.fallback", extra={"event": "ai.chat.fallback", "reason": "balanced_default"})
    return "Your portfolio looks balanced based on the current metrics — nothing urgent stands out."


def _validate_insights(parsed: list[dict], summary: dict) -> list[Insight]:
    allowed_numbers = _extract_numeric_tokens(json.dumps(summary))
    out: list[Insight] = []
    for item in parsed[:6]:
        tag = item.get("tag")
        text = item.get("text")
        if not isinstance(tag, str) or not tag.strip():
            return []
        if not isinstance(text, str) or not text.strip():
            return []
        if not _numbers_are_grounded(text, allowed_numbers):
            return []
        out.append(Insight(tag=tag.strip(), text=text.strip()))
    return out


def _numbers_are_grounded(text: str, allowed_numbers: set[str]) -> bool:
    numbers = _extract_numeric_tokens(text)
    return numbers.issubset(allowed_numbers)


def _extract_numeric_tokens(text: str) -> set[str]:
    return set(re.findall(r"-?\d+(?:\.\d+)?", text))


def _fallback_insights(m: PortfolioMetrics) -> list[Insight]:
    """Rule-based insights used when the AI call fails or no API key is
    configured. Ported 1:1 from lib/ai.ts's buildFallbackInsights."""
    out: list[Insight] = []

    if m.top_performer and m.top_performer_share_percent is not None:
        out.append(
            Insight(
                tag="Top contributor",
                text=f"{m.top_performer} generated about "
                f"{m.top_performer_share_percent:.0f}% of your total realized gains.",
            )
        )

    if m.concentration_share_percent is not None and m.concentration_share_percent > 40:
        out.append(
            Insight(
                tag="Concentration",
                text=f"{m.most_concentrated_holding} accounts for roughly "
                f"{m.concentration_share_percent:.0f}% of your invested capital.",
            )
        )

    if m.leakage_percent is not None:
        out.append(
            Insight(
                tag="Fee impact",
                text=f"Fees and charges reduced your gross gains by about {m.leakage_percent:.1f}%.",
            )
        )

    if m.trade_frequency_trend_percent is not None:
        direction = "increased" if m.trade_frequency_trend_percent > 0 else "decreased"
        out.append(
            Insight(
                tag="Trading activity",
                text=f"Your trade count {direction} by about "
                f"{abs(m.trade_frequency_trend_percent):.0f}% in the most recent month versus the one before.",
            )
        )

    if m.fee_trend == "up":
        out.append(
            Insight(
                tag="Fee trend",
                text="Monthly fees have been trending upward over your last few months of activity.",
            )
        )

    out.append(
        Insight(
            tag="Net result",
            text=f"After all costs, your net realized profit stands at "
            f"{m.currency} {round(m.net_profit):,}.",
        )
    )

    return out[:6]
