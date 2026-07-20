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

export default function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
