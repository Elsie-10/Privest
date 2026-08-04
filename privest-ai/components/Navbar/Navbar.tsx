"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Badge from "@/components/ui/Badge";

export default function Navbar({
  right,
  brandHref = "/",
}: {
  right?: ReactNode;
  brandHref?: string;
}) {
  const pathname = usePathname();
  const onHistoryPage = pathname === "/history";

  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href={brandHref} className="flex items-center gap-2.5 font-semibold text-lg text-zinc-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-400/20">
              P
            </span>
            <span className="hidden sm:inline">Privest AI</span>
          </Link>
          {!onHistoryPage && (
            <>
              <Link href="/ai" className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-100">
                AI
              </Link>
              <Link href="/history" className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-100">
                History
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {right ?? (
            <Badge tone="teal" dot>
              Privacy-first, by design
            </Badge>
          )}
        </div>
      </div>
    </nav>
  );
}