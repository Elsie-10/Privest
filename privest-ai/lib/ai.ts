// lib/ai.ts
// Client-side helper for getting AI insights. Calls our own
// /api/insights route (which holds the Anthropic API key server-side)
// rather than calling api.anthropic.com directly from the browser.

import { Insight, PortfolioMetrics } from "@/types/portfolio";

export async function fetchAiInsights(metrics: PortfolioMetrics): Promise<Insight[]> {
  try {
    const res = await fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metrics }),
    });

    if (!res.ok) throw new Error(`Insights API returned ${res.status}`);

    const data = await res.json();
    if (Array.isArray(data.insights) && data.insights.length) {
      return data.insights as Insight[];
    }
    throw new Error("No insights returned");
  } catch {
    return buildFallbackInsights(metrics);
  }
}

/** Rule-based insights used when the AI call fails or no API key is configured. */
export function buildFallbackInsights(m: PortfolioMetrics): Insight[] {
  const out: Insight[] = [];

  if (m.topPerformer && m.topPerformerSharePercent !== null) {
    out.push({
      tag: "Top contributor",
      text: `${m.topPerformer} generated about ${m.topPerformerSharePercent.toFixed(
        0
      )}% of your total realized gains.`,
    });
  }

  if (m.concentrationSharePercent !== null && m.concentrationSharePercent > 40) {
    out.push({
      tag: "Concentration",
      text: `${m.mostConcentratedHolding} accounts for roughly ${m.concentrationSharePercent.toFixed(
        0
      )}% of your invested capital.`,
    });
  }

  if (m.leakagePercent !== null) {
    out.push({
      tag: "Fee impact",
      text: `Fees and charges reduced your gross gains by about ${m.leakagePercent.toFixed(1)}%.`,
    });
  }

  if (m.tradeFrequencyTrendPercent !== null) {
    const dir = m.tradeFrequencyTrendPercent > 0 ? "increased" : "decreased";
    out.push({
      tag: "Trading activity",
      text: `Your trade count ${dir} by about ${Math.abs(
        m.tradeFrequencyTrendPercent
      ).toFixed(0)}% in the most recent month versus the one before.`,
    });
  }

  if (m.feeTrend === "up") {
    out.push({
      tag: "Fee trend",
      text: "Monthly fees have been trending upward over your last few months of activity.",
    });
  }

  out.push({
    tag: "Net result",
    text: `After all costs, your net realized profit stands at ${m.currency} ${Math.round(
      m.netProfit
    ).toLocaleString()}.`,
  });

  return out.slice(0, 6);
}
