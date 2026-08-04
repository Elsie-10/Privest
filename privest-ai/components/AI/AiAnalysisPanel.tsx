"use client";

import { PortfolioMetrics } from "@/types/portfolio";
import Card from "@/components/Cards/Card";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatPercentage } from "@/utils/formatPercentage";

export default function AiAnalysisPanel({ metrics }: { metrics: PortfolioMetrics }) {
  const healthScore = Math.max(40, Math.min(95, 70 + metrics.diversificationScore / 10 - metrics.riskScore / 20));
  const strengths = [
    `Current market value is ${formatCurrency(metrics.marketValue, metrics.currency)} across ${metrics.holdings.length} open holdings.`,
    `Diversification is ${formatPercentage(metrics.diversificationScore / 100)} and concentration remains manageable.`,
    `Net profitability is ${formatCurrency(metrics.netProfit, metrics.currency)} after fees.`,
  ];
  const risks = [
    metrics.concentrationSharePercent ? `The largest position represents ${metrics.concentrationSharePercent.toFixed(1)}% of invested capital.` : "Concentration is not yet extreme.",
    `Risk score is ${metrics.riskScore}/100 based on concentration and income assumptions.`,
    `Fee leakage is ${metrics.leakagePercent?.toFixed(1) ?? "n/a"}% of realized gain.`,
  ];

  return (
    <Card title="AI analysis" subtitle="Deterministic diagnosis from computed portfolio metrics">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 p-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-400">Health score</div>
          <div className="mt-3 text-4xl font-semibold text-zinc-100">{Math.round(healthScore)}/100</div>
          <p className="mt-3 text-sm text-zinc-300">
            These signals come from the portfolio engine only: holdings, weights, fees, and realized performance. The AI layer explains them without inventing new figures.
          </p>
          <div className="mt-5 h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: `${healthScore}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          {[
            { title: "Strengths", items: strengths },
            { title: "Risks", items: risks },
            { title: "Recommendations", items: metrics.recommendations.map((item) => `${item.title}: ${item.rationale}`) },
          ].map((section) => (
            <div key={section.title} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
              <h4 className="text-sm font-semibold text-zinc-100">{section.title}</h4>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-zinc-500">
        Signal basis: {metrics.transactionCount} trades · {metrics.monthsOfActivity} months of activity · {metrics.currency} reporting
      </p>
    </Card>
  );
}
