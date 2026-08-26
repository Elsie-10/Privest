"""POST /api/transactions/* — ingestion endpoints. Parsing/validation only;
no financial math happens here (that's app/api/portfolio.py + the engine)."""

from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.parsers.csv_parser import build_sample_csv, parse_csv_text
from app.schemas.portfolio import ParsedStatement, Transaction

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.post("/import", response_model=ParsedStatement)
async def import_transactions(file: UploadFile = File(...)) -> ParsedStatement:
    """Parses an uploaded CSV brokerage statement into validated transactions.
    Mirrors the old app/api/upload/route.ts, now backed by the same parser
    the rest of the Python engine uses (app/parsers/csv_parser.py)."""
    name = (file.filename or "").lower()
    if not name.endswith(".csv"):
        raise HTTPException(
            status_code=422,
            detail="Unsupported file type. Please upload a CSV statement "
            "(PDF/OCR import is staged for a future build).",
        )

    raw = await file.read()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(status_code=422, detail="Could not read the file as UTF-8 text.")

    result = parse_csv_text(text)
    if result.errors:
        raise HTTPException(status_code=422, detail=result.errors[0])
    return result


@router.post("", response_model=ParsedStatement)
async def validate_transactions(transactions: list[Transaction]) -> ParsedStatement:
    """Validates a list of transactions the client already has (e.g. parsed
    client-side, or edited by hand) without going through CSV parsing."""
    return ParsedStatement(transactions=transactions, row_count=len(transactions), errors=[])


@router.get("/sample-csv")
async def sample_csv() -> dict:
    """Sample statement so users can try the app without their own file."""
    return {"csv": build_sample_csv()}
