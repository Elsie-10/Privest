"use client";

import { Transaction } from "@/types/portfolio";
import Card from "@/components/Cards/Card";
import Badge from "@/components/ui/Badge";

export default function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <Card
      id="transactions"
      className="scroll-mt-24"
      title="Recent transactions"
      subtitle={`Showing the ${Math.min(10, transactions.length)} most recent of ${
        transactions.length
      } transactions`}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {["Date", "Symbol", "Type", "Qty", "Price", "Fee"].map((h) => (
                <th
                  key={h}
                  className="border-b border-white/10 px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-[0.24em] text-zinc-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((r, i) => (
              <tr key={i}>
                <td className="border-b border-white/10 px-3 py-2.5 text-zinc-300">{r.date}</td>
                <td className="border-b border-white/10 px-3 py-2.5 text-zinc-100">{r.symbol}</td>
                <td className="border-b border-white/10 px-3 py-2.5">
                  <Badge tone={r.type === "sell" ? "red" : "emerald"}>{r.type.toUpperCase()}</Badge>
                </td>
                <td className="border-b border-white/10 px-3 py-2.5 text-zinc-300">{r.quantity}</td>
                <td className="border-b border-white/10 px-3 py-2.5 text-zinc-300">{r.price}</td>
                <td className="border-b border-white/10 px-3 py-2.5 text-zinc-300">{r.fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
