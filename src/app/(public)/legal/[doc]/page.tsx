import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LEGAL, type LegalDocKey } from "@/legal/documents";
import { COMPANY } from "@/legal/company";
import { getLocale, getMessages } from "@/i18n/server";
import { intlLocale } from "@/i18n/config";
import { LanguageSwitch } from "@/components/features/settings/LanguageSwitch";

function isDoc(value: string): value is LegalDocKey {
  return value in LEGAL;
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const { doc } = await params;
  if (!isDoc(doc)) return {};
  return { title: `${LEGAL[doc][await getLocale()].title} — FinLens` };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  if (!isDoc(doc)) notFound();
  const [locale, m] = await Promise.all([getLocale(), getMessages()]);
  const d = LEGAL[doc][locale];
  const updated = new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${COMPANY.lastUpdated}T12:00:00Z`)
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-400 hover:text-ink-950">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          {m.common.back}
        </Link>
        <LanguageSwitch compact />
      </div>
      <Logo className="mt-8" />
      <h1 className="mt-6 text-[28px] font-semibold tracking-tight text-ink-950">{d.title}</h1>
      <p className="mt-1 text-[12.5px] text-ink-400">
        {locale === "fr" ? "Dernière mise à jour : " : "Last updated: "}
        {updated}
      </p>
      <p className="mt-5 text-[15px] leading-relaxed text-ink-800">{d.intro}</p>

      {d.sections.map((s) => (
        <section key={s.title} className="mt-8">
          <h2 className="text-[17px] font-semibold text-ink-950">{s.title}</h2>
          {s.list && (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[14.5px] leading-relaxed text-ink-800">
              {s.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {s.paragraphs?.map((p) => (
            <p key={p} className="mt-3 text-[14.5px] leading-relaxed text-ink-800">
              {p}
            </p>
          ))}
        </section>
      ))}

      <p className="mt-12 flex gap-4 border-t border-border pt-6 text-[12.5px] text-ink-400">
        <Link href="/legal/terms" className="hover:text-ink-950">{m.common.terms}</Link>
        <Link href="/legal/privacy" className="hover:text-ink-950">{m.common.privacy}</Link>
      </p>
    </main>
  );
}
