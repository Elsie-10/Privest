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
    <div className="flex flex-wrap items-center gap-4 rounded-[24px] border border-white/10 bg-white/5 p-5">
      <div className="min-w-[140px]">
        <div className="text-[15px] font-semibold text-zinc-100">{formatPeriodLabel(snapshot.periodLabel)}</div>
        <div className="mt-0.5 text-xs text-zinc-500">Saved {formatSavedAt(snapshot.savedAt)}</div>
      </div>

      <div className="flex-1 min-w-[280px] grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Net Profit</div>
          <div className={`num text-sm font-semibold ${metrics.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {formatCurrency(metrics.netProfit, metrics.currency)}
          </div>
        </div>
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-zinc-500">ROI</div>
          <div className={`num text-sm font-semibold ${metrics.roiPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {formatPercentage(metrics.roiPercent)}
          </div>
        </div>
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Transactions</div>
          <div className="num text-sm font-semibold text-zinc-100">{metrics.transactionCount}</div>
        </div>
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-zinc-500">vs. previous</div>
          <Badge tone={copy.tone}>{copy.label}</Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onView} className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-[13px] font-semibold text-zinc-100 transition-colors hover:bg-white/10">
          View
        </button>
        <button onClick={onDelete} className="rounded-lg px-3 py-2 text-[13px] font-semibold text-rose-400 transition-colors hover:bg-rose-500/10">
          Delete
        </button>
      </div>
    </div>
  );
}
