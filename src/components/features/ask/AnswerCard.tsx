"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AskSource } from "@/lib/data/ask";

export function AnswerCard({
  short,
  detail,
  sources,
  isAdviceBoundary,
}: {
  short: string;
  detail: string;
  sources: AskSource[];
  isAdviceBoundary?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2 text-ink-400">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
        <span className="text-[11px] font-semibold uppercase tracking-wider">FinLens</span>
      </div>

      {isAdviceBoundary && (
        <div className="mb-3 flex items-start gap-2 rounded-md bg-surface px-3 py-2 text-[12px] text-ink-600">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={2} />
          <span>FinLens shares information, not personalized investment advice.</span>
        </div>
      )}

      <p className="text-[14.5px] leading-relaxed text-ink-950">{short}</p>

      {expanded && (
        <p className="mt-3 border-t border-border pt-3 text-[13.5px] leading-relaxed text-ink-600">
          {detail}
        </p>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent-ink hover:underline"
      >
        {expanded ? "Show less" : "Show more detail"}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
          strokeWidth={2}
        />
      </button>

      {sources.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          <span className="text-[11px] font-medium text-ink-400">Sources:</span>
          {sources.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-full border border-border px-2.5 py-1 text-[11.5px] font-medium text-ink-600 transition-colors hover:bg-surface hover:text-ink-950"
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
