"""Pure math helpers for return-on-investment style figures. Ported 1:1
from utils/roiCalculator.ts."""

from __future__ import annotations


def calculate_roi_percent(net_profit: float, total_invested: float) -> float:
    """Realized ROI = net profit (after fees) divided by total capital deployed."""
    if total_invested <= 0:
        return 0.0
    return (net_profit / total_invested) * 100


def calculate_net_profit(gross_realized_gain: float, total_fees: float) -> float:
    """Net profit is the gross realized gain minus every fee category paid."""
    return gross_realized_gain - total_fees


def percent_change(current: float, previous: float) -> float | None:
    """Month-over-month change, used for trade-frequency and fee trend insights.
    Returns None when there isn't a valid previous value to compare against."""
    if previous <= 0:
        return None
    return ((current - previous) / previous) * 100
