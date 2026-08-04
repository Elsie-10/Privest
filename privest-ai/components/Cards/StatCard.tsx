"use client";

type Tone = "pos" | "neg" | "neutral";

const toneClass: Record<Tone, string> = {
  pos: "text-emerald-400",
  neg: "text-rose-400",
  neutral: "text-zinc-100",
};

export default function StatCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
}) {
  return (
    <div className="glass-panel rounded-[var(--radius-card)] p-5 sm:p-6">
      <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-semibold mb-2.5">
        {label}
      </div>
      <div className={`num text-[22px] sm:text-[26px] font-semibold ${toneClass[tone]}`}>{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1.5">{sub}</div>}
    </div>
  );
}
