"use client";

import Link from "next/link";
import { CATEGORY_ORDER } from "@/lib/data/categories";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";

export function CategoryChips({
  compact = false,
  basePath,
  activeCategory,
  extraParams,
}: {
  compact?: boolean;
  basePath: string;
  activeCategory?: Category;
  /** Additional query params to preserve when switching category (e.g. sort, view). */
  extraParams?: Record<string, string | undefined>;
}) {
  const { m } = useI18n();
  function hrefFor(category: Category | "all") {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (extraParams) {
      for (const [key, value] of Object.entries(extraParams)) {
        if (value) params.set(key, value);
      }
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2", compact ? "max-w-full overflow-x-auto whitespace-nowrap pb-1 sm:flex-wrap sm:whitespace-normal sm:overflow-visible" : "flex-wrap")}>
      <Link
        href={hrefFor("all")}
        className={cn(
          "shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
          !activeCategory
            ? "border-ink-950 bg-ink-950 text-white"
            : "border-border text-ink-600 hover:bg-surface"
        )}
      >
        {m.news.all}
      </Link>
      {CATEGORY_ORDER.map((category) => (
        <Link
          key={category}
          href={hrefFor(category)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
            activeCategory === category
              ? "border-ink-950 bg-ink-950 text-white"
              : "border-border text-ink-600 hover:bg-surface"
          )}
        >
          {m.categories[category]}
        </Link>
      ))}
    </div>
  );
}
