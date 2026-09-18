import type { LucideIcon } from "lucide-react";
import { LayoutGrid, Newspaper, CalendarClock, Star, Sparkles } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: LayoutGrid },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Agenda", href: "/agenda", icon: CalendarClock },
  { label: "Watchlist", href: "/watchlist", icon: Star },
  { label: "Ask FinLens", href: "/ask", icon: Sparkles },
];
