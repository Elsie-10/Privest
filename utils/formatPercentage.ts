// utils/formatPercentage.ts

/** Formats a number as a signed percentage string, e.g. 8.4 -> "8.4%", -3 -> "-3.0%". */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Formats an optional percentage, returning a fallback string when null. */
export function formatOptionalPercentage(
  value: number | null,
  fallback = "—",
  decimals = 1
): string {
  return value === null ? fallback : formatPercentage(value, decimals);
}
