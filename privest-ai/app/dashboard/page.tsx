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
    <div className="min-h-screen bg-transparent">
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
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-24 pt-8 sm:px-6 lg:flex-row lg:px-8">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <DashboardView
            metrics={metrics}
            transactions={statement.transactions}
            previousMetrics={previousMetrics}
          />
        </main>
      </div>
      <Footer note="Privest AI — local-first analysis, modern portfolio intelligence" />
    </div>
  );
}  