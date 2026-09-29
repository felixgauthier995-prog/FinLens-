import { ArrowDownRight, ArrowUpRight, BadgeCheck, Link2, Quote } from "lucide-react";
import type { ArticleSignal, SignalTrackRecord } from "@/lib/types";
import { cn } from "@/lib/cn";

const CONFIDENCE_LABEL: Record<ArticleSignal["confidence"], string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

const HORIZON_LABEL: Record<ArticleSignal["horizon"], string> = {
  short: "Short term",
  long: "Long term",
};

function directionTone(signal: ArticleSignal) {
  const positive = signal.direction === "positive";
  return {
    Icon: positive ? ArrowUpRight : ArrowDownRight,
    label: positive ? "Potential positive impact" : "Potential negative impact",
    text: positive ? "text-positive" : "text-negative",
    soft: positive ? "bg-positive-soft" : "bg-negative-soft",
    // Lower confidence reads visibly weaker.
    weight: signal.confidence === "high" ? "" : signal.confidence === "medium" ? "opacity-85" : "opacity-60",
  };
}

/** Compact ticker + arrow chips for news cards. */
export function SignalChips({ signals, max = 3 }: { signals: ArticleSignal[]; max?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {signals.slice(0, max).map((s) => {
        const tone = directionTone(s);
        return (
          <span
            key={s.ticker}
            title={`${tone.label} · ${CONFIDENCE_LABEL[s.confidence]}${s.linkLevel === "chain" ? " · Indirect link" : ""}`}
            className={cn(
              "font-data inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
              tone.soft,
              tone.text,
              tone.weight,
              s.linkLevel === "chain" && "border border-dashed border-current bg-transparent"
            )}
          >
            {s.ticker}
            <tone.Icon className="h-3 w-3" strokeWidth={2.25} aria-hidden="true" />
          </span>
        );
      })}
    </div>
  );
}

function SignalRow({ signal }: { signal: ArticleSignal }) {
  const tone = directionTone(signal);
  const chain = signal.linkLevel === "chain";
  return (
    <li
      className={cn(
        "rounded-lg border p-3.5",
        chain ? "border-dashed border-border" : "border-border"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-data text-[14px] font-semibold text-ink-950">{signal.ticker}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium",
            tone.soft,
            tone.text,
            tone.weight
          )}
        >
          <tone.Icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
          {tone.label}
        </span>
        <span className="text-[11px] text-ink-400">
          {CONFIDENCE_LABEL[signal.confidence]} · {HORIZON_LABEL[signal.horizon]}
        </span>
      </div>

      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-800">{signal.rationale}</p>

      <p className="mt-2 flex gap-1.5 text-[12.5px] italic leading-relaxed text-ink-400">
        <Quote className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={2} aria-hidden="true" />
        <span>{signal.evidenceQuote}</span>
      </p>

      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-ink-400">
        {chain ? (
          <span className="inline-flex items-center gap-1">
            <Link2 className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
            Indirect link — a lead to explore, not named in the article
          </span>
        ) : (
          <span>Named in the article</span>
        )}
        {signal.verified && (
          <span className="inline-flex items-center gap-1">
            <BadgeCheck className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
            Checked by a second review
          </span>
        )}
      </div>
    </li>
  );
}

const MIN_SAMPLE_FOR_RATE = 20;

function TrackRecordLine({ record }: { record: SignalTrackRecord[] }) {
  const week = record.find((r) => r.window === "1w");
  if (!week) return null;
  if (week.measured < MIN_SAMPLE_FOR_RATE) {
    return (
      <p className="mt-3 text-[12px] text-ink-400">
        Track record in progress: {week.measured} signal{week.measured === 1 ? "" : "s"} measured
        after one week so far. A hit rate is shown from {MIN_SAMPLE_FOR_RATE}.
      </p>
    );
  }
  const rate = Math.round((week.matched / week.measured) * 100);
  return (
    <p className="mt-3 text-[12px] text-ink-600">
      <span className="font-semibold text-ink-950">{rate}%</span> of FinLens signals matched the
      stock&apos;s move relative to the S&amp;P 500 one week later ({week.matched} of {week.measured}{" "}
      measured).
    </p>
  );
}

export function SignalList({
  signals,
  trackRecord,
}: {
  signals: ArticleSignal[];
  trackRecord?: SignalTrackRecord[];
}) {
  return (
    <div>
      <ul className="space-y-3">
        {signals.map((s) => (
          <SignalRow key={s.ticker} signal={s} />
        ))}
      </ul>
      {trackRecord && <TrackRecordLine record={trackRecord} />}
      <p className="mt-3 text-[12px] italic text-ink-400">
        These signals assess whether the news is good or bad for each company. They are not price
        predictions and not investment advice — a stock can fall on good news.
      </p>
    </div>
  );
}
