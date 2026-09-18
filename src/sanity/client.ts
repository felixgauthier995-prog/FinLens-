import { createClient, type SanityClient } from "next-sanity";
import { projectId, dataset, apiVersion, isSanityConfigured } from "@/sanity/env";

export const sanityClient: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;
