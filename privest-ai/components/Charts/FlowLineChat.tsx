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
          <CartesianGrid stroke="#F1F2F5" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={{ stroke: "#E7EAEF" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
          <Tooltip
  formatter={(value) => {
    const amount = Number(value);
    return [`${metrics.currency} ${amount.toLocaleString()}`, ""];
  }}
  contentStyle={{
    borderRadius: 10,
    border: "1px solid #E7EAEF",
    fontSize: 12.5,
  }}
/>
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="Invested" stroke="#0A1F3D" fill="#0A1F3D" fillOpacity={0.08} strokeWidth={2} />
          <Area type="monotone" dataKey="Sold" stroke="#0E9D67" fill="#0E9D67" fillOpacity={0.08} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
