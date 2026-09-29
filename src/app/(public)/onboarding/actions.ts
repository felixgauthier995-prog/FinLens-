"use server";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";
import { ASSETS } from "@/lib/data/assets";
import { parseAnswers } from "@/lib/onboarding/options";
import { getMessages, getLocale } from "@/i18n/server";

export async function saveOnboarding(input: unknown): Promise<{ error: string } | void> {
  const m = await getMessages();
  const db = await createSessionClient();
  if (!db) return { error: m.auth.notConfigured };
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/login");

  const answers = parseAnswers(input, ASSETS.map((a) => a.ticker));
  if (!answers) return { error: m.onboarding.errMissing };

  const { error: profileError } = await db.from("profiles").upsert({
    user_id: user.id,
    experience: answers.experience,
    goal: answers.goal,
    sectors: answers.sectors,
    risk: answers.risk,
    onboarding_completed_at: new Date().toISOString(),
    locale: await getLocale(),
    updated_at: new Date().toISOString(),
  });
  if (profileError) return { error: m.onboarding.errSaveAnswers };

  const { error: watchlistError } = await db
    .from("user_watchlists")
    .upsert(
      answers.tickers.map((ticker) => ({ user_id: user.id, ticker })),
      { onConflict: "user_id,ticker", ignoreDuplicates: true }
    );
  if (watchlistError) return { error: m.onboarding.errSaveStocks };

  redirect("/subscribe");
}
