"""
Single source of truth for values referenced across multiple modules,
ported from lib/constants.ts. Keep this in sync with the TS file for the
handful of constants (fee labels/colors, sample CSV) still duplicated
because the frontend also renders them directly.
"""

REQUIRED_CSV_COLUMNS = ["date", "symbol", "type", "quantity", "price"]

DEFAULT_CURRENCY = "KES"
MAX_CSV_UPLOAD_BYTES = 2 * 1024 * 1024
MAX_CSV_ROWS = 10000

FEE_CATEGORY_LABELS = {
    "broker": "Broker Fees",
    "tax": "Taxes",
    "exchange": "Exchange Charges",
    "other": "Other Charges",
}

FEE_CATEGORY_ORDER = ["broker", "tax", "exchange", "other"]

# Month-over-month change within this band counts as "meeting" rather than
# exceeding/below.
EXPECTATION_BAND_PERCENT = 5

SAMPLE_CSV_ROWS = [
    ["date", "symbol", "type", "quantity", "price", "fee", "fee_type", "currency"],
    ["2025-08-04", "SCOM", "buy", "500", "17.20", "120", "broker", "KES"],
    ["2025-08-04", "SCOM", "buy", "0", "0", "25", "tax", "KES"],
    ["2025-09-12", "EQTY", "buy", "200", "44.50", "95", "broker", "KES"],
    ["2025-09-30", "SCOM", "sell", "200", "19.80", "80", "broker", "KES"],
    ["2025-09-30", "SCOM", "sell", "0", "0", "15", "tax", "KES"],
    ["2025-10-15", "KCB", "buy", "300", "32.10", "110", "broker", "KES"],
    ["2025-10-22", "EQTY", "sell", "100", "41.00", "60", "broker", "KES"],
    ["2025-11-05", "SCOM", "buy", "150", "20.40", "75", "broker", "KES"],
    ["2025-11-05", "SCOM", "buy", "0", "0", "40", "exchange", "KES"],
    ["2025-11-19", "KCB", "sell", "150", "35.60", "90", "broker", "KES"],
    ["2025-12-02", "EQTY", "buy", "250", "39.80", "130", "broker", "KES"],
    ["2025-12-02", "EQTY", "buy", "0", "0", "35", "exchange", "KES"],
    ["2026-01-10", "KCB", "sell", "150", "30.20", "85", "broker", "KES"],
    ["2026-01-10", "KCB", "sell", "0", "0", "20", "tax", "KES"],
    ["2026-02-14", "SCOM", "sell", "300", "22.10", "100", "broker", "KES"],
    ["2026-02-14", "SCOM", "sell", "0", "0", "30", "tax", "KES"],
    ["2026-03-01", "EQTY", "sell", "150", "45.30", "95", "broker", "KES"],
]
