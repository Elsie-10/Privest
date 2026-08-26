// domains/risk/index.ts
//
// The recommendation rule engine (lib/ruleEngine.ts) was removed from the
// frontend as part of the Python backend migration — it now lives at
// backend/app/risk/rules.py and runs as part of computing PortfolioMetrics
// (see domains/portfolio-engine). This helper just reads the
// already-computed recommendations back off a metrics object, kept for
// any call site still expecting a `generateRecommendations`-shaped export.

import { PortfolioMetrics, PortfolioRecommendation } from "@/types/portfolio";

export function getRecommendations(metrics: PortfolioMetrics): PortfolioRecommendation[] {
  return metrics.recommendations;
}
