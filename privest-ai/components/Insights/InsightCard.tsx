"use client";

import { Insight } from "@/types/portfolio";

export default function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className="bg-white rounded-card p-5 shadow-card border-l-[3px] border-teal">
      <div className="text-[11px] font-bold uppercase tracking-wide text-teal mb-2">
        {insight.tag}
      </div>
      <p className="text-[13.5px] leading-relaxed text-navy-2">{insight.text}</p>
    </div>
  );
}
