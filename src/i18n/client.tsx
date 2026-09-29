"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { messages, type Messages } from "@/i18n/messages";

const I18nContext = createContext<{ locale: Locale; m: Messages }>({ locale: "en", m: messages.en });

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <I18nContext.Provider value={{ locale, m: messages[locale] }}>{children}</I18nContext.Provider>;
}

/** Current locale and its messages, in client components. */
export function useI18n() {
  return useContext(I18nContext);
}
