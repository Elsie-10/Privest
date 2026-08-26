"use client";

import Card from "@/components/Cards/Card";
import { PortfolioMetrics, Transaction } from "@/types/portfolio";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatPercentage } from "@/utils/formatPercentage";

const watchlist = ["AIRTEL", "COOP", "EABL", "ABSA"];
const marketNews = [
  "NSE liquidity remains constructive after recent policy easing",
  "Rate-sensitive sectors continue to attract selective inflows",
];

export default function WidgetGrid({
  transactions,
  metrics,
}: {
  transactions: Transaction[];
  metrics: PortfolioMetrics;
}) {
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="mb-4 grid gap-4 xl:grid-cols-2">
      <Card title="Top holdings" subtitle="Largest weights in the current composition">
        <div className="space-y-3">
          {metrics.holdings.slice(0, 4).map((holding) => (
            <div key={holding.symbol} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div>
                <div className="font-semibold text-zinc-100">{holding.symbol}</div>
                <div className="text-sm text-zinc-500">{formatPercentage(holding.weight / 100)}</div>
              </div>
              <div className="text-right text-sm font-semibold text-emerald-400">
                {formatCurrency(holding.marketValue, metrics.currency)}
              </div>
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

      <Card title="Dividend calendar" subtitle="Derived from current income assumptions">
        <div className="space-y-3">
          {metrics.holdings.slice(0, 3).map((holding) => (
            <div key={holding.symbol} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div>
                <div className="font-semibold text-zinc-100">{holding.symbol}</div>
                <div className="text-sm text-zinc-500">Expected income</div>
              </div>
              <div className="text-sm font-semibold text-emerald-400">
                {formatCurrency(holding.dividendEstimate, metrics.currency)}
              </div>
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
