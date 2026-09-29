import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Scheduled jobs are called either by Vercel Cron (Bearer CRON_SECRET) or
 * by the Supabase pg_cron scheduler (Bearer SCHEDULER_SECRET), which runs
 * them every 15 minutes on the free Vercel plan.
 */
export function isCronAuthorized(request: Request): boolean {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return false;
  return [process.env.CRON_SECRET, process.env.SCHEDULER_SECRET].some(
    (secret) => !!secret && secret.length >= 16 && safeEqual(token, secret)
  );
}
