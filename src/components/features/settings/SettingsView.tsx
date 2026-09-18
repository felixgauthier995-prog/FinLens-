"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card, SectionHeading } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";

const CURRENT_USER = {
  name: "Felix Gauthier",
  email: "felixgauthier995@gmail.com",
  memberSince: "March 2025",
};

const DEFAULT_PREFERENCES = [
  {
    id: "breaking",
    label: "Breaking news alerts",
    description: "Get notified immediately for major-impact stories.",
    checked: true,
  },
  {
    id: "brief",
    label: "Daily market brief",
    description: "A short email summary of what mattered, sent each morning.",
    checked: true,
  },
  {
    id: "events",
    label: "Event reminders",
    description: "Reminders before scheduled events you've set alerts for.",
    checked: true,
  },
  {
    id: "digest",
    label: "Weekly watchlist digest",
    description: "A weekly recap of everything relevant to your watchlist.",
    checked: false,
  },
];

export function SettingsView() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  function toggle(id: string, checked: boolean) {
    setPreferences((prev) => prev.map((p) => (p.id === id ? { ...p, checked } : p)));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink-950 sm:text-2xl">
          Settings
        </h1>
        <p className="mt-1 text-[13.5px] text-ink-400">
          Manage your profile and notification preferences.
        </p>
      </div>

      <Card className="mb-6 flex items-center gap-4 p-5">
        <Avatar name={CURRENT_USER.name} className="h-12 w-12 text-[14px]" />
        <div>
          <p className="text-[15px] font-semibold text-ink-950">{CURRENT_USER.name}</p>
          <p className="text-[13px] text-ink-400">{CURRENT_USER.email}</p>
          <p className="mt-0.5 text-[12px] text-ink-300">
            Member since {CURRENT_USER.memberSince}
          </p>
        </div>
      </Card>

      <SectionHeading eyebrow="Alerts" title="Notification preferences" />
      <Card className="mb-6 divide-y divide-border">
        {preferences.map((pref) => (
          <div key={pref.id} className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <div>
              <p className="text-[13.5px] font-medium text-ink-950">{pref.label}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-400">{pref.description}</p>
            </div>
            <Switch
              checked={pref.checked}
              onChange={(checked) => toggle(pref.id, checked)}
              label={pref.label}
            />
          </div>
        ))}
      </Card>

      <SectionHeading eyebrow="Account" title="Session" />
      <Card className="flex items-center justify-between gap-4 p-4 sm:p-5">
        <p className="text-[13px] text-ink-600">Signed in as {CURRENT_USER.email}</p>
        <Button variant="outline" size="sm">
          <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
          Sign out
        </Button>
      </Card>
    </div>
  );
}
