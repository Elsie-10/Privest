"use client";

import Link from "next/link";

const QUESTIONS = [
  "Am I actually making money?",
  "How much are fees costing me?",
  "Which holdings drive my returns?",
  "Where is my money leaking?",
];

const FLOW = [
  { n: 1, title: "Upload", desc: "Import PDF, image, or CSV contract notes" },
  { n: 2, title: "Analyze", desc: "Compute profit, fees, diversification, and risk" },
  { n: 3, title: "Protect", desc: "Keep raw inputs local and private" },
  { n: 4, title: "Understand", desc: "Get a plain-language AI breakdown" },
];

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
      <div className="glass-panel rounded-[28px] border border-white/10 p-8 sm:p-10 lg:p-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-400">
          Confidential portfolio intelligence
        </div>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold leading-tight text-zinc-50 sm:text-5xl lg:text-6xl">
              Turn broker notes into a live AI-powered investment command center.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
              Privest AI ingests contracts, statements, and portfolio uploads to surface performance,
              fees, diversification, risk, and recommendations in a single modern workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-400"
              >
                Analyze portfolio
              </Link>
              <Link
                href="/ai"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
              >
                Open AI workspace
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/40 p-5 sm:p-6">
            <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.24em] text-zinc-500">
              <span>Live signal</span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-400">
                +12.4% YTD
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {QUESTIONS.map((q) => (
                <div key={q} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {FLOW.map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-sm font-semibold text-emerald-400">
                {s.n}
              </div>
              <p className="font-semibold text-zinc-100">{s.title}</p>
              <p className="mt-1 text-sm text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}