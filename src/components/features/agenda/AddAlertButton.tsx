"use client";
import { useEffect, useState } from "react";
import { supabaseBrowserClient as db } from "@/lib/supabase/client";
export function AddAlertButton({
  eventSlug,
  eventTitle,
  scheduledAt,
  className,
}: {
  eventSlug: string;
  eventTitle: string;
  scheduledAt: string;
  compact?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!db) return;
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) {
        if (alive) setActive(false);
        return;
      }
      const { data } = await db
        .from("user_event_alerts")
        .select("event_slug")
        .eq("user_id", user.id)
        .eq("event_slug", eventSlug)
        .maybeSingle();
      if (alive) setActive(!!data);
    }
    void load();
    const sub = db?.auth.onAuthStateChange(() => {
      setTimeout(() => void load(), 0);
    });
    return () => {
      alive = false;
      sub?.data.subscription.unsubscribe();
    };
  }, [eventSlug]);
  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!db) {
      setMessage("Account service unavailable");
      return;
    }
    setBusy(true);
    try {
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) {
        setMessage("Sign in in Settings to save a reminder.");
        return;
      }
      const result = active
        ? await db
            .from("user_event_alerts")
            .delete()
            .eq("user_id", user.id)
            .eq("event_slug", eventSlug)
        : await db
            .from("user_event_alerts")
            .upsert(
              {
                user_id: user.id,
                event_slug: eventSlug,
                event_title: eventTitle,
                due_at: scheduledAt,
              },
              { onConflict: "user_id,event_slug" },
            );
      if (result.error) throw result.error;
      setActive(!active);
      setMessage(
        active
          ? "Reminder removed"
          : "Saved. Shown in Notifications when due; no email is sent.",
      );
    } catch {
      setMessage("Could not save reminder. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <span className={className}>
      <button
        disabled={busy}
        aria-pressed={active}
        onClick={toggle}
        className="rounded border border-border px-3 py-2 text-xs"
      >
        {busy ? "Saving…" : active ? "Reminder saved" : "Add reminder"}
      </button>
      {message && (
        <span role="status" className="block mt-1 text-xs">
          {message}
        </span>
      )}
    </span>
  );
}
