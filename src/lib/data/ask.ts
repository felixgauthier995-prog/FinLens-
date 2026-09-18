export interface AskSource {
  label: string;
  href: string;
}

export interface AskEntry {
  id: string;
  /** The example prompt shown as a suggestion chip. */
  prompt: string;
  /** Extra keywords used for matching free-text input to this entry. */
  keywords: string[];
  short: string;
  detail: string;
  sources: AskSource[];
  /** Marks answers that explicitly decline to give personalized advice. */
  isAdviceBoundary?: boolean;
}

/**
 * Canned responses for the Ask FinLens prototype. A production build would
 * replace matchAskEntry() with a real retrieval-augmented model call, but
 * the response shape (short answer, expandable detail, cited sources,
 * explicit advice boundary) is the actual product contract.
 */
export const ASK_ENTRIES: AskEntry[] = [
  {
    id: "nvidia-up",
    prompt: "Why is NVIDIA up today?",
    keywords: ["nvidia", "nvda", "chip", "semiconductor"],
    short:
      "NVIDIA reported quarterly revenue well above analyst expectations, driven by continued data center demand, and next quarter's guidance also came in slightly ahead of consensus.",
    detail:
      "NVIDIA posted revenue of $38.2 billion versus $35.9 billion expected, with management saying data center demand \"continues to outstrip supply.\" The stock is up 4.12% today. Related chipmakers AMD and TSM are also trading higher, and the move is lifting the Nasdaq-100 given NVIDIA's index weighting. This is a potential positive read on enterprise AI infrastructure spending broadly, not just for NVIDIA specifically.",
    sources: [
      { label: "NVIDIA reports stronger-than-expected earnings", href: "/news/nvidia-reports-stronger-than-expected-earnings" },
      { label: "NVIDIA Fiscal Q4 Earnings Call", href: "/agenda/nvidia-q4-earnings-call" },
    ],
  },
  {
    id: "tesla-week",
    prompt: "What could affect Tesla this week?",
    keywords: ["tesla", "tsla", "ev", "electric vehicle"],
    short:
      "Tesla just reported deliveries below Wall Street estimates, and this week's broader rate and consumer-spending data could add to the pressure on growth stocks like Tesla.",
    detail:
      "Tesla delivered about 423,000 vehicles versus roughly 445,000 expected, citing softer European demand and rising Chinese competition. Beyond company-specific news, Tesla tends to react to macro data this week — including tomorrow's retail sales report and Friday's employment report — since both influence rate expectations and risk appetite for high-growth names. Watch for any updated pricing commentary in Tesla's next earnings call.",
    sources: [
      { label: "Tesla quarterly deliveries fall short of Wall Street estimates", href: "/news/tesla-quarterly-deliveries-fall-short-of-estimates" },
      { label: "U.S. Employment Report (Nonfarm Payrolls)", href: "/agenda/us-employment-report" },
    ],
  },
  {
    id: "fed-said",
    prompt: "What did the Fed say?",
    keywords: ["fed", "federal reserve", "interest rate", "rates", "powell", "fomc"],
    short:
      "The Fed held interest rates steady and signaled a more cautious, data-dependent path forward — more hawkish than markets had hoped for.",
    detail:
      "The Federal Reserve kept its benchmark rate in the 4.00%–4.25% range. In the press conference, the Chair described the approach as \"meeting by meeting\" and said the committee wants more evidence inflation is durably cooling before cutting further. Markets had priced in a reasonable chance of consecutive cuts, so the more cautious tone was a mild disappointment for rate-sensitive sectors like regional banks and homebuilders.",
    sources: [
      { label: "Federal Reserve holds rates steady, signals a cautious path ahead", href: "/news/federal-reserve-holds-rates-signals-caution" },
      { label: "Federal Reserve Press Conference", href: "/agenda/fed-press-conference" },
    ],
  },
  {
    id: "cpi-explain",
    prompt: "Explain the CPI report simply.",
    keywords: ["cpi", "inflation", "consumer price index"],
    short:
      "CPI measures how much prices for everyday goods and services are rising. This month's report showed inflation cooling gradually, right in line with what economists expected.",
    detail:
      "The Consumer Price Index rose 2.6% year-over-year and 0.2% from the prior month, both matching forecasts. \"Core\" CPI — which strips out volatile food and energy prices — came in at 3.0%, its lowest level in over two years. Because the print matched expectations, it didn't force a big shift in what investors think the Fed will do next, but it keeps the door open for further rate cuts if the trend continues.",
    sources: [
      { label: "CPI report shows inflation cooling gradually, in line with forecasts", href: "/news/cpi-report-shows-inflation-cooling-gradually" },
      { label: "U.S. CPI Report (September)", href: "/agenda/cpi-report-release" },
    ],
  },
  {
    id: "bitcoin-buy",
    prompt: "Is Bitcoin a good buy right now?",
    keywords: ["bitcoin", "btc", "crypto", "buy", "should i invest", "should i buy"],
    short:
      "FinLens doesn't give personalized investment advice or tell you what to buy — but here's what's actually happening with Bitcoin right now.",
    detail:
      "Bitcoin is down about 1.8% today, part of a broader pullback in risk assets after the Fed signaled a slower path for rate cuts than markets had hoped. Crypto has traded with a closer relationship to rate expectations over the past two years, since higher-for-longer rates raise the opportunity cost of holding non-yielding assets. Whether that makes current levels attractive depends on your own goals, time horizon, and risk tolerance — a licensed financial advisor is better placed to help with that decision than FinLens.",
    sources: [
      { label: "Bitcoin slides as rate uncertainty weighs on risk assets", href: "/news/bitcoin-slides-as-rate-uncertainty-weighs-on-risk-assets" },
    ],
    isAdviceBoundary: true,
  },
];

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

export function matchAskEntry(query: string): AskEntry | undefined {
  const q = normalize(query);
  if (!q) return undefined;

  let best: { entry: AskEntry; score: number } | undefined;
  for (const entry of ASK_ENTRIES) {
    const haystack = [entry.prompt, ...entry.keywords].map(normalize);
    let score = 0;
    for (const term of haystack) {
      if (q.includes(term) || term.includes(q)) score += term.length;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }
  return best?.entry;
}
