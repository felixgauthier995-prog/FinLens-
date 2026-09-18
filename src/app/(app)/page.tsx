import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/Card";
import { MarketPulseStrip } from "@/components/features/home/MarketPulseStrip";
import { MarketBrief } from "@/components/features/home/MarketBrief";
import { WatchlistSnapshot } from "@/components/features/home/WatchlistSnapshot";
import { NewsCard } from "@/components/features/news/NewsCard";
import { EventRow } from "@/components/features/agenda/EventRow";
import { getTopStories } from "@/lib/data/news";
import { getUpcomingEvents } from "@/lib/data/events";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default async function HomePage() {
  const [topStories, upcomingEvents] = await Promise.all([
    getTopStories(4),
    getUpcomingEvents(3),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <p className="text-[13px] font-medium text-ink-400">{dateFormatter.format(new Date())}</p>
        <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-ink-950 sm:text-2xl">
          What matters in the market today
        </h1>
      </div>

      <MarketPulseStrip />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <MarketBrief />

          <div>
            <SectionHeading
              eyebrow="Ranked by impact"
              title="Top Stories"
              action={
                <Link
                  href="/news"
                  className="flex items-center gap-1 text-[13px] font-medium text-ink-600 hover:text-ink-950"
                >
                  See all news
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              }
            />
            <div className="space-y-3">
              {topStories.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <SectionHeading
              eyebrow="What's next"
              title="Upcoming Events"
              action={
                <Link
                  href="/agenda"
                  className="flex items-center gap-1 text-[13px] font-medium text-ink-600 hover:text-ink-950"
                >
                  Agenda
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

          <div>
            <SectionHeading
              eyebrow="Personalized"
              title="Your Watchlist"
              action={
                <Link
                  href="/watchlist"
                  className="flex items-center gap-1 text-[13px] font-medium text-ink-600 hover:text-ink-950"
                >
                  Manage
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              }
            />
            <WatchlistSnapshot />
          </div>
        </div>
      </div>
    </div>
  );
}
