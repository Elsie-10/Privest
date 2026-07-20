// app/api/upload/route.ts
//
// An alternative, server-side path for turning a CSV into validated
// transactions. The default UI flow (components/Upload) parses entirely
// client-side, in keeping with Privest AI's "nothing leaves your browser"
// promise — this route exists for cases where that tradeoff is
// acceptable or desirable: programmatic/API access, mobile clients that
// can't parse locally, very large files, or a future integration where
// the file is handed off for real Midnight confidential processing
// instead of a plain server. It reuses the exact same parseCsvText logic
// as the client, so results are identical either way.
//
// Note this route only parses and validates — the analytics engine
// (lib/calculations.ts) still runs client-side against the returned
// transactions, same as the default flow.

import { NextRequest, NextResponse } from "next/server";
import { parseCsvText } from "@/lib/csvParser";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  let csvText: string | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (file instanceof File) {
        csvText = await file.text();
      }
    } else {
      // Fall back to treating the raw body as CSV text (text/csv, text/plain).
      csvText = await req.text();
    }
  } catch {
    return NextResponse.json(
      { transactions: [], rowCount: 0, errors: ["Could not read the request body."] },
      { status: 400 }
    );
  }

  if (!csvText || !csvText.trim()) {
    return NextResponse.json(
      { transactions: [], rowCount: 0, errors: ["No CSV content was provided."] },
      { status: 400 }
    );
  }

  const result = parseCsvText(csvText);
  const status = result.errors.length ? 422 : 200;
  return NextResponse.json(result, { status });
}
