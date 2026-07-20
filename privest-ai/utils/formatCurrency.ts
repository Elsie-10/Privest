// utils/formatCurrency.ts
// Single formatting helper reused by every card, chart, and table that
// displays a monetary value, so currency formatting never drifts between
// components.

export function formatCurrency(amount: number, currency: string): string {
  const sign = amount < 0 ? "-" : "";
  const magnitude = Math.abs(amount).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
  return `${sign}${currency} ${magnitude}`;
}
