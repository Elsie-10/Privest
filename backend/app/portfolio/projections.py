"""
Forward-looking growth projection, built on top of already-computed
metrics (never raw transactions, and never invented by an LLM). New
capability requested by the migration spec — the historical `growthSeries`
already returned inside PortfolioMetrics stays as-is; this is a distinct
*projection* endpoint (POST /api/portfolio/growth).

Deterministic compound-growth model: starts from the portfolio's current
market value and applies a monthly contribution plus a fixed annual
growth rate. NumPy vectorizes the compounding across months.
"""

from __future__ import annotations

from datetime import date

import numpy as np

from app.schemas.portfolio import GrowthPoint, PortfolioMetrics


def project_growth(
    metrics: PortfolioMetrics,
    months: int = 12,
    monthly_contribution: float = 0.0,
    annual_growth_rate_percent: float = 7.0,
) -> list[GrowthPoint]:
    months = max(1, min(months, 360))
    monthly_rate = (1 + annual_growth_rate_percent / 100) ** (1 / 12) - 1

    starting_value = metrics.market_value
    contributions = np.full(months, monthly_contribution, dtype=float)
    growth_factors = np.full(months, 1 + monthly_rate, dtype=float)

    values = np.empty(months, dtype=float)
    running = starting_value
    for i in range(months):
        running = running * growth_factors[i] + contributions[i]
        values[i] = running

    today = date.today().replace(day=1)
    series: list[GrowthPoint] = []
    year, month = today.year, today.month
    for i in range(months):
        month += 1
        if month > 12:
            month = 1
            year += 1
        series.append(GrowthPoint(month=f"{year:04d}-{month:02d}", value=round(float(values[i]), 2)))

    return series
