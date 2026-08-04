// lib/ruleEngine.ts
// Deterministic recommendation engine. It consumes computed metrics only and
// never uses an LLM to invent or estimate figures.

import { PortfolioMetrics, PortfolioRecommendation } from "@/types/portfolio";

export function generateRecommendations(metrics: PortfolioMetrics): PortfolioRecommendation[] {
  const recommendations: PortfolioRecommendation[] = [];

  if (metrics.concentrationSharePercent && metrics.concentrationSharePercent > 30) {
    recommendations.push({
      title: "Trim concentration",
      rationale: "The largest position is above 30% of invested capital, so reducing concentration improves resilience.",
      priority: "high",
    });
  }

  if (metrics.riskScore > 70) {
    recommendations.push({
      title: "Lower volatility",
      rationale: "The risk score is elevated, so shifting capital into lower-volatility holdings is prudent.",
      priority: "high",
    });
  }

  if (metrics.dividendYield < 4) {
    recommendations.push({
      title: "Improve income coverage",
      rationale: "The dividend yield is modest, so adding income-oriented positions can strengthen cash flow.",
      priority: "medium",
    });
  }

  if (metrics.leakagePercent && metrics.leakagePercent > 4) {
    recommendations.push({
      title: "Reduce fee leakage",
      rationale: "Fees are absorbing a meaningful share of gains, so lowering friction should improve net outcomes.",
      priority: "medium",
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      title: "Maintain current posture",
      rationale: "The portfolio is balanced, so continue monitoring concentration, income, and fee drift.",
      priority: "low",
    });
  }

  return recommendations;
}
