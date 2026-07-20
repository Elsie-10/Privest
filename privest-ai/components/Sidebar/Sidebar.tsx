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
      <div className="sticky top-24 flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-grey px-3 mb-2">
          On this page
        </p>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className="text-left text-[13.5px] font-medium text-navy-2 px-3 py-2 rounded-lg hover:bg-white hover:shadow-card transition-all"
          >
            {s.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
