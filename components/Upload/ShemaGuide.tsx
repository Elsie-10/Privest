"use client";

import { useState } from "react";
import { CSV_SCHEMA_GUIDE } from "@/domains/shared";

export default function SchemaGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <div className="text-center">
        <button onClick={() => setOpen((o) => !o)} className="text-sm text-zinc-400 underline-offset-4 hover:text-zinc-100">
          {open ? "Hide" : "Show"} supported import schema
        </button>
      </div>

      {open && (
        <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-white/10 px-2 py-2 text-left font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Column
                </th>
                <th className="border-b border-white/10 px-2 py-2 text-left font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Required
                </th>
                <th className="border-b border-white/10 px-2 py-2 text-left font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Example
                </th>
              </tr>
            </thead>
            <tbody>
              {CSV_SCHEMA_GUIDE.map((row) => (
                <tr key={row.column}>
                  <td className="border-b border-white/10 px-2 py-2 text-zinc-200">{row.column}</td>
                  <td className="border-b border-white/10 px-2 py-2 text-zinc-200">{row.required}</td>
                  <td className="border-b border-white/10 px-2 py-2 text-zinc-200">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3">
            <a href="/sample-statement.csv" download className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
              ⬇ Download sample CSV
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
