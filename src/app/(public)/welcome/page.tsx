import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, BellRing, Quote, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { getAccount } from "@/lib/account";

export const metadata: Metadata = {
  title: "FinLens — What moves your stocks, explained",
};

const FEATURES = [
  {
    icon: ArrowUpRight,
    title: "Who could be affected",
    text: "Each story shows which companies it's good or bad news for, and why — with the sentence from the source that backs it up.",
  },
  {
    icon: Quote,
    title: "No invented links",
    text: "Every signal must quote the article and pass a second review. Our hit rate is published, right or wrong.",
  },
  {
    icon: BellRing,
    title: "Built around your stocks",
    text: "Pick the companies you follow and FinLens puts their earnings, news and catalysts first.",
  },
  {
    icon: Sparkles,
    title: "Ask FinLens",
    text: "Ask a question in plain words and get an answer grounded in the latest coverage.",
  },
];

export default async function WelcomePage() {
  if (await getAccount()) redirect("/");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-10">
      <Logo />
      <div className="mt-12">
        <h1 className="font-serif text-[34px] font-semibold leading-[1.1] tracking-tight text-ink-950">
          What moves your stocks, explained.
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-600">
          FinLens reads the financial news for you and tells you which companies it could affect —
          up or down, and why.
        </p>
      </div>

      <ul className="mt-10 space-y-5">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[14.5px] font-semibold text-ink-950">{title}</p>
              <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink-600">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-12">
        <Link
          href="/login?mode=signup"
          className="flex h-12 w-full items-center justify-center rounded-xl bg-ink-950 text-[15px] font-semibold text-white transition-colors hover:bg-ink-800"
        >
          Start your 7-day free trial
        </Link>
        <Link
          href="/login"
          className="mt-3 flex h-11 w-full items-center justify-center text-[14px] font-medium text-ink-600 hover:text-ink-950"
        >
          I already have an account
        </Link>
        <p className="mt-4 text-center text-[11.5px] leading-relaxed text-ink-400">
          Information and analysis, not investment advice.
        </p>
      </div>
    </main>
  );
}
