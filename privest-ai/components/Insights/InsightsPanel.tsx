"use client";

import { useEffect, useState } from "react";
import { PortfolioMetrics, Insight } from "@/types/portfolio";
import { portfolioService } from "@/services/portfolioService";
import InsightCard from "./InsightCard";
import Card from "@/components/Cards/Card";
import Spinner from "@/components/ui/Spinner";

export default function InsightsPanel({ metrics }: { metrics: PortfolioMetrics }) {
  const [insights, setInsights] = useState<Insight[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setInsights(null);
    portfolioService.getInsights(metrics).then((result) => {
      if (!cancelled) setInsights(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics]);

  return (
    <Card className="mb-4" title="AI financial insights" subtitle="Plain-language observations — never advice">
      {insights === null ? (
        <div className="flex items-center gap-2.5 text-grey text-[13.5px] py-5">
          <Spinner />
          Generating insights…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      )}
    </Card>
  );
}
