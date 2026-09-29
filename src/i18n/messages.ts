import type { Locale } from "@/i18n/config";
import { en, type Messages } from "@/i18n/en";
import { fr } from "@/i18n/fr";

export type { Messages };
export const messages: Record<Locale, Messages> = { en, fr };
