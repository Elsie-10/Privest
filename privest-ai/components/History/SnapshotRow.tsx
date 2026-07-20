"use client";

import { ExpectationStatus, StatementSnapshot } from "@/types/portfolio";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatPercentage } from "@/utils/formatPercentage";
import { formatPeriodLabel, formatSavedAt } from "@/utils/formatDate";
import Badge from "@/components/ui/Badge";

const STATUS_COPY: Record<ExpectationStatus, { label: string; tone: "emerald" | "teal" | "red" | "neutral" }> = {
  exceeding: { label: "Exceeding", tone: "emerald" },
  meeting: { label: "Meeting", tone: "teal" },
  below: { label: "Below", tone: "red" },
  first: { label: "Baseline", tone: "neutral" },
};

export default function SnapshotRow({
  snapshot,
  status,
  onView,
  onDelete,
}: {
  snapshot: StatementSnapshot;
  status: ExpectationStatus;
  onView: () => void;
  onDelete: () => void;
}) {
  const { metrics } = snapshot;
  const copy = STATUS_COPY[status];

  return (
    <div className="flex items-center gap-4 bg-white rounded-card p-5 shadow-card flex-wrap">
      <div className="min-w-[140px]">
        <div className="font-display font-semibold text-[15px]">
          {formatPeriodLabel(snapshot.periodLabel)}
        </div>
        <div className="text-xs text-grey mt-0.5">Saved {formatSavedAt(snapshot.savedAt)}</div>
      </div>

      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-[280px]">
        <div>
          <div className="text-[10.5px] text-grey uppercase font-semibold tracking-wide">
            Net Profit
          </div>
          <div
            className={`num text-sm font-semibold ${
              metrics.netProfit >= 0 ? "text-emerald" : "text-red"
            }`}
          >
            {formatCurrency(metrics.netProfit, metrics.currency)}
          </div>
        </div>
        <div>
          <div className="text-[10.5px] text-grey uppercase font-semibold tracking-wide">ROI</div>
          <div
            className={`num text-sm font-semibold ${
              metrics.roiPercent >= 0 ? "text-emerald" : "text-red"
            }`}
          >
            {formatPercentage(metrics.roiPercent)}
          </div>
        </div>
        <div>
          <div className="text-[10.5px] text-grey uppercase font-semibold tracking-wide">
            Transactions
          </div>
          <div className="num text-sm font-semibold text-navy">{metrics.transactionCount}</div>
        </div>
        <div>
          <div className="text-[10.5px] text-grey uppercase font-semibold tracking-wide">
            vs. previous
          </div>
          <Badge tone={copy.tone}>{copy.label}</Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          className="text-[13px] font-semibold text-navy border border-grey-light px-3.5 py-2 rounded-lg hover:bg-bg transition-colors"
        >
          View
        </button>
        <button
          onClick={onDelete}
          className="text-[13px] font-semibold text-red px-3 py-2 rounded-lg hover:bg-red-soft transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
