// lib/history.ts
//
// Persists analyzed statements to the browser's own localStorage — nothing
// is sent to a server. This is what lets Privest AI show progress over
// time without user accounts: history lives on this device, in this
// browser, exactly like the rest of the app's privacy-first design.
//
// Trade-off, stated plainly: this history won't follow you to another
// browser or device. That's the deliberate cost of not standing up
// accounts + a database. See README for the fuller discussion.

import { ParsedStatement, PortfolioMetrics, StatementSnapshot } from "@/types/portfolio";
import { HISTORY_STORAGE_KEY, MAX_HISTORY_SNAPSHOTS } from "@/lib/constants";

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/** All saved snapshots, oldest first. Safe to call on the server (returns []). */
export function getSnapshots(): StatementSnapshot[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StatementSnapshot[];
    if (!Array.isArray(parsed)) return [];
    return [...parsed].sort(
      (a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime()
    );
  } catch {
    return [];
  }
}

function persist(snapshots: StatementSnapshot[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(snapshots));
  } catch {
    // Storage full or unavailable (e.g. private browsing) — fail silently,
    // the current session still works, it just won't be remembered.
  }
}

/** Derives "YYYY-MM" from the most recent month with activity in the metrics. */
function derivePeriodLabel(metrics: PortfolioMetrics): string {
  if (metrics.monthly.length) return metrics.monthly[metrics.monthly.length - 1].month;
  return new Date().toISOString().slice(0, 7);
}

/** Saves a freshly analyzed statement as a new snapshot and returns it. */
export function saveSnapshot(
  statement: ParsedStatement,
  metrics: PortfolioMetrics
): StatementSnapshot {
  const snapshot: StatementSnapshot = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
    periodLabel: derivePeriodLabel(metrics),
    statement,
    metrics,
  };

  const existing = getSnapshots();
  const updated = [...existing, snapshot].slice(-MAX_HISTORY_SNAPSHOTS);
  persist(updated);
  return snapshot;
}

/** The snapshot immediately before the given one, chronologically. Null if it's the first. */
export function getPreviousSnapshot(currentId: string): StatementSnapshot | null {
  const all = getSnapshots();
  const index = all.findIndex((s) => s.id === currentId);
  if (index <= 0) return null;
  return all[index - 1];
}

export function deleteSnapshot(id: string): void {
  const remaining = getSnapshots().filter((s) => s.id !== id);
  persist(remaining);
}

export function clearHistory(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(HISTORY_STORAGE_KEY);
}