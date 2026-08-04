"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PortfolioMetrics } from "@/types/portfolio";

export default function FlowLineChart({ metrics }: { metrics: PortfolioMetrics }) {
  const data = metrics.monthly.map((m) => ({
    month: m.month,
    Invested: Math.round(m.invested),
    Sold: Math.round(m.sold),
  }));

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => {
              const amount = Number(value);
              return [`${metrics.currency} ${amount.toLocaleString()}`, ""];
            }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(5,5,5,0.95)",
              fontSize: 12.5,
              color: "#f5f5f5",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
          <Area type="monotone" dataKey="Invested" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeWidth={2} />
          <Area type="monotone" dataKey="Sold" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.12} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
