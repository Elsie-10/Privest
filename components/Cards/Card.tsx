"use client";

import { ReactNode } from "react";

export default function Card({
  title,
  subtitle,
  children,
  className = "",
  id,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`glass-panel rounded-[var(--radius-card)] p-5 sm:p-6 ${className}`}>
      {title && <h3 className="text-[15px] font-semibold text-zinc-100 mb-1">{title}</h3>}
      {subtitle && <p className="text-[12.5px] text-zinc-400 mb-4">{subtitle}</p>}
      {children}
    </section>
  );
}
