import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, BellRing, Quote, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { getAccount } from "@/lib/account";
import { getMessages } from "@/i18n/server";
import { LanguageSwitch } from "@/components/features/settings/LanguageSwitch";

export const metadata: Metadata = {
  title: "FinLens — What moves your stocks, explained",
};

const FEATURE_ICONS = [ArrowUpRight, Quote, BellRing, Sparkles];

export default async function WelcomePage() {
  if (await getAccount()) redirect("/");
  const m = await getMessages();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-10">
      <div className="flex items-center justify-between">
        <Logo />
        <LanguageSwitch compact />
      </div>
      <div className="mt-12">
        <h1 className="font-serif text-[34px] font-semibold leading-[1.1] tracking-tight text-ink-950">
          {m.welcome.title}
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-600">
          {m.welcome.intro}
        </p>
      </div>

      <ul className="mt-10 space-y-5">
        {m.welcome.features.map(({ title, text }, i) => {
          const Icon = FEATURE_ICONS[i] ?? Sparkles;
          return (
          <li key={title} className="flex gap-3.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[14.5px] font-semibold text-ink-950">{title}</p>
              <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink-600">{text}</p>
            </div>
          </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-12">
        <Link
          href="/login?mode=signup"
          className="flex h-12 w-full items-center justify-center rounded-xl bg-ink-950 text-[15px] font-semibold text-white transition-colors hover:bg-ink-800"
        >
          {m.welcome.start}
        </Link>
        <Link
          href="/login"
          className="mt-3 flex h-11 w-full items-center justify-center text-[14px] font-medium text-ink-600 hover:text-ink-950"
        >
          {m.welcome.haveAccount}
        </Link>
        <p className="mt-4 text-center text-[11.5px] leading-relaxed text-ink-400">
          {m.common.notAdvice}
        </p>
        <p className="mt-2 flex justify-center gap-4 text-[11.5px] text-ink-400">
          <Link href="/legal/terms" className="hover:text-ink-950">{m.common.terms}</Link>
          <Link href="/legal/privacy" className="hover:text-ink-950">{m.common.privacy}</Link>
        </p>
      </div>
    </main>
  );
}
