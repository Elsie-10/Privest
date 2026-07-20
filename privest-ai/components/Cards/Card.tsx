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
    <div id={id} className={`bg-white rounded-card p-6 shadow-card ${className}`}>
      {title && <h3 className="text-[15.5px] font-semibold mb-1">{title}</h3>}
      {subtitle && <p className="text-[12.5px] text-grey mb-4">{subtitle}</p>}
      {children}
    </div>
  );
}
