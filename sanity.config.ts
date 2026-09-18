import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { Aperture } from "lucide-react";
import { schemaTypes } from "@/sanity/schemaTypes";
import { projectId, dataset } from "@/sanity/env";

export default defineConfig({
  name: "finlens",
  title: "FinLens Studio",
  basePath: "/studio",

  projectId: projectId || "",
  dataset,

  icon: Aperture,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("FinLens Content")
          .items([
            S.listItem()
              .title("News Articles")
              .schemaType("newsArticle")
              .child(
                S.documentTypeList("newsArticle")
                  .title("News Articles")
                  .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
              ),
            S.listItem()
              .title("Market Events")
              .schemaType("marketEvent")
              .child(
                S.documentTypeList("marketEvent")
                  .title("Market Events")
                  .defaultOrdering([{ field: "scheduledAt", direction: "asc" }])
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
