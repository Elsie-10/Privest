import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.parsers.csv_parser import build_sample_csv, parse_csv_text  # noqa: E402
from app.portfolio.engine import compute_portfolio_metrics  # noqa: E402
from app.schemas.portfolio import Transaction  # noqa: E402


def test_sample_csv_parses_cleanly():
    csv_text = build_sample_csv()
    result = parse_csv_text(csv_text)
    assert result.errors == []
    assert result.row_count == 17
    assert result.transactions[0].symbol == "SCOM"
    assert result.transactions[0].type == "buy"


def test_missing_required_columns_reports_error():
    result = parse_csv_text("symbol,type\nSCOM,buy\n")
    assert result.errors
    assert "Missing required column" in result.errors[0]


def test_metrics_basic_buy_sell_roundtrip():
    txs = [
        Transaction(
            date="2026-01-01", symbol="AAA", type="buy", quantity=100, price=10,
            fee=10, fee_category="broker", currency="KES",
        ),
        Transaction(
            date="2026-02-01", symbol="AAA", type="sell", quantity=50, price=15,
            fee=5, fee_category="broker", currency="KES",
        ),
    ]
    m = compute_portfolio_metrics(txs)

    assert m.transaction_count == 2
    assert m.total_invested == 1000
    assert m.total_sales == 750
    # realized gain = proceeds(750) - costBasis(50*10=500) = 250
    assert m.gross_realized_gain == 250
    assert m.total_fees == 15
    assert m.net_profit == 235  # 250 - 15
    assert round(m.roi_percent, 4) == round((235 / 1000) * 100, 4)
    assert len(m.positions) == 1
    assert m.positions[0].quantity == 50
    assert m.positions[0].avg_cost == 10
    assert m.currency == "KES"
    assert m.months_of_activity == 2
    assert len(m.recommendations) >= 1


def test_metrics_empty_transactions_is_safe():
    m = compute_portfolio_metrics([])
    assert m.transaction_count == 0
    assert m.total_invested == 0
    assert m.roi_percent == 0
    assert m.recommendations  # rule engine always returns >=1 (the "maintain posture" default)


def test_full_sample_csv_end_to_end():
    result = parse_csv_text(build_sample_csv())
    m = compute_portfolio_metrics(result.transactions)
    assert m.transaction_count == 17
    assert m.fees_by_category.broker > 0
    assert m.fees_by_category.tax > 0
    assert m.fees_by_category.exchange > 0
    # 3 symbols traded across the sample statement
    symbols = {t.symbol for t in result.transactions}
    assert symbols == {"SCOM", "EQTY", "KCB"}


if __name__ == "__main__":
    import pytest

    raise SystemExit(pytest.main([__file__, "-v"]))
