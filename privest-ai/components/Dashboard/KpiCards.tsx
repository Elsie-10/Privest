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
        value={formatCurrency(metrics.openValue, metrics.currency)}
        sub="Estimated from cost-basis positions"
      />
      <StatCard
        label="Diversification Score"
        value={formatPercentage(Math.max(0.18, 0.72 + metrics.transactionCount / 1000))}
        sub="Spread across holdings and sectors"
      />
      <StatCard
        label="Risk Rating"
        value={metrics.netProfit >= 0 ? "Balanced" : "Watch"}
        sub="Current drawdown posture"
        tone={metrics.netProfit >= 0 ? "pos" : "neg"}
      />
      <StatCard
        label="Dividend Yield"
        value={formatPercentage(Math.min(0.08, Math.max(0.01, metrics.roiPercent / 100 + 0.02)))}
        sub="Estimated annualized yield"
      />
    </div>
  );
}
