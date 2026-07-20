"use client";

import { PortfolioMetrics } from "@/types/portfolio";
import { formatCurrency } from "@/utils/formatCurrency";

export default function Waterfall({ metrics }: { metrics: PortfolioMetrics }) {
  const { grossRealizedGain: gross, totalFees: fees, netProfit: net, currency } = metrics;
  const maxVal = Math.max(Math.abs(gross), Math.abs(net), fees, 1);

  const bars = [
    { label: "Gross Profit", value: gross, color: gross >= 0 ? "#0E9D67" : "#D6484A" },
    { label: "Fees Lost", value: -fees, color: "#C6862E" },
    { label: "Net Take-Home", value: net, color: net >= 0 ? "#0A1F3D" : "#D6484A" },
  ];

  return (
    <div className="flex items-end gap-3.5 h-[170px] pt-2.5">
      {bars.map((b) => {
        const height = Math.max(8, (Math.abs(b.value) / maxVal) * 140);
        return (
          <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="text-[12.5px] font-bold mb-0.5" style={{ color: b.color }}>
              {formatCurrency(b.value, currency)}
            </div>
            <div
              className="w-full rounded-t-lg transition-[height] duration-700"
              style={{ height, background: b.color }}
            />
            <div className="text-[11px] text-grey mt-2 text-center font-medium">{b.label}</div>
          </div>
        );
      })}
    </div>
  );
}
