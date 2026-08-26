"use client";

import { useState } from "react";
import Card from "@/components/Cards/Card";
import { sendChatMessage } from "@/domains/ai";
import { PortfolioMetrics } from "@/types/portfolio";

const promptSuggestions = [
  "What is the current risk posture?",
  "Which positions should I rebalance first?",
  "How would fees affect a new allocation?",
  "Summarize my portfolio in plain English",
];

type Message = { role: "assistant" | "user"; content: string };

export default function AiChatPanel({ metrics }: { metrics: PortfolioMetrics | null }) {
  const [draft, setDraft] = useState(promptSuggestions[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I'm reviewing your portfolio context so I can answer with scenario-aware guidance.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit() {
    const question = draft.trim();
    if (!question || isSending) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setDraft("");
    setIsSending(true);

    try {
      const history = nextMessages
        .slice(0, -1)
        .map((m) => ({ role: m.role === "assistant" ? ("assistant" as const) : ("user" as const), content: m.content }));
      const reply = await sendChatMessage(question, metrics, history);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I couldn't reach the analysis backend just now — please try again in a moment.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
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
                onClick={() => setDraft(prompt)}
                className={`w-full rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
                  draft === prompt
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
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-sm ${
                  message.role === "assistant" ? "bg-emerald-500/10 text-zinc-100" : "ml-auto bg-white/10 text-zinc-200"
                }`}
              >
                {message.content}
              </div>
            ))}
            {isSending && (
              <div className="max-w-[90%] rounded-2xl bg-emerald-500/10 px-3 py-2.5 text-sm text-zinc-400">
                Thinking…
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSubmit();
              }}
              placeholder="Ask about your portfolio…"
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-100 outline-none"
            />
            <button
              onClick={handleSubmit}
              disabled={isSending}
              className="rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Ask AI
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
