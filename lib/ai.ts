// lib/ai.ts
// Client-side helper for the AI layer. Calls the FastAPI backend's
// /api/ai/* endpoints (backend/app/api/ai.py), which talk to Backboard AI
// (falling back to Anthropic directly) and only ever explain metrics
// already computed by the Python Portfolio Engine — never invent them.

import { apiPost } from "@/lib/apiClient";
import { Insight, PortfolioMetrics } from "@/types/portfolio";

export async function fetchAiInsights(metrics: PortfolioMetrics): Promise<Insight[]> {
  try {
    const data = await apiPost<{ insights: Insight[]; reason: string | null }>(
      "/api/ai/insights",
      { metrics }
    );
    if (Array.isArray(data.insights) && data.insights.length) {
      return data.insights;
    }
    throw new Error("No insights returned");
  } catch {
    // Backend unreachable or returned nothing usable — degrade gracefully
    // with the same rule-based fallback the backend itself uses.
    return buildFallbackInsights(metrics);
  }
}

/** Sends a chat message, grounded in the current portfolio metrics. */
export async function sendChatMessage(
  message: string,
  metrics: PortfolioMetrics | null,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  const data = await apiPost<{ reply: string }>("/api/ai/chat", { message, metrics, history });
  return data.reply;
}

/**
 * Rule-based insights used when the backend is unreachable. Mirrors
 * backend/app/services/ai_service.py's _fallback_insights exactly, so the
 * UI degrades to the same output the server would have returned anyway.
 */
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
