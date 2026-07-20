"use client";

type Tone = "pos" | "neg" | "neutral";

const toneClass: Record<Tone, string> = {
  pos: "text-emerald",
  neg: "text-red",
  neutral: "text-navy",
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
    <div className="bg-white rounded-card p-6 shadow-card">
      <div className="text-[12.5px] text-grey font-semibold uppercase tracking-wide mb-2.5">
        {label}
      </div>
      <div className={`num text-[26px] font-semibold ${toneClass[tone]}`}>{value}</div>
      {sub && <div className="text-xs text-grey mt-1.5">{sub}</div>}
    </div>
  );
}
