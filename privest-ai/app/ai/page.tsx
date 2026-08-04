import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/footer";
import AiChatPanel from "@/components/AI/AiChatPanel";
import AiAnalysisPanel from "@/components/AI/AiAnalysisPanel";

export default function AiPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <div className="mb-8 rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-400">AI workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-100 sm:text-4xl">Context-aware investment analysis</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-[15px]">
            Review health signals, strengths, risks, and rebalancing guidance while chatting with an assistant grounded in your imported portfolio context.
          </p>
        </div>
        <div className="space-y-4">
          <AiAnalysisPanel metrics={{
            currency: "KES",
            transactionCount: 12,
            monthsOfActivity: 6,
            totalInvested: 125000,
            totalSales: 0,
            openValue: 142000,
            grossRealizedGain: 18000,
            totalFees: 1450,
            netProfit: 16550,
            roiPercent: 13.24,
            leakagePercent: 8.1,
            feesByCategory: { broker: 900, tax: 320, exchange: 180, other: 50 },
            topPerformer: "SCOM",
            topPerformerSharePercent: 28,
            mostConcentratedHolding: "EQTY",
            concentrationSharePercent: 31,
            tradeFrequencyTrendPercent: 4,
            feeTrend: "down",
            monthly: [],
            positions: [],
          }} />
          <AiChatPanel />
        </div>
      </main>
      <Footer />
    </div>
  );
}
