"use client";
import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, Check, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  MAX_STOCKS,
  MIN_STOCKS,
  RISK_OPTIONS,
  SECTOR_OPTIONS,
  suggestAssets,
  type Experience,
  type Goal,
  type PickableAsset,
  type Risk,
  type Sector,
} from "@/lib/onboarding/options";
import { saveOnboarding } from "@/app/(public)/onboarding/actions";

const STEPS = ["experience", "goal", "sectors", "risk", "stocks"] as const;
type Step = (typeof STEPS)[number];

const TITLES: Record<Step, { title: string; subtitle: string }> = {
  experience: { title: "How much investing experience do you have?", subtitle: "We'll adapt how much we explain." },
  goal: { title: "What brings you to FinLens?", subtitle: "Pick the one that fits best." },
  sectors: { title: "Which areas interest you?", subtitle: "Choose as many as you like." },
  risk: { title: "How do you feel about risk?", subtitle: "There's no wrong answer." },
  stocks: { title: "Pick the stocks you want to follow", subtitle: `Choose ${MIN_STOCKS} to ${MAX_STOCKS}. You can change them anytime.` },
};

function OptionCard({
  selected,
  onClick,
  label,
  hint,
  multi = false,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors",
        selected ? "border-ink-950 bg-surface" : "border-border hover:bg-surface"
      )}
    >
      <span className="flex-1">
        <span className="block text-[15px] font-semibold text-ink-950">{label}</span>
        {hint && <span className="mt-0.5 block text-[13px] leading-snug text-ink-600">{hint}</span>}
      </span>
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center border",
          multi ? "rounded-md" : "rounded-full",
          selected ? "border-ink-950 bg-ink-950 text-white" : "border-border-strong"
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
      </span>
    </button>
  );
}

function StockChip({
  asset,
  selected,
  disabled,
  onToggle,
}: {
  asset: PickableAsset;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled && !selected}
      onClick={onToggle}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors disabled:opacity-40",
        selected ? "border-ink-950 bg-surface" : "border-border hover:bg-surface"
      )}
    >
      <span className="font-data w-12 shrink-0 text-[14px] font-semibold text-ink-950">{asset.ticker}</span>
      <span className="flex-1 truncate text-[13px] text-ink-600">{asset.name}</span>
      {selected && <Check className="h-4 w-4 shrink-0 text-ink-950" strokeWidth={2.5} aria-hidden="true" />}
    </button>
  );
}

export function OnboardingFlow({ assets }: { assets: PickableAsset[] }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [risk, setRisk] = useState<Risk | null>(null);
  const [tickers, setTickers] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [saving, startSaving] = useTransition();

  const step = STEPS[stepIndex];
  const { suggested, others } = useMemo(() => suggestAssets(assets, sectors), [assets, sectors]);
  const q = query.trim().toLowerCase();
  const searchResults = useMemo(
    () =>
      q
        ? assets.filter((a) => a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)).slice(0, 20)
        : [],
    [assets, q]
  );
  const selectedAssets = assets.filter((a) => tickers.includes(a.ticker));

  const canContinue =
    (step === "experience" && experience) ||
    (step === "goal" && goal) ||
    (step === "sectors" && sectors.length > 0) ||
    (step === "risk" && risk) ||
    (step === "stocks" && tickers.length >= MIN_STOCKS);

  function toggle<T>(list: T[], item: T): T[] {
    return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
  }

  function next() {
    setError("");
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    startSaving(async () => {
      const result = await saveOnboarding({ experience, goal, sectors, risk, tickers });
      if (result?.error) setError(result.error);
    });
  }

  const atMax = tickers.length >= MAX_STOCKS;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
          disabled={stepIndex === 0}
          aria-label="Previous question"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-600 hover:bg-surface disabled:invisible"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <div className="flex flex-1 gap-1.5" aria-label={`Step ${stepIndex + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={cn("h-1 flex-1 rounded-full", i <= stepIndex ? "bg-ink-950" : "bg-border")}
            />
          ))}
        </div>
      </div>

      <h1 className="mt-8 text-[24px] font-semibold leading-tight tracking-tight text-ink-950">
        {TITLES[step].title}
      </h1>
      <p className="mt-2 text-[14.5px] text-ink-600">{TITLES[step].subtitle}</p>

      <div className="mt-7 space-y-2.5" role={step === "sectors" || step === "stocks" ? "group" : "radiogroup"}>
        {step === "experience" &&
          EXPERIENCE_OPTIONS.map((o) => (
            <OptionCard key={o.value} selected={experience === o.value} onClick={() => setExperience(o.value)} label={o.label} hint={o.hint} />
          ))}

        {step === "goal" &&
          GOAL_OPTIONS.map((o) => (
            <OptionCard key={o.value} selected={goal === o.value} onClick={() => setGoal(o.value)} label={o.label} hint={o.hint} />
          ))}

        {step === "sectors" && (
          <div className="grid grid-cols-2 gap-2.5">
            {SECTOR_OPTIONS.map((o) => (
              <OptionCard key={o.value} multi selected={sectors.includes(o.value)} onClick={() => setSectors(toggle(sectors, o.value))} label={o.label} />
            ))}
          </div>
        )}

        {step === "risk" &&
          RISK_OPTIONS.map((o) => (
            <OptionCard key={o.value} selected={risk === o.value} onClick={() => setRisk(o.value)} label={o.label} hint={o.hint} />
          ))}

        {step === "stocks" && (
          <>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" strokeWidth={2} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a company or ticker (e.g. Disney, NFLX)"
                aria-label="Search stocks"
                className="h-11 w-full rounded-xl border border-border-strong pl-10 pr-3 text-[14px] text-ink-950 outline-none placeholder:text-ink-300 focus:border-accent"
              />
            </label>

            {selectedAssets.length > 0 && !q && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedAssets.map((a) => (
                  <button
                    key={a.ticker}
                    type="button"
                    onClick={() => setTickers(toggle(tickers, a.ticker))}
                    className="font-data inline-flex items-center gap-1 rounded-full bg-ink-950 px-2.5 py-1 text-[12px] font-semibold text-white"
                    aria-label={`Remove ${a.ticker}`}
                  >
                    {a.ticker} <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}

            {q ? (
              <div className="grid gap-2 pt-2">
                {searchResults.length === 0 && (
                  <p className="py-6 text-center text-[13px] text-ink-400">No company matches “{query}”.</p>
                )}
                {searchResults.map((a) => (
                  <StockChip key={a.ticker} asset={a} selected={tickers.includes(a.ticker)} disabled={atMax} onToggle={() => setTickers(toggle(tickers, a.ticker))} />
                ))}
              </div>
            ) : (
              <>
                {suggested.length > 0 && (
                  <>
                    <p className="pt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">Suggested for you</p>
                    <div className="grid gap-2">
                      {suggested.slice(0, 12).map((a) => (
                        <StockChip key={a.ticker} asset={a} selected={tickers.includes(a.ticker)} disabled={atMax} onToggle={() => setTickers(toggle(tickers, a.ticker))} />
                      ))}
                    </div>
                  </>
                )}
                <p className="pt-4 text-[11px] font-semibold uppercase tracking-wider text-ink-400">Popular</p>
                <div className="grid gap-2">
                  {others
                    .filter((a) => ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN", "GOOGL", "META", "SPY"].includes(a.ticker))
                    .map((a) => (
                      <StockChip key={a.ticker} asset={a} selected={tickers.includes(a.ticker)} disabled={atMax} onToggle={() => setTickers(toggle(tickers, a.ticker))} />
                    ))}
                </div>
                <p className="pt-2 text-center text-[12.5px] text-ink-400">
                  {assets.length} companies available — use the search to find yours.
                </p>
              </>
            )}
          </>
        )}
      </div>

      <div className="sticky bottom-0 mt-auto bg-background pb-4 pt-6">
        {error && (
          <p role="alert" className="mb-3 text-[13px] text-negative">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={next}
          disabled={!canContinue || saving}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-ink-950 text-[15px] font-semibold text-white transition-colors hover:bg-ink-800 disabled:bg-ink-300"
        >
          {step === "stocks"
            ? saving
              ? "Saving…"
              : `Continue with ${tickers.length} stock${tickers.length === 1 ? "" : "s"}`
            : "Continue"}
        </button>
      </div>
    </main>
  );
}
