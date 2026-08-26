"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatementSnapshot } from "@/types/portfolio";
import { portfolioService } from "@/services/portfolioService";
import { compareToExpectation } from "@/utils/expectationComparator";
import { usePortfolio } from "@/app/providers";
import SnapshotRow from "./SnapshotRow";

export default function HistoryView() {
  const router = useRouter();
  const { loadSnapshot } = usePortfolio();
  // Empty on the very first render (matches server render) to avoid a
  // hydration mismatch; the real localStorage contents load in the effect.
  const [snapshots, setSnapshots] = useState<StatementSnapshot[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSnapshots(portfolioService.getHistory());
    setLoaded(true);
  }, []);

  function refresh() {
    setSnapshots(portfolioService.getHistory());
  }

  function handleView(snapshot: StatementSnapshot) {
    loadSnapshot(snapshot);
    router.push("/dashboard");
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this saved statement? This can't be undone.")) return;
    portfolioService.deleteSnapshot(id);
    refresh();
  }

  function handleClearAll() {
    if (!window.confirm("Clear all statement history from this browser? This can't be undone.")) return;
    portfolioService.clearHistory();
    refresh();
  }

  const chronological = [...snapshots].sort(
    (a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime()
  );
  const newestFirst = [...chronological].reverse();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3 rounded-[24px] border border-white/10 bg-white/5 p-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-400">Saved portfolio snapshots</p>
          <h2 className="mt-2 text-3xl font-semibold text-zinc-100">Statement history</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Saved to this browser only — nothing here has been sent anywhere.
          </p>
        </div>
        {snapshots.length > 0 && (
          <button
            onClick={handleClearAll}
            className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3.5 py-2 text-[13px] font-semibold text-rose-400 transition-colors hover:bg-rose-500/20"
          >
            Clear all history
          </button>
        )}
      </div>

      {!loaded ? null : snapshots.length === 0 ? (
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-10 text-center">
          <p className="mb-2 font-medium text-zinc-100">No saved statements yet</p>
          <p className="mb-6 text-[13.5px] text-zinc-400">
            Every statement you analyze is saved here automatically, so next month you can see
            whether you&apos;re exceeding, meeting, or below where you were.
          </p>
          <button
            onClick={() => router.push("/upload")}
            className="rounded-xl bg-emerald-500 px-6 py-3 text-[13.5px] font-semibold text-white transition hover:bg-emerald-400"
          >
            Analyze your first statement →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {newestFirst.map((snapshot) => {
            const idx = chronological.findIndex((s) => s.id === snapshot.id);
            const previous = idx > 0 ? chronological[idx - 1] : null;
            const comparison = compareToExpectation(snapshot.metrics, previous?.metrics ?? null);
            return (
              <SnapshotRow
                key={snapshot.id}
                snapshot={snapshot}
                status={comparison.status}
                onView={() => handleView(snapshot)}
                onDelete={() => handleDelete(snapshot.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
