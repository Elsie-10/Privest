// utils/expectationComparator.ts
// Judges "exceeding / meeting / below expectations" purely by comparing
// the current statement's numbers to the previous saved snapshot's numbers
// — no user-defined targets involved, per how this feature was scoped.
//
// Intentionally still client-side after the Python backend migration: both
// PortfolioMetrics inputs are already in memory (current + the previous
// history snapshot), so this stays a pure, free, synchronous comparison
// rather than a network round-trip. It mirrors
// backend/app/analytics/expectation.py exactly — that Python copy exists
// for API consumers who only have metrics, not both snapshots, in hand
// (e.g. POST /api/portfolio/expectation-comparison). Keep the two in sync
// if this logic ever changes.

import { ExpectationComparison, ExpectationStatus, PortfolioMetrics } from "@/types/portfolio";
import { EXPECTATION_BAND_PERCENT } from "@/domains/shared";

export function compareToExpectation(
  current: PortfolioMetrics,
  previous: PortfolioMetrics | null
): ExpectationComparison {
  if (!previous) {
    return { status: "first", netProfitDelta: 0, netProfitDeltaPercent: null, roiPointDelta: 0 };
  }

  const netProfitDelta = current.netProfit - previous.netProfit;
  const roiPointDelta = current.roiPercent - previous.roiPercent;

  let netProfitDeltaPercent: number | null = null;
  let status: ExpectationStatus;

  if (previous.netProfit !== 0) {
    netProfitDeltaPercent = (netProfitDelta / Math.abs(previous.netProfit)) * 100;
    if (netProfitDeltaPercent > EXPECTATION_BAND_PERCENT) status = "exceeding";
    else if (netProfitDeltaPercent < -EXPECTATION_BAND_PERCENT) status = "below";
    else status = "meeting";
  } else {
    // Previous month broke even exactly — fall back to a simple sign check.
    status = netProfitDelta > 0 ? "exceeding" : netProfitDelta < 0 ? "below" : "meeting";
  }

  return { status, netProfitDelta, netProfitDeltaPercent, roiPointDelta };
}