"""
Direct Pydantic mirror of frontend `types/portfolio.ts`.

Field order and names intentionally match the TS file 1:1 so the two can be
diffed against each other. If you change a shape here, change it there too
(and vice versa) — this file is the Python half of that single contract.
"""

from __future__ import annotations

from typing import Literal, Optional

from app.schemas.base import CamelModel

TransactionType = Literal["buy", "sell"]
FeeCategory = Literal["broker", "tax", "exchange", "other"]
RecommendationPriority = Literal["high", "medium", "low"]
FeeTrend = Literal["up", "down", "flat"]
ExpectationStatus = Literal["exceeding", "meeting", "below", "first"]


class Transaction(CamelModel):
    """A single row from an imported brokerage statement, normalized."""

    date: str  # ISO-ish date string, e.g. "2026-02-14"
    symbol: str
    type: TransactionType
    quantity: float
    price: float
    fee: float
    fee_category: FeeCategory
    currency: str


class ParsedStatement(CamelModel):
    """Result of parsing a raw CSV file."""

    transactions: list[Transaction]
    row_count: int
    errors: list[str]


class Position(CamelModel):
    """Running cost-basis state for a single holding."""

    symbol: str
    quantity: float
    avg_cost: float


class MonthlyActivity(CamelModel):
    month: str  # "YYYY-MM"
    invested: float
    sold: float
    fees: float
    transaction_count: int
    realized_gain: float


class HoldingSnapshot(CamelModel):
    symbol: str
    quantity: float
    avg_cost: float
    market_price: float
    market_value: float
    cost_basis: float
    unrealized_pn_l: float
    unrealized_return_percent: float
    dividend_estimate: float
    dividend_yield: float
    weight: float


class AllocationPoint(CamelModel):
    name: str
    value: float
    color: str


class GrowthPoint(CamelModel):
    month: str
    value: float


class PortfolioRecommendation(CamelModel):
    title: str
    rationale: str
    priority: RecommendationPriority


class FeesByCategory(CamelModel):
    broker: float
    tax: float
    exchange: float
    other: float


class PortfolioMetrics(CamelModel):
    """The full computed analytics output for a portfolio."""

    currency: str
    transaction_count: int
    months_of_activity: int

    total_invested: float
    total_sales: float
    open_value: float
    market_value: float
    cost_basis: float
    unrealized_pn_l: float
    realized_pn_l: float
    total_return_percent: float
    dividend_income: float
    dividend_yield: float
    diversification_score: float
    concentration_score: float
    risk_score: float

    gross_realized_gain: float
    total_fees: float
    net_profit: float
    roi_percent: float
    leakage_percent: Optional[float]

    fees_by_category: FeesByCategory

    top_performer: Optional[str]
    top_performer_share_percent: Optional[float]

    most_concentrated_holding: Optional[str]
    concentration_share_percent: Optional[float]

    trade_frequency_trend_percent: Optional[float]
    fee_trend: Optional[FeeTrend]

    monthly: list[MonthlyActivity]
    positions: list[Position]
    holdings: list[HoldingSnapshot]
    allocations: list[AllocationPoint]
    growth_series: list[GrowthPoint]
    recommendations: list[PortfolioRecommendation]


class Insight(CamelModel):
    tag: str
    text: str


class ExpectationComparison(CamelModel):
    status: ExpectationStatus
    net_profit_delta: float
    net_profit_delta_percent: Optional[float]
    roi_point_delta: float


class StatementSnapshot(CamelModel):
    """A saved analysis. Persisted server-side in Postgres (see
    app/models/snapshot.py) — the backend replacement for the old
    browser-localStorage history in lib/history.ts."""

    id: str
    saved_at: str  # ISO timestamp of when this snapshot was saved
    period_label: str  # most recent "YYYY-MM" with activity in this statement
    statement: ParsedStatement
    metrics: PortfolioMetrics


# --- API request/response envelopes (not in types/portfolio.ts, backend-only) ---


class ImportTransactionsResponse(ParsedStatement):
    """Response body for POST /api/transactions/import."""


class AnalyzeRequest(CamelModel):
    transactions: list[Transaction]


class GrowthProjectionRequest(CamelModel):
    metrics: PortfolioMetrics
    months: int = 12
    monthly_contribution: float = 0.0
    annual_growth_rate_percent: float = 7.0


class GrowthProjectionResponse(CamelModel):
    series: list[GrowthPoint]


class AiChatRequest(CamelModel):
    message: str
    metrics: Optional[PortfolioMetrics] = None
    history: list[dict] = []


class AiChatResponse(CamelModel):
    reply: str


class AiInsightsRequest(CamelModel):
    metrics: PortfolioMetrics


class AiInsightsResponse(CamelModel):
    insights: list[Insight]
    reason: Optional[str] = None


class ExpectationRequest(CamelModel):
    current: PortfolioMetrics
    previous: Optional[PortfolioMetrics] = None
