"use client";

// app/providers.tsx
// Holds portfolio state (parsed statement, computed metrics, and which
// saved snapshot — if any — is currently being viewed) in memory so it
// survives client-side navigation between /upload, /dashboard, and
// /history. Next.js App Router keeps this provider mounted across route
// changes as long as navigation happens via <Link>/router.push rather
// than a full page reload.
//
// Three explicit actions instead of raw setters, because "a new upload
// just arrived" and "we're viewing a saved snapshot" need to behave
// differently (only the former should trigger the privacy-flow animation
// and get saved as a new history entry) — see app/dashboard/page.tsx.

import { createContext, useContext, useState, ReactNode } from "react";
import { ParsedStatement, PortfolioMetrics, StatementSnapshot } from "@/types/portfolio";

interface PortfolioContextValue {
  statement: ParsedStatement | null;
  metrics: PortfolioMetrics | null;
  currentSnapshotId: string | null;

  /** A brand-new CSV was just parsed successfully. Clears metrics so /dashboard runs the privacy flow. */
  startNewStatement: (s: ParsedStatement) => void;

  /** The privacy flow finished and analysis + history save is complete. */
  completeAnalysis: (metrics: PortfolioMetrics, snapshotId: string) => void;

  /** Jump straight to viewing a previously saved snapshot — no privacy flow, no re-save. */
  loadSnapshot: (snapshot: StatementSnapshot) => void;

  reset: () => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [statement, setStatement] = useState<ParsedStatement | null>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [currentSnapshotId, setCurrentSnapshotId] = useState<string | null>(null);

  function startNewStatement(s: ParsedStatement) {
    setStatement(s);
    setMetrics(null);
    setCurrentSnapshotId(null);
  }

  function completeAnalysis(m: PortfolioMetrics, snapshotId: string) {
    setMetrics(m);
    setCurrentSnapshotId(snapshotId);
  }

  function loadSnapshot(snapshot: StatementSnapshot) {
    setStatement(snapshot.statement);
    setMetrics(snapshot.metrics);
    setCurrentSnapshotId(snapshot.id);
  }

  function reset() {
    setStatement(null);
    setMetrics(null);
    setCurrentSnapshotId(null);
  }

  return (
    <PortfolioContext.Provider
      value={{
        statement,
        metrics,
        currentSnapshotId,
        startNewStatement,
        completeAnalysis,
        loadSnapshot,
        reset,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}