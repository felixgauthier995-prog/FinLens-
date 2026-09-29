export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "finlens_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Cookie choice first, then the browser's preferred languages. */
export function detectLocale(cookieValue: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  const preferred = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().slice(0, 2), q: q ? Number(q) : 1 };
    })
    .filter((p) => p.lang)
    .sort((a, b) => b.q - a.q);
  for (const p of preferred) if (isLocale(p.lang)) return p.lang;
  return DEFAULT_LOCALE;
}

/** BCP-47 tag for Intl date/number formatting. */
export function intlLocale(locale: Locale): string {
  return locale === "fr" ? "fr-CA" : "en-US";
}
