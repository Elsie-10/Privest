"use client";

import { PortfolioMetrics } from "@/types/portfolio";
import Card from "@/components/Cards/Card";

const healthScore = 88;
const strengths = [
  "Diversified across defensive sectors and cash-rich positions",
  "Fee leakage is controlled and within a healthy range",
  "Portfolio activity suggests disciplined rebalancing behavior",
];
const risks = [
  "Concentration in a few large holdings could pressure downside",
  "Dividend coverage remains modest compared with the current risk profile",
  "A few recent trades have elevated transaction churn",
];
const rebalancing = [
  "Trim the largest holding by 5–8% if volatility rises",
  "Increase cash buffer to preserve flexibility for future entry points",
  "Revisit tax-aware sell decisions before the next quarter renews",
];
const recommendations = [
  "Maintain a tactical waitlist for quality names with stronger yield",
  "Review tariff and rate sensitivity before adding new risk",
  "Use the AI chat to stress-test scenarios and trade ideas",
];

export default function AiAnalysisPanel({ metrics }: { metrics: PortfolioMetrics }) {
  return (
    <Card title="AI analysis" subtitle="A compact operating view for next actions">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 p-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-400">Health score</div>
          <div className="mt-3 text-4xl font-semibold text-zinc-100">{healthScore}/100</div>
          <p className="mt-3 text-sm text-zinc-300">
            Portfolio context indicates a resilient setup with a manageable fee drag and stable cash flow, though concentration risk remains the main watchpoint.
          </p>
          <div className="mt-5 h-2 rounded-full bg-white/10">
            <div className="h-2 w-[88%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
          </div>
        </div>

        <div className="space-y-3">
          {[
            { title: "Strengths", items: strengths },
            { title: "Risks", items: risks },
            { title: "Rebalancing", items: rebalancing },
            { title: "Recommendations", items: recommendations },
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
