"use server";
import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "@/i18n/config";
import { createSessionClient } from "@/lib/supabase/session";

/** Saves the chosen language (cookie, and profile for notifications). */
export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  const db = await createSessionClient();
  const user = db ? (await db.auth.getUser()).data.user : null;
  if (db && user) await db.from("profiles").update({ locale }).eq("user_id", user.id);
}
