// utils/roiCalculator.ts
// Pure math helpers for return-on-investment style figures.

/** Realized ROI = net profit (after fees) divided by total capital deployed. */
export function calculateRoiPercent(netProfit: number, totalInvested: number): number {
  if (totalInvested <= 0) return 0;
  return (netProfit / totalInvested) * 100;
}

/** Net profit is the gross realized gain minus every fee category paid. */
export function calculateNetProfit(grossRealizedGain: number, totalFees: number): number {
  return grossRealizedGain - totalFees;
}

/**
 * Month-over-month change, used for trade-frequency and fee trend insights.
 * Returns null when there isn't a valid previous value to compare against.
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}
