// lib/midnight.ts
//
// WHAT'S REAL HERE: nothing is sent over the network by this file. All
// "processing" happens synchronously in the user's browser.
//
// WHAT'S SIMULATED: the staged progress (encrypt → submit → verify →
// return) is a UI representation of how Privest AI is designed to talk to
// Midnight's confidential-compute layer in production, calling the circuit
// sketched in contracts/portfolioAnalysis.compact. Wiring in a real Midnight
// wallet + provider + compiled contract is listed under Future Vision.
//
// This is the single module a real integration would change: swap
// `simulatePrivacyLayer`'s body for an actual `@midnight-ntwrk` SDK call
// that submits the witness transactions and awaits the public circuit
// output, and every component that imports from here keeps working.

import { PrivacyStep } from "@/types/portfolio";
import { PRIVACY_STEP_LABELS, PRIVACY_STEP_DELAY_MS } from "@/lib/constants";

export const PRIVACY_STEPS: Omit<PrivacyStep, "status">[] = PRIVACY_STEP_LABELS.map(
  (label, id) => ({ id, label })
);

/**
 * Simulates the confidential-compute flow, invoking onStepChange as each
 * stage completes. Resolves once all steps are done.
 */
export async function simulatePrivacyLayer(
  onStepChange: (stepId: number, status: "active" | "done") => void
): Promise<void> {
  for (const step of PRIVACY_STEPS) {
    onStepChange(step.id, "active");
    await delay(PRIVACY_STEP_DELAY_MS);
    onStepChange(step.id, "done");
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
