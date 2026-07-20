"use client";

import ProgressBar from "@/components/ui/ProgressBar";

export type UploadState =
  | { kind: "idle" }
  | { kind: "loading"; progress: number }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function UploadStatus({ state }: { state: UploadState }) {
  if (state.kind === "idle") return null;

  return (
    <div className="mt-4">
      {state.kind === "loading" && <ProgressBar percent={state.progress} />}
      {state.kind === "success" && (
        <div className="flex items-center gap-2.5 bg-emerald-soft text-emerald rounded-xl px-4 py-3.5 text-[13.5px] font-semibold">
          ✓ {state.message}
        </div>
      )}
      {state.kind === "error" && (
        <div className="flex items-center gap-2.5 bg-red-soft text-red rounded-xl px-4 py-3.5 text-[13.5px] font-semibold">
          ⚠ {state.message}
        </div>
      )}
    </div>
  );
}
