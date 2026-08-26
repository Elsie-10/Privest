"use client";

import { PortfolioMetrics, Transaction } from "@/types/portfolio";
import KpiCards from "./KpiCards";
import TransactionsTable from "./TransactionsTable";
import LeakageReport from "@/components/FeeAnalysis/LeakageReport";
import FlowLineChart from "@/components/Charts/FlowLineChat";
import InsightsPanel from "@/components/Insights/InsightsPanel";
import Card from "@/components/Cards/Card";
import WidgetGrid from "@/components/Dashboard/WidgetGrid";
import AiAnalysisPanel from "@/components/AI/AiAnalysisPanel";

type DashboardViewProps = {
  metrics: PortfolioMetrics;
  transactions: Transaction[];
  previousMetrics: PortfolioMetrics | null;
};

export default function DashboardView({
  metrics,
  transactions,
  previousMetrics: _previousMetrics,
}: DashboardViewProps) {
  return (
    <div>
      <div className="mb-6 rounded-[24px] border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-400">AI portfolio operating system</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Portfolio intelligence dashboard</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {metrics.transactionCount} transactions analyzed · {metrics.monthsOfActivity} month(s) of activity
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[12px] text-zinc-400">
            Confidential compute · Python-verified
          </div>
        </div>
      </div>

      <KpiCards metrics={metrics} />

      <LeakageReport metrics={metrics} />

      <Card
        id="activity"
        className="mb-4 scroll-mt-24"
        title="Capital deployed over time"
        subtitle="Cumulative buys vs. sells by month"
      >
        <FlowLineChart metrics={metrics} />
      </Card>

      <div id="insights" className="scroll-mt-24">
        <InsightsPanel metrics={metrics} />
      </div>

      <div className="mb-4 scroll-mt-24">
        <AiAnalysisPanel metrics={metrics} />
      </div>

      <WidgetGrid 
      transactions={transactions}
  metrics={metrics}
   />
      <TransactionsTable transactions={transactions} />
    </div>
  );
}