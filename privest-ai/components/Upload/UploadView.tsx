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
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setState({
        kind: "error",
        message: "Only CSV files are supported in this build. Please choose a .csv file.",
      });
      setReady(false);
      return;
    }

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
    <div className="max-w-[760px] mx-auto px-10 pt-16 pb-24">
      <h2 className="text-3xl font-display font-semibold text-center mb-2">
        Import your brokerage statement
      </h2>
      <p className="text-center text-grey text-[15px] mb-10">
        Nothing leaves your browser except aggregated results once you continue.
      </p>

      <Dropzone onFile={handleFile} />
      <UploadStatus state={state} />
      <SchemaGuide />

      <div className="text-center mt-7">
        <Button disabled={!ready} onClick={handleContinue}>
          Continue to secure processing →
        </Button>
      </div>
    </div>
  );
}