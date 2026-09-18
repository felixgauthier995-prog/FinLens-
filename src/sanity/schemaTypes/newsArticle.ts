import { defineField, defineType } from "sanity";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/data/categories";
import { ASSETS } from "@/lib/data/assets";

const categoryOptions = CATEGORY_ORDER.map((value) => ({
  title: CATEGORY_LABEL[value],
  value,
}));

const assetOptions = ASSETS.map((a) => ({ title: `${a.ticker} · ${a.name}`, value: a.ticker }));

const directionOptions = [
  { title: "Potential positive impact", value: "positive" },
  { title: "Potential negative impact", value: "negative" },
  { title: "Mixed impact", value: "mixed" },
  { title: "Worth monitoring (neutral)", value: "neutral" },
];

export const newsArticle = defineType({
  name: "newsArticle",
  title: "News Article",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "analysis", title: "Analysis" },
    { name: "meta", title: "Impact & Sources" },
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
      name: "summary",
      title: "Summary (1–2 sentences)",
      type: "text",
      rows: 2,
      group: "content",
      description: "Shown on News cards and in the Home Top Stories list.",
      validation: (rule) => rule.required().max(280),
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
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "content",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "affectedAssets",
      title: "Assets affected",
      type: "array",
      group: "content",
      of: [{ type: "string" }],
      options: { list: assetOptions },
    }),

    defineField({
      name: "whatHappened",
      title: "What happened (facts)",
      type: "text",
      rows: 4,
      group: "analysis",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "whyItMatters",
      title: "Why it matters (analysis)",
      type: "text",
      rows: 4,
      group: "analysis",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "marketImpact",
      title: "Market impact (analysis)",
      type: "text",
      rows: 4,
      group: "analysis",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "whatToWatch",
      title: "What to watch next",
      type: "array",
      group: "analysis",
      of: [{ type: "string" }],
      description: "One bullet point per list item.",
    }),

    defineField({
      name: "impactScoreValue",
      title: "Impact score (1–10)",
      type: "number",
      group: "meta",
      validation: (rule) => rule.required().min(1).max(10),
    }),
    defineField({
      name: "impactDirection",
      title: "Impact direction",
      type: "string",
      group: "meta",
      options: { list: directionOptions },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "source",
      title: "Primary source name",
      type: "string",
      group: "meta",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sourceUrl",
      title: "Primary source URL",
      type: "url",
      group: "meta",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "additionalSources",
      title: "Additional sources",
      type: "array",
      group: "meta",
      of: [
        {
          type: "object",
          name: "sourceLink",
          fields: [
            { name: "name", title: "Name", type: "string" },
            { name: "url", title: "URL", type: "url" },
          ],
        },
      ],
    }),
    defineField({
      name: "relatedEventSlug",
      title: "Related Agenda event slug",
      type: "string",
      group: "meta",
      description:
        "If this story follows a scheduled event, paste that event's slug here to link them (Before → Event → After).",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", impact: "impactScoreValue" },
    prepare: ({ title, subtitle, impact }) => ({
      title,
      subtitle: `${subtitle ?? ""}${impact ? ` · Impact ${impact}` : ""}`,
    }),
  },
});
