"use client";

import { PortfolioMetrics } from "@/types/portfolio";
import { compareToExpectation } from "@/utils/expectationComparator";
import { formatCurrency } from "@/utils/formatCurrency";
import Badge from "@/components/ui/Badge";

const COPY = {
  exceeding: {
    headline: "You're exceeding last month's performance",
    tone: "emerald" as const,
    label: "Exceeding",
  },
  meeting: {
    headline: "You're roughly in line with last month",
    tone: "teal" as const,
    label: "Meeting",
  },
  below: {
    headline: "You're below last month's performance",
    tone: "red" as const,
    label: "Below",
  },
};

export default function ExpectationBanner({
  metrics,
  previousMetrics,
}: {
  metrics: PortfolioMetrics;
  previousMetrics: PortfolioMetrics | null;
}) {
  const comparison = compareToExpectation(metrics, previousMetrics);

  if (comparison.status === "first") {
    return (
      <div className="bg-white rounded-card p-5 shadow-card mb-6 flex items-center gap-3">
        <Badge tone="neutral">First statement</Badge>
        <p className="text-[13.5px] text-navy-2">
          This is your first analyzed statement. Upload next month&apos;s to see whether you&apos;re
          exceeding, meeting, or falling below this baseline.
        </p>
      </div>
    );
  }

  const copy = COPY[comparison.status];
  const profitSign = comparison.netProfitDelta >= 0 ? "+" : "";
  const roiSign = comparison.roiPointDelta >= 0 ? "+" : "";

  return (
    <div className="bg-white rounded-card p-5 shadow-card mb-6 flex items-center gap-4 flex-wrap">
      <Badge tone={copy.tone}>{copy.label}</Badge>
      <p className="text-[13.5px] text-navy-2 font-medium flex-1 min-w-[200px]">{copy.headline}</p>
      <div className="text-xs text-grey">
        Net profit{" "}
        <span className="font-semibold text-navy-2">
          {profitSign}
          {formatCurrency(comparison.netProfitDelta, metrics.currency)}
        </span>{" "}
        · ROI{" "}
        <span className="font-semibold text-navy-2">
          {roiSign}
          {comparison.roiPointDelta.toFixed(1)} pts
        </span>{" "}
        vs. last statement
      </div>
    </div>
  );
}