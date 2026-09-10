import json
import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app  # noqa: E402
from app.services import ai_service  # noqa: E402

client = TestClient(app)
FIXTURE_DIR = Path(__file__).parent / "fixtures" / "csv"


def _fixture_text(name: str) -> str:
    return (FIXTURE_DIR / name).read_text(encoding="utf-8")


def test_import_transactions_accepts_valid_csv_fixture():
    csv_text = _fixture_text("valid_statement.csv")
    response = client.post(
        "/api/transactions/import",
        files={"file": ("statement.csv", csv_text, "text/csv")},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["errors"] == []
    assert payload["rowCount"] == 2


def test_import_transactions_rejects_missing_required_headers():
    csv_text = _fixture_text("invalid_missing_headers.csv")
    response = client.post(
        "/api/transactions/import",
        files={"file": ("statement.csv", csv_text, "text/csv")},
    )
    assert response.status_code == 422
    assert "Missing required column" in response.json()["detail"]


def test_import_transactions_rejects_non_utf8_payload():
    response = client.post(
        "/api/transactions/import",
        files={"file": ("statement.csv", b"\xff\xfe\xfd", "text/csv")},
    )
    assert response.status_code == 422
    assert "Could not read the file as UTF-8 text." in response.json()["detail"]


def test_portfolio_metrics_round_trip_with_imported_transactions():
    csv_text = _fixture_text("valid_statement.csv")
    imported = client.post(
        "/api/transactions/import",
        files={"file": ("statement.csv", csv_text, "text/csv")},
    )
    assert imported.status_code == 200

    response = client.post("/api/portfolio/metrics", json={"transactions": imported.json()["transactions"]})
    assert response.status_code == 200
    payload = response.json()
    assert payload["transactionCount"] == 2
    assert payload["currency"] == "KES"


def test_ai_insights_falls_back_without_api_keys():
    csv_text = _fixture_text("valid_statement.csv")
    imported = client.post(
        "/api/transactions/import",
        files={"file": ("statement.csv", csv_text, "text/csv")},
    )
    metrics = client.post("/api/portfolio/metrics", json={"transactions": imported.json()["transactions"]})

    response = client.post("/api/ai/insights", json={"metrics": metrics.json()})
    assert response.status_code == 200
    payload = response.json()
    assert payload["reason"] == "no_api_key"
    assert len(payload["insights"]) >= 1


def test_ai_insights_rejects_hallucinated_numbers(monkeypatch):
    csv_text = _fixture_text("valid_statement.csv")
    imported = client.post(
        "/api/transactions/import",
        files={"file": ("statement.csv", csv_text, "text/csv")},
    )
    metrics = client.post("/api/portfolio/metrics", json={"transactions": imported.json()["transactions"]})

    original_enabled = ai_service.settings.ai_enabled

    class _EnabledSettings:
        ai_enabled = True

    async def _fake_call_ai(_: str) -> str:
        return json.dumps([
            {"tag": "Top", "text": "Net result is 999999 KES."},
        ])

    monkeypatch.setattr(ai_service, "_call_ai", _fake_call_ai)
    monkeypatch.setattr(ai_service, "settings", _EnabledSettings())

    response = client.post("/api/ai/insights", json={"metrics": metrics.json()})
    assert response.status_code == 200
    payload = response.json()
    assert payload["reason"] == "invalid_insight_payload"
    assert len(payload["insights"]) >= 1

    monkeypatch.setattr(ai_service, "settings", ai_service.get_settings())


def test_ai_chat_returns_safe_fallback_without_metrics():
    response = client.post("/api/ai/chat", json={"message": "hello", "history": []})
    assert response.status_code == 200
    assert "upload and analyze" in response.json()["reply"].lower()
