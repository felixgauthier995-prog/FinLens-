"use client";
import { useI18n } from "@/i18n/client";
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
  const { m } = useI18n();
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
      setMessage(m.agenda.accountUnavailable);
      return;
    }
    setBusy(true);
    try {
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) {
        setMessage(m.agenda.signInToRemind);
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
          ? m.agenda.reminderRemoved
          : m.agenda.reminderSavedText,
      );
    } catch {
      setMessage(m.agenda.reminderError);
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
        {busy ? m.common.saving : active ? m.agenda.reminderSaved : m.agenda.addReminder}
      </button>
      {message && (
        <span role="status" className="block mt-1 text-xs">
          {message}
        </span>
      )}
    </span>
  );
}
