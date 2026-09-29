"use client";
import { useI18n } from "@/i18n/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowserClient as db } from "@/lib/supabase/client";
type Reminder = {
  event_slug: string;
  event_title: string;
  due_at: string;
  read_at: string | null;
};
export function NotificationsButton() {
  const { m } = useI18n();
  const [open, setOpen] = useState(false),
    [items, setItems] = useState<Reminder[]>([]),
    [message, setMessage] = useState("");
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!db) return;
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) {
        if (alive) {
          setItems([]);
          setMessage(m.reminders.signIn);
        }
        return;
      }
      const { data, error } = await db
        .from("user_event_alerts")
        .select("event_slug,event_title,due_at,read_at")
        .eq("user_id", user.id)
        .lte("due_at", new Date().toISOString())
        .order("due_at", { ascending: false })
        .limit(30);
      if (alive) {
        setItems(data ?? []);
        setMessage(error ? m.reminders.unavailable : m.reminders.none);
      }
    }
    void load();
    const id = setInterval(() => void load(), 60000);
    const sub = db?.auth.onAuthStateChange(() => {
      setTimeout(() => void load(), 0);
    });
    return () => {
      alive = false;
      clearInterval(id);
      sub?.data.subscription.unsubscribe();
    };
    // m is a constant per language; it only changes when the language does.
  }, [m]);
  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-label={m.reminders.title}
        onClick={() => setOpen(!open)}
        className="rounded border border-border px-3 py-2 text-sm"
      >
        Alerts {items.length || ""}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 max-h-80 overflow-auto rounded-xl border bg-background p-4 shadow-lg">
          <h2 className="font-semibold">{m.reminders.heading}</h2>
          <p className="my-2 text-xs">
            Checked every minute while FinLens is open. No email or push
            delivery.
          </p>
          {items.length ? (
            items.map((i) => (
              <Link
                onClick={() => setOpen(false)}
                key={i.event_slug}
                href={`/agenda/${i.event_slug}`}
                className="block border-t py-3 text-sm"
              >
                {i.event_title}
                <span className="block text-xs">{i.due_at}</span>
              </Link>
            ))
          ) : (
            <p className="text-sm">{message || m.reminders.noneAvailable}</p>
          )}
        </div>
      )}
    </div>
  );
}
