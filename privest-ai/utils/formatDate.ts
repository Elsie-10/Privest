// utils/formatDate.ts

export function formatSavedAt(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatPeriodLabel(periodLabel: string): string {
  // periodLabel is "YYYY-MM" — render as "March 2026".
  const [year, month] = periodLabel.split("-").map(Number);
  if (!year || !month) return periodLabel;
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
}