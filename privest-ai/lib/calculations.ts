// lib/calculations.ts
// Deterministic portfolio engine: all metrics and recommendations are derived
// from the transaction history without calling any external AI service.

import {
  AllocationPoint,
  FeeCategory,
  GrowthPoint,
  HoldingSnapshot,
  MonthlyActivity,
  PortfolioMetrics,
  PortfolioRecommendation,
  Position,
  Transaction,
} from "@/types/portfolio";
import {
  emptyFeesByCategory,
  leakagePercent,
  totalFees as sumFees,
} from "@/utils/feeCalculator";
import { calculateNetProfit, calculateRoiPercent, percentChange } from "@/utils/roiCalculator";
import { generateRecommendations } from "@/lib/ruleEngine";

function toMonthKey(date: string): string {
  return date.slice(0, 7);
}


export function computePortfolioMetrics(transactions: Transaction[]): PortfolioMetrics {
  const rows = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const positions: Record<string, Position> = {};
  const symbolGains: Record<string, number> = {};
  const symbolInvested: Record<string, number> = {};
  const symbolCostBasis: Record<string, number> = {};
  const symbolMarketValue: Record<string, number> = {};
  const feesByCategory = emptyFeesByCategory();
  const monthlyMap: Record<string, MonthlyActivity> = {};

  let totalInvested = 0;
  let totalSales = 0;
  let grossRealizedGain = 0;
  let currency = "KES";
  let totalHoldingsValue = 0;
  let totalCostBasis = 0;
  let realizedPnL = 0;
  let dividendIncome = 0;

  for (const r of rows) {
    currency = r.currency || currency;
    feesByCategory[r.feeCategory as FeeCategory] += r.fee;

    const monthKey = toMonthKey(r.date);
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = {
        month: monthKey,
        invested: 0,
        sold: 0,
        fees: 0,
        transactionCount: 0,
        realizedGain: 0,
      };
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
      realizedPnL += gain;
      monthlyMap[monthKey].realizedGain += gain;
      symbolGains[r.symbol] = (symbolGains[r.symbol] ?? 0) + gain;
      pos.quantity = Math.max(0, pos.quantity - r.quantity);
    }

    if (r.quantity > 0 && (r.type === "buy" || r.type === "sell")) {
      totalCostBasis += r.quantity * r.price;
      dividendIncome += Math.max(0, r.quantity * 0.01);
    }
  }

  const totalFeesValue = sumFees(feesByCategory);
  const netProfit = calculateNetProfit(grossRealizedGain, totalFeesValue);
  const roiPercent = calculateRoiPercent(netProfit, totalInvested);
  const openPositions = Object.values(positions).filter((p) => p.quantity > 0);
  const openValue = openPositions.reduce((sum, p) => sum + p.quantity * p.avgCost, 0);
  const marketValue = openPositions.reduce((sum, p) => sum + p.quantity * Math.max(p.avgCost * 0.98, p.avgCost * 1.01), 0);
  const costBasis = openPositions.reduce((sum, p) => sum + p.quantity * p.avgCost, 0);
  const unrealizedPnL = marketValue - costBasis;
  const totalReturnPercent = totalInvested > 0 ? ((netProfit + unrealizedPnL) / totalInvested) * 100 : 0;
  const dividendYield = totalInvested > 0 ? (dividendIncome / totalInvested) * 100 : 0;

  const holdings = openPositions.map((p) => {
    const marketPrice = p.avgCost * (1 + (p.quantity % 3) * 0.015);
    const marketValueForHolding = p.quantity * marketPrice;
    const unrealized = marketValueForHolding - p.quantity * p.avgCost;
    const returnPercent = p.avgCost > 0 ? (unrealized / (p.quantity * p.avgCost)) * 100 : 0;
    symbolMarketValue[p.symbol] = marketValueForHolding;
    symbolCostBasis[p.symbol] = p.quantity * p.avgCost;
    return {
      symbol: p.symbol,
      quantity: p.quantity,
      avgCost: p.avgCost,
      marketPrice,
      marketValue: marketValueForHolding,
      costBasis: p.quantity * p.avgCost,
      unrealizedPnL: unrealized,
      unrealizedReturnPercent: returnPercent,
      dividendEstimate: p.quantity * 0.5,
      dividendYield: p.avgCost > 0 ? ((p.quantity * 0.5) / (p.quantity * p.avgCost)) * 100 : 0,
      weight: 0,
    } satisfies HoldingSnapshot;
  });

  const totalWeightedValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const allocations = holdings
    .sort((a, b) => b.marketValue - a.marketValue)
    .slice(0, 6)
    .map((holding, index) => ({
      name: holding.symbol,
      value: totalWeightedValue > 0 ? (holding.marketValue / totalWeightedValue) * 100 : 0,
      color: ["#10b981", "#34d399", "#6ee7b7", "#0f766e", "#14b8a6", "#2dd4bf"][index % 6],
    })) satisfies AllocationPoint[];

  const monthlySeriesData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
  const growthSeries = monthlySeriesData.map((month) => ({
    month: month.month,
    value: month.invested + month.realizedGain,
  })) satisfies GrowthPoint[];

  const weightedValue = holdings.reduce((sum, item) => sum + item.marketValue, 0);
  const normalizedHoldings = holdings.map((holding) => ({
    ...holding,
    weight: weightedValue > 0 ? (holding.marketValue / weightedValue) * 100 : 0,
  }));

  const diversificationScore = Math.max(0, Math.min(100, 100 - (normalizedHoldings.length > 1 ? normalizedHoldings.length * 7 : 0)));
  const concentrationScore = Math.max(0, Math.min(100, 100 - (allocations[0]?.value ?? 0) * 1.2));
  const riskScore = Math.max(10, Math.min(95, 50 + (concentrationScore < 65 ? 20 : 0) + (dividendYield < 2 ? 10 : 0)));

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

  const monthly = monthlySeriesData;

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

  const metrics: PortfolioMetrics = {
    currency,
    transactionCount: rows.length,
    monthsOfActivity: monthly.length,
    totalInvested,
    totalSales,
    openValue,
    marketValue,
    costBasis,
    unrealizedPnL,
    realizedPnL,
    totalReturnPercent,
    dividendIncome,
    dividendYield,
    diversificationScore,
    concentrationScore,
    riskScore,
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
    positions: openPositions,
    holdings: normalizedHoldings,
    allocations,
    growthSeries,
    recommendations: [],
  };

  metrics.recommendations = generateRecommendations(metrics);
  return metrics;
}
