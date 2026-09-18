"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Newspaper, CalendarClock, TrendingUp } from "lucide-react";
import { ASSETS } from "@/lib/data/assets";
import { CATEGORY_LABEL } from "@/lib/data/categories";
import type { MarketEvent, NewsArticle } from "@/lib/types";
import { cn } from "@/lib/cn";

interface SearchResult {
  key: string;
  group: "Assets" | "News" | "Agenda";
  title: string;
  subtitle: string;
  href: string;
}

function buildResults(
  query: string,
  articles: NewsArticle[],
  events: MarketEvent[]
): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const assetResults: SearchResult[] = ASSETS.filter(
    (a) => a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
  ).map((a) => ({
    key: `asset-${a.ticker}`,
    group: "Assets",
    title: `${a.ticker} · ${a.name}`,
    subtitle: a.sector ?? a.assetType.toUpperCase(),
    href: `/watchlist?focus=${a.ticker}`,
  }));

  const newsResults: SearchResult[] = articles
    .filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        CATEGORY_LABEL[n.category].toLowerCase().includes(q)
    )
    .map((n) => ({
      key: `news-${n.slug}`,
      group: "News",
      title: n.title,
      subtitle: CATEGORY_LABEL[n.category],
      href: `/news/${n.slug}`,
    }));

  const eventResults: SearchResult[] = events
    .filter(
      (e) =>
        e.title.toLowerCase().includes(q) || CATEGORY_LABEL[e.category].toLowerCase().includes(q)
    )
    .map((e) => ({
      key: `event-${e.slug}`,
      group: "Agenda",
      title: e.title,
      subtitle: CATEGORY_LABEL[e.category],
      href: `/agenda/${e.slug}`,
    }));

  return [...assetResults, ...newsResults, ...eventResults].slice(0, 20);
}

const GROUP_ICON = {
  Assets: TrendingUp,
  News: Newspaper,
  Agenda: CalendarClock,
} as const;

export function CommandSearch({
  articles,
  events,
}: {
  articles: NewsArticle[];
  events: MarketEvent[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function openSearch() {
    setQuery("");
    setOpen(true);
  }

  function closeSearch() {
    setOpen(false);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) setQuery("");
          return !prev;
        });
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => buildResults(query, articles, events), [query, articles, events]);
  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const r of results) {
      groups[r.group] = groups[r.group] ?? [];
      groups[r.group].push(r);
    }
    return groups;
  }, [results]);

  function go(href: string) {
    closeSearch();
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search"
        className="flex h-9 w-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-0 text-[13px] text-ink-400 transition-colors hover:border-border-strong sm:w-64 sm:justify-start sm:px-3"
      >
        <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
        <span className="hidden flex-1 text-left sm:inline">Search companies, news, events…</span>
        <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-data text-[10px] text-ink-400 sm:inline-block">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/40 px-4 pt-[12vh] backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search FinLens"
            className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-xl"
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={2} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search companies, news, events…"
                className="h-12 w-full bg-transparent text-sm text-ink-950 placeholder:text-ink-400 outline-none"
              />
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Close search"
                className="shrink-0 rounded-md p-1 text-ink-400 hover:bg-surface hover:text-ink-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {query.trim() === "" && (
                <p className="px-3 py-6 text-center text-[13px] text-ink-400">
                  Try “NVIDIA”, “Fed”, or “BTC”.
                </p>
              )}
              {query.trim() !== "" && results.length === 0 && (
                <p className="px-3 py-6 text-center text-[13px] text-ink-400">
                  No results for “{query}”.
                </p>
              )}
              {(Object.keys(grouped) as Array<keyof typeof GROUP_ICON>).map((group) => (
                <div key={group} className="mb-1">
                  <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                    {group}
                  </p>
                  {grouped[group].map((r) => {
                    const Icon = GROUP_ICON[r.group];
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => go(r.href)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] transition-colors hover:bg-surface"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={2} />
                        <span className="flex-1 truncate font-medium text-ink-950">
                          {r.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-ink-400">{r.subtitle}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
