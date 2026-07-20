"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PortfolioMetrics } from "@/types/portfolio";
import { FEE_CATEGORY_COLORS, FEE_CATEGORY_LABELS } from "@/utils/feeCalculator";

export default function FeeDonutChart({ metrics }: { metrics: PortfolioMetrics }) {
  const data = (Object.keys(metrics.feesByCategory) as (keyof typeof metrics.feesByCategory)[]).map(
    (key) => ({
      name: FEE_CATEGORY_LABELS[key],
      value: metrics.feesByCategory[key],
      color: FEE_CATEGORY_COLORS[key],
    })
  );

  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="90%" paddingAngle={2}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
  formatter={(value) => {
    const amount = typeof value === "number" ? value : Number(value);

    return [`${metrics.currency} ${amount.toLocaleString()}`, "Amount"];
  }}
  contentStyle={{
    borderRadius: 10,
    border: "1px solid #E7EAEF",
    fontSize: 12.5,
  }}
/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
