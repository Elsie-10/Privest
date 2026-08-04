"use client";

import Card from "@/components/Cards/Card";
import { Transaction } from "@/types/portfolio";

const holdings = [
  { symbol: "SCOM", weight: "28%", note: "Core growth position" },
  { symbol: "KCB", weight: "22%", note: "Banking stability" },
  { symbol: "EQTY", weight: "17%", note: "Dividend-friendly" },
];

const watchlist = ["AIRTEL", "COOP", "EABL", "ABSA"];
const dividendCalendar = [
  { name: "SCOM", date: "Aug 14", yield: "5.2%" },
  { name: "KCB", date: "Aug 28", yield: "4.6%" },
];
const marketNews = [
  "NSE liquidity remains constructive after recent policy easing",
  "Rate-sensitive sectors continue to attract selective inflows",
];

export default function WidgetGrid({ transactions }: { transactions: Transaction[] }) {
  const recent = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  return (
    <div className="mb-4 grid gap-4 xl:grid-cols-2">
      <Card title="Top holdings" subtitle="Largest weights in the current composition">
        <div className="space-y-3">
          {holdings.map((holding) => (
            <div key={holding.symbol} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div>
                <div className="font-semibold text-zinc-100">{holding.symbol}</div>
                <div className="text-sm text-zinc-500">{holding.note}</div>
              </div>
              <div className="text-sm font-semibold text-emerald-400">{holding.weight}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Recent transactions" subtitle="Latest activity captured from the imported statement">
        <div className="space-y-3">
          {recent.map((transaction) => (
            <div key={`${transaction.symbol}-${transaction.date}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div>
                <div className="font-semibold text-zinc-100">{transaction.symbol}</div>
                <div className="text-sm text-zinc-500">{transaction.date}</div>
              </div>
              <div className="text-right text-sm text-zinc-300">
                <div>{transaction.type.toUpperCase()}</div>
                <div className="text-zinc-500">{transaction.quantity} shares</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Dividend calendar" subtitle="Upcoming income events to monitor">
        <div className="space-y-3">
          {dividendCalendar.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div>
                <div className="font-semibold text-zinc-100">{item.name}</div>
                <div className="text-sm text-zinc-500">{item.date}</div>
              </div>
              <div className="text-sm font-semibold text-emerald-400">{item.yield}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Watchlist" subtitle="Names worth keeping on the radar">
        <div className="flex flex-wrap gap-2">
          {watchlist.map((name) => (
            <span key={name} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300">
              {name}
            </span>
          ))}
        </div>
      </Card>

      <Card title="Market news" subtitle="Context for the week ahead" className="xl:col-span-2">
        <div className="space-y-3">
          {marketNews.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-zinc-300">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
