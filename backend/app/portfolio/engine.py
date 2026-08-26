"""
Deterministic portfolio engine: all metrics and recommendations are
derived from transaction history without calling any external AI service.

This is a faithful port of lib/calculations.ts. The per-symbol running
average-cost bookkeeping is inherently sequential (each row updates state
built by the previous one), so that part stays a single pass over the
rows sorted by date — exactly like the TS original. Pandas is used to
load/sort the transactions and to build the monthly/holding aggregates;
NumPy backs the numeric reductions.

IMPORTANT: this module is the sole source of truth for financial
calculations. The AI layer (app/services/ai_service.py) only ever
receives numbers already computed here — it must never be asked to
compute or estimate a metric itself.
"""

from __future__ import annotations

from collections import defaultdict

import numpy as np
import pandas as pd

from app.analytics.fees import empty_fees_by_category, leakage_percent, total_fees as sum_fees
from app.analytics.roi import calculate_net_profit, calculate_roi_percent, percent_change
from app.risk.rules import generate_recommendations
from app.schemas.portfolio import (
    AllocationPoint,
    FeesByCategory,
    GrowthPoint,
    HoldingSnapshot,
    MonthlyActivity,
    PortfolioMetrics,
    Position,
    Transaction,
)

_ALLOCATION_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#0f766e", "#14b8a6", "#2dd4bf"]


def _month_key(date: str) -> str:
    return date[:7]


def compute_portfolio_metrics(transactions: list[Transaction]) -> PortfolioMetrics:
    if not transactions:
        rows: list[Transaction] = []
    else:
        # Sort by date exactly like `[...transactions].sort((a, b) => ...)` in TS.
        df = pd.DataFrame(
            [
                {"idx": i, "date": t.date, **t.model_dump()}
                for i, t in enumerate(transactions)
            ]
        )
        df["_ts"] = pd.to_datetime(df["date"], errors="coerce")
        df = df.sort_values(["_ts", "idx"], kind="stable")
        rows = [transactions[i] for i in df["idx"].tolist()]

    positions: dict[str, Position] = {}
    symbol_gains: dict[str, float] = defaultdict(float)
    symbol_invested: dict[str, float] = defaultdict(float)
    fees_by_category = empty_fees_by_category()
    monthly_map: dict[str, MonthlyActivity] = {}

    total_invested = 0.0
    total_sales = 0.0
    gross_realized_gain = 0.0
    currency = "KES"
    realized_pn_l = 0.0
    dividend_income = 0.0

    for r in rows:
        currency = r.currency or currency
        fees_by_category[r.fee_category] += r.fee

        month_key = _month_key(r.date)
        if month_key not in monthly_map:
            monthly_map[month_key] = MonthlyActivity(
                month=month_key, invested=0, sold=0, fees=0, transaction_count=0, realized_gain=0
            )
        monthly_map[month_key].fees += r.fee
        monthly_map[month_key].transaction_count += 1

        if r.symbol not in positions:
            positions[r.symbol] = Position(symbol=r.symbol, quantity=0, avg_cost=0)
        pos = positions[r.symbol]

        if r.type == "buy" and r.quantity > 0:
            cost = r.quantity * r.price
            total_invested += cost
            symbol_invested[r.symbol] += cost
            monthly_map[month_key].invested += cost

            new_qty = pos.quantity + r.quantity
            pos.avg_cost = ((pos.quantity * pos.avg_cost) + cost) / new_qty if new_qty > 0 else 0
            pos.quantity = new_qty
        elif r.type == "sell" and r.quantity > 0:
            proceeds = r.quantity * r.price
            total_sales += proceeds
            monthly_map[month_key].sold += proceeds

            sell_qty = min(r.quantity, pos.quantity)
            cost_basis_for_sale = sell_qty * pos.avg_cost
            gain = proceeds - cost_basis_for_sale
            gross_realized_gain += gain
            realized_pn_l += gain
            monthly_map[month_key].realized_gain += gain
            symbol_gains[r.symbol] += gain
            pos.quantity = max(0.0, pos.quantity - r.quantity)

        if r.quantity > 0 and r.type in ("buy", "sell"):
            dividend_income += max(0.0, r.quantity * 0.01)

    total_fees_value = sum_fees(fees_by_category)
    net_profit = calculate_net_profit(gross_realized_gain, total_fees_value)
    roi_percent = calculate_roi_percent(net_profit, total_invested)

    open_positions = [p for p in positions.values() if p.quantity > 0]
    open_value = float(np.sum([p.quantity * p.avg_cost for p in open_positions])) if open_positions else 0.0
    cost_basis = open_value

    # Same synthetic "market price" heuristic as the TS engine (no live
    # market-data feed yet — see README "Known limitations").
    market_value = float(
        np.sum([p.quantity * max(p.avg_cost * 0.98, p.avg_cost * 1.01) for p in open_positions])
    ) if open_positions else 0.0
    unrealized_pn_l = market_value - cost_basis
    total_return_percent = (
        ((net_profit + unrealized_pn_l) / total_invested) * 100 if total_invested > 0 else 0.0
    )
    dividend_yield = (dividend_income / total_invested) * 100 if total_invested > 0 else 0.0

    holdings: list[HoldingSnapshot] = []
    for p in open_positions:
        market_price = p.avg_cost * (1 + (p.quantity % 3) * 0.015)
        market_value_for_holding = p.quantity * market_price
        unrealized = market_value_for_holding - p.quantity * p.avg_cost
        return_percent = (
            (unrealized / (p.quantity * p.avg_cost)) * 100 if p.avg_cost > 0 else 0.0
        )
        holdings.append(
            HoldingSnapshot(
                symbol=p.symbol,
                quantity=p.quantity,
                avg_cost=p.avg_cost,
                market_price=market_price,
                market_value=market_value_for_holding,
                cost_basis=p.quantity * p.avg_cost,
                unrealized_pn_l=unrealized,
                unrealized_return_percent=return_percent,
                dividend_estimate=p.quantity * 0.5,
                dividend_yield=((p.quantity * 0.5) / (p.quantity * p.avg_cost)) * 100
                if p.avg_cost > 0
                else 0.0,
                weight=0.0,
            )
        )

    total_weighted_value = float(np.sum([h.market_value for h in holdings])) if holdings else 0.0
    sorted_holdings = sorted(holdings, key=lambda h: h.market_value, reverse=True)[:6]
    allocations = [
        AllocationPoint(
            name=h.symbol,
            value=(h.market_value / total_weighted_value) * 100 if total_weighted_value > 0 else 0.0,
            color=_ALLOCATION_COLORS[i % len(_ALLOCATION_COLORS)],
        )
        for i, h in enumerate(sorted_holdings)
    ]

    monthly_series_data = sorted(monthly_map.values(), key=lambda m: m.month)
    growth_series = [
        GrowthPoint(month=m.month, value=m.invested + m.realized_gain) for m in monthly_series_data
    ]

    weighted_value = float(np.sum([h.market_value for h in holdings])) if holdings else 0.0
    normalized_holdings = [
        h.model_copy(
            update={
                "weight": (h.market_value / weighted_value) * 100 if weighted_value > 0 else 0.0
            }
        )
        for h in holdings
    ]

    diversification_score = max(
        0.0, min(100.0, 100 - (len(normalized_holdings) * 7 if len(normalized_holdings) > 1 else 0))
    )
    concentration_score = max(0.0, min(100.0, 100 - (allocations[0].value if allocations else 0) * 1.2))
    risk_score = max(
        10.0,
        min(
            95.0,
            50
            + (20 if concentration_score < 65 else 0)
            + (10 if dividend_yield < 2 else 0),
        ),
    )

    top_performer: str | None = None
    top_gain = -float("inf")
    for symbol, gain in symbol_gains.items():
        if gain > top_gain:
            top_gain = gain
            top_performer = symbol
    top_performer_share_percent = (
        (top_gain / abs(gross_realized_gain)) * 100
        if top_performer is not None and gross_realized_gain != 0
        else None
    )

    most_concentrated_holding: str | None = None
    conc_amt = -float("inf")
    for symbol, amt in symbol_invested.items():
        if amt > conc_amt:
            conc_amt = amt
            most_concentrated_holding = symbol
    concentration_share_percent = (
        (conc_amt / total_invested) * 100
        if most_concentrated_holding is not None and total_invested > 0
        else None
    )

    monthly = monthly_series_data

    trade_frequency_trend_percent: float | None = None
    if len(monthly) >= 2:
        trade_frequency_trend_percent = percent_change(
            monthly[-1].transaction_count, monthly[-2].transaction_count
        )

    fee_trend: str | None = None
    if len(monthly) >= 3:
        last3 = [m.fees for m in monthly[-3:]]
        fee_trend = "up" if last3[2] > last3[0] else "down" if last3[2] < last3[0] else "flat"

    metrics = PortfolioMetrics(
        currency=currency,
        transaction_count=len(rows),
        months_of_activity=len(monthly),
        total_invested=total_invested,
        total_sales=total_sales,
        open_value=open_value,
        market_value=market_value,
        cost_basis=cost_basis,
        unrealized_pn_l=unrealized_pn_l,
        realized_pn_l=realized_pn_l,
        total_return_percent=total_return_percent,
        dividend_income=dividend_income,
        dividend_yield=dividend_yield,
        diversification_score=diversification_score,
        concentration_score=concentration_score,
        risk_score=risk_score,
        gross_realized_gain=gross_realized_gain,
        total_fees=total_fees_value,
        net_profit=net_profit,
        roi_percent=roi_percent,
        leakage_percent=leakage_percent(gross_realized_gain, total_fees_value),
        fees_by_category=FeesByCategory(**fees_by_category),
        top_performer=top_performer,
        top_performer_share_percent=top_performer_share_percent,
        most_concentrated_holding=most_concentrated_holding,
        concentration_share_percent=concentration_share_percent,
        trade_frequency_trend_percent=trade_frequency_trend_percent,
        fee_trend=fee_trend,  # type: ignore[arg-type]
        monthly=monthly,
        positions=open_positions,
        holdings=normalized_holdings,
        allocations=allocations,
        growth_series=growth_series,
        recommendations=[],
    )

    metrics.recommendations = generate_recommendations(metrics)
    return metrics
