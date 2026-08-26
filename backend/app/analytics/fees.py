"""
Pure helper functions for classifying and aggregating fees.
Ported 1:1 from utils/feeCalculator.ts — no portfolio-wide state lives
here, that's app/portfolio/engine.py's job.
"""

from __future__ import annotations


def normalize_fee_category(raw: str | None) -> str:
    """Normalizes a free-text fee_type CSV value into one of our four buckets."""
    t = (raw or "").strip().lower()
    if "broker" in t:
        return "broker"
    if "tax" in t:
        return "tax"
    if "exch" in t or "currency" in t or "fx" in t:
        return "exchange"
    return "other"


def empty_fees_by_category() -> dict[str, float]:
    return {"broker": 0.0, "tax": 0.0, "exchange": 0.0, "other": 0.0}


def total_fees(fees_by_category: dict[str, float]) -> float:
    """Sums a fees-by-category record into a single total."""
    return (
        fees_by_category["broker"]
        + fees_by_category["tax"]
        + fees_by_category["exchange"]
        + fees_by_category["other"]
    )


def leakage_percent(gross_realized_gain: float, fees: float) -> float | None:
    """What % of gross gains were consumed by fees. None when there's nothing to divide against."""
    if gross_realized_gain == 0:
        return None
    return (fees / abs(gross_realized_gain)) * 100
