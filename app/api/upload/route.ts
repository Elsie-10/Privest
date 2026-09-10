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
// Note this route only parses and validates. The analytics engine no
// longer runs client-side at all (see backend/app/portfolio/engine.py) —
// whichever path parses the CSV, the resulting transactions are POSTed to
// FastAPI's /api/portfolio/metrics for the actual computation. This route
// intentionally still duplicates parseCsvText rather than proxying to the
// Python backend's own parser (backend/app/parsers/csv_parser.py), so the
// "parse offline, analyze later" flow keeps working without a backend
// connection.

import { NextRequest, NextResponse } from "next/server";
import { parseCsvText } from "@/domains/ingestion";
import { MAX_CSV_UPLOAD_BYTES } from "@/domains/shared";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  let csvText: string | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (file instanceof File) {
        if (file.size > MAX_CSV_UPLOAD_BYTES) {
          return NextResponse.json(
            {
              transactions: [],
              rowCount: 0,
              errors: [`CSV exceeds the ${Math.floor(MAX_CSV_UPLOAD_BYTES / (1024 * 1024))}MB upload limit.`],
            },
            { status: 413 }
          );
        }
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

  if (csvText.length > MAX_CSV_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        transactions: [],
        rowCount: 0,
        errors: [`CSV exceeds the ${Math.floor(MAX_CSV_UPLOAD_BYTES / (1024 * 1024))}MB upload limit.`],
      },
      { status: 413 }
    );
  }

  const result = parseCsvText(csvText);
  const status = result.errors.length ? 422 : 200;
  return NextResponse.json(result, { status });
}
