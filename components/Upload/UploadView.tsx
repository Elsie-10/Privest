"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Dropzone from "./DropZone";
import UploadStatus, { UploadState } from "./UploadStatus";
import SchemaGuide from "./ShemaGuide";
import Button from "@/components/ui/Button";
import { portfolioService } from "@/services/portfolioService";
import { usePortfolio } from "@/app/providers";

export default function UploadView() {
  const router = useRouter();
  const { startNewStatement } = usePortfolio();
  const [state, setState] = useState<UploadState>({ kind: "idle" });
  const [ready, setReady] = useState(false);

  async function handleFile(file: File) {
    setState({ kind: "loading", progress: 15 });
    // Small staged progress purely for perceived responsiveness on fast parses.
    const tick = setInterval(() => {
      setState((s) =>
        s.kind === "loading" ? { kind: "loading", progress: Math.min(s.progress + 18, 92) } : s
      );
    }, 60);

    const result = await portfolioService.importStatement(file);
    clearInterval(tick);

    if (result.errors.length) {
      setState({ kind: "error", message: result.errors[0] });
      setReady(false);
      return;
    }

    // A fresh statement needs a fresh privacy-layer run and a new history
    // entry once analyzed — startNewStatement clears any prior metrics so
    // /dashboard knows to run that flow rather than reuse old numbers.
    startNewStatement(result);
    setState({ kind: "success", message: `Successfully imported ${result.rowCount} transactions.` });
    setReady(true);
  }

  function handleContinue() {
    if (ready) router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pt-16">
      <div className="mb-8 rounded-[28px] border border-white/10 bg-white/5 p-6 text-center sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-400">Import workspace</p>
        <h2 className="mt-2 text-3xl font-semibold text-zinc-100 sm:text-4xl">Parse broker statements into a live portfolio view</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-[15px]">
          Upload contract notes, images, or CSV files to extract holdings, prices, commissions,
          CDSC, CMA, and NSE levy data without sending anything off-device.
        </p>
      </div>

      <Dropzone onFile={handleFile} />
      <UploadStatus state={state} />
      <SchemaGuide />

      <div className="mt-7 text-center">
        <Button disabled={!ready} onClick={handleContinue}>
          Continue to secure processing →
        </Button>
      </div>
    </div>
  );
}