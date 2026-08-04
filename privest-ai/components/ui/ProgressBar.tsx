"use client";

export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-white/10">
      <div
        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
