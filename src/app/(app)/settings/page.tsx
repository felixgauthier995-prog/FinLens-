import Link from "next/link";
import { AccountPanel } from "@/components/features/settings/AccountPanel";
import { NotificationsPanel } from "@/components/features/settings/NotificationsPanel";
import { LanguageSwitch } from "@/components/features/settings/LanguageSwitch";
import { DeleteAccount } from "@/components/features/settings/DeleteAccount";
import { requireAppAccess } from "@/lib/account";
import { getMessages } from "@/i18n/server";

export default async function SettingsPage() {
  const [{ user, subscription, profile }, m] = await Promise.all([requireAppAccess(), getMessages()]);
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">{m.settings.title}</h1>
      <AccountPanel
        account={{
          email: user.email ?? "",
          status: subscription?.status ?? null,
          planInterval: subscription?.planInterval ?? null,
          trialEnd: subscription?.trialEnd ?? null,
          currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
          cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
        }}
      />
      <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-5">
        <div>
          <h2 className="font-semibold text-ink-950">{m.settings.languageTitle}</h2>
          <p className="mt-0.5 text-[13px] text-ink-600">{m.settings.languageHint}</p>
        </div>
        <LanguageSwitch />
      </section>
      <NotificationsPanel
        notifySignals={profile?.notifySignals ?? true}
        notifyMorning={profile?.notifyMorning ?? true}
      />
      <DeleteAccount />
      <p className="flex flex-wrap gap-4 text-[12.5px] text-ink-400">
        <span>{m.settings.legal}:</span>
        <Link href="/legal/terms" className="hover:text-ink-950">{m.common.terms}</Link>
        <Link href="/legal/privacy" className="hover:text-ink-950">{m.common.privacy}</Link>
      </p>
    </div>
  );
}
