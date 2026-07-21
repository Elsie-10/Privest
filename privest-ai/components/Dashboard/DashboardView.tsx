"use client";

import { PortfolioMetrics, Transaction } from "@/types/portfolio";
import KpiCards from "./KpiCards";
import TransactionsTable from "./TransactionsTable";
import LeakageReport from "@/components/FeeAnalysis/LeakageReport";
import FlowLineChart from "@/components/Charts/FlowLineChat";
import InsightsPanel from "@/components/Insights/InsightsPanel";
import Card from "@/components/Cards/Card";

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
      <div className="mb-6">
        <h2 className="text-2xl font-display font-semibold">
          Portfolio dashboard
        </h2>
        <p className="text-[13.5px] text-grey mt-1">
          {metrics.transactionCount} transactions analyzed ·{" "}
          {metrics.monthsOfActivity} month(s) of activity
        </p>
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

      <TransactionsTable transactions={transactions} />
    </div>
  );
}