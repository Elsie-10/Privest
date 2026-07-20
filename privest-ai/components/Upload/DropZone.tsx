"use client";

import { useRef, useState } from "react";

export default function Dropzone({ onFile }: { onFile: (file: File) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`bg-white border-2 border-dashed rounded-[18px] p-14 text-center transition-colors ${
        dragOver ? "border-teal bg-[#F3FBFB]" : "border-grey-light"
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
      <div className="w-14 h-14 rounded-2xl bg-emerald-soft text-emerald flex items-center justify-center mx-auto mb-4 text-2xl">
        ↑
      </div>
      <h3 className="text-[17px] font-semibold mb-1.5">Drag & drop your CSV here</h3>
      <p className="text-grey text-[13.5px] mb-5">or choose a file from your device</p>
      <button
        className="bg-navy text-white px-5 py-2.5 rounded-lg text-[13.5px] font-semibold"
        style={{ backgroundColor: "#0A1F3D", color: "#FFFFFF" }}
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <div className="mt-5 text-xs text-grey">
        Supported now: <b className="text-navy-2">CSV</b> &nbsp;·&nbsp; Coming soon: PDF statements
      </div>
    </div>
  );
}