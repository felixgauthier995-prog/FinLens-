import type { Category, ImpactDirection, NewsArticle } from "@/lib/types";
import { makeImpact } from "@/lib/impact";
import { hoursAgo, minutesAgo } from "@/lib/data/dates";
import { fetchListOrFallback, fetchOneOrFallback } from "@/lib/data/sanityFetch";

interface SanityNewsArticleDoc {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: Category;
  publishedAt: string;
  source: string;
  sourceUrl: string;
  additionalSources?: { name: string; url: string }[];
  impactScoreValue: number;
  impactDirection: ImpactDirection;
  affectedAssets?: string[];
  whatHappened: string;
  whyItMatters: string;
  marketImpact: string;
  whatToWatch?: string[];
  relatedEventSlug?: string;
}

const NEWS_ARTICLE_PROJECTION = `{
  "id": _id,
  "slug": slug.current,
  title,
  summary,
  category,
  publishedAt,
  source,
  sourceUrl,
  additionalSources[]{name, url},
  impactScoreValue,
  impactDirection,
  "affectedAssets": affectedAssets[],
  whatHappened,
  whyItMatters,
  marketImpact,
  "whatToWatch": whatToWatch[],
  relatedEventSlug
}`;

function mapSanityArticle(doc: SanityNewsArticleDoc): NewsArticle {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    category: doc.category,
    publishedAt: doc.publishedAt,
    source: doc.source,
    sourceUrl: doc.sourceUrl,
    additionalSources: doc.additionalSources,
    impactScore: makeImpact(doc.impactScoreValue),
    impactDirection: doc.impactDirection,
    affectedAssets: doc.affectedAssets ?? [],
    whatHappened: doc.whatHappened,
    whyItMatters: doc.whyItMatters,
    marketImpact: doc.marketImpact,
    whatToWatch: doc.whatToWatch ?? [],
    relatedEventSlug: doc.relatedEventSlug,
  };
}

/**
 * Mock editorial content. Written in FinLens's voice (facts vs. analysis
 * vs. scenario, never a guaranteed forecast) but the events themselves are
 * fictional — not real reporting on the named companies.
 */
export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "n-nvda-earnings",
    slug: "nvidia-reports-stronger-than-expected-earnings",
    title: "NVIDIA reports stronger-than-expected earnings",
    summary:
      "NVIDIA reported revenue above expectations, reinforcing continued demand for AI computing infrastructure.",
    category: "earnings",
    publishedAt: hoursAgo(2),
    source: "FinLens Wire",
    sourceUrl: "https://example.com/finlens-wire/nvidia-q3-earnings",
    additionalSources: [
      { name: "Company earnings release", url: "https://example.com/nvidia/investor-relations" },
    ],
    impactScore: makeImpact(8.7),
    impactDirection: "positive",
    affectedAssets: ["NVDA", "AMD", "TSM", "QQQ"],
    whatHappened:
      "NVIDIA posted quarterly revenue of $38.2 billion, above the $35.9 billion analysts had modeled, driven by data center demand. Management guided next quarter's revenue slightly above consensus and said data center demand \"continues to outstrip supply.\"",
    whyItMatters:
      "NVIDIA is the largest supplier of chips used to train and run AI models, so its results are widely read as a proxy for whether enterprise AI spending is holding up. A beat this size suggests large cloud providers are not yet pulling back on infrastructure budgets.",
    marketImpact:
      "The print is a potential positive read-through for the broader semiconductor supply chain, including foundries and memory makers. Software and cloud names with heavy AI capital expenditure exposure may also see renewed attention. Broad indices with large NVIDIA weightings, such as the Nasdaq-100, could see outsized reaction relative to the company's own move.",
    whatToWatch: [
      "Commentary from hyperscalers (Microsoft, Amazon, Meta) on capital expenditure plans in upcoming earnings calls.",
      "Whether AMD and other challengers report similar demand strength or point to share shifts.",
      "Any export-control or supply-chain policy changes affecting chip shipments to certain markets.",
    ],
  },
  {
    id: "n-fed-holds",
    slug: "federal-reserve-holds-rates-signals-caution",
    title: "Federal Reserve holds rates steady, signals a cautious path ahead",
    summary:
      "The Fed kept its benchmark rate unchanged and reiterated it will move gradually, disappointing investors positioned for a faster pace of cuts.",
    category: "policy",
    publishedAt: hoursAgo(5),
    source: "FinLens Wire",
    sourceUrl: "https://example.com/finlens-wire/fed-rate-decision-september",
    impactScore: makeImpact(9.1),
    impactDirection: "mixed",
    affectedAssets: ["SPY", "QQQ", "DXY", "GOLD", "JPM"],
    whatHappened:
      "The Federal Reserve held its policy rate in the 4.00%–4.25% range, in line with expectations. In the press conference, the Chair described the outlook as \"meeting by meeting\" and said policymakers want more evidence inflation is durably moving toward target before cutting further.",
    whyItMatters:
      "Markets had been pricing in a reasonable chance of back-to-back cuts. A more cautious tone changes the assumed path for borrowing costs, which affects everything from mortgage rates to how growth stocks are valued.",
    marketImpact:
      "Rate-sensitive sectors — regional banks, homebuilders, and high-multiple technology names — are most directly exposed to a slower cutting path. The dollar could see support if rate-cut expectations are pushed out, which would be a mixed-to-negative factor for gold and commodities priced in dollars.",
    whatToWatch: [
      "The next CPI and employment reports, which the Fed explicitly said will shape the timing of future moves.",
      "Any dissent within the committee at future meetings.",
      "Treasury yield moves over the following sessions as the market re-prices rate-cut odds.",
    ],
    relatedEventSlug: "fed-press-conference",
  },
  {
    id: "n-apple-launch",
    slug: "apple-unveils-next-generation-iphone-lineup",
    title: "Apple unveils next-generation iPhone lineup with on-device AI features",
    summary:
      "Apple introduced its latest iPhone lineup with a stronger emphasis on on-device AI processing, alongside modest pricing changes.",
    category: "tech",
    publishedAt: hoursAgo(9),
    source: "FinLens Wire",
    sourceUrl: "https://example.com/finlens-wire/apple-fall-event",
    impactScore: makeImpact(6.4),
    impactDirection: "mixed",
    affectedAssets: ["AAPL", "QQQ"],
    whatHappened:
      "At its fall hardware event, Apple introduced its newest iPhone generation with an upgraded neural processing unit built for on-device AI features, alongside a new chip and a modest increase to entry-level storage. Pricing was largely unchanged from the prior generation.",
    whyItMatters:
      "iPhone remains Apple's largest single revenue source, so lineup changes and pricing decisions have an outsized effect on the company's forward guidance. Investors are also watching how Apple's AI features compare with rivals after a slower initial rollout.",
    marketImpact:
      "The announcement is a potential positive for Apple's upgrade cycle if on-device AI features drive replacement demand, but the market has historically waited for early sales data before reacting meaningfully. Suppliers in Apple's component ecosystem may see secondary attention.",
    whatToWatch: [
      "Pre-order data over the first weekend, typically the earliest signal of demand.",
      "Analyst commentary on unit and pricing assumptions for the December quarter.",
      "Any commentary on China demand, a region where Apple has faced more competitive pressure.",
    ],
  },
  {
    id: "n-tesla-deliveries",
    slug: "tesla-quarterly-deliveries-fall-short-of-estimates",
    title: "Tesla quarterly deliveries fall short of Wall Street estimates",
    summary:
      "Tesla delivered fewer vehicles than analysts expected this quarter, citing softer demand in Europe and increased competition.",
    category: "earnings",
    publishedAt: hoursAgo(13),
    source: "FinLens Wire",
    sourceUrl: "https://example.com/finlens-wire/tesla-q3-deliveries",
    impactScore: makeImpact(7.2),
    impactDirection: "negative",
    affectedAssets: ["TSLA"],
    whatHappened:
      "Tesla reported quarterly deliveries of approximately 423,000 vehicles, below the roughly 445,000 analysts had modeled. The company pointed to softer demand in Europe and increased competition from lower-priced entrants in China.",
    whyItMatters:
      "Delivery numbers are the most immediate proxy investors have for Tesla's underlying demand between quarterly earnings reports, and a miss of this size raises questions about pricing power heading into the holiday quarter.",
    marketImpact:
      "The miss is a potential negative for near-term margin expectations if the company needs further price cuts or incentives to support volume. It may also renew scrutiny on Tesla's non-automotive segments as a offsetting growth story.",
    whatToWatch: [
      "Management's commentary on pricing strategy in the upcoming earnings call.",
      "Registration data out of Europe and China over the following weeks.",
      "Any updates on new lower-priced model timing.",
    ],
  },
  {
    id: "n-opec-cuts",
    slug: "opec-plus-agrees-to-extend-production-cuts",
    title: "OPEC+ agrees to extend production cuts into next year",
    summary:
      "OPEC+ members agreed to extend existing output cuts, aiming to support prices amid softer-than-expected global demand growth.",
    category: "energy",
    publishedAt: hoursAgo(20),
    source: "FinLens Wire",
    sourceUrl: "https://example.com/finlens-wire/opec-meeting-outcome",
    impactScore: makeImpact(7.8),
    impactDirection: "positive",
    affectedAssets: ["OIL", "XOM"],
    whatHappened:
      "OPEC+ agreed to extend its current production cuts through the first quarter of next year, slightly longer than the market had expected heading into the meeting. Saudi Arabia's energy minister said the group remains prepared to adjust further \"as conditions warrant.\"",
    whyItMatters:
      "Oil prices have been under pressure this year from softer demand growth forecasts and rising non-OPEC supply. A longer extension signals the group is prioritizing price support over market share, at least for now.",
    marketImpact:
      "The decision is a potential positive for crude prices and energy-sector equities in the near term, though the size of the move will depend on compliance among member states, which has been inconsistent in prior extensions.",
    whatToWatch: [
      "Compliance data from individual OPEC+ members over the coming weeks.",
      "U.S. shale production figures, which have partly offset OPEC+ cuts in the past.",
      "Global demand indicators out of China, the largest swing factor in oil consumption.",
    ],
  },
  {
    id: "n-btc-slide",
    slug: "bitcoin-slides-as-rate-uncertainty-weighs-on-risk-assets",
    title: "Bitcoin slides as rate uncertainty weighs on risk assets",
    summary:
      "Bitcoin fell alongside other risk assets following the Fed's cautious tone, extending a pullback from recent highs.",
    category: "crypto",
    publishedAt: hoursAgo(6),
    source: "FinLens Wire",
    sourceUrl: "https://example.com/finlens-wire/bitcoin-rate-selloff",
    impactScore: makeImpact(5.9),
    impactDirection: "negative",
    affectedAssets: ["BTC", "ETH"],
    whatHappened:
      "Bitcoin declined nearly 2% in the hours following the Federal Reserve's rate decision, part of a broader pullback in risk assets after the central bank signaled a slower path for future cuts. Ether moved in step, falling a similar magnitude.",
    whyItMatters:
      "Crypto assets have traded with a closer relationship to broader risk sentiment and rate expectations over the past two years, making Fed communication a more direct driver of short-term price action than it once was.",
    marketImpact:
      "A slower rate-cut path is generally a mixed-to-negative factor for non-yielding assets like Bitcoin, since higher-for-longer rates increase the opportunity cost of holding them. The move so far remains within recent trading ranges.",
    whatToWatch: [
      "Spot ETF flow data over the coming days as a gauge of institutional positioning.",
      "Whether the move extends beyond crypto into other high-beta risk assets.",
      "Any regulatory commentary tied to digital asset custody or ETF products.",
    ],
  },
  {
    id: "n-cpi-report",
    slug: "cpi-report-shows-inflation-cooling-gradually",
    title: "CPI report shows inflation cooling gradually, in line with forecasts",
    summary:
      "The latest consumer price index rose 2.6% year-over-year, matching expectations and continuing a gradual cooling trend.",
    category: "macro",
    publishedAt: hoursAgo(28),
    source: "FinLens Wire",
    sourceUrl: "https://example.com/finlens-wire/cpi-report-september",
    impactScore: makeImpact(8.4),
    impactDirection: "positive",
    affectedAssets: ["SPY", "QQQ", "GOLD", "DXY"],
    whatHappened:
      "Headline CPI rose 2.6% year-over-year and 0.2% month-over-month, both in line with economist estimates. Core CPI, which excludes food and energy, also matched expectations at 3.0% year-over-year, its lowest reading in over two years.",
    whyItMatters:
      "Inflation data is one of the two data points (alongside employment) the Fed has said will most directly determine the pace of future rate cuts. An in-line print removes a source of near-term uncertainty rather than resolving the debate outright.",
    marketImpact:
      "A cooling, in-line report is typically read as a potential positive for equities and bonds, since it keeps the possibility of further rate cuts on the table without pointing to renewed inflation risk. The reaction was more muted than after prior CPI surprises, given the print matched forecasts.",
    whatToWatch: [
      "Shelter and services inflation components, which have cooled more slowly than goods prices.",
      "The next employment report, the other key input to the Fed's decision.",
      "Fed commentary in the days following the report for any shift in tone.",
    ],
    relatedEventSlug: "cpi-report-release",
  },
  {
    id: "n-meta-ai-capex",
    slug: "meta-announces-expanded-ai-infrastructure-investment",
    title: "Meta announces expanded AI infrastructure investment for next year",
    summary:
      "Meta said it plans to meaningfully increase capital spending next year to build out AI training and inference capacity.",
    category: "ai",
    publishedAt: hoursAgo(31),
    source: "FinLens Wire",
    sourceUrl: "https://example.com/finlens-wire/meta-capex-update",
    impactScore: makeImpact(5.8),
    impactDirection: "mixed",
    affectedAssets: ["META", "NVDA", "QQQ"],
    whatHappened:
      "Meta told investors it expects capital expenditures next year to rise meaningfully from this year's already-elevated level, primarily to expand data center capacity dedicated to AI model training and to support its recommendation and advertising systems.",
    whyItMatters:
      "Big Tech capital expenditure plans are one of the clearest signals of how committed large platforms remain to AI infrastructure buildout, and they flow directly to chipmakers and data center suppliers.",
    marketImpact:
      "Higher planned spending is a potential positive for chip and infrastructure suppliers, but a mixed signal for Meta itself, since heavier spending pressures near-term free cash flow even if it supports longer-term growth.",
    whatToWatch: [
      "Whether other large platforms raise their own capex guidance in upcoming earnings calls.",
      "Free cash flow trends as spending ramps through next year.",
      "Any commentary on expected returns from AI-driven ad-targeting improvements.",
    ],
  },
  {
    id: "n-middle-east-oil",
    slug: "middle-east-tensions-raise-oil-supply-concerns",
    title: "Escalation in the Middle East raises concerns over oil supply routes",
    summary:
      "Renewed tension in a key oil-producing region has raised concerns about potential disruption to shipping routes.",
    category: "geopolitics",
    publishedAt: hoursAgo(38),
    source: "FinLens Wire",
    sourceUrl: "https://example.com/finlens-wire/middle-east-tension-update",
    impactScore: makeImpact(7.0),
    impactDirection: "mixed",
    affectedAssets: ["OIL", "XOM", "GOLD"],
    whatHappened:
      "Reports of renewed military activity in a key Middle East shipping corridor raised concerns among traders about potential disruption to oil tanker traffic, though no confirmed disruption to physical supply has been reported so far.",
    whyItMatters:
      "A meaningful share of global seaborne oil trade passes through the region, so even the risk of disruption tends to add a geopolitical risk premium to prices well before any actual supply is affected.",
    marketImpact:
      "The situation is a potential positive for oil prices and traditional safe-haven assets like gold if tensions escalate further, though prices have historically given back geopolitical premiums quickly once the immediate risk passes.",
    whatToWatch: [
      "Shipping insurance rates for vessels transiting the corridor, an early indicator of perceived risk.",
      "Statements from national governments and international bodies over the coming days.",
      "Whether any producer nations in the region signal supply-side responses.",
    ],
  },
  {
    id: "n-msft-openai",
    slug: "microsoft-and-openai-expand-partnership-terms",
    title: "Microsoft and OpenAI expand the terms of their partnership",
    summary:
      "Microsoft and OpenAI announced updated commercial terms extending their infrastructure and product collaboration.",
    category: "ai",
    publishedAt: hoursAgo(46),
    source: "FinLens Wire",
    sourceUrl: "https://example.com/finlens-wire/microsoft-openai-agreement",
    impactScore: makeImpact(6.2),
    impactDirection: "positive",
    affectedAssets: ["MSFT", "QQQ"],
    whatHappened:
      "Microsoft and OpenAI announced updated terms to their multi-year partnership, extending Microsoft's cloud infrastructure commitments and clarifying how OpenAI's models are integrated across Microsoft's product lineup.",
    whyItMatters:
      "The relationship between the two companies underpins a large share of Microsoft's AI-related product strategy, from Copilot across its productivity suite to Azure's AI services, making any change to the terms closely watched.",
    marketImpact:
      "The extension is a potential positive for Microsoft's cloud and productivity segments if it translates into continued exclusive access to OpenAI's latest models, reinforcing a key competitive advantage versus other cloud providers.",
    whatToWatch: [
      "Azure revenue growth attributed to AI services in the next earnings report.",
      "Competitive responses from other cloud providers with their own model partnerships.",
      "Any regulatory attention on the exclusivity terms of the partnership.",
    ],
  },
  {
    id: "n-bank-earnings",
    slug: "regional-banks-report-resilient-credit-quality",
    title: "Regional banks report resilient credit quality in latest earnings",
    summary:
      "A batch of regional bank earnings showed stable loan performance, easing some concerns about commercial real estate exposure.",
    category: "financials",
    publishedAt: hoursAgo(52),
    source: "FinLens Wire",
    sourceUrl: "https://example.com/finlens-wire/regional-bank-earnings-roundup",
    impactScore: makeImpact(4.6),
    impactDirection: "positive",
    affectedAssets: ["JPM", "SPY"],
    whatHappened:
      "A group of regional lenders reported quarterly results showing loan delinquency rates holding steady or improving slightly, including in commercial real estate portfolios that had been a focus of investor concern over the past two years.",
    whyItMatters:
      "Commercial real estate exposure has been one of the more persistent worries for regional banks since interest rates rose sharply. Stable credit metrics across multiple lenders in the same reporting window is a broader signal than any single bank's results.",
    marketImpact:
      "The results are a modest potential positive for regional bank equities and broader financial sector sentiment, though the sample remains limited to early reporters and larger banks have yet to report.",
    whatToWatch: [
      "Results from larger money-center banks later in the reporting season.",
      "Commercial real estate refinancing activity as more loans reach maturity.",
      "Any change in loan-loss provisioning guidance for next year.",
    ],
  },
  {
    id: "n-fda-obesity-drug",
    slug: "fda-approves-new-obesity-treatment",
    title: "FDA approves new obesity treatment from major pharmaceutical maker",
    summary:
      "U.S. regulators approved a new weekly injectable treatment for chronic weight management, expanding competition in the category.",
    category: "healthcare",
    publishedAt: minutesAgo(90),
    source: "FinLens Wire",
    sourceUrl: "https://example.com/finlens-wire/fda-obesity-drug-approval",
    impactScore: makeImpact(6.8),
    impactDirection: "mixed",
    affectedAssets: ["SPY"],
    whatHappened:
      "The FDA approved a new weekly injectable treatment for chronic weight management from a major pharmaceutical manufacturer, following a review of late-stage trial data showing meaningful average weight reduction over 68 weeks.",
    whyItMatters:
      "The approval adds a new competitor to a category that has become one of the fastest-growing in pharmaceuticals, intensifying competition among the small number of companies with approved treatments.",
    marketImpact:
      "The approval is a mixed signal for the sector: a potential positive for the approved manufacturer's growth outlook, but a potential negative for incumbents facing new competition for market share and pricing.",
    whatToWatch: [
      "Initial pricing and insurance coverage decisions for the new treatment.",
      "Manufacturing capacity announcements, which have constrained rivals' growth in the category.",
      "Longer-term safety data as real-world usage expands.",
    ],
  },
];

function fallbackArticlesSorted(): NewsArticle[] {
  return [...NEWS_ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getArticle(slug: string): Promise<NewsArticle | undefined> {
  return fetchOneOrFallback<SanityNewsArticleDoc, NewsArticle>(
    `*[_type == "newsArticle" && slug.current == $slug][0] ${NEWS_ARTICLE_PROJECTION}`,
    { slug },
    mapSanityArticle,
    () => NEWS_ARTICLES.find((a) => a.slug === slug)
  );
}

export async function getArticlesSorted(): Promise<NewsArticle[]> {
  return fetchListOrFallback<SanityNewsArticleDoc, NewsArticle>(
    `*[_type == "newsArticle"] | order(publishedAt desc) ${NEWS_ARTICLE_PROJECTION}`,
    mapSanityArticle,
    fallbackArticlesSorted()
  );
}

export async function getTopStories(limit = 5): Promise<NewsArticle[]> {
  const articles = await getArticlesSorted();
  return [...articles].sort((a, b) => b.impactScore.value - a.impactScore.value).slice(0, limit);
}

export async function getArticlesForAsset(ticker: string): Promise<NewsArticle[]> {
  const articles = await getArticlesSorted();
  return articles.filter((a) => a.affectedAssets.includes(ticker));
}
