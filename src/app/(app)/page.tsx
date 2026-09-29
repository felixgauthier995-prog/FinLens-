import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/Card";
import { MarketPulseStrip } from "@/components/features/home/MarketPulseStrip";
import { WatchlistSnapshot } from "@/components/features/home/WatchlistSnapshot";
import { NewsCard } from "@/components/features/news/NewsCard";
import { EventRow } from "@/components/features/agenda/EventRow";
import { getArticlesForReader } from "@/lib/data/reader";
import { getMessages, getLocale } from "@/i18n/server";
import { intlLocale } from "@/i18n/config";
import { getUpcomingEvents, getEventsSorted } from "@/lib/data/events";
import { buildBrief } from "@/lib/brief";
import { TodayCard } from "@/components/features/home/TodayCard";
import { getUserPreferences } from "@/lib/data/preferences";
import { rankForUser } from "@/lib/personalization";


export default async function HomePage() {
  const [articles, upcomingEvents, prefs, allEvents] = await Promise.all([
    getArticlesForReader(),
    getUpcomingEvents(3),
    getUserPreferences(),
    getEventsSorted(),
  ]);
  const brief = buildBrief(prefs, articles, allEvents);
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const today = new Intl.DateTimeFormat(intlLocale(locale), { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const forYou = rankForUser(articles, prefs).slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <p className="text-[13px] font-medium text-ink-400">{today.charAt(0).toUpperCase() + today.slice(1)}</p>
        <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-ink-950 sm:text-2xl">
          {m.home.headline}
        </h1>
      </div>

      <TodayCard brief={brief} hasStocks={prefs.tickers.length > 0} />

      <div className="mt-6">
        <MarketPulseStrip />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <SectionHeading
              eyebrow={m.home.forYouEyebrow}
              title={m.home.forYou}
              action={
                <Link
                  href="/news"
                  className="flex items-center gap-1 text-[13px] font-medium text-ink-600 hover:text-ink-950"
                >
                  {m.home.seeAllNews}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              }
            />
            <div className="space-y-3">
              {forYou.map((article) => (
                <NewsCard key={article.id} article={article} prefs={prefs} />
              ))}
            </div>
          </div>
        </div>

        {/* On phones, the user's stocks come first. */}
        <div className="order-first space-y-8 lg:order-none">
          <div>
            <SectionHeading
              eyebrow={m.home.stocksEyebrow}
              title={m.home.yourStocks}
              action={
                <Link
                  href="/watchlist"
                  className="flex items-center gap-1 text-[13px] font-medium text-ink-600 hover:text-ink-950"
                >
                  {m.home.manage}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              }
            />
            <WatchlistSnapshot prefs={prefs} articles={articles} />
          </div>

          <div>
            <SectionHeading
              eyebrow={m.home.nextEyebrow}
              title={m.home.upcoming}
              action={
                <Link
                  href="/agenda"
                  className="flex items-center gap-1 text-[13px] font-medium text-ink-600 hover:text-ink-950"
                >
                  {m.home.agendaLink}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              }
            />
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
