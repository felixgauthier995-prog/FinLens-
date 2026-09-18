import { defineField, defineType } from "sanity";
import { CATEGORY_LABEL, CATEGORY_ORDER, EVENT_TYPE_LABEL } from "@/lib/data/categories";
import { ASSETS } from "@/lib/data/assets";
import type { EventType } from "@/lib/types";

const categoryOptions = CATEGORY_ORDER.map((value) => ({
  title: CATEGORY_LABEL[value],
  value,
}));

const eventTypeOptions = (Object.keys(EVENT_TYPE_LABEL) as EventType[]).map((value) => ({
  title: EVENT_TYPE_LABEL[value],
  value,
}));

const assetOptions = ASSETS.map((a) => ({ title: `${a.ticker} · ${a.name}`, value: a.ticker }));

const directionOptions = [
  { title: "Potential positive impact", value: "positive" },
  { title: "Potential negative impact", value: "negative" },
  { title: "Mixed impact", value: "mixed" },
  { title: "Worth monitoring (neutral)", value: "neutral" },
];

export const marketEvent = defineType({
  name: "marketEvent",
  title: "Market Event",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "scenarios", title: "Scenarios" },
    { name: "meta", title: "Impact & Links" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eventType",
      title: "Event type",
      type: "string",
      group: "content",
      options: { list: eventTypeOptions },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "content",
      options: { list: categoryOptions },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "scheduledAt",
      title: "Scheduled at",
      type: "datetime",
      group: "content",
      description:
        "Status (Upcoming vs. Completed) is calculated automatically from this date — nothing to update manually.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 2,
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "affectedAssets",
      title: "Assets to watch",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: { list: assetOptions },
    }),

    defineField({
      name: "expectations",
      title: "Consensus expectations",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "whyItMatters",
      title: "Why it matters",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "possibleScenarios",
      title: "Possible scenarios",
      type: "array",
      group: "scenarios",
      description: "Not predictions — a short range of outcomes FinLens is watching for.",
      of: [
        {
          type: "object",
          name: "scenario",
          fields: [
            { name: "label", title: "Scenario label", type: "string" },
            {
              name: "direction",
              title: "Direction",
              type: "string",
              options: { list: directionOptions },
            },
            { name: "description", title: "Description", type: "text", rows: 2 },
          ],
          preview: { select: { title: "label", subtitle: "direction" } },
        },
      ],
    }),

    defineField({
      name: "impactScoreValue",
      title: "Impact score (1–10)",
      type: "number",
      group: "meta",
      validation: (rule) => rule.required().min(1).max(10),
    }),
    defineField({
      name: "previousRelatedEventSlug",
      title: "Previous occurrence — event slug",
      type: "string",
      group: "meta",
      description: "e.g. last quarter's version of this same recurring event.",
    }),
    defineField({
      name: "relatedArticleSlug",
      title: "\"What happened\" — News article slug",
      type: "string",
      group: "meta",
      description:
        "Once this event has passed, paste the slug of the News article explaining the outcome (Before → Event → After).",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "eventType", scheduledAt: "scheduledAt" },
    prepare: ({ title, subtitle, scheduledAt }) => ({
      title,
      subtitle: `${subtitle ?? ""}${scheduledAt ? ` · ${new Date(scheduledAt).toLocaleDateString()}` : ""}`,
    }),
  },
});
