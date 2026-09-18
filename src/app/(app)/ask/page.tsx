import type { Metadata } from "next";
import { AskView } from "@/components/features/ask/AskView";
import { getArticlesSorted } from "@/lib/data/news";
import { getEventsSorted } from "@/lib/data/events";

export const metadata: Metadata = {
  title: "Ask FinLens",
};

export default async function AskPage() {
  const [articles, events] = await Promise.all([getArticlesSorted(), getEventsSorted()]);
  return <AskView articles={articles} events={events} />;
}
