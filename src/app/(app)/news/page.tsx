import Link from "next/link";
import type { Metadata } from "next";
import { CategoryChips } from "@/components/features/shared/CategoryChips";
import { NewsCard } from "@/components/features/news/NewsCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getArticlesForReader } from "@/lib/data/reader";
import { getMessages } from "@/i18n/server";
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
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = isCategory(params.category) ? params.category : undefined;
  const sort = params.sort === "impact" || params.sort === "recent" ? params.sort : "for-you";

  const [allArticles, prefs, m] = await Promise.all([getArticlesForReader(), getUserPreferences(), getMessages()]);
  let articles = allArticles;
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

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryChips
          basePath="/news"
          activeCategory={activeCategory}
          extraParams={{ sort: sort !== "for-you" ? sort : undefined }}
        />
        <div className="flex shrink-0 items-center gap-1 self-start rounded-md border border-border p-0.5 sm:self-auto">
          {(["for-you", "recent", "impact"] as const).map((option) => {
            const params2 = new URLSearchParams();
            if (activeCategory) params2.set("category", activeCategory);
            if (option !== "for-you") params2.set("sort", option);
            const qs = params2.toString();
            return (
              <Link
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

      {articles.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="h-5 w-5" strokeWidth={2} />}
          title={m.news.emptyTitle}
          description={m.news.emptyText}
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
