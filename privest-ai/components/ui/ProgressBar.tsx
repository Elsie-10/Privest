"use client";

export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 bg-grey-light rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
