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
                  className="text-left text-grey font-semibold text-[11.5px] uppercase tracking-wide py-2.5 px-3 border-b border-grey-light"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((r, i) => (
              <tr key={i}>
                <td className="py-2.5 px-3 border-b border-[#F1F2F5] text-navy-2">{r.date}</td>
                <td className="py-2.5 px-3 border-b border-[#F1F2F5] text-navy-2">{r.symbol}</td>
                <td className="py-2.5 px-3 border-b border-[#F1F2F5]">
                  <Badge tone={r.type === "sell" ? "red" : "emerald"}>{r.type.toUpperCase()}</Badge>
                </td>
                <td className="py-2.5 px-3 border-b border-[#F1F2F5] text-navy-2">{r.quantity}</td>
                <td className="py-2.5 px-3 border-b border-[#F1F2F5] text-navy-2">{r.price}</td>
                <td className="py-2.5 px-3 border-b border-[#F1F2F5] text-navy-2">{r.fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
