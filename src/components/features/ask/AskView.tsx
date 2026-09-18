"use client";

import { useMemo, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { ASK_ENTRIES, matchAskEntry, type AskSource } from "@/lib/data/ask";
import { answerForWatchlistToday } from "@/lib/portfolio";
import { getWatchlistTickers } from "@/lib/data/watchlist";
import { isWithinNextDays } from "@/lib/format";
import type { MarketEvent, NewsArticle } from "@/lib/types";
import { AnswerCard } from "@/components/features/ask/AnswerCard";
import { Input } from "@/components/ui/Input";

interface AssistantAnswer {
  short: string;
  detail: string;
  sources: AskSource[];
  isAdviceBoundary?: boolean;
}

type Message =
  | { id: string; role: "user"; text: string }
  | ({ id: string; role: "assistant" } & AssistantAnswer);

const WATCHLIST_KEYWORDS = ["watchlist", "my portfolio", "my stocks"];

const FALLBACK: AssistantAnswer = {
  short:
    "I don't have a grounded answer for that yet in this preview. Try one of the questions below, or ask about a company, event, or economic report FinLens is tracking.",
  detail:
    "This prototype answers a curated set of questions using FinLens's own News and Agenda data. A production version would route unmatched questions to a live model with real-time retrieval.",
  sources: [],
};

function answerFor(
  query: string,
  articles: NewsArticle[],
  thisWeekEvents: MarketEvent[]
): AssistantAnswer {
  const q = query.toLowerCase();
  if (WATCHLIST_KEYWORDS.some((k) => q.includes(k))) {
    return answerForWatchlistToday(getWatchlistTickers(), thisWeekEvents, articles);
  }
  const entry = matchAskEntry(query);
  if (entry) {
    return {
      short: entry.short,
      detail: entry.detail,
      sources: entry.sources,
      isAdviceBoundary: entry.isAdviceBoundary,
    };
  }
  return FALLBACK;
}

export function AskView({
  articles,
  events,
}: {
  articles: NewsArticle[];
  events: MarketEvent[];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const thisWeekEvents = useMemo(
    () => events.filter((e) => isWithinNextDays(e.scheduledAt, 7)),
    [events]
  );

  function submit(text: string) {
    const question = text.trim();
    if (!question) return;

    const answer = answerFor(question, articles, thisWeekEvents);
    setMessages((prev) => [
      ...prev,
      { id: `u-${prev.length}`, role: "user", text: question },
      { id: `a-${prev.length}`, role: "assistant", ...answer },
    ]);
    setInput("");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-2xl">
          {messages.length === 0 ? (
            <div className="pt-6 sm:pt-10">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950">
                <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink-950">
                Ask FinLens
              </h1>
              <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-ink-400">
                Plain-English answers about what&rsquo;s moving markets, grounded in FinLens&rsquo;s
                own News and Agenda coverage. FinLens shares information, not investment advice.
              </p>

              <p className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                Try asking
              </p>
              <div className="flex flex-col gap-2">
                {ASK_ENTRIES.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => submit(entry.prompt)}
                    className="rounded-lg border border-border px-4 py-2.5 text-left text-[13.5px] font-medium text-ink-800 transition-colors hover:border-border-strong hover:bg-surface"
                  >
                    {entry.prompt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => submit("What matters for my watchlist today?")}
                  className="rounded-lg border border-border px-4 py-2.5 text-left text-[13.5px] font-medium text-ink-800 transition-colors hover:border-border-strong hover:bg-surface"
                >
                  What matters for my watchlist today?
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl bg-ink-950 px-4 py-2.5 text-[14px] text-white">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <AnswerCard
                    key={m.id}
                    short={m.short}
                    detail={m.detail}
                    sources={m.sources}
                    isAdviceBoundary={m.isAdviceBoundary}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-16 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6 md:bottom-0">
        <form
          className="mx-auto flex max-w-2xl items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a company, event, or report…"
            className="h-11"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-ink-950 text-white transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:bg-ink-300"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </form>
      </div>
    </div>
  );
}
