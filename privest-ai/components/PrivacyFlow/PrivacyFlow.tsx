"use client";

import { useEffect, useState } from "react";
import { portfolioService } from "@/services/portfolioService";
import { PRIVACY_STEPS } from "@/lib/midnight";
import { PrivacyStepStatus } from "@/types/portfolio";

export default function PrivacyFlow({ onComplete }: { onComplete: () => void }) {
  const [statuses, setStatuses] = useState<Record<number, PrivacyStepStatus>>(
    Object.fromEntries(PRIVACY_STEPS.map((s) => [s.id, "pending"]))
  );

  useEffect(() => {
    let cancelled = false;

    portfolioService
      .runPrivacyLayer((stepId, status) => {
        if (!cancelled) setStatuses((prev) => ({ ...prev, [stepId]: status }));
      })
      .then(() => {
        if (!cancelled) setTimeout(onComplete, 550);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-[560px] mx-auto px-10 py-32 text-center">
      <div className="w-20 h-20 rounded-[20px] mx-auto mb-8 bg-gradient-to-br from-navy to-teal flex items-center justify-center text-white text-3xl animate-privest-pulse">
        ◆
      </div>
      <h2 className="text-xl font-display font-semibold mb-1.5">
        Processing through the Midnight privacy layer
      </h2>
      <p className="text-grey text-[13.5px] mb-9">
        Your raw transaction data stays local. Only aggregated results are returned.
      </p>

      <div className="text-left flex flex-col gap-4">
        {PRIVACY_STEPS.map((step) => {
          const status = statuses[step.id];
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3.5 transition-opacity ${
                status === "pending" ? "opacity-35" : "opacity-100"
              }`}
            >
              <div
                className={`w-[26px] h-[26px] rounded-full border-[1.5px] flex-none flex items-center justify-center text-[13px] transition-all ${
                  status === "done"
                    ? "border-emerald bg-emerald text-white"
                    : status === "active"
                    ? "border-teal"
                    : "border-grey-light"
                }`}
              >
                {status === "done" ? "✓" : status === "active" ? (
                  <span className="w-2 h-2 rounded-full bg-teal animate-privest-step" />
                ) : null}
              </div>
              <p className="text-sm font-medium">{step.label}</p>
            </div>
          );
        })}
      </div>

      <p className="mt-9 text-[11.5px] text-grey leading-relaxed">
        This flow is a visual simulation of Privest AI&apos;s intended Midnight confidential-compute
        integration, built for demo purposes. All analysis in this build actually runs locally in
        your browser — no raw data is transmitted anywhere.
      </p>
    </div>
  );
}
