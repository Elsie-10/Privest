export type GrowthProjectionInput = {
  initialInvestment: number;
  monthlyContribution: number;
  expectedAnnualReturnPercent: number;
  years: number;
};

export type GrowthProjectionPoint = {
  month: number;
  contributedCapital: number;
  projectedValue: number;
};

/**
 * Deterministic monthly compounding projection.
 * Used for simulation UX — no AI involved.
 */
export function projectPortfolioGrowth(input: GrowthProjectionInput): GrowthProjectionPoint[] {
  const initialInvestment = Math.max(0, input.initialInvestment);
  const monthlyContribution = Math.max(0, input.monthlyContribution);
  const annualRate = Math.max(-100, input.expectedAnnualReturnPercent);
  const years = Math.max(0, input.years);

  const months = Math.floor(years * 12);
  const monthlyRate = annualRate / 100 / 12;

  const series: GrowthProjectionPoint[] = [];
  let value = initialInvestment;

  for (let month = 1; month <= months; month += 1) {
    value = value * (1 + monthlyRate) + monthlyContribution;
    series.push({
      month,
      contributedCapital: initialInvestment + monthlyContribution * month,
      projectedValue: value,
    });
  }

  return series;
}
