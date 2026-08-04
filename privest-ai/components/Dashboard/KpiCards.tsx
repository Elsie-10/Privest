"use client";

import { PortfolioMetrics } from "@/types/portfolio";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatPercentage } from "@/utils/formatPercentage";
import StatCard from "@/components/Cards/StatCard";

export default function KpiCards({ metrics }: { metrics: PortfolioMetrics }) {
  return (
    <div id="overview" className="mb-6 grid scroll-mt-24 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Net Worth"
        value={formatCurrency(metrics.marketValue, metrics.currency)}
        sub="Current market value of open holdings"
      />
      <StatCard
        label="Diversification"
        value={formatPercentage(metrics.diversificationScore / 100)}
        sub="Spread across open positions"
      />
      <StatCard
        label="Risk"
        value={metrics.riskScore > 70 ? "Elevated" : metrics.riskScore > 50 ? "Balanced" : "Defensive"}
        sub={`Model score ${metrics.riskScore}/100`}
        tone={metrics.riskScore > 70 ? "neg" : "pos"}
      />
      <StatCard
        label="Dividend Yield"
        value={formatPercentage(metrics.dividendYield / 100)}
        sub="Estimated income yield"
      />
    </div>
  );
}
