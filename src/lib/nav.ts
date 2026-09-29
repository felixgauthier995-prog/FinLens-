import type { LucideIcon } from "lucide-react";
import { LayoutGrid, Newspaper, CalendarClock, CalendarRange, Star, Sparkles } from "lucide-react";

export interface NavItem {
  /** Key in messages.nav */
  key: "home" | "week" | "news" | "agenda" | "watchlist" | "ask";
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "home", label: "Home", href: "/", icon: LayoutGrid },
  { key: "week", label: "My week", href: "/week", icon: CalendarRange },
  { key: "news", label: "News", href: "/news", icon: Newspaper },
  { key: "agenda", label: "Agenda", href: "/agenda", icon: CalendarClock },
  { key: "watchlist", label: "Watchlist", href: "/watchlist", icon: Star },
  { key: "ask", label: "Ask FinLens", href: "/ask", icon: Sparkles },
];
