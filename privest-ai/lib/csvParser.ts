// lib/csvParser.ts
// Turns a raw brokerage-statement CSV into validated Transaction[]. The
// core `parseCsvText` function is isomorphic (no browser-only APIs) so it
// can run both client-side (default, for the "nothing leaves your
// browser" privacy story) and server-side in app/api/upload/route.ts.
// PDF import is listed in the product roadmap as a future format — this
// file is intentionally the single place that would grow a second parser.

import Papa from "papaparse";
import { ParsedStatement, Transaction } from "@/types/portfolio";
import { REQUIRED_CSV_COLUMNS, SAMPLE_CSV_ROWS, DEFAULT_CURRENCY } from "@/lib/constants";
import { normalizeFeeCategory } from "@/utils/feeCalculator";

/** Core parser: raw CSV text in, validated transactions out. Works anywhere. */
export function parseCsvText(csvText: string): ParsedStatement {
  const results = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return buildParsedStatement(results.data, results.meta.fields ?? []);
}

/** Client-only convenience wrapper for a File from an <input> or drop event. */
export async function parseCsvFile(file: File): Promise<ParsedStatement> {
  try {
    const text = await file.text();
    return parseCsvText(text);
  } catch {
    return {
      transactions: [],
      rowCount: 0,
      errors: ["We could not read that file. Please check it is a valid CSV."],
    };
  }
}

function buildParsedStatement(
  rawRows: Record<string, string>[],
  fields: string[]
): ParsedStatement {
  const normalizedFields = fields.map((f) => f.trim().toLowerCase());
  const missing = REQUIRED_CSV_COLUMNS.filter((c) => !normalizedFields.includes(c));

  if (missing.length) {
    return {
      transactions: [],
      rowCount: 0,
      errors: [`Missing required column(s): ${missing.join(", ")}.`],
    };
  }

  const transactions: Transaction[] = [];
  let defaultCurrency: string = DEFAULT_CURRENCY;

  for (const raw of rawRows) {
    const row: Record<string, string> = {};
    Object.keys(raw).forEach((k) => (row[k.trim().toLowerCase()] = raw[k]));

    if (!row.date || !row.symbol || !row.type) continue;

    const type = row.type.toString().trim().toLowerCase();
    if (type !== "buy" && type !== "sell") continue;

    const quantity = parseFloat(row.quantity) || 0;
    const price = parseFloat(row.price) || 0;
    const fee = parseFloat(row.fee) || 0;
    const currency = (row.currency || defaultCurrency).toString().trim().toUpperCase();
    defaultCurrency = currency;

    transactions.push({
      date: row.date.toString().trim(),
      symbol: row.symbol.toString().trim().toUpperCase(),
      type,
      quantity,
      price,
      fee,
      feeCategory: normalizeFeeCategory(row.fee_type),
      currency,
    });
  }

  if (!transactions.length) {
    return {
      transactions: [],
      rowCount: 0,
      errors: ["No valid transaction rows were found in this file."],
    };
  }

  return { transactions, rowCount: transactions.length, errors: [] };
}

/** Generates a small, realistic sample statement so users can try the app immediately. */
export function buildSampleCsv(): string {
  return SAMPLE_CSV_ROWS.map((r) => r.join(",")).join("\n");
}
