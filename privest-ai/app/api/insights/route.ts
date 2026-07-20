// app/api/insights/route.ts
// Server-side route so the Anthropic API key never reaches the browser.
// Set ANTHROPIC_API_KEY in your environment (see .env.local.example).
// If it's missing or the call fails, we return { insights: [] } and the
// client falls back to lib/ai.ts's rule-based insights.

import { NextRequest, NextResponse } from "next/server";
import { PortfolioMetrics } from "@/types/portfolio";
import { ANTHROPIC_MODEL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ insights: [], reason: "no_api_key" });
  }

  let metrics: PortfolioMetrics;
  try {
    const body = await req.json();
    metrics = body.metrics;
  } catch {
    return NextResponse.json({ insights: [], reason: "bad_request" }, { status: 400 });
  }

  const summary = {
    currency: metrics.currency,
    totalInvested: Math.round(metrics.totalInvested),
    totalSales: Math.round(metrics.totalSales),
    grossRealizedGain: Math.round(metrics.grossRealizedGain),
    totalFees: Math.round(metrics.totalFees),
    netProfit: Math.round(metrics.netProfit),
    roiPercent: Number(metrics.roiPercent.toFixed(1)),
    leakagePercent: metrics.leakagePercent !== null ? Number(metrics.leakagePercent.toFixed(1)) : null,
    topPerformer: metrics.topPerformer,
    topPerformerSharePercent:
      metrics.topPerformerSharePercent !== null ? Number(metrics.topPerformerSharePercent.toFixed(1)) : null,
    mostConcentratedHolding: metrics.mostConcentratedHolding,
    concentrationSharePercent:
      metrics.concentrationSharePercent !== null ? Number(metrics.concentrationSharePercent.toFixed(1)) : null,
    tradeFrequencyTrendPercent:
      metrics.tradeFrequencyTrendPercent !== null ? Number(metrics.tradeFrequencyTrendPercent.toFixed(1)) : null,
    feeTrend: metrics.feeTrend,
    monthsOfActivity: metrics.monthsOfActivity,
    feesByCategory: metrics.feesByCategory,
  };

  const prompt = `You are a financial analyst assistant inside an investment app called Privest AI. Given this computed portfolio summary (already calculated, treat as ground truth), write 4 to 6 short observational insights about the portfolio. Rules: never give financial advice, recommendations, or tell the user what to buy/sell/do — only observe and explain what the numbers show. Keep each insight to one short sentence, plain language, no jargon. Respond ONLY with a JSON array of objects, no markdown fences, no preamble, in this exact shape: [{"tag":"short 2-3 word category label","text":"the insight sentence"}]. Portfolio summary: ${JSON.stringify(
    summary
  )}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ insights: [], reason: "anthropic_error" });
    }

    const data = await response.json();
    let text = (data.content ?? []).map((c: { text?: string }) => c.text ?? "").join("");
    text = text.replace(/```json|```/g, "").trim();

    const insights = JSON.parse(text);
    if (!Array.isArray(insights) || !insights.length) {
      return NextResponse.json({ insights: [], reason: "empty_response" });
    }

    return NextResponse.json({ insights: insights.slice(0, 6) });
  } catch {
    return NextResponse.json({ insights: [], reason: "exception" });
  }
}
