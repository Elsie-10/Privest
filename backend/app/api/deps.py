from collections.abc import Generator

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency. Raises a clean 503 (instead of a 500 crash) when
    DATABASE_URL isn't configured, so history/snapshot endpoints degrade
    gracefully rather than breaking the whole API."""
    if SessionLocal is None:
        raise HTTPException(
            status_code=503,
            detail="History persistence is not configured on this server "
            "(DATABASE_URL is unset). Analysis endpoints still work.",
        )
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
