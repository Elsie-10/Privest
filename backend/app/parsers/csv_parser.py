"""
Turns a raw brokerage-statement CSV into validated Transaction rows.
Ported from lib/csvParser.ts. PDF/OCR import is a future format — this
module is intentionally the single place that would grow a second parser
(see app/parsers/__init__.py).
"""

from __future__ import annotations

import io

import pandas as pd

from app.analytics.fees import normalize_fee_category
from app.constants import DEFAULT_CURRENCY, MAX_CSV_ROWS, MAX_CSV_UPLOAD_BYTES, REQUIRED_CSV_COLUMNS
from app.schemas.portfolio import ParsedStatement, Transaction


def parse_csv_text(csv_text: str) -> ParsedStatement:
    """Core parser: raw CSV text in, validated transactions out."""
    if len(csv_text.encode("utf-8")) > MAX_CSV_UPLOAD_BYTES:
        return ParsedStatement(
            transactions=[],
            row_count=0,
            errors=[f"CSV exceeds the {MAX_CSV_UPLOAD_BYTES // (1024 * 1024)}MB upload limit."],
        )

    try:
        df = pd.read_csv(io.StringIO(csv_text), dtype=str, keep_default_na=False)
    except Exception:
        return ParsedStatement(
            transactions=[],
            row_count=0,
            errors=["We could not read that file. Please check it is a valid CSV."],
        )

    normalized_fields = [c.strip().lower() for c in df.columns]
    df.columns = normalized_fields

    if len(df.index) > MAX_CSV_ROWS:
        return ParsedStatement(
            transactions=[],
            row_count=0,
            errors=[f"CSV has too many rows. Maximum allowed is {MAX_CSV_ROWS}."],
        )

    missing = [c for c in REQUIRED_CSV_COLUMNS if c not in normalized_fields]
    if missing:
        return ParsedStatement(
            transactions=[],
            row_count=0,
            errors=[f"Missing required column(s): {', '.join(missing)}."],
        )

    transactions: list[Transaction] = []
    default_currency = DEFAULT_CURRENCY

    for _, row in df.iterrows():
        date = str(row.get("date", "")).strip()
        symbol = str(row.get("symbol", "")).strip()
        type_raw = str(row.get("type", "")).strip().lower()

        if not date or not symbol or not type_raw:
            continue
        if type_raw not in ("buy", "sell"):
            continue

        quantity = _to_float(row.get("quantity"))
        price = _to_float(row.get("price"))
        fee = _to_float(row.get("fee"))
        currency = (str(row.get("currency", "")).strip() or default_currency).upper()
        default_currency = currency

        transactions.append(
            Transaction(
                date=date,
                symbol=symbol.upper(),
                type=type_raw,  # type: ignore[arg-type]
                quantity=quantity,
                price=price,
                fee=fee,
                fee_category=normalize_fee_category(row.get("fee_type")),  # type: ignore[arg-type]
                currency=currency,
            )
        )

    if not transactions:
        return ParsedStatement(
            transactions=[],
            row_count=0,
            errors=["No valid transaction rows were found in this file."],
        )

    return ParsedStatement(transactions=transactions, row_count=len(transactions), errors=[])


def _to_float(value: object) -> float:
    try:
        result = float(str(value))
        return result if result == result else 0.0  # NaN check
    except (TypeError, ValueError):
        return 0.0


def build_sample_csv() -> str:
    """Generates a small, realistic sample statement so users can try the app immediately."""
    from app.constants import SAMPLE_CSV_ROWS

    return "\n".join(",".join(row) for row in SAMPLE_CSV_ROWS)
