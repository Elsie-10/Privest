"use client";

export default function Footer({ note }: { note?: string }) {
  return (
    <div className="text-center py-10 text-grey text-xs">
      {note ?? "Privest AI — Midnight Hackathon 2026 · Demo build"}
    </div>
  );
}
