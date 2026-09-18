# FinLens

An AI-native financial news and market-events platform for retail investors. Next.js 16 + React 19 + TypeScript + Tailwind CSS, with editorial content (News, Agenda) managed through an embedded Sanity Studio.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without any further setup, the app runs entirely on its built-in mock data (`src/lib/data/`) — nothing below is required just to browse the site.

## Editing content (News & Agenda)

Content is managed through [Sanity](https://sanity.io), embedded directly in this app at **`/studio`** — no separate tool to install.

**One-time setup:**

1. Create a free account at [sanity.io](https://sanity.io) and a new project.
2. Copy `.env.local.example` to `.env.local` and fill in `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` from your project's dashboard (neither is secret).
3. Run `npm run dev`, visit `/studio`, and log in with your Sanity account. The first time, Sanity will ask you to approve `localhost:3000` as a CORS origin — click through that once.
4. Optional but recommended: seed your Studio with the existing mock content as a starting point.
   - Generate a token at [sanity.io/manage](https://sanity.io/manage) → your project → API → Tokens (**Editor** permission).
   - Add `SANITY_WRITE_TOKEN=<your-token>` to `.env.local` (keep this one secret, unlike the two above).
   - Run `npm run seed`.

**Day to day**: once configured, open `/studio` to create or edit News Articles and Market Events through proper forms (with validation, dropdowns for category/impact/assets, etc.). Changes appear on the live site immediately — News and Agenda detail pages are rendered on demand, not pre-built, so nothing needs to be redeployed.

If Sanity isn't configured (or a fetch fails), the site automatically falls back to the built-in mock data — it never breaks.

**Scope**: Sanity only manages editorial content (News, Agenda). Asset prices, the Watchlist, and user accounts are separate, still-mock pieces of the product — see the project's roadmap for what's planned next (Supabase for auth, a live news/market-data pipeline, etc.).

## Deploying

Not deployed yet. The recommended path is [Vercel](https://vercel.com) (same team as Next.js): connect the GitHub repo, add the `NEXT_PUBLIC_SANITY_*` environment variables in the Vercel project settings, and deploy. `SANITY_WRITE_TOKEN` is only needed locally for seeding and should not be set in the deployed environment.

## Project structure

- `src/app/(app)/` — the product itself (Home, News, Agenda, Watchlist, Ask FinLens, Settings), wrapped in the shared app shell (sidebar/header/nav).
- `src/app/studio/` — the embedded Sanity Studio.
- `src/lib/data/` — data access layer (Sanity-backed with mock-data fallback for News/Agenda; static mock data for assets/watchlist).
- `src/sanity/` — Sanity client, env config, and content schemas.
- `src/components/ui/` — design system primitives. `src/components/features/` — page-specific components. `src/components/layout/` — app shell/navigation.
- `scripts/seed-sanity.ts` — one-time content import (see above).
