/** Questionnaire choices. Shared by the UI and server-side validation. */

export const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Just starting", hint: "I'm new to investing and want things explained simply." },
  { value: "intermediate", label: "Some experience", hint: "I own a few stocks or ETFs and follow the market now and then." },
  { value: "advanced", label: "Experienced", hint: "I invest actively and know the jargon." },
] as const;

export const GOAL_OPTIONS = [
  { value: "long-term", label: "Grow my money over years", hint: "Long-term investing." },
  { value: "active-trading", label: "Spot opportunities", hint: "I trade more actively on news." },
  { value: "stay-informed", label: "Understand what's going on", hint: "Follow the news that moves markets." },
  { value: "learn", label: "Learn how markets work", hint: "Build my knowledge step by step." },
] as const;

export const SECTOR_OPTIONS = [
  { value: "tech", label: "Tech & software", assetSectors: ["Technology"] },
  { value: "ai", label: "AI & chips", assetSectors: ["Semiconductors"] },
  { value: "energy", label: "Energy & oil", assetSectors: ["Energy", "Utilities"], assetTypes: ["commodity"] },
  { value: "financials", label: "Banks & finance", assetSectors: ["Financials"] },
  { value: "consumer", label: "Consumer & retail", assetSectors: ["Consumer Discretionary", "Consumer Staples", "Automotive"] },
  { value: "media", label: "Media & entertainment", assetSectors: ["Communication Services"] },
  { value: "healthcare", label: "Healthcare & pharma", assetSectors: ["Healthcare"] },
  { value: "industrials", label: "Industry & defense", assetSectors: ["Industrials", "Materials"] },
  { value: "crypto", label: "Crypto", assetTypes: ["crypto"] },
  { value: "broad", label: "The whole market", assetSectors: ["Broad Market"], assetTypes: ["etf"] },
] as const;

export const RISK_OPTIONS = [
  { value: "cautious", label: "Cautious", hint: "Losing money worries me more than missing gains." },
  { value: "balanced", label: "Balanced", hint: "I accept ups and downs for reasonable growth." },
  { value: "aggressive", label: "Aggressive", hint: "I'm comfortable with big swings for bigger potential." },
] as const;

export type Experience = (typeof EXPERIENCE_OPTIONS)[number]["value"];
export type Goal = (typeof GOAL_OPTIONS)[number]["value"];
export type Sector = (typeof SECTOR_OPTIONS)[number]["value"];
export type Risk = (typeof RISK_OPTIONS)[number]["value"];

export const MIN_STOCKS = 1;
export const MAX_STOCKS = 15;

export interface PickableAsset {
  ticker: string;
  name: string;
  assetType: string;
  sector?: string;
}

/** Assets matching the chosen sectors first, then everything else. */
export function suggestAssets(assets: PickableAsset[], sectors: Sector[]): {
  suggested: PickableAsset[];
  others: PickableAsset[];
} {
  const chosen = SECTOR_OPTIONS.filter((o) => sectors.includes(o.value));
  const matches = (a: PickableAsset) =>
    chosen.some(
      (o) =>
        ("assetSectors" in o && a.sector && (o.assetSectors as readonly string[]).includes(a.sector)) ||
        ("assetTypes" in o && (o.assetTypes as readonly string[]).includes(a.assetType))
    );
  return {
    suggested: assets.filter(matches),
    others: assets.filter((a) => !matches(a)),
  };
}

export interface OnboardingAnswers {
  experience: Experience;
  goal: Goal;
  sectors: Sector[];
  risk: Risk;
  tickers: string[];
}

/** Server-side validation of submitted answers. Returns null if invalid. */
export function parseAnswers(value: unknown, knownTickers: string[]): OnboardingAnswers | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const inList = <T extends string>(x: unknown, list: readonly { value: T }[]): x is T =>
    typeof x === "string" && list.some((o) => o.value === x);

  if (!inList(v.experience, EXPERIENCE_OPTIONS)) return null;
  if (!inList(v.goal, GOAL_OPTIONS)) return null;
  if (!inList(v.risk, RISK_OPTIONS)) return null;
  if (!Array.isArray(v.sectors) || v.sectors.length === 0) return null;
  if (!v.sectors.every((s) => inList(s, SECTOR_OPTIONS))) return null;
  if (!Array.isArray(v.tickers)) return null;
  const tickers = Array.from(new Set(v.tickers));
  if (tickers.length < MIN_STOCKS || tickers.length > MAX_STOCKS) return null;
  if (!tickers.every((t) => typeof t === "string" && knownTickers.includes(t))) return null;

  return {
    experience: v.experience,
    goal: v.goal,
    risk: v.risk,
    sectors: Array.from(new Set(v.sectors as Sector[])),
    tickers: tickers as string[],
  };
}
