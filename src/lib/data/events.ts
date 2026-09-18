import type { Category, EventStatus, EventType, MarketEvent, PossibleScenario } from "@/lib/types";
import { makeImpact } from "@/lib/impact";
import { daysFromNow, hoursAgo } from "@/lib/data/dates";
import { isPast, isWithinNextDays } from "@/lib/format";
import { fetchListOrFallback, fetchOneOrFallback } from "@/lib/data/sanityFetch";

interface SanityMarketEventDoc {
  id: string;
  slug: string;
  title: string;
  eventType: EventType;
  category: Category;
  scheduledAt: string;
  description: string;
  impactScoreValue: number;
  affectedAssets?: string[];
  expectations: string;
  whyItMatters: string;
  possibleScenarios?: PossibleScenario[];
  previousRelatedEventSlug?: string;
  relatedArticleSlug?: string;
}

const MARKET_EVENT_PROJECTION = `{
  "id": _id,
  "slug": slug.current,
  title,
  eventType,
  category,
  scheduledAt,
  description,
  "affectedAssets": affectedAssets[],
  expectations,
  whyItMatters,
  "possibleScenarios": possibleScenarios[]{label, direction, description},
  impactScoreValue,
  previousRelatedEventSlug,
  relatedArticleSlug
}`;

/** Upcoming vs. completed is never stored — it's derived from the date so
 * editors never have to remember to flip a status field. */
function computeStatus(scheduledAt: string): EventStatus {
  return isPast(scheduledAt) ? "completed" : "upcoming";
}

function mapSanityEvent(doc: SanityMarketEventDoc): MarketEvent {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    eventType: doc.eventType,
    category: doc.category,
    scheduledAt: doc.scheduledAt,
    description: doc.description,
    impactScore: makeImpact(doc.impactScoreValue),
    affectedAssets: doc.affectedAssets ?? [],
    expectations: doc.expectations,
    whyItMatters: doc.whyItMatters,
    possibleScenarios: doc.possibleScenarios ?? [],
    previousRelatedEventSlug: doc.previousRelatedEventSlug,
    relatedArticleSlug: doc.relatedArticleSlug,
    status: computeStatus(doc.scheduledAt),
  };
}

/**
 * Mock calendar data — a mix of just-completed events (linked back to a
 * News article to demonstrate the Before → Event → After pattern) and
 * upcoming events spanning the current week and the following month.
 */
export const MARKET_EVENTS: MarketEvent[] = [
  {
    id: "e-fed-press-conference",
    slug: "fed-press-conference",
    title: "Federal Reserve Press Conference",
    eventType: "press-conference",
    category: "policy",
    scheduledAt: hoursAgo(5),
    description:
      "The Federal Reserve announces its interest rate decision, followed by a press conference with the Chair.",
    impactScore: makeImpact(9.2),
    affectedAssets: ["SPY", "QQQ", "DXY", "GOLD", "JPM"],
    expectations:
      "Markets had priced in roughly a 60% chance of a rate cut, with most economists expecting the Fed to hold and signal a data-dependent path for the remainder of the year.",
    whyItMatters:
      "The market watches this event for signals on the future path of interest rates, which affect borrowing costs, equity valuations, and the dollar. The press conference Q&A often moves markets more than the rate decision itself.",
    possibleScenarios: [
      {
        label: "Hold with cautious tone",
        direction: "mixed",
        description: "Rates unchanged, Chair emphasizes patience — modestly negative for rate-cut-sensitive sectors.",
      },
      {
        label: "Hold with dovish signal",
        direction: "positive",
        description: "Rates unchanged but Chair signals confidence in future cuts — positive for equities and gold.",
      },
      {
        label: "Surprise cut",
        direction: "positive",
        description: "A cut against consensus — likely a strong positive reaction for risk assets, negative for the dollar.",
      },
    ],
    previousRelatedEventSlug: "fed-press-conference-previous",
    relatedArticleSlug: "federal-reserve-holds-rates-signals-caution",
    status: "completed",
  },
  {
    id: "e-cpi-report",
    slug: "cpi-report-release",
    title: "U.S. CPI Report (September)",
    eventType: "economic-data",
    category: "macro",
    scheduledAt: hoursAgo(28),
    description: "The Bureau of Labor Statistics releases the monthly Consumer Price Index report.",
    impactScore: makeImpact(8.5),
    affectedAssets: ["SPY", "QQQ", "GOLD", "DXY"],
    expectations:
      "Economists expected headline CPI at 2.6% year-over-year and core CPI at 3.0%, both continuing a gradual cooling trend from earlier in the year.",
    whyItMatters:
      "Inflation data is one of the Fed's two primary inputs (alongside employment) for setting the pace of interest rate changes, making this one of the most closely watched monthly releases.",
    possibleScenarios: [
      { label: "In line with forecasts", direction: "positive", description: "Confirms the cooling trend, keeps rate-cut expectations intact." },
      { label: "Hotter than expected", direction: "negative", description: "Would likely push out rate-cut timing and pressure equities." },
      { label: "Cooler than expected", direction: "positive", description: "Would likely accelerate rate-cut expectations, a tailwind for risk assets." },
    ],
    relatedArticleSlug: "cpi-report-shows-inflation-cooling-gradually",
    status: "completed",
  },
  {
    id: "e-retail-sales",
    slug: "us-retail-sales-report",
    title: "U.S. Retail Sales Report",
    eventType: "economic-data",
    category: "macro",
    scheduledAt: daysFromNow(1, 8, 30),
    description: "Monthly report on consumer spending across retail categories.",
    impactScore: makeImpact(5.5),
    affectedAssets: ["SPY", "AMZN"],
    expectations:
      "Consensus expects a modest 0.3% month-over-month increase, consistent with steady but unspectacular consumer spending heading into the holiday season.",
    whyItMatters:
      "Consumer spending drives roughly two-thirds of U.S. economic activity, making this one of the more direct real-time reads on household demand between GDP reports.",
    possibleScenarios: [
      { label: "In line", direction: "neutral", description: "Little market reaction expected if the print matches forecasts." },
      { label: "Strong beat", direction: "positive", description: "Would support consumer discretionary names but could reduce rate-cut odds." },
      { label: "Notable miss", direction: "negative", description: "Would raise concern about consumer health heading into the holidays." },
    ],
    status: "upcoming",
  },
  {
    id: "e-nonfarm-payrolls",
    slug: "us-employment-report",
    title: "U.S. Employment Report (Nonfarm Payrolls)",
    eventType: "economic-data",
    category: "macro",
    scheduledAt: daysFromNow(2, 8, 30),
    description: "The Bureau of Labor Statistics releases monthly jobs and unemployment data.",
    impactScore: makeImpact(8.8),
    affectedAssets: ["SPY", "QQQ", "DXY", "GOLD"],
    expectations:
      "Economists expect roughly 155,000 jobs added and an unemployment rate holding near 4.1%, broadly consistent with a gradually cooling but resilient labor market.",
    whyItMatters:
      "Alongside inflation, employment is the other data series the Fed has said will most directly shape the pace of future rate decisions, making this one of the highest-impact monthly releases.",
    possibleScenarios: [
      { label: "In line with forecasts", direction: "neutral", description: "Reinforces the current \"gradual cooling\" narrative without shifting rate expectations much." },
      { label: "Much weaker than expected", direction: "mixed", description: "Could accelerate rate-cut expectations but also raise growth concerns." },
      { label: "Much stronger than expected", direction: "negative", description: "Would likely reduce near-term rate-cut odds and pressure rate-sensitive equities." },
    ],
    status: "upcoming",
  },
  {
    id: "e-ecb-rate-decision",
    slug: "ecb-rate-decision",
    title: "European Central Bank Rate Decision",
    eventType: "rate-decision",
    category: "macro",
    scheduledAt: daysFromNow(4, 7, 45),
    description: "The ECB Governing Council announces its interest rate decision for the eurozone.",
    impactScore: makeImpact(7.0),
    affectedAssets: ["DXY", "SPY"],
    expectations:
      "Markets expect the ECB to hold rates steady, having already cut several times this year, with attention on updated growth and inflation projections.",
    whyItMatters:
      "ECB policy affects the euro-dollar exchange rate and can shift capital flows between U.S. and European assets, with knock-on effects for multinational earnings.",
    possibleScenarios: [
      { label: "Hold, neutral tone", direction: "neutral", description: "Limited spillover expected into U.S. markets." },
      { label: "Hold, dovish tone", direction: "mixed", description: "Could weaken the euro and strengthen the dollar, a mixed factor for U.S. exporters." },
    ],
    status: "upcoming",
  },
  {
    id: "e-nvidia-earnings",
    slug: "nvidia-q4-earnings-call",
    title: "NVIDIA Fiscal Q4 Earnings Call",
    eventType: "earnings",
    category: "earnings",
    scheduledAt: daysFromNow(5, 16, 30),
    description: "NVIDIA reports fiscal fourth-quarter results and hosts its quarterly earnings call.",
    impactScore: makeImpact(8.9),
    affectedAssets: ["NVDA", "AMD", "TSM", "QQQ"],
    expectations:
      "Analysts expect continued sequential growth in data center revenue, with attention on gross margin trends and forward guidance for the following fiscal year.",
    whyItMatters:
      "As the largest supplier of AI training and inference chips, NVIDIA's guidance is widely treated as a bellwether for enterprise AI infrastructure spending across the technology sector.",
    possibleScenarios: [
      { label: "Beat and raise", direction: "positive", description: "Would reinforce confidence in sustained AI infrastructure demand." },
      { label: "In-line with cautious guidance", direction: "mixed", description: "Could raise questions about whether AI capex growth is decelerating." },
      { label: "Miss on margins", direction: "negative", description: "Would raise concerns about pricing pressure or supply chain costs." },
    ],
    previousRelatedEventSlug: undefined,
    status: "upcoming",
  },
  {
    id: "e-us-china-talks",
    slug: "us-china-trade-talks",
    title: "U.S.–China Trade Talks (Scheduled Session)",
    eventType: "geopolitical",
    category: "geopolitics",
    scheduledAt: daysFromNow(8, 9, 0),
    description: "Senior trade officials from the U.S. and China are scheduled to meet for a new round of talks.",
    impactScore: makeImpact(7.4),
    affectedAssets: ["SPY", "TSM", "AAPL"],
    expectations:
      "No breakthrough is widely expected, but markets will watch for tone changes and any signal on existing tariff or export-control measures.",
    whyItMatters:
      "Trade policy between the two largest economies affects global supply chains, particularly in semiconductors and consumer electronics, sectors with significant exposure to both markets.",
    possibleScenarios: [
      { label: "No major change", direction: "neutral", description: "Most likely outcome; limited market reaction expected." },
      { label: "De-escalation signal", direction: "positive", description: "Would be a positive for companies with China manufacturing or sales exposure." },
      { label: "New restrictions announced", direction: "negative", description: "Would pressure semiconductor and hardware supply chains." },
    ],
    status: "upcoming",
  },
  {
    id: "e-apple-investor-day",
    slug: "apple-investor-day",
    title: "Apple Investor Day",
    eventType: "investor-day",
    category: "tech",
    scheduledAt: daysFromNow(9, 13, 0),
    description: "Apple hosts investors and analysts to discuss long-term strategy across hardware and services.",
    impactScore: makeImpact(6.0),
    affectedAssets: ["AAPL"],
    expectations:
      "Investors expect updated commentary on services growth, capital return plans, and the roadmap for AI features across the product lineup.",
    whyItMatters:
      "Investor days give management a platform to set multi-year expectations outside the constraints of a quarterly earnings call, often moving longer-term valuation assumptions.",
    possibleScenarios: [
      { label: "Reaffirms current strategy", direction: "neutral", description: "Limited new information, modest market reaction." },
      { label: "New buyback or services target", direction: "positive", description: "Could support the stock if capital return plans are increased." },
    ],
    status: "upcoming",
  },
  {
    id: "e-boj-policy-meeting",
    slug: "bank-of-japan-policy-meeting",
    title: "Bank of Japan Policy Meeting",
    eventType: "rate-decision",
    category: "macro",
    scheduledAt: daysFromNow(15, 23, 0),
    description: "The Bank of Japan announces its latest monetary policy decision.",
    impactScore: makeImpact(6.3),
    affectedAssets: ["DXY", "GOLD"],
    expectations:
      "Markets are watching for any signal on further normalization of Japan's ultra-low interest rate policy after several incremental moves over the past two years.",
    whyItMatters:
      "Shifts in Japanese monetary policy can affect global carry trades and capital flows, with historical episodes of BOJ surprises causing volatility well beyond Japanese markets.",
    possibleScenarios: [
      { label: "No change", direction: "neutral", description: "Base case; limited spillover expected." },
      { label: "Further tightening", direction: "mixed", description: "Could add volatility to global rate-sensitive assets." },
    ],
    status: "upcoming",
  },
  {
    id: "e-opec-ministerial",
    slug: "opec-plus-ministerial-meeting",
    title: "OPEC+ Ministerial Meeting",
    eventType: "opec-meeting",
    category: "energy",
    scheduledAt: daysFromNow(21, 10, 0),
    description: "OPEC+ member states meet to review production quotas and compliance.",
    impactScore: makeImpact(7.1),
    affectedAssets: ["OIL", "XOM"],
    expectations:
      "The group is expected to review compliance with the current production cuts and discuss whether to extend them further into next year.",
    whyItMatters:
      "OPEC+ decisions directly influence global oil supply and, by extension, prices at the pump and input costs across the economy.",
    possibleScenarios: [
      { label: "Cuts extended further", direction: "positive", description: "Would likely support oil prices near current levels." },
      { label: "Cuts unwound", direction: "negative", description: "Would likely pressure oil prices lower on increased supply." },
    ],
    previousRelatedEventSlug: undefined,
    status: "upcoming",
  },
  {
    id: "e-msft-ignite",
    slug: "microsoft-ignite-ai-announcements",
    title: "Microsoft Ignite — AI Product Announcements",
    eventType: "product-launch",
    category: "ai",
    scheduledAt: daysFromNow(27, 9, 0),
    description: "Microsoft's annual conference for enterprise and developer product announcements.",
    impactScore: makeImpact(5.6),
    affectedAssets: ["MSFT", "NVDA"],
    expectations:
      "Expected announcements include updates to Copilot across the Microsoft 365 suite and new Azure AI infrastructure offerings.",
    whyItMatters:
      "Enterprise adoption of Copilot and Azure AI services is a key growth driver management has highlighted in recent earnings calls, making product cadence relevant to the growth narrative.",
    possibleScenarios: [
      { label: "Incremental updates", direction: "neutral", description: "Expected base case with limited market reaction." },
      { label: "Major new enterprise commitments", direction: "positive", description: "Could reinforce the AI monetization narrative." },
    ],
    status: "upcoming",
  },
];

function fallbackEventsSorted(): MarketEvent[] {
  return [...MARKET_EVENTS]
    .map((e) => ({ ...e, status: computeStatus(e.scheduledAt) }))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

export async function getEvent(slug: string): Promise<MarketEvent | undefined> {
  return fetchOneOrFallback<SanityMarketEventDoc, MarketEvent>(
    `*[_type == "marketEvent" && slug.current == $slug][0] ${MARKET_EVENT_PROJECTION}`,
    { slug },
    mapSanityEvent,
    () => {
      const event = MARKET_EVENTS.find((e) => e.slug === slug);
      return event ? { ...event, status: computeStatus(event.scheduledAt) } : undefined;
    }
  );
}

export async function getEventsSorted(): Promise<MarketEvent[]> {
  return fetchListOrFallback<SanityMarketEventDoc, MarketEvent>(
    `*[_type == "marketEvent"] | order(scheduledAt asc) ${MARKET_EVENT_PROJECTION}`,
    mapSanityEvent,
    fallbackEventsSorted()
  );
}

export async function getUpcomingEvents(limit?: number): Promise<MarketEvent[]> {
  const events = await getEventsSorted();
  const upcoming = events.filter((e) => e.status === "upcoming");
  return typeof limit === "number" ? upcoming.slice(0, limit) : upcoming;
}

export async function getTodayEvents(): Promise<MarketEvent[]> {
  const events = await getEventsSorted();
  const now = new Date();
  return events.filter((e) => {
    const d = new Date(e.scheduledAt);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });
}

export async function getThisWeekEvents(): Promise<MarketEvent[]> {
  const events = await getEventsSorted();
  return events.filter((e) => isWithinNextDays(e.scheduledAt, 7));
}

export async function getEventsForAsset(ticker: string): Promise<MarketEvent[]> {
  const events = await getEventsSorted();
  return events.filter((e) => e.affectedAssets.includes(ticker));
}
