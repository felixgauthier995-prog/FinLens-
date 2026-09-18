import { cn } from "@/lib/cn";
import type { ImpactScore as ImpactScoreType } from "@/lib/types";
import { IMPACT_LABEL, IMPACT_TONE } from "@/lib/impact";

const SEGMENTS = 5;

/**
 * The FinLens Impact Score: a 1–10 scale rendered as a number, a text
 * label, and a segmented bar — the label and segment count carry the
 * meaning so the indicator still reads correctly without relying on color.
 */
export function ImpactScore({
  score,
  size = "md",
  className,
}: {
  score: ImpactScoreType;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tone = IMPACT_TONE[score.level];
  const filled = Math.max(1, Math.round((score.value / 10) * SEGMENTS));

  if (size === "sm") {
    return (
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        <span className="font-data text-[13px] font-semibold text-ink-950">
          {score.value.toFixed(1)}
        </span>
        <div className="flex items-center gap-0.5" aria-hidden="true">
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-2.5 w-1 rounded-full",
                i < filled ? tone.bar : "bg-ink-300/40"
              )}
            />
          ))}
        </div>
        <span className={cn("text-[11px] font-medium", tone.text)}>
          {IMPACT_LABEL[score.level]}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-lg border border-border px-3 py-2",
        className
      )}
      role="img"
      aria-label={`Impact score ${score.value.toFixed(1)} out of 10, ${IMPACT_LABEL[score.level]}`}
    >
      <span className="font-data text-2xl font-semibold text-ink-950 leading-none">
        {score.value.toFixed(1)}
        <span className="text-xs font-medium text-ink-400">/10</span>
      </span>
      <div className="flex flex-col gap-1">
        <span
          className={cn(
            "inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
            tone.text,
            tone.bg
          )}
        >
          {IMPACT_LABEL[score.level]} impact
        </span>
        <div className="flex items-center gap-0.5" aria-hidden="true">
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-5 rounded-full",
                i < filled ? tone.bar : "bg-ink-300/40"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
