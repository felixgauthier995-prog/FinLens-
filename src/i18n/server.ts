import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { detectLocale, type Locale } from "@/i18n/config";
import { messages, type Messages } from "@/i18n/messages";

export const getLocale = cache(async (): Promise<Locale> => {
  const [c, h] = await Promise.all([cookies(), headers()]);
  return detectLocale(c.get("finlens_locale")?.value, h.get("accept-language"));
});

export async function getMessages(): Promise<Messages> {
  return messages[await getLocale()];
}
