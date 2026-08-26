"""
Portfolio analytics endpoints. This router is the "Verified metrics"
stage of the architecture — every number returned here comes from
app/portfolio/engine.py, never from an LLM.

Endpoint names/methods are adapted slightly from the migration spec's
sketch: GET can't carry a transaction list as a body, so the primary
compute endpoint (`/metrics`) is POST. The `/holdings`, `/allocation`,
`/risk`, and `/recommendations` endpoints are lightweight *views* over an
already-computed PortfolioMetrics (so a caller who already has metrics —
e.g. a dashboard widget refreshing independently — doesn't need to resend
every transaction and pay for a full recompute).
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.analytics.expectation import compare_to_expectation
from app.api.deps import get_db
from app.portfolio.engine import compute_portfolio_metrics
from app.portfolio.projections import project_growth
from app.risk.rules import generate_recommendations
from app.schemas.portfolio import (
    AllocationPoint,
    AnalyzeRequest,
    ExpectationComparison,
    ExpectationRequest,
    GrowthProjectionRequest,
    GrowthProjectionResponse,
    HoldingSnapshot,
    ParsedStatement,
    PortfolioMetrics,
    PortfolioRecommendation,
    StatementSnapshot,
)
from app.services import snapshot_service

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.post("/metrics", response_model=PortfolioMetrics)
async def compute_metrics(payload: AnalyzeRequest) -> PortfolioMetrics:
    """The primary analyze endpoint. Replaces the client-side
    computePortfolioMetrics() call in the old services/portfolioService.ts —
    the frontend now POSTs validated transactions here instead of running
    lib/calculations.ts in the browser."""
    return compute_portfolio_metrics(payload.transactions)


@router.post("/holdings", response_model=list[HoldingSnapshot])
async def holdings_view(metrics: PortfolioMetrics) -> list[HoldingSnapshot]:
    return metrics.holdings


@router.post("/allocation", response_model=list[AllocationPoint])
async def allocation_view(metrics: PortfolioMetrics) -> list[AllocationPoint]:
    return metrics.allocations


@router.post("/risk", response_model=dict)
async def risk_view(metrics: PortfolioMetrics) -> dict:
    return {
        "riskScore": metrics.risk_score,
        "diversificationScore": metrics.diversification_score,
        "concentrationScore": metrics.concentration_score,
        "mostConcentratedHolding": metrics.most_concentrated_holding,
        "concentrationSharePercent": metrics.concentration_share_percent,
    }


@router.post("/recommendations", response_model=list[PortfolioRecommendation])
async def recommendations_view(metrics: PortfolioMetrics) -> list[PortfolioRecommendation]:
    # Recomputed (not just metrics.recommendations) so this endpoint stays
    # correct even if a caller hand-edits metrics before calling it.
    return generate_recommendations(metrics)


@router.post("/growth", response_model=GrowthProjectionResponse)
async def growth_projection(payload: GrowthProjectionRequest) -> GrowthProjectionResponse:
    series = project_growth(
        payload.metrics,
        months=payload.months,
        monthly_contribution=payload.monthly_contribution,
        annual_growth_rate_percent=payload.annual_growth_rate_percent,
    )
    return GrowthProjectionResponse(series=series)


@router.post("/expectation-comparison", response_model=ExpectationComparison)
async def expectation_comparison(payload: ExpectationRequest) -> ExpectationComparison:
    return compare_to_expectation(payload.current, payload.previous)


# --- History (Postgres-backed replacement for lib/history.ts) ---
# Requires DATABASE_URL to be set; otherwise these return 503 (see api/deps.py).


@router.post("/snapshots", response_model=StatementSnapshot)
async def save_snapshot(
    statement: ParsedStatement, metrics: PortfolioMetrics, db: Session = Depends(get_db)
) -> StatementSnapshot:
    return snapshot_service.save_snapshot(db, statement, metrics)


@router.get("/snapshots", response_model=list[StatementSnapshot])
async def list_snapshots(db: Session = Depends(get_db)) -> list[StatementSnapshot]:
    return snapshot_service.get_snapshots(db)


@router.get("/snapshots/{snapshot_id}/previous", response_model=StatementSnapshot | None)
async def previous_snapshot(
    snapshot_id: str, db: Session = Depends(get_db)
) -> StatementSnapshot | None:
    return snapshot_service.get_previous_snapshot(db, snapshot_id)


@router.delete("/snapshots/{snapshot_id}", status_code=204)
async def delete_snapshot(snapshot_id: str, db: Session = Depends(get_db)) -> None:
    snapshot_service.delete_snapshot(db, snapshot_id)


@router.delete("/snapshots", status_code=204)
async def clear_snapshots(db: Session = Depends(get_db)) -> None:
    snapshot_service.clear_history(db)
