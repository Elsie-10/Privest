"use client";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "leakage", label: "Leakage Report" },
  { id: "activity", label: "Capital Activity" },
  { id: "insights", label: "AI Insights" },
  { id: "transactions", label: "Transactions" },
];

export default function Sidebar() {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <aside className="hidden lg:block w-56 flex-none">
      <div className="sticky top-24 flex flex-col gap-1 rounded-[20px] border border-white/10 bg-white/5 p-3">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          On this page
        </p>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className="rounded-xl px-3 py-2 text-left text-[13.5px] font-medium text-zinc-400 transition-all hover:bg-white/10 hover:text-zinc-100"
          >
            {s.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
