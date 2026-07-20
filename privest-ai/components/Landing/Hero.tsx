"use client";

import Link from "next/link";

const QUESTIONS = [
  "Am I actually making money?",
  "How much are fees costing me?",
  "Which holdings drive my returns?",
  "Where is my money leaking?",
];

const FLOW = [
  { n: 1, title: "Upload", desc: "Import your statement as CSV" },
  { n: 2, title: "Analyze", desc: "We compute profit, fees & ROI" },
  { n: 3, title: "Protect", desc: "Data passes a confidential layer" },
  { n: 4, title: "Understand", desc: "Get a plain-language breakdown" },
];

export default function Hero() {
  return (
    <div className="max-w-[1080px] mx-auto px-10 pt-28 pb-24 text-center">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal bg-[#EAF7F7] px-3.5 py-1.5 rounded-full mb-7">
        Confidential portfolio intelligence
      </div>

      <h1 className="font-display font-semibold text-4xl md:text-[52px] leading-[1.08] max-w-3xl mx-auto mb-5 text-navy">
        Understand your investments without exposing your financial life.
      </h1>

      <p className="text-lg text-grey max-w-xl mx-auto mb-10 leading-relaxed">
        Privest AI reads your brokerage statement, finds where your money is really going, and
        returns insights — not your raw financial records — through a confidential computation
        layer.
      </p>

      <Link
        href="/upload"
        className="inline-flex items-center gap-2 bg-navy text-white px-8 py-4 rounded-xl text-base font-semibold shadow-card hover:bg-navy-2 hover:-translate-y-0.5 transition-all"
      >
        Analyze Portfolio →
      </Link>

      <div className="flex flex-wrap gap-2.5 justify-center mt-14 max-w-3xl mx-auto">
        {QUESTIONS.map((q) => (
          <div
            key={q}
            className="text-sm text-navy-2 bg-white border border-grey-light px-4 py-2.5 rounded-full font-medium"
          >
            {q}
          </div>
        ))}
      </div>

      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-y-8 mt-24 max-w-[1080px] mx-auto">
        <div className="hidden md:block absolute top-[19px] left-[60px] right-[60px] h-px bg-grey-light" />
        {FLOW.map((s) => (
          <div key={s.n} className="relative z-10 text-center">
            <div className="w-9 h-9 rounded-full bg-white border-[1.5px] border-navy flex items-center justify-center font-display font-bold text-sm mx-auto mb-3.5 text-navy">
              {s.n}
            </div>
            <p className="font-semibold text-sm mb-1">{s.title}</p>
            <p className="text-xs text-grey px-2">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
