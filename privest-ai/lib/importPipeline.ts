// lib/importPipeline.ts
// Central import entry point for the deterministic ingestion flow.
// Today this supports CSV statements; PDF and image ingestion can be layered in
// here without changing the rest of the portfolio workflow.

import { ParsedStatement } from "@/types/portfolio";
import { parseCsvFile } from "@/lib/csvParser";

export async function ingestStatement(file: File): Promise<ParsedStatement> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    return parseCsvFile(file);
  }

  if (name.endsWith(".pdf") || name.match(/\.(png|jpe?g|webp)$/i)) {
    return {
      transactions: [],
      rowCount: 0,
      errors: [
        "OCR and image parsing are staged for this build. Please import a CSV statement to continue.",
      ],
    };
  }

  return {
    transactions: [],
    rowCount: 0,
    errors: ["Unsupported file type. Please upload a CSV, PDF, or image statement."],
  };
}
