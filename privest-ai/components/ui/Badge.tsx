"use client";

import { ReactNode } from "react";

type Tone = "teal" | "emerald" | "red" | "gold" | "neutral";

const tones: Record<Tone, string> = {
  teal: "text-emerald-400 bg-emerald-500/10 border border-emerald-400/20",
  emerald: "text-emerald-400 bg-emerald-500/10 border border-emerald-400/20",
  red: "text-rose-400 bg-rose-500/10 border border-rose-400/20",
  gold: "text-amber-400 bg-amber-500/10 border border-amber-400/20",
  neutral: "text-zinc-300 bg-white/5 border border-white/10",
};

export default function Badge({
  children,
  tone = "neutral",
  dot = false,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${tones[tone]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </div>
  );
}
