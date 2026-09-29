"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Share } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { disablePush, enablePush, getPushState, type PushState } from "@/lib/push/client";
import { useI18n } from "@/i18n/client";

export function NotificationsPanel({
  notifySignals: initialSignals,
  notifyMorning: initialMorning,
}: {
  notifySignals: boolean;
  notifyMorning: boolean;
}) {
  const { m } = useI18n();
  const t = m.notifications;
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [signals, setSignals] = useState(initialSignals);
  const [morning, setMorning] = useState(initialMorning);

  useEffect(() => {
    getPushState().then(setState).catch(() => setState("unsupported"));
  }, []);

  async function toggleDevice() {
    setBusy(true);
    setError("");
    try {
      setState(state === "on" ? await disablePush() : await enablePush({ notConfigured: t.errNotConfigured, failed: t.errTurnOn }));
    } catch (e) {
      setError(e instanceof Error ? e.message : m.common.somethingWrong);
    } finally {
      setBusy(false);
    }
  }

  async function savePref(key: "notifySignals" | "notifyMorning", value: boolean) {
    if (key === "notifySignals") setSignals(value);
    else setMorning(value);
    const res = await fetch("/api/notifications/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    if (!res.ok) {
      setError(t.errSave);
      if (key === "notifySignals") setSignals(!value);
      else setMorning(!value);
    }
  }

  return (
    <section className="mb-6 rounded-xl border border-border p-5">
      <h2 className="font-semibold text-ink-950">{t.title}</h2>

      {state === "needs-install" && (
        <div className="mt-3 rounded-lg bg-surface p-3.5 text-[13.5px] leading-relaxed text-ink-800">
          <p className="font-medium text-ink-950">{t.installTitle}</p>
          <p className="mt-1">
            <Share className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
            {t.installText}
          </p>
        </div>
      )}
      {state === "unsupported" && (
        <p className="mt-2 text-[13.5px] text-ink-600">{t.unsupported}</p>
      )}
      {state === "denied" && (
        <p className="mt-2 text-[13.5px] text-ink-600">
          {t.denied}
        </p>
      )}
      {(state === "on" || state === "off") && (
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {state === "on" ? (
              <Bell className="h-4 w-4 text-positive" strokeWidth={2} />
            ) : (
              <BellOff className="h-4 w-4 text-ink-400" strokeWidth={2} />
            )}
            <p className="text-[14px] text-ink-800">
              {state === "on" ? t.onDevice : t.offDevice}
            </p>
          </div>
          <button
            onClick={toggleDevice}
            disabled={busy}
            className="rounded-md border border-border-strong px-3.5 py-2 text-[13px] font-medium text-ink-950 hover:bg-surface disabled:text-ink-300"
          >
            {busy ? "…" : state === "on" ? t.turnOff : t.turnOn}
          </button>
        </div>
      )}

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-[14px] font-medium text-ink-950">{t.signals}</span>
            <span className="block text-[12.5px] text-ink-400">{t.signalsHint}</span>
          </span>
          <Switch checked={signals} onChange={(v) => savePref("notifySignals", v)} label={t.signals} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-[14px] font-medium text-ink-950">{t.morning}</span>
            <span className="block text-[12.5px] text-ink-400">{t.morningHint}</span>
          </span>
          <Switch checked={morning} onChange={(v) => savePref("notifyMorning", v)} label={t.morning} />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[13px] text-negative">
          {error}
        </p>
      )}
    </section>
  );
}
