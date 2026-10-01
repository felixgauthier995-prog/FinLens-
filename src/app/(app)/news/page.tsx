import Link from "next/link";
import type { Metadata } from "next";
import { CategoryChips } from "@/components/features/shared/CategoryChips";
import { NewsCard } from "@/components/features/news/NewsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getArticlesForReader } from "@/lib/data/reader";
import { getLocale, getMessages } from "@/i18n/server";
import { CATEGORY_ORDER } from "@/lib/data/categories";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Newspaper } from "lucide-react";
import { getUserPreferences } from "@/lib/data/preferences";
import { rankForUser } from "@/lib/personalization";

export const metadata: Metadata = {
  title: "News — FinLens",
};

function isCategory(value: string | undefined): value is Category {
  return !!value && (CATEGORY_ORDER as string[]).includes(value);
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string; scope?: string; period?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = isCategory(params.category) ? params.category : undefined;
  const sort = params.sort === "impact" || params.sort === "recent" ? params.sort : "for-you";

  const [allArticles, prefs, m] = await Promise.all([getArticlesForReader(), getUserPreferences(), getMessages()]);
  const locale = await getLocale();
  const fr = locale === "fr";
  const q = (params.q ?? "").trim().slice(0, 120);
  const scope = params.scope === "companies" || params.scope === "watchlist" ? params.scope : "all";
  const period = params.period === "24h" || params.period === "7d" ? params.period : "all";
  const { filterNews } = await import("@/lib/news-feed");
  let articles = filterNews(allArticles, { q, scope, period }, prefs);
  const preserved = { q: q || undefined, scope: scope !== "all" ? scope : undefined, period: period !== "all" ? period : undefined };

  if (activeCategory) {
    articles = articles.filter((a) => a.category === activeCategory);
  }
  if (sort === "impact") {
    articles = [...articles].sort((a, b) => b.impactScore.value - a.impactScore.value);
  } else if (sort === "for-you") {
    articles = rankForUser(articles, prefs);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink-950 sm:text-2xl">
          {m.news.title}
        </h1>
        <p className="mt-1 text-[13.5px] text-ink-400">
          {m.news.subtitle}
        </p>
      </div>

      <form action="/news" className="mb-5 rounded-xl border border-border bg-surface/40 p-4">
        {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
        <input type="hidden" name="sort" value={sort} />
        <label htmlFor="news-search" className="mb-2 block text-sm font-medium text-ink-950">{fr ? "Les nouvelles qui comptent pour vous" : "Find what matters to you"}</label>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <input id="news-search" name="q" defaultValue={q} maxLength={120} placeholder={fr ? "Entreprise, symbole ou sujet…" : "Company, ticker or topic…"} className="col-span-2 min-h-11 min-w-0 flex-1 rounded-md border border-border bg-white px-3 text-sm text-ink-950" />
          <select aria-label={fr ? "Type de nouvelles" : "News focus"} name="scope" defaultValue={scope} className="min-h-11 rounded-md border border-border bg-white px-3 text-sm">
            <option value="all">{fr ? "Toutes les nouvelles" : "All stories"}</option>
            <option value="companies">{fr ? "Événements d’entreprises" : "Company catalysts"}</option>
            <option value="watchlist">{fr ? "Mes actions" : "My watchlist"}</option>
          </select>
          <select aria-label={fr ? "Période" : "Time range"} name="period" defaultValue={period} className="min-h-11 rounded-md border border-border bg-white px-3 text-sm">
            <option value="all">{fr ? "Toute période" : "Any time"}</option>
            <option value="24h">{fr ? "Dernières 24 h" : "Past 24 hours"}</option>
            <option value="7d">{fr ? "7 derniers jours" : "Past 7 days"}</option>
          </select>
          <button className="col-span-2 min-h-11 rounded-md bg-ink-950 px-4 text-sm font-medium text-white">{fr ? "Rechercher" : "Search"}</button>
        </div>
        <p className="mt-3 hidden text-xs text-ink-600 sm:block">{fr ? "Lancements, contrats, résultats et décisions réglementaires. Les analyses indiquent des effets possibles, pas des prévisions de cours." : "Product launches, contracts, earnings and regulatory decisions. Analysis describes possible effects, not price predictions."}</p>
      </form>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryChips
          compact
          basePath="/news"
          activeCategory={activeCategory}
          extraParams={{ ...preserved, sort: sort !== "for-you" ? sort : undefined }}
        />
        <div className="flex shrink-0 items-center gap-1 self-start rounded-md border border-border p-0.5 sm:self-auto">
          {(["for-you", "recent", "impact"] as const).map((option) => {
            const params2 = new URLSearchParams();
            for (const [key, value] of Object.entries(preserved)) if (value) params2.set(key, value);
            if (activeCategory) params2.set("category", activeCategory);
            if (option !== "for-you") params2.set("sort", option);
            const qs = params2.toString();
            return (
              <Link
                aria-current={sort === option ? "page" : undefined}
                key={option}
                href={qs ? `/news?${qs}` : "/news"}
                className={cn(
                  "rounded px-2.5 py-1 text-[12px] font-medium capitalize transition-colors",
                  sort === option ? "bg-surface text-ink-950" : "text-ink-400 hover:text-ink-600"
                )}
              >
                {option === "for-you" ? m.news.forYou : option === "recent" ? m.news.recent : m.news.impact}
              </Link>
            );
          })}
        </div>
      </div>

      <p className="mb-3 text-xs text-ink-400" role="status">{articles.length} {fr ? "articles dans les dernières nouvelles disponibles" : "stories in the latest available coverage"}</p>
      {articles.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="h-5 w-5" strokeWidth={2} />}
          title={m.news.emptyTitle}
          description={scope === "watchlist" && prefs.tickers.length === 0 ? (fr ? "Ajoutez des actions à votre liste pour retrouver leurs nouvelles ici." : "Add stocks to your watchlist to see their news here.") : m.news.emptyText}
          action={
            <Link
              href="/news"
              className="text-[13px] font-medium text-accent-ink hover:underline"
            >
              {m.news.clearFilter}
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} prefs={prefs} />
          ))}
        </div>
      )}
    </div>
  );
}
