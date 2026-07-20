// types/portfolio.ts
// Shared data contracts passed between lib/, services/, and components/.
// Keeping these in one place means every layer of the app agrees on the
// exact shape of a transaction, a computed metric, or an insight.

export type TransactionType = "buy" | "sell";

export type FeeCategory = "broker" | "tax" | "exchange" | "other";

/** A single row from an imported brokerage statement, normalized. */
export interface Transaction {
  date: string; // ISO-ish date string, e.g. "2026-02-14"
  symbol: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fee: number;
  feeCategory: FeeCategory;
  currency: string;
}

/** Result of parsing a raw CSV file. */
export interface ParsedStatement {
  transactions: Transaction[];
  rowCount: number;
  errors: string[];
}

/** Running cost-basis state for a single holding. */
export interface Position {
  symbol: string;
  quantity: number;
  avgCost: number;
}

export interface MonthlyActivity {
  month: string; // "YYYY-MM"
  invested: number;
  sold: number;
  fees: number;
  transactionCount: number;
}

/** The full computed analytics output for a portfolio. */
export interface PortfolioMetrics {
  currency: string;
  transactionCount: number;
  monthsOfActivity: number;

  totalInvested: number;
  totalSales: number;
  openValue: number; // remaining open positions, valued at average cost

  grossRealizedGain: number;
  totalFees: number;
  netProfit: number;
  roiPercent: number;
  leakagePercent: number | null;

  feesByCategory: Record<FeeCategory, number>;

  topPerformer: string | null;
  topPerformerSharePercent: number | null;

  mostConcentratedHolding: string | null;
  concentrationSharePercent: number | null;

  tradeFrequencyTrendPercent: number | null;
  feeTrend: "up" | "down" | "flat" | null;

  monthly: MonthlyActivity[];
  positions: Position[];
}

/** A single AI-generated (or fallback) observation about the portfolio. */
export interface Insight {
  tag: string;
  text: string;
}

/** Status of each step in the simulated Midnight confidential-compute flow. */
export type PrivacyStepStatus = "pending" | "active" | "done";

export interface PrivacyStep {
  id: number;
  label: string;
  status: PrivacyStepStatus;
}
