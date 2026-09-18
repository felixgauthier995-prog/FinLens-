import type { Category, EventType } from "@/lib/types";

export const CATEGORY_LABEL: Record<Category, string> = {
  tech: "Tech",
  macro: "Macro",
  energy: "Energy",
  crypto: "Crypto",
  earnings: "Earnings",
  policy: "Policy",
  geopolitics: "Geopolitics",
  ai: "AI",
  healthcare: "Healthcare",
  financials: "Financials",
};

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  "rate-decision": "Rate Decision",
  "economic-data": "Economic Data",
  earnings: "Earnings",
  "press-conference": "Press Conference",
  "investor-day": "Investor Day",
  "product-launch": "Product Launch",
  "opec-meeting": "OPEC Meeting",
  government: "Government",
  regulatory: "Regulatory",
  geopolitical: "Geopolitical",
};

export const CATEGORY_ORDER: Category[] = [
  "macro",
  "earnings",
  "ai",
  "tech",
  "policy",
  "energy",
  "crypto",
  "financials",
  "healthcare",
  "geopolitics",
];
