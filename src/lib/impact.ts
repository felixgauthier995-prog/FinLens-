import type { ImpactLevel, ImpactScore } from "@/lib/types";

export function impactLevelFromValue(value: number): ImpactLevel {
  if (value >= 9) return "major";
  if (value >= 7) return "high";
  if (value >= 4) return "moderate";
  return "low";
}

export function makeImpact(value: number): ImpactScore {
  return { value, level: impactLevelFromValue(value) };
}

export const IMPACT_LABEL: Record<ImpactLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  major: "Major",
};

/** Tailwind-driven tone per level. Used by the ImpactScore component only. */
export const IMPACT_TONE: Record<ImpactLevel, { text: string; bg: string; ring: string; bar: string }> = {
  low: {
    text: "text-slate-600",
    bg: "bg-slate-100",
    ring: "ring-slate-200",
    bar: "bg-slate-400",
  },
  moderate: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    bar: "bg-amber-500",
  },
  high: {
    text: "text-orange-700",
    bg: "bg-orange-50",
    ring: "ring-orange-200",
    bar: "bg-orange-500",
  },
  major: {
    text: "text-red-700",
    bg: "bg-red-50",
    ring: "ring-red-200",
    bar: "bg-red-600",
  },
};
