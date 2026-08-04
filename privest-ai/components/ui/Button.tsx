"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base = "font-semibold transition-all rounded-xl inline-flex items-center justify-center gap-2";

const variants: Record<Variant, string> = {
  primary:
    "bg-emerald-500/90 text-white px-6 py-3 text-[14px] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_10px_35px_rgba(0,0,0,0.28)] hover:bg-emerald-400 hover:-translate-y-0.5 disabled:opacity-55 disabled:cursor-not-allowed disabled:translate-y-0",
  ghost:
    "bg-white/5 text-zinc-100 border border-white/10 px-4 py-2 text-[13.5px] rounded-lg hover:bg-white/10",
};

const inlineFallback: Record<Variant, React.CSSProperties> = {
  primary: { backgroundColor: "#10b981", color: "#FFFFFF" },
  ghost: { backgroundColor: "rgba(255,255,255,0.05)", color: "#f5f5f5" },
};

export default function Button({
  variant = "primary",
  className = "",
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={{ ...inlineFallback[variant], ...style }}
      {...props}
    />
  );
}