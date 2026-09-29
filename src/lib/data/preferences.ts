import "server-only";
import { cache } from "react";
import { createSessionClient } from "@/lib/supabase/session";
import { getAccount } from "@/lib/account";
import { NO_PREFERENCES, type UserPreferences } from "@/lib/personalization";

/** The signed-in user's questionnaire answers and watchlist, once per request. */
export const getUserPreferences = cache(async (): Promise<UserPreferences> => {
  const account = await getAccount();
  if (!account) return NO_PREFERENCES;

  let tickers: string[] = [];
  const db = await createSessionClient();
  if (db) {
    const { data } = await db
      .from("user_watchlists")
      .select("ticker")
      .eq("user_id", account.user.id)
      .order("created_at", { ascending: true });
    tickers = (data ?? []).map((r) => r.ticker as string);
  }

  return {
    experience: account.profile?.experience ?? null,
    risk: account.profile?.risk ?? null,
    sectors: account.profile?.sectors ?? [],
    tickers,
  };
});
