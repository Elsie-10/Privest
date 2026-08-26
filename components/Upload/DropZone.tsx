"use client";

import { useRef, useState } from "react";

const brokers = ["Sterling Capital", "AIB-AXYS", "Dyer & Blair", "SIB", "Kingdom", "Genghis"];

export default function Dropzone({ onFile }: { onFile: (file: File) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`rounded-[24px] border p-6 text-center transition-all sm:p-8 ${
        dragOver ? "border-emerald-400/40 bg-emerald-500/10" : "border-white/10 bg-white/5"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-2xl text-emerald-400">
        ↑
      </div>
      <h3 className="mt-4 text-[17px] font-semibold text-zinc-100">Import broker contract notes</h3>
      <p className="mt-2 text-sm text-zinc-400">Drag and drop PDF, image, or CSV files to extract holdings, fees, and portfolio context.</p>
      <button
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-emerald-400"
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.pdf,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {brokers.map((broker) => (
          <span key={broker} className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] text-zinc-400">
            {broker}
          </span>
        ))}
      </div>
    </div>
  );
}