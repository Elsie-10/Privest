// lib/calculations.ts
// The analytics engine: turns a list of transactions into a full
// PortfolioMetrics object using average-cost-basis accounting per symbol.

import {
  FeeCategory,
  MonthlyActivity,
  PortfolioMetrics,
  Position,
  Transaction,
} from "@/types/portfolio";
import {
  emptyFeesByCategory,
  leakagePercent,
  totalFees as sumFees,
} from "@/utils/feeCalculator";
import { calculateNetProfit, calculateRoiPercent, percentChange } from "@/utils/roiCalculator";

export function computePortfolioMetrics(transactions: Transaction[]): PortfolioMetrics {
  const rows = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const positions: Record<string, Position> = {};
  const symbolGains: Record<string, number> = {};
  const symbolInvested: Record<string, number> = {};
  const feesByCategory = emptyFeesByCategory();
  const monthlyMap: Record<string, MonthlyActivity> = {};

  let totalInvested = 0;
  let totalSales = 0;
  let grossRealizedGain = 0;
  let currency = "KES";

  for (const r of rows) {
    currency = r.currency || currency;
    feesByCategory[r.feeCategory as FeeCategory] += r.fee;

    const monthKey = r.date.slice(0, 7);
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { month: monthKey, invested: 0, sold: 0, fees: 0, transactionCount: 0 };
    }
    monthlyMap[monthKey].fees += r.fee;
    monthlyMap[monthKey].transactionCount += 1;

    if (!positions[r.symbol]) positions[r.symbol] = { symbol: r.symbol, quantity: 0, avgCost: 0 };
    const pos = positions[r.symbol];

    if (r.type === "buy" && r.quantity > 0) {
      const cost = r.quantity * r.price;
      totalInvested += cost;
      symbolInvested[r.symbol] = (symbolInvested[r.symbol] ?? 0) + cost;
      monthlyMap[monthKey].invested += cost;

      const newQty = pos.quantity + r.quantity;
      pos.avgCost = newQty > 0 ? (pos.quantity * pos.avgCost + cost) / newQty : 0;
      pos.quantity = newQty;
    } else if (r.type === "sell" && r.quantity > 0) {
      const proceeds = r.quantity * r.price;
      totalSales += proceeds;
      monthlyMap[monthKey].sold += proceeds;

      const sellQty = Math.min(r.quantity, pos.quantity);
      const costBasis = sellQty * pos.avgCost;
      const gain = proceeds - costBasis;
      grossRealizedGain += gain;
      symbolGains[r.symbol] = (symbolGains[r.symbol] ?? 0) + gain;
      pos.quantity = Math.max(0, pos.quantity - r.quantity);
    }
  }

  const totalFeesValue = sumFees(feesByCategory);
  const netProfit = calculateNetProfit(grossRealizedGain, totalFeesValue);
  const roiPercent = calculateRoiPercent(netProfit, totalInvested);
  const openValue = Object.values(positions).reduce((s, p) => s + p.quantity * p.avgCost, 0);

  // Top performing holding by realized gain.
  let topPerformer: string | null = null;
  let topGain = -Infinity;
  Object.entries(symbolGains).forEach(([symbol, gain]) => {
    if (gain > topGain) {
      topGain = gain;
      topPerformer = symbol;
    }
  });
  const topPerformerSharePercent =
    topPerformer && grossRealizedGain !== 0 ? (topGain / Math.abs(grossRealizedGain)) * 100 : null;

  // Most concentrated holding by capital invested.
  let mostConcentratedHolding: string | null = null;
  let concAmt = -Infinity;
  Object.entries(symbolInvested).forEach(([symbol, amt]) => {
    if (amt > concAmt) {
      concAmt = amt;
      mostConcentratedHolding = symbol;
    }
  });
  const concentrationSharePercent =
    mostConcentratedHolding && totalInvested > 0 ? (concAmt / totalInvested) * 100 : null;

  const monthly = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  let tradeFrequencyTrendPercent: number | null = null;
  if (monthly.length >= 2) {
    tradeFrequencyTrendPercent = percentChange(
      monthly[monthly.length - 1].transactionCount,
      monthly[monthly.length - 2].transactionCount
    );
  }

  let feeTrend: PortfolioMetrics["feeTrend"] = null;
  if (monthly.length >= 3) {
    const last3 = monthly.slice(-3).map((m) => m.fees);
    feeTrend = last3[2] > last3[0] ? "up" : last3[2] < last3[0] ? "down" : "flat";
  }

  return {
    currency,
    transactionCount: rows.length,
    monthsOfActivity: monthly.length,
    totalInvested,
    totalSales,
    openValue,
    grossRealizedGain,
    totalFees: totalFeesValue,
    netProfit,
    roiPercent,
    leakagePercent: leakagePercent(grossRealizedGain, totalFeesValue),
    feesByCategory,
    topPerformer,
    topPerformerSharePercent,
    mostConcentratedHolding,
    concentrationSharePercent,
    tradeFrequencyTrendPercent,
    feeTrend,
    monthly,
    positions: Object.values(positions),
  };
}
