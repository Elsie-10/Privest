// utils/feeCalculator.ts
// Pure helper functions for classifying and aggregating fees.
// No portfolio-wide state lives here — that's lib/calculations.ts's job.
// Category labels/colors live in lib/constants.ts and are re-exported here
// for convenience so existing imports of FEE_CATEGORY_* keep working.

import { FeeCategory } from "@/types/portfolio";

export {
  FEE_CATEGORY_LABELS,
  FEE_CATEGORY_COLORS,
  FEE_CATEGORY_ORDER,
} from "@/lib/constants";

/** Normalizes a free-text fee_type CSV value into one of our four buckets. */
export function normalizeFeeCategory(raw: string | undefined | null): FeeCategory {
  const t = (raw ?? "").toString().trim().toLowerCase();
  if (t.includes("broker")) return "broker";
  if (t.includes("tax")) return "tax";
  if (t.includes("exch") || t.includes("currency") || t.includes("fx")) return "exchange";
  return "other";
}

export function emptyFeesByCategory(): Record<FeeCategory, number> {
  return { broker: 0, tax: 0, exchange: 0, other: 0 };
}

/** Sums a fees-by-category record into a single total. */
export function totalFees(feesByCategory: Record<FeeCategory, number>): number {
  return (
    feesByCategory.broker +
    feesByCategory.tax +
    feesByCategory.exchange +
    feesByCategory.other
  );
}

/** What % of gross gains were consumed by fees. Null when there's nothing to divide against. */
export function leakagePercent(grossRealizedGain: number, fees: number): number | null {
  if (grossRealizedGain === 0) return null;
  return (fees / Math.abs(grossRealizedGain)) * 100;
}
