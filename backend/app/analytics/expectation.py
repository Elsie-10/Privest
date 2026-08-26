"""
Judges "exceeding / meeting / below expectations" purely by comparing the
current statement's numbers to the previous saved snapshot's numbers — no
user-defined targets involved. Ported 1:1 from utils/expectationComparator.ts.
"""

from __future__ import annotations

from app.constants import EXPECTATION_BAND_PERCENT
from app.schemas.portfolio import ExpectationComparison, PortfolioMetrics


def compare_to_expectation(
    current: PortfolioMetrics, previous: PortfolioMetrics | None
) -> ExpectationComparison:
    if previous is None:
        return ExpectationComparison(
            status="first", net_profit_delta=0, net_profit_delta_percent=None, roi_point_delta=0
        )

    net_profit_delta = current.net_profit - previous.net_profit
    roi_point_delta = current.roi_percent - previous.roi_percent

    net_profit_delta_percent: float | None = None

    if previous.net_profit != 0:
        net_profit_delta_percent = (net_profit_delta / abs(previous.net_profit)) * 100
        if net_profit_delta_percent > EXPECTATION_BAND_PERCENT:
            status = "exceeding"
        elif net_profit_delta_percent < -EXPECTATION_BAND_PERCENT:
            status = "below"
        else:
            status = "meeting"
    else:
        # Previous month broke even exactly — fall back to a simple sign check.
        if net_profit_delta > 0:
            status = "exceeding"
        elif net_profit_delta < 0:
            status = "below"
        else:
            status = "meeting"

    return ExpectationComparison(
        status=status,
        net_profit_delta=net_profit_delta,
        net_profit_delta_percent=net_profit_delta_percent,
        roi_point_delta=roi_point_delta,
    )
