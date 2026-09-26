import { AccountPanel } from "@/components/features/settings/AccountPanel";
export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>
      <AccountPanel />
      <p className="text-sm text-ink-600">
        Watchlists and in-app event reminders are saved to your account. Email
        and push alerts are not enabled.
      </p>
    </div>
  );
}
