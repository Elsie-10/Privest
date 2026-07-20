"use client";

import { PortfolioMetrics } from "@/types/portfolio";
import { FEE_CATEGORY_COLORS, FEE_CATEGORY_LABELS, FEE_CATEGORY_ORDER } from "@/lib/constants";
import { formatCurrency } from "@/utils/formatCurrency";
import Waterfall from "@/components/Charts/Waterfall";
import FeeDonutChart from "@/components/Charts/FeeDonutChat";
import Card from "@/components/Cards/Card";

export default function LeakageReport({ metrics }: { metrics: PortfolioMetrics }) {
  return (
    <div id="leakage" className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mb-4 scroll-mt-24">
      <Card
        title="Profit leakage — where gains disappeared"
        subtitle="Gross realized gain vs. what actually reached you, after fees"
      >
        <Waterfall metrics={metrics} />
      </Card>

      <Card title="Leakage breakdown" subtitle="Fees by category">
        <FeeDonutChart metrics={metrics} />

        <div className="flex flex-col gap-3 mt-2">
          {FEE_CATEGORY_ORDER.map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full flex-none"
                style={{ background: FEE_CATEGORY_COLORS[cat] }}
              />
              <div className="flex-1 text-sm text-navy-2 font-medium">{FEE_CATEGORY_LABELS[cat]}</div>
              <div className="text-sm font-bold">
                {formatCurrency(metrics.feesByCategory[cat], metrics.currency)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3.5 pt-3.5 border-t border-grey-light flex justify-between text-[13.5px] font-bold">
          <span>Total Leakage</span>
          <span>{formatCurrency(metrics.totalFees, metrics.currency)}</span>
        </div>

        <div className="mt-4 bg-gold-soft text-[#8A5A17] text-[12.5px] font-semibold px-3.5 py-3 rounded-lg">
          {metrics.leakagePercent !== null
            ? `Fees reduced your gross gains by ${metrics.leakagePercent.toFixed(1)}%.`
            : `Fees totaled ${formatCurrency(
                metrics.totalFees,
                metrics.currency
              )} against a break-even realized position.`}
        </div>
      </Card>
    </div>
  );
}
