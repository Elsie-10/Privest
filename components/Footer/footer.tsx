"use client";

export default function Footer({ note }: { note?: string }) {
  return (
    <footer className="border-t border-white/10 py-8 text-center text-[12px] text-zinc-500">
      {note ?? "Privest AI — AI-powered investment intelligence for modern portfolios"}
    </footer>
  );
}
