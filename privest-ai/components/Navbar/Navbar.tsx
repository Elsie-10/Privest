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
    <nav className="flex items-center justify-between px-10 py-5 bg-white border-b border-grey-light sticky top-0 z-20">
      <div className="flex items-center gap-6">
        <Link href={brandHref} className="flex items-center gap-2.5 font-display font-bold text-lg">
          <span className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-navy to-teal flex items-center justify-center text-white text-sm">
            P
          </span>
          Privest AI
        </Link>
        {!onHistoryPage && (
          <Link
            href="/history"
            className="text-[13.5px] font-semibold text-grey hover:text-navy transition-colors"
          >
            History
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        {right ?? (
          <Badge tone="teal" dot>
            Privacy-first, by design
          </Badge>
        )}
      </div>
    </nav>
  );
}