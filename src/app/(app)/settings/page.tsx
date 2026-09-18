import type { Metadata } from "next";
import { SettingsView } from "@/components/features/settings/SettingsView";

export const metadata: Metadata = {
  title: "Settings — FinLens",
};

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <SettingsView />
    </div>
  );
}
