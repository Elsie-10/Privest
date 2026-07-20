"use client";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/footer";
import Sidebar from "@/components/Sidebar/Sidebar";
import DashboardView from "@/components/Dashboard/DashboardView";
import PrivacyFlow from "@/components/PrivacyFlow/PrivacyFlow";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { usePortfolio } from "@/app/providers";
import { portfolioService } from "@/services/portfolioService";
import { PortfolioMetrics } from "@/types/portfolio";
export default function DashboardPage() {
  const router = useRouter();
  const { statement, metrics, currentSnapshotId, completeAnalysis, reset } = usePortfolio();
  // No statement in memory — most likely a hard refresh, since state lives
  // only in the PortfolioProvider context. Send the user back to import one.
  useEffect(() => {
    if (!statement) router.replace("/upload");
  }, [statement, router]);
  // Look up whatever snapshot preceded the one currently on screen, so the
  // comparison is correct whether we just analyzed a new upload or are
  // browsing back through /history.
  const previousMetrics: PortfolioMetrics | null = useMemo(() => {
    if (!currentSnapshotId) return null;
    return portfolioService.getPreviousSnapshot(currentSnapshotId)?.metrics ?? null;
  }, [currentSnapshotId]);
  function handleNewStatement() {
    reset();
    router.push("/upload");
  }
  function handleAnalyzeAndSave() {
    if (!statement) return;
    const computed = portfolioService.analyze(statement);
    const snapshot = portfolioService.saveSnapshot(statement, computed);
    completeAnalysis(computed, snapshot.id);
  }
  if (!statement) return null;
  if (!metrics) {
    return <PrivacyFlow onComplete={handleAnalyzeAndSave} />;
  }
  return (
    <div>
      <Navbar
        right={
          <>
            <Badge tone="teal" dot>
              Confidential compute active
            </Badge>
            <Button variant="ghost" onClick={handleNewStatement}>
              New statement
            </Button>
          </>
        }
      />
      <div className="max-w-[1180px] mx-auto px-10 pt-9 pb-24 flex gap-8">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <DashboardView
            metrics={metrics}
            transactions={statement.transactions}
            previousMetrics={previousMetrics}
          />
        </main>
      </div>
      <Footer note="Privest AI — Midnight Hackathon 2026 · Demo build · Analysis runs locally in your browser" />
    </div>
  );
}  