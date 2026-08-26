"""
Server-side replacement for lib/history.ts. Same behavior (append,
list oldest-first, get-previous, delete, clear, capped at
MAX_HISTORY_SNAPSHOTS) but backed by Postgres instead of localStorage —
this is the concrete trade-off from moving to a real backend: history
now follows the user across devices/browsers, at the cost of the raw
statement/metrics living server-side. See root README's "Architecture &
privacy" section.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.snapshot import StatementSnapshot as SnapshotModel
from app.schemas.portfolio import ParsedStatement, PortfolioMetrics, StatementSnapshot

MAX_HISTORY_SNAPSHOTS = 36


def _derive_period_label(metrics: PortfolioMetrics) -> str:
    if metrics.monthly:
        return metrics.monthly[-1].month
    from datetime import date

    return date.today().strftime("%Y-%m")


def save_snapshot(
    db: Session, statement: ParsedStatement, metrics: PortfolioMetrics
) -> StatementSnapshot:
    row = SnapshotModel(
        period_label=_derive_period_label(metrics),
        statement=statement.model_dump(by_alias=True),
        metrics=metrics.model_dump(by_alias=True),
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    # Enforce the cap, oldest first.
    all_ids = db.execute(
        select(SnapshotModel.id).order_by(SnapshotModel.saved_at.asc())
    ).scalars().all()
    if len(all_ids) > MAX_HISTORY_SNAPSHOTS:
        stale_ids = all_ids[: len(all_ids) - MAX_HISTORY_SNAPSHOTS]
        db.query(SnapshotModel).filter(SnapshotModel.id.in_(stale_ids)).delete(
            synchronize_session=False
        )
        db.commit()

    return _to_schema(row)


def get_snapshots(db: Session) -> list[StatementSnapshot]:
    rows = db.execute(
        select(SnapshotModel).order_by(SnapshotModel.saved_at.asc())
    ).scalars().all()
    return [_to_schema(r) for r in rows]


def get_previous_snapshot(db: Session, current_id: str) -> StatementSnapshot | None:
    all_snapshots = get_snapshots(db)
    index = next((i for i, s in enumerate(all_snapshots) if s.id == current_id), -1)
    if index <= 0:
        return None
    return all_snapshots[index - 1]


def delete_snapshot(db: Session, snapshot_id: str) -> None:
    db.query(SnapshotModel).filter(SnapshotModel.id == snapshot_id).delete()
    db.commit()


def clear_history(db: Session) -> None:
    db.query(SnapshotModel).delete()
    db.commit()


def _to_schema(row: SnapshotModel) -> StatementSnapshot:
    return StatementSnapshot(
        id=row.id,
        saved_at=row.saved_at.isoformat(),
        period_label=row.period_label,
        statement=ParsedStatement.model_validate(row.statement),
        metrics=PortfolioMetrics.model_validate(row.metrics),
    )
