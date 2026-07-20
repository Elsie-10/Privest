"use client";

// app/providers.tsx
// Holds portfolio state (parsed statement + computed metrics) in memory so
// it survives client-side navigation between /upload and /dashboard.
// Next.js App Router keeps this provider mounted across route changes as
// long as navigation happens via <Link>/router.push rather than a full
// page reload, so no localStorage/sessionStorage is needed for the core
// flow. A hard refresh on /dashboard will lose state — that route redirects
// back to /upload in that case (see app/dashboard/page.tsx).

import { createContext, useContext, useState, ReactNode } from "react";
import { ParsedStatement, PortfolioMetrics } from "@/types/portfolio";

interface PortfolioContextValue {
  statement: ParsedStatement | null;
  setStatement: (s: ParsedStatement | null) => void;
  metrics: PortfolioMetrics | null;
  setMetrics: (m: PortfolioMetrics | null) => void;
  reset: () => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [statement, setStatement] = useState<ParsedStatement | null>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);

  function reset() {
    setStatement(null);
    setMetrics(null);
  }

  return (
    <PortfolioContext.Provider value={{ statement, setStatement, metrics, setMetrics, reset }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
