"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base = "font-semibold transition-all rounded-xl inline-flex items-center justify-center gap-2";

const variants: Record<Variant, string> = {
  primary:
    "bg-navy text-white px-8 py-4 text-[15.5px] shadow-card hover:bg-navy-2 hover:-translate-y-0.5 disabled:opacity-55 disabled:cursor-not-allowed disabled:translate-y-0",
  ghost:
    "bg-transparent text-navy border border-grey-light px-4 py-2 text-[13.5px] rounded-lg hover:bg-bg",
};

// Inline fallback colors: if a custom Tailwind color utility (bg-navy,
// text-navy, etc.) ever fails to generate — e.g. a stale build cache, a
// content-scanning miss — the button still renders with correct contrast
// instead of silently becoming invisible text-on-background.
const inlineFallback: Record<Variant, React.CSSProperties> = {
  primary: { backgroundColor: "#0A1F3D", color: "#FFFFFF" },
  ghost: { backgroundColor: "transparent", color: "#0A1F3D" },
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