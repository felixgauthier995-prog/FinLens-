"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Share } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { disablePush, enablePush, getPushState, type PushState } from "@/lib/push/client";

export function NotificationsPanel({
  notifySignals: initialSignals,
  notifyMorning: initialMorning,
}: {
  notifySignals: boolean;
  notifyMorning: boolean;
}) {
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
      setState(state === "on" ? await disablePush() : await enablePush());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
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
      setError("Couldn't save your preference.");
      if (key === "notifySignals") setSignals(!value);
      else setMorning(!value);
    }
  }

  return (
    <section className="mb-6 rounded-xl border border-border p-5">
      <h2 className="font-semibold text-ink-950">Notifications</h2>

      {state === "needs-install" && (
        <div className="mt-3 rounded-lg bg-surface p-3.5 text-[13.5px] leading-relaxed text-ink-800">
          <p className="font-medium text-ink-950">Add FinLens to your home screen first</p>
          <p className="mt-1">
            On iPhone, notifications only work from the installed app: tap{" "}
            <Share className="inline h-3.5 w-3.5 align-[-2px]" aria-label="Share" /> then “Add to Home Screen”, open
            FinLens from your home screen and come back here.
          </p>
        </div>
      )}
      {state === "unsupported" && (
        <p className="mt-2 text-[13.5px] text-ink-600">This browser doesn&apos;t support notifications.</p>
      )}
      {state === "denied" && (
        <p className="mt-2 text-[13.5px] text-ink-600">
          Notifications are blocked for FinLens. Allow them in your browser or phone settings, then reload this page.
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
              {state === "on" ? "On for this device" : "Off on this device"}
            </p>
          </div>
          <button
            onClick={toggleDevice}
            disabled={busy}
            className="rounded-md border border-border-strong px-3.5 py-2 text-[13px] font-medium text-ink-950 hover:bg-surface disabled:text-ink-300"
          >
            {busy ? "…" : state === "on" ? "Turn off" : "Turn on"}
          </button>
        </div>
      )}

      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-[14px] font-medium text-ink-950">New signals on my stocks</span>
            <span className="block text-[12.5px] text-ink-400">At most 5 a day.</span>
          </span>
          <Switch checked={signals} onChange={(v) => savePref("notifySignals", v)} label="New signals on my stocks" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-[14px] font-medium text-ink-950">Morning brief</span>
            <span className="block text-[12.5px] text-ink-400">Around 8 a.m. your time, on weekdays.</span>
          </span>
          <Switch checked={morning} onChange={(v) => savePref("notifyMorning", v)} label="Morning brief" />
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
