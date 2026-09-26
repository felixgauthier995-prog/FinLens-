"use client";
import { useState } from "react";
import { supabaseBrowserClient as db } from "@/lib/supabase/client";
import { AnswerCard } from "./AnswerCard";
type Answer = {
  short: string;
  detail: string;
  sources: { label: string; href: string }[];
};
export function AskView() {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<
    { question: string; answer: Answer }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !question.trim()) return;
    setBusy(true);
    setError("");
    try {
      const session = await db?.auth.getSession();
      const token = session?.data.session?.access_token;
      if (!token) throw new Error("Sign in in Settings to ask a question.");
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
        signal: AbortSignal.timeout(45000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to answer.");
      setAnswers((prev) => [...prev, { question, answer: result }]);
      setQuestion("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to answer.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Ask FinLens</h1>
      <p className="mt-2 text-sm text-ink-600">
        Answers grounded in recent coverage, with sources and uncertainty. Sign
        in to use your daily allowance.
      </p>
      <div className="my-6 space-y-4">
        {answers.map((a, i) => (
          <div key={i}>
            <p className="mb-3 text-right font-medium">{a.question}</p>
            <AnswerCard {...a.answer} />
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          aria-label="Your question"
          maxLength={1500}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-w-0 flex-1 rounded border border-border p-3"
          placeholder="What matters for my watchlist?"
        />
        <button
          disabled={busy || !question.trim()}
          className="rounded bg-ink-950 px-4 text-white disabled:opacity-50"
        >
          {busy ? "Reading…" : "Ask"}
        </button>
      </form>
      <p role="status" className="mt-3 text-sm">
        {error}
      </p>
    </div>
  );
}
