"use client";

import { PortfolioMetrics } from "@/types/portfolio";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatPercentage } from "@/utils/formatPercentage";
import StatCard from "@/components/Cards/StatCard";

export default function KpiCards({ metrics }: { metrics: PortfolioMetrics }) {
  return (
    <div id="overview" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 scroll-mt-24">
      <StatCard
        label="Open Positions (at cost)"
        value={formatCurrency(metrics.openValue, metrics.currency)}
        sub="No live pricing in this MVP — shown at average cost"
      />
      <StatCard
        label="Total Invested"
        value={formatCurrency(metrics.totalInvested, metrics.currency)}
        sub="Capital deployed across all buys"
      />
      <StatCard
        label="Net Profit / Loss"
        value={formatCurrency(metrics.netProfit, metrics.currency)}
        sub="Realized gains after all fees"
        tone={metrics.netProfit >= 0 ? "pos" : "neg"}
      />
      <StatCard
        label="Realized ROI"
        value={formatPercentage(metrics.roiPercent)}
        sub="Net profit ÷ total invested"
        tone={metrics.roiPercent >= 0 ? "pos" : "neg"}
      />
    </div>
  );
}
