"use client";

import { useState } from "react";
import { CSV_SCHEMA_GUIDE } from "@/lib/constants";

export default function SchemaGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <div className="text-center">
        <button onClick={() => setOpen((o) => !o)} className="text-grey text-xs underline">
          What columns does my CSV need?
        </button>
      </div>

      {open && (
        <div className="mt-4 bg-white border border-grey-light rounded-xl px-5 py-4 text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-grey font-semibold py-1.5 px-2 border-b border-grey-light">
                  Column
                </th>
                <th className="text-left text-grey font-semibold py-1.5 px-2 border-b border-grey-light">
                  Required
                </th>
                <th className="text-left text-grey font-semibold py-1.5 px-2 border-b border-grey-light">
                  Example
                </th>
              </tr>
            </thead>
            <tbody>
              {CSV_SCHEMA_GUIDE.map((row) => (
                <tr key={row.column}>
                  <td className="py-1.5 px-2 border-b border-[#F0F1F4] text-navy-2">{row.column}</td>
                  <td className="py-1.5 px-2 border-b border-[#F0F1F4] text-navy-2">{row.required}</td>
                  <td className="py-1.5 px-2 border-b border-[#F0F1F4] text-navy-2">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3">
            <a
              href="/sample-statement.csv"
              download
              className="text-teal font-semibold text-[13.5px] inline-flex items-center gap-1.5"
            >
              ⬇ Download a sample CSV to try it
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
