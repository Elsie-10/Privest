// utils/expectationComparator.ts
// Judges "exceeding / meeting / below expectations" purely by comparing
// the current statement's numbers to the previous saved snapshot's numbers
// — no user-defined targets involved, per how this feature was scoped.

import { ExpectationComparison, ExpectationStatus, PortfolioMetrics } from "@/types/portfolio";
import { EXPECTATION_BAND_PERCENT } from "@/lib/constants";

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