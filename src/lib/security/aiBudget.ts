import { reserveQuota } from "@/lib/security/quota";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function limit(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

/**
 * Separate daily AI budgets, so frequent background imports can never use
 * up the calls reserved for subscribers asking questions (and vice versa).
 */
export function reserveIngestionAiCall(): Promise<boolean> {
  return reserveQuota(`ai-ingest:${today()}`, limit("AI_INGEST_DAILY_MAX", 150));
}

export function reserveAskAiCall(): Promise<boolean> {
  return reserveQuota(`ai-ask:${today()}`, limit("AI_ASK_DAILY_MAX", 300));
}
