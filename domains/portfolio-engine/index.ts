// domains/portfolio-engine/index.ts
//
// Financial calculations no longer live in this codebase — they were
// removed from lib/calculations.ts as part of the Python backend
// migration. This barrel now calls the FastAPI Portfolio Engine
// (backend/app/portfolio/engine.py), which is the sole source of truth
// for every computed metric. See root README "Architecture" section.

import { apiPost } from "@/lib/apiClient";
import { PortfolioMetrics, Transaction } from "@/types/portfolio";

export async function computePortfolioMetrics(
  transactions: Transaction[]
): Promise<PortfolioMetrics> {
  return apiPost<PortfolioMetrics>("/api/portfolio/metrics", { transactions });
}
