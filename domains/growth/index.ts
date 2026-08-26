// domains/growth/index.ts
//
// Growth projection math was duplicated here and in lib/calculations'
// world (client-side compounding) before the Python migration. It now
// lives once, in backend/app/portfolio/projections.py, and is reached via
// POST /api/portfolio/growth — this barrel is a thin typed wrapper so any
// existing/future call site doesn't need to know about the HTTP layer.

import { apiPost } from "@/lib/apiClient";
import { PortfolioMetrics } from "@/types/portfolio";

export type GrowthProjectionInput = {
  metrics: PortfolioMetrics;
  months?: number;
  monthlyContribution?: number;
  annualGrowthRatePercent?: number;
};

export type GrowthProjectionPoint = {
  month: string;
  value: number;
};

/** Deterministic monthly compounding projection, computed server-side. */
export async function projectPortfolioGrowth(
  input: GrowthProjectionInput
): Promise<GrowthProjectionPoint[]> {
  const data = await apiPost<{ series: GrowthProjectionPoint[] }>("/api/portfolio/growth", {
    metrics: input.metrics,
    months: input.months ?? 12,
    monthlyContribution: input.monthlyContribution ?? 0,
    annualGrowthRatePercent: input.annualGrowthRatePercent ?? 7,
  });
  return data.series;
}
