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
    <div className="max-w-[860px] mx-auto px-10 pt-14 pb-24">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-8">
        <div>
          <h2 className="text-3xl font-display font-semibold mb-2">Statement history</h2>
          <p className="text-grey text-[15px]">
            Saved to this browser only — nothing here has been sent anywhere.
          </p>
        </div>
        {snapshots.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-[13px] font-semibold text-red border border-red-soft px-3.5 py-2 rounded-lg hover:bg-red-soft transition-colors"
          >
            Clear all history
          </button>
        )}
      </div>

      {!loaded ? null : snapshots.length === 0 ? (
        <div className="bg-white rounded-card p-10 shadow-card text-center">
          <p className="text-navy-2 font-medium mb-2">No saved statements yet</p>
          <p className="text-grey text-[13.5px] mb-6">
            Every statement you analyze is saved here automatically, so next month you can see
            whether you&apos;re exceeding, meeting, or below where you were.
          </p>
          <button
            onClick={() => router.push("/upload")}
            className="bg-navy text-white px-6 py-3 rounded-xl text-[13.5px] font-semibold"
            style={{ backgroundColor: "#0A1F3D", color: "#FFFFFF" }}
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
