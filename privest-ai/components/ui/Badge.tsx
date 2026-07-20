"use client";

import { ReactNode } from "react";

type Tone = "teal" | "emerald" | "red" | "gold" | "neutral";

const tones: Record<Tone, string> = {
  teal: "text-teal bg-[#EAF7F7] border border-[#CDEBEB]",
  emerald: "text-emerald bg-emerald-soft",
  red: "text-red bg-red-soft",
  gold: "text-[#8A5A17] bg-gold-soft",
  neutral: "text-grey bg-bg border border-grey-light",
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
