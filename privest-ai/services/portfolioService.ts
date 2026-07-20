// services/portfolioService.ts
// The orchestration layer components call into. Components should not
// import lib/* or utils/* directly for the main workflow — they go
// through here, which keeps the UI layer decoupled from how parsing,
// privacy simulation, analytics, and AI insights are actually implemented.

import { parseCsvFile, buildSampleCsv } from "@/lib/csvParser";
import { computePortfolioMetrics } from "@/lib/calculations";
import { simulatePrivacyLayer } from "@/lib/midnight";
import { fetchAiInsights } from "@/lib/ai";
import { Insight, ParsedStatement, PortfolioMetrics } from "@/types/portfolio";

export const portfolioService = {
  /** Step 1 (default): parse and validate an uploaded CSV file entirely client-side. */
  async importStatement(file: File): Promise<ParsedStatement> {
    return parseCsvFile(file);
  },

  /**
   * Step 1 (alternative): parse via the server-side /api/upload route
   * instead of locally. Same validation logic, different tradeoff — see
   * app/api/upload/route.ts for when this is preferable.
   */
  async importStatementViaApi(file: File): Promise<ParsedStatement> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    return (await res.json()) as ParsedStatement;
  },

  /** Sample statement for users who want to try the app without their own file. */
  getSampleCsv(): string {
    return buildSampleCsv();
  },

  /** Step 2: run the (simulated) confidential-compute privacy flow. */
  async runPrivacyLayer(
    onStepChange: (stepId: number, status: "active" | "done") => void
  ): Promise<void> {
    return simulatePrivacyLayer(onStepChange);
  },

  /** Step 3: compute portfolio analytics from validated transactions. */
  analyze(statement: ParsedStatement): PortfolioMetrics {
    return computePortfolioMetrics(statement.transactions);
  },

  /** Step 4: fetch AI-generated (or rule-based fallback) insights. */
  async getInsights(metrics: PortfolioMetrics): Promise<Insight[]> {
    return fetchAiInsights(metrics);
  },
};
