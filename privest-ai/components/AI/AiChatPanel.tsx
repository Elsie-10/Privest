"use client";

import { useMemo, useState } from "react";
import Card from "@/components/Cards/Card";

const promptSuggestions = [
  "What is the current risk posture?",
  "Which positions should I rebalance first?",
  "How would fees affect a new allocation?",
  "Summarize my portfolio in plain English",
];

type Message = { role: "assistant" | "user"; content: string };

export default function AiChatPanel() {
  const [selectedPrompt, setSelectedPrompt] = useState(promptSuggestions[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I’m reviewing your portfolio context so I can answer with scenario-aware guidance.",
    },
  ]);

  const reply = useMemo(() => {
    if (selectedPrompt.includes("risk")) {
      return "Your portfolio is currently balanced but still sensitive to concentration in the largest holding.";
    }
    if (selectedPrompt.includes("rebalance")) {
      return "A moderate trim to the heaviest position and a small increase in cash buffer would improve resilience.";
    }
    if (selectedPrompt.includes("fees")) {
      return "Fees are manageable, but a shift toward lower-cost vehicles would improve net outcomes over time.";
    }
    return "I’d keep the thesis steady and monitor yield, concentration, and transaction churn before adding risk.";
  }, [selectedPrompt]);

  function handleSubmit() {
    setMessages((prev) => [...prev, { role: "user", content: selectedPrompt }, { role: "assistant", content: reply }]);
  }

  return (
    <Card title="AI chat" subtitle="Context-aware assistant with suggested prompts">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Suggested prompts</div>
          <div className="mt-4 space-y-2">
            {promptSuggestions.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setSelectedPrompt(prompt)}
                className={`w-full rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
                  selectedPrompt === prompt
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-400"
                    : "border-white/10 bg-black/20 text-zinc-300 hover:bg-white/10"
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div className="flex h-[260px] flex-col gap-3 overflow-auto">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-sm ${message.role === "assistant" ? "bg-emerald-500/10 text-zinc-100" : "ml-auto bg-white/10 text-zinc-200"}`}>
                {message.content}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={selectedPrompt}
              onChange={(event) => setSelectedPrompt(event.target.value)}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 outline-none"
            />
            <button onClick={handleSubmit} className="rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white">
              Ask AI
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
