// lib/constants.ts
// Single source of truth for values referenced across multiple layers of
// the app, so a schema or copy change only has to happen in one place.

import { FeeCategory } from "@/types/portfolio";

export const REQUIRED_CSV_COLUMNS = ["date", "symbol", "type", "quantity", "price"] as const;

export const DEFAULT_CURRENCY = "KES";

export const ANTHROPIC_MODEL = "claude-sonnet-4-6";

export const FEE_CATEGORY_LABELS: Record<FeeCategory, string> = {
  broker: "Broker Fees",
  tax: "Taxes",
  exchange: "Exchange Charges",
  other: "Other Charges",
};

export const FEE_CATEGORY_COLORS: Record<FeeCategory, string> = {
  broker: "#0A1F3D",
  tax: "#D6484A",
  exchange: "#0E8A8A",
  other: "#C6862E",
};

export const FEE_CATEGORY_ORDER: FeeCategory[] = ["broker", "tax", "exchange", "other"];

export const PRIVACY_STEP_LABELS: string[] = [
  "Encrypting portfolio data locally",
  "Submitting to confidential compute layer",
  "Verifying computation, discarding raw inputs",
  "Returning only your portfolio insights",
];

export const PRIVACY_STEP_DELAY_MS = 750;

export const SAMPLE_CSV_ROWS: string[][] = [
  ["date", "symbol", "type", "quantity", "price", "fee", "fee_type", "currency"],
  ["2025-08-04", "SCOM", "buy", "500", "17.20", "120", "broker", "KES"],
  ["2025-08-04", "SCOM", "buy", "0", "0", "25", "tax", "KES"],
  ["2025-09-12", "EQTY", "buy", "200", "44.50", "95", "broker", "KES"],
  ["2025-09-30", "SCOM", "sell", "200", "19.80", "80", "broker", "KES"],
  ["2025-09-30", "SCOM", "sell", "0", "0", "15", "tax", "KES"],
  ["2025-10-15", "KCB", "buy", "300", "32.10", "110", "broker", "KES"],
  ["2025-10-22", "EQTY", "sell", "100", "41.00", "60", "broker", "KES"],
  ["2025-11-05", "SCOM", "buy", "150", "20.40", "75", "broker", "KES"],
  ["2025-11-05", "SCOM", "buy", "0", "0", "40", "exchange", "KES"],
  ["2025-11-19", "KCB", "sell", "150", "35.60", "90", "broker", "KES"],
  ["2025-12-02", "EQTY", "buy", "250", "39.80", "130", "broker", "KES"],
  ["2025-12-02", "EQTY", "buy", "0", "0", "35", "exchange", "KES"],
  ["2026-01-10", "KCB", "sell", "150", "30.20", "85", "broker", "KES"],
  ["2026-01-10", "KCB", "sell", "0", "0", "20", "tax", "KES"],
  ["2026-02-14", "SCOM", "sell", "300", "22.10", "100", "broker", "KES"],
  ["2026-02-14", "SCOM", "sell", "0", "0", "30", "tax", "KES"],
  ["2026-03-01", "EQTY", "sell", "150", "45.30", "95", "broker", "KES"],
];

export const CSV_SCHEMA_GUIDE: { column: string; required: string; example: string }[] = [
  { column: "date", required: "Yes", example: "2026-02-14" },
  { column: "symbol", required: "Yes", example: "SCOM" },
  { column: "type", required: "Yes", example: "buy / sell" },
  { column: "quantity", required: "Yes", example: "150" },
  { column: "price", required: "Yes", example: "18.40" },
  { column: "fee", required: "No (default 0)", example: "45" },
  { column: "fee_type", required: "No (default other)", example: "broker / tax / exchange" },
  { column: "currency", required: "No", example: "KES" },
];
