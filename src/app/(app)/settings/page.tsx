import { AccountPanel } from "@/components/features/settings/AccountPanel";
import { requireAppAccess } from "@/lib/account";
import { NotificationsPanel } from "@/components/features/settings/NotificationsPanel";

export default async function SettingsPage() {
  const { user, subscription, profile } = await requireAppAccess();
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>
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
      <NotificationsPanel
        notifySignals={profile?.notifySignals ?? true}
        notifyMorning={profile?.notifyMorning ?? true}
      />
    </div>
  );
}
