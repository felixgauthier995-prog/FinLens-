"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { LOCALES, type Locale } from "@/i18n/config";
import { setLocale } from "@/app/actions/locale";
import { cn } from "@/lib/cn";

const LABEL: Record<Locale, string> = { en: "English", fr: "Français" };

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { locale, m } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div
      role="radiogroup"
      aria-label={m.common.language}
      className={cn("inline-flex rounded-lg bg-surface p-0.5", pending && "opacity-60")}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={locale === l}
          disabled={pending}
          onClick={() =>
            start(async () => {
              await setLocale(l);
              router.refresh();
            })
          }
          className={cn(
            "rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors",
            locale === l ? "bg-background text-ink-950 shadow-sm" : "text-ink-400 hover:text-ink-600"
          )}
        >
          {compact ? l.toUpperCase() : LABEL[l]}
        </button>
      ))}
    </div>
  );
}
