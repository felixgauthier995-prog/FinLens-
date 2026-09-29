/**
 * Companies FinLens knows beyond the core list in assets.ts: they can be
 * followed, and the AI can attach signals to them.
 *
 * `names` are the phrases that identify the company in an article (used to
 * check that a "direct" signal's company is really named). Keep them
 * specific: never a common word ("The", "General") or a 1–2 letter ticker.
 */
export interface UniverseCompany {
  ticker: string;
  name: string;
  sector: string;
  assetType?: "equity" | "etf";
  names: string[];
}

export const UNIVERSE: UniverseCompany[] = [
  // Technology & software
  { ticker: "GOOGL", name: "Alphabet Inc.", sector: "Technology", names: ["Alphabet", "Google", "YouTube"] },
  { ticker: "ORCL", name: "Oracle Corporation", sector: "Technology", names: ["Oracle"] },
  { ticker: "CRM", name: "Salesforce, Inc.", sector: "Technology", names: ["Salesforce"] },
  { ticker: "ADBE", name: "Adobe Inc.", sector: "Technology", names: ["Adobe"] },
  { ticker: "IBM", name: "International Business Machines", sector: "Technology", names: ["IBM"] },
  { ticker: "CSCO", name: "Cisco Systems, Inc.", sector: "Technology", names: ["Cisco"] },
  { ticker: "PLTR", name: "Palantir Technologies Inc.", sector: "Technology", names: ["Palantir"] },
  { ticker: "NOW", name: "ServiceNow, Inc.", sector: "Technology", names: ["ServiceNow"] },
  { ticker: "INTU", name: "Intuit Inc.", sector: "Technology", names: ["Intuit"] },
  { ticker: "SHOP", name: "Shopify Inc.", sector: "Technology", names: ["Shopify"] },
  { ticker: "SNOW", name: "Snowflake Inc.", sector: "Technology", names: ["Snowflake"] },
  { ticker: "NET", name: "Cloudflare, Inc.", sector: "Technology", names: ["Cloudflare"] },
  { ticker: "CRWD", name: "CrowdStrike Holdings, Inc.", sector: "Technology", names: ["CrowdStrike"] },
  { ticker: "PANW", name: "Palo Alto Networks, Inc.", sector: "Technology", names: ["Palo Alto Networks"] },
  { ticker: "DDOG", name: "Datadog, Inc.", sector: "Technology", names: ["Datadog"] },
  { ticker: "DELL", name: "Dell Technologies Inc.", sector: "Technology", names: ["Dell"] },
  { ticker: "HPQ", name: "HP Inc.", sector: "Technology", names: ["HP Inc"] },
  { ticker: "ANET", name: "Arista Networks, Inc.", sector: "Technology", names: ["Arista"] },
  { ticker: "MSI", name: "Motorola Solutions, Inc.", sector: "Technology", names: ["Motorola"] },
  { ticker: "SMCI", name: "Super Micro Computer, Inc.", sector: "Technology", names: ["Super Micro", "Supermicro"] },
  { ticker: "UBER", name: "Uber Technologies, Inc.", sector: "Technology", names: ["Uber"] },

  // Semiconductors
  { ticker: "AVGO", name: "Broadcom Inc.", sector: "Semiconductors", names: ["Broadcom"] },
  { ticker: "QCOM", name: "Qualcomm Incorporated", sector: "Semiconductors", names: ["Qualcomm"] },
  { ticker: "INTC", name: "Intel Corporation", sector: "Semiconductors", names: ["Intel"] },
  { ticker: "MU", name: "Micron Technology, Inc.", sector: "Semiconductors", names: ["Micron"] },
  { ticker: "ARM", name: "Arm Holdings plc", sector: "Semiconductors", names: ["Arm Holdings"] },
  { ticker: "ASML", name: "ASML Holding N.V.", sector: "Semiconductors", names: ["ASML"] },
  { ticker: "TXN", name: "Texas Instruments Incorporated", sector: "Semiconductors", names: ["Texas Instruments"] },
  { ticker: "AMAT", name: "Applied Materials, Inc.", sector: "Semiconductors", names: ["Applied Materials"] },
  { ticker: "LRCX", name: "Lam Research Corporation", sector: "Semiconductors", names: ["Lam Research"] },
  { ticker: "MRVL", name: "Marvell Technology, Inc.", sector: "Semiconductors", names: ["Marvell"] },

  // Communication & media
  { ticker: "NFLX", name: "Netflix, Inc.", sector: "Communication Services", names: ["Netflix"] },
  { ticker: "DIS", name: "The Walt Disney Company", sector: "Communication Services", names: ["Disney"] },
  { ticker: "SPOT", name: "Spotify Technology S.A.", sector: "Communication Services", names: ["Spotify"] },
  { ticker: "T", name: "AT&T Inc.", sector: "Communication Services", names: ["AT&T"] },
  { ticker: "VZ", name: "Verizon Communications Inc.", sector: "Communication Services", names: ["Verizon"] },
  { ticker: "CMCSA", name: "Comcast Corporation", sector: "Communication Services", names: ["Comcast", "NBCUniversal"] },
  { ticker: "WBD", name: "Warner Bros. Discovery, Inc.", sector: "Communication Services", names: ["Warner Bros"] },
  { ticker: "TTWO", name: "Take-Two Interactive Software, Inc.", sector: "Communication Services", names: ["Take-Two", "Rockstar Games"] },
  { ticker: "EA", name: "Electronic Arts Inc.", sector: "Communication Services", names: ["Electronic Arts"] },

  // Financials
  { ticker: "BAC", name: "Bank of America Corporation", sector: "Financials", names: ["Bank of America", "BofA"] },
  { ticker: "GS", name: "The Goldman Sachs Group, Inc.", sector: "Financials", names: ["Goldman Sachs", "Goldman"] },
  { ticker: "MS", name: "Morgan Stanley", sector: "Financials", names: ["Morgan Stanley"] },
  { ticker: "WFC", name: "Wells Fargo & Company", sector: "Financials", names: ["Wells Fargo"] },
  { ticker: "C", name: "Citigroup Inc.", sector: "Financials", names: ["Citigroup", "Citibank", "Citi"] },
  { ticker: "V", name: "Visa Inc.", sector: "Financials", names: ["Visa Inc", "Visa's", "Visa and Mastercard", "Visa, Mastercard"] },
  { ticker: "MA", name: "Mastercard Incorporated", sector: "Financials", names: ["Mastercard"] },
  { ticker: "AXP", name: "American Express Company", sector: "Financials", names: ["American Express", "Amex"] },
  { ticker: "PYPL", name: "PayPal Holdings, Inc.", sector: "Financials", names: ["PayPal"] },
  { ticker: "COIN", name: "Coinbase Global, Inc.", sector: "Financials", names: ["Coinbase"] },
  { ticker: "HOOD", name: "Robinhood Markets, Inc.", sector: "Financials", names: ["Robinhood"] },
  { ticker: "BLK", name: "BlackRock, Inc.", sector: "Financials", names: ["BlackRock"] },
  { ticker: "SCHW", name: "The Charles Schwab Corporation", sector: "Financials", names: ["Charles Schwab", "Schwab"] },

  // Healthcare
  { ticker: "LLY", name: "Eli Lilly and Company", sector: "Healthcare", names: ["Eli Lilly", "Lilly"] },
  { ticker: "NVO", name: "Novo Nordisk A/S", sector: "Healthcare", names: ["Novo Nordisk"] },
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", names: ["Johnson & Johnson", "J&J"] },
  { ticker: "UNH", name: "UnitedHealth Group Incorporated", sector: "Healthcare", names: ["UnitedHealth"] },
  { ticker: "PFE", name: "Pfizer Inc.", sector: "Healthcare", names: ["Pfizer"] },
  { ticker: "MRK", name: "Merck & Co., Inc.", sector: "Healthcare", names: ["Merck"] },
  { ticker: "ABBV", name: "AbbVie Inc.", sector: "Healthcare", names: ["AbbVie"] },
  { ticker: "AMGN", name: "Amgen Inc.", sector: "Healthcare", names: ["Amgen"] },
  { ticker: "MRNA", name: "Moderna, Inc.", sector: "Healthcare", names: ["Moderna"] },
  { ticker: "ISRG", name: "Intuitive Surgical, Inc.", sector: "Healthcare", names: ["Intuitive Surgical"] },
  { ticker: "TMO", name: "Thermo Fisher Scientific Inc.", sector: "Healthcare", names: ["Thermo Fisher"] },

  // Consumer
  { ticker: "NKE", name: "Nike, Inc.", sector: "Consumer Discretionary", names: ["Nike"] },
  { ticker: "SBUX", name: "Starbucks Corporation", sector: "Consumer Discretionary", names: ["Starbucks"] },
  { ticker: "MCD", name: "McDonald's Corporation", sector: "Consumer Discretionary", names: ["McDonald's", "McDonalds"] },
  { ticker: "HD", name: "The Home Depot, Inc.", sector: "Consumer Discretionary", names: ["Home Depot"] },
  { ticker: "LULU", name: "Lululemon Athletica Inc.", sector: "Consumer Discretionary", names: ["Lululemon"] },
  { ticker: "CMG", name: "Chipotle Mexican Grill, Inc.", sector: "Consumer Discretionary", names: ["Chipotle"] },
  { ticker: "BKNG", name: "Booking Holdings Inc.", sector: "Consumer Discretionary", names: ["Booking Holdings", "Booking.com"] },
  { ticker: "ABNB", name: "Airbnb, Inc.", sector: "Consumer Discretionary", names: ["Airbnb"] },
  { ticker: "DASH", name: "DoorDash, Inc.", sector: "Consumer Discretionary", names: ["DoorDash"] },
  { ticker: "EBAY", name: "eBay Inc.", sector: "Consumer Discretionary", names: ["eBay"] },
  { ticker: "F", name: "Ford Motor Company", sector: "Automotive", names: ["Ford Motor", "Ford's", "Ford said", "Ford CEO"] },
  { ticker: "GM", name: "General Motors Company", sector: "Automotive", names: ["General Motors"] },
  { ticker: "RIVN", name: "Rivian Automotive, Inc.", sector: "Automotive", names: ["Rivian"] },
  { ticker: "WMT", name: "Walmart Inc.", sector: "Consumer Staples", names: ["Walmart"] },
  { ticker: "COST", name: "Costco Wholesale Corporation", sector: "Consumer Staples", names: ["Costco"] },
  { ticker: "TGT", name: "Target Corporation", sector: "Consumer Staples", names: ["Target Corp", "Target's", "Target said"] },
  { ticker: "KO", name: "The Coca-Cola Company", sector: "Consumer Staples", names: ["Coca-Cola", "Coke"] },
  { ticker: "PEP", name: "PepsiCo, Inc.", sector: "Consumer Staples", names: ["PepsiCo", "Pepsi"] },
  { ticker: "PG", name: "The Procter & Gamble Company", sector: "Consumer Staples", names: ["Procter & Gamble", "P&G"] },
  { ticker: "MNST", name: "Monster Beverage Corporation", sector: "Consumer Staples", names: ["Monster Beverage"] },
  { ticker: "TSN", name: "Tyson Foods, Inc.", sector: "Consumer Staples", names: ["Tyson Foods", "Tyson"] },
  { ticker: "KDP", name: "Keurig Dr Pepper Inc.", sector: "Consumer Staples", names: ["Keurig", "Dr Pepper"] },

  // Energy & utilities
  { ticker: "CVX", name: "Chevron Corporation", sector: "Energy", names: ["Chevron"] },
  { ticker: "COP", name: "ConocoPhillips", sector: "Energy", names: ["ConocoPhillips"] },
  { ticker: "SHEL", name: "Shell plc", sector: "Energy", names: ["Shell plc", "Shell's", "Royal Dutch Shell", "Shell said"] },
  { ticker: "BP", name: "BP p.l.c.", sector: "Energy", names: ["BP plc", "BP's", "BP said"] },
  { ticker: "OXY", name: "Occidental Petroleum Corporation", sector: "Energy", names: ["Occidental"] },
  { ticker: "SLB", name: "SLB N.V.", sector: "Energy", names: ["Schlumberger", "SLB"] },
  { ticker: "CCJ", name: "Cameco Corporation", sector: "Energy", names: ["Cameco"] },
  { ticker: "FSLR", name: "First Solar, Inc.", sector: "Energy", names: ["First Solar"] },
  { ticker: "NEE", name: "NextEra Energy, Inc.", sector: "Utilities", names: ["NextEra"] },
  { ticker: "CEG", name: "Constellation Energy Corporation", sector: "Utilities", names: ["Constellation Energy"] },
  { ticker: "VST", name: "Vistra Corp.", sector: "Utilities", names: ["Vistra"] },
  { ticker: "OKLO", name: "Oklo Inc.", sector: "Utilities", names: ["Oklo"] },

  // Industrials & defense
  { ticker: "BA", name: "The Boeing Company", sector: "Industrials", names: ["Boeing"] },
  { ticker: "RTX", name: "RTX Corporation", sector: "Industrials", names: ["RTX", "Raytheon", "Pratt & Whitney"] },
  { ticker: "LMT", name: "Lockheed Martin Corporation", sector: "Industrials", names: ["Lockheed"] },
  { ticker: "NOC", name: "Northrop Grumman Corporation", sector: "Industrials", names: ["Northrop"] },
  { ticker: "GD", name: "General Dynamics Corporation", sector: "Industrials", names: ["General Dynamics"] },
  { ticker: "CAT", name: "Caterpillar Inc.", sector: "Industrials", names: ["Caterpillar"] },
  { ticker: "DE", name: "Deere & Company", sector: "Industrials", names: ["John Deere", "Deere"] },
  { ticker: "GE", name: "GE Aerospace", sector: "Industrials", names: ["GE Aerospace", "General Electric"] },
  { ticker: "HON", name: "Honeywell International Inc.", sector: "Industrials", names: ["Honeywell"] },
  { ticker: "UPS", name: "United Parcel Service, Inc.", sector: "Industrials", names: ["United Parcel Service", "UPS"] },
  { ticker: "FDX", name: "FedEx Corporation", sector: "Industrials", names: ["FedEx"] },
  { ticker: "DAL", name: "Delta Air Lines, Inc.", sector: "Industrials", names: ["Delta Air Lines", "Delta Airlines"] },
  { ticker: "UNP", name: "Union Pacific Corporation", sector: "Industrials", names: ["Union Pacific"] },

  // Materials
  { ticker: "FCX", name: "Freeport-McMoRan Inc.", sector: "Materials", names: ["Freeport-McMoRan", "Freeport"] },
  { ticker: "NEM", name: "Newmont Corporation", sector: "Materials", names: ["Newmont"] },

  // ETFs
  { ticker: "IWM", name: "iShares Russell 2000 ETF", sector: "Broad Market", assetType: "etf", names: ["Russell 2000"] },
];

/** Identifying names for the core assets defined in assets.ts. */
export const CORE_NAMES: Record<string, string[]> = {
  AAPL: ["Apple", "iPhone"],
  NVDA: ["Nvidia", "NVIDIA"],
  TSLA: ["Tesla", "Elon Musk"],
  MSFT: ["Microsoft", "Azure"],
  META: ["Meta Platforms", "Facebook", "Instagram", "WhatsApp", "Meta's", "Meta said"],
  AMZN: ["Amazon", "AWS"],
  AMD: ["AMD", "Advanced Micro Devices"],
  TSM: ["TSMC", "Taiwan Semiconductor"],
  JPM: ["JPMorgan", "JP Morgan", "JPMorgan Chase"],
  XOM: ["Exxon", "ExxonMobil"],
  SPY: ["S&P 500"],
  QQQ: ["Nasdaq-100", "Nasdaq 100"],
  BTC: ["Bitcoin"],
  ETH: ["Ethereum", "Ether"],
  GOLD: ["gold price", "gold prices", "Gold price", "Gold prices", "price of gold"],
  OIL: ["oil price", "oil prices", "Oil price", "Oil prices", "crude", "Crude", "Brent", "WTI"],
};
