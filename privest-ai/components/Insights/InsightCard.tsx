"use client";

import { Insight } from "@/types/portfolio";

export default function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 p-5">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-400">
        {insight.tag}
      </div>
      <p className="text-[13.5px] leading-relaxed text-zinc-300">{insight.text}</p>
    </div>
  );
}
