"""
Postgres-backed replacement for the old browser-localStorage history
(lib/history.ts). Storing the parsed statement + computed metrics as JSON
columns keeps this model simple while Postgres remains the durability
layer; if/when multi-user accounts are added, add a user_id column here.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class StatementSnapshot(Base):
    __tablename__ = "statement_snapshots"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    saved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    period_label: Mapped[str] = mapped_column(String, nullable=False)
    statement: Mapped[dict] = mapped_column(JSONB, nullable=False)  # ParsedStatement JSON
    metrics: Mapped[dict] = mapped_column(JSONB, nullable=False)  # PortfolioMetrics JSON
