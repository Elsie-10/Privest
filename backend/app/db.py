"""
SQLAlchemy engine/session setup for Postgres persistence.

Persistence is optional: if DATABASE_URL isn't set, `engine`/`SessionLocal`
are None and the API runs in stateless "analyze only" mode (no history,
no saved snapshots) — this is what keeps the app buildable and runnable
before Postgres is provisioned, per migration rule #12.
"""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

settings = get_settings()


class Base(DeclarativeBase):
    pass


engine = create_engine(settings.database_url) if settings.db_enabled else None
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None


def get_db() -> Generator[Session, None, None]:
    if SessionLocal is None:
        raise RuntimeError(
            "DATABASE_URL is not configured — snapshot persistence is disabled. "
            "Set DATABASE_URL in backend/.env to enable history endpoints."
        )
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create tables if they don't exist. Call once at startup when db is enabled."""
    if engine is None:
        return
    from app.models import snapshot  # noqa: F401  (registers models on Base)

    Base.metadata.create_all(bind=engine)
