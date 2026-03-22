export type ImpactDirection = "positive" | "negative" | "mixed";

export interface CurrencyImpact {
  currency: string;
  direction: ImpactDirection;
  strength: "strong" | "moderate" | "weak";
  reason: string;
}

export interface CommodityCorrelation {
  symbol: string;
  currencyImpacts: CurrencyImpact[];
  marketNote: string; // broader market context
}

export const COMMODITY_CORRELATIONS: Record<string, CommodityCorrelation> = {
  "CL=F": {
    symbol: "CL=F",
    marketNote: "Oil is the world's most traded commodity. Rising prices signal inflation pressure and shift wealth from importers to exporters.",
    currencyImpacts: [
      { currency: "CAD", direction: "positive", strength: "strong",   reason: "Canada is the world's 4th largest oil producer and exports ~95% to the US" },
      { currency: "NOK", direction: "positive", strength: "strong",   reason: "Norway's petroleum exports make NOK highly sensitive to oil prices" },
      { currency: "RUB", direction: "positive", strength: "strong",   reason: "Oil accounts for ~40% of Russia's export revenue" },
      { currency: "JPY", direction: "negative", strength: "strong",   reason: "Japan imports ~90% of its energy needs — higher oil raises the trade deficit" },
      { currency: "EUR", direction: "negative", strength: "moderate", reason: "Eurozone is a net energy importer; higher oil widens the current account deficit" },
      { currency: "USD", direction: "mixed",    strength: "moderate", reason: "US is both producer and consumer. Higher oil can be inflationary, pressuring Fed rate expectations" },
      { currency: "INR", direction: "negative", strength: "strong",   reason: "India imports ~85% of its oil needs, creating large current account pressure" },
    ],
  },
  "BZ=F": {
    symbol: "BZ=F",
    marketNote: "Brent is the global benchmark. Movements mirror WTI but reflect non-US supply (OPEC, North Sea) more directly.",
    currencyImpacts: [
      { currency: "CAD", direction: "positive", strength: "strong",   reason: "Global oil benchmark rising benefits all major oil exporters including Canada" },
      { currency: "NOK", direction: "positive", strength: "strong",   reason: "North Sea Brent production directly supports Norwegian krone" },
      { currency: "GBP", direction: "positive", strength: "weak",     reason: "UK is a net oil exporter (North Sea) though production has declined significantly" },
      { currency: "JPY", direction: "negative", strength: "strong",   reason: "Higher Brent increases Japan's import bill, pressuring the yen" },
      { currency: "EUR", direction: "negative", strength: "moderate", reason: "Europe depends heavily on Brent-priced imports for energy" },
    ],
  },
  "NG=F": {
    symbol: "NG=F",
    marketNote: "Natural gas impacts energy security. Post-2022 European energy crisis made it a key geopolitical commodity.",
    currencyImpacts: [
      { currency: "USD", direction: "positive", strength: "moderate", reason: "US is the world's largest LNG exporter — higher prices boost export revenue" },
      { currency: "CAD", direction: "positive", strength: "moderate", reason: "Canada is a major natural gas exporter, particularly to the US" },
      { currency: "EUR", direction: "negative", strength: "strong",   reason: "Eurozone imports most of its gas; higher prices strain the current account and fuel inflation" },
      { currency: "JPY", direction: "negative", strength: "moderate", reason: "Japan is the world's 2nd largest LNG importer after China" },
    ],
  },
  "GC=F": {
    symbol: "GC=F",
    marketNote: "Gold is the ultimate safe-haven asset. It typically rises when USD weakens, real yields fall, or geopolitical risk spikes.",
    currencyImpacts: [
      { currency: "USD", direction: "negative", strength: "strong",   reason: "Gold is priced in USD — a stronger dollar makes gold more expensive for foreign buyers, reducing demand" },
      { currency: "AUD", direction: "positive", strength: "strong",   reason: "Australia is the world's 2nd largest gold producer; exports rise with gold prices" },
      { currency: "CHF", direction: "positive", strength: "moderate", reason: "CHF and gold share safe-haven demand; both rise during risk-off episodes" },
      { currency: "JPY", direction: "positive", strength: "moderate", reason: "JPY also acts as safe-haven; both benefit from geopolitical uncertainty" },
      { currency: "CAD", direction: "positive", strength: "weak",     reason: "Canada is one of the top 5 gold producers globally" },
      { currency: "ZAR", direction: "positive", strength: "moderate", reason: "South Africa is a significant gold producer — revenues increase with rising prices" },
    ],
  },
  "SI=F": {
    symbol: "SI=F",
    marketNote: "Silver has dual nature as both monetary metal and industrial input (solar panels, electronics). More volatile than gold.",
    currencyImpacts: [
      { currency: "USD", direction: "negative", strength: "moderate", reason: "Silver priced in USD — inverse correlation with dollar strength, similar to gold" },
      { currency: "AUD", direction: "positive", strength: "moderate", reason: "Australia is a top-5 silver producing nation" },
      { currency: "MXN", direction: "positive", strength: "strong",   reason: "Mexico is consistently the world's largest silver producer" },
      { currency: "CAD", direction: "positive", strength: "weak",     reason: "Canada has significant silver mining operations" },
    ],
  },
  "HG=F": {
    symbol: "HG=F",
    marketNote: "Copper is known as 'Dr. Copper' — it's a leading indicator of global economic health due to its widespread industrial use.",
    currencyImpacts: [
      { currency: "AUD", direction: "positive", strength: "strong",   reason: "Australia is one of the world's largest copper exporters; it's a key driver of AUD" },
      { currency: "CAD", direction: "positive", strength: "moderate", reason: "Canada is a major copper producer and exporter" },
      { currency: "CLP", direction: "positive", strength: "strong",   reason: "Chile produces ~27% of world copper supply — copper IS the Chilean economy" },
      { currency: "NZD", direction: "positive", strength: "weak",     reason: "NZD tends to track AUD; commodity risk-on sentiment lifts both" },
      { currency: "USD", direction: "negative", strength: "moderate", reason: "Dollar weakening typically accompanies commodity rallies (risk-on)" },
      { currency: "JPY", direction: "negative", strength: "moderate", reason: "Rising copper signals global growth, pushing investors away from safe-haven yen" },
    ],
  },
  "PL=F": {
    symbol: "PL=F",
    marketNote: "Platinum is rarer than gold, used heavily in auto catalysts (diesel), fuel cells, and jewelry.",
    currencyImpacts: [
      { currency: "ZAR", direction: "positive", strength: "strong",   reason: "South Africa produces ~70% of global platinum supply — the currency is deeply tied to platinum" },
      { currency: "USD", direction: "negative", strength: "weak",     reason: "Priced in USD; mild inverse relationship with dollar strength" },
    ],
  },
  "ZW=F": {
    symbol: "ZW=F",
    marketNote: "Wheat prices are key to food inflation globally. Geopolitical shocks (e.g., war in Ukraine) cause major disruptions.",
    currencyImpacts: [
      { currency: "USD", direction: "positive", strength: "moderate", reason: "US is a top wheat exporter; higher prices improve agricultural trade balance" },
      { currency: "CAD", direction: "positive", strength: "moderate", reason: "Canada is one of the world's largest wheat exporters" },
      { currency: "AUD", direction: "positive", strength: "moderate", reason: "Australia is a major wheat exporter to Asia and the Middle East" },
      { currency: "EUR", direction: "negative", strength: "weak",     reason: "Higher food commodity prices fuel Eurozone inflation, complicating ECB policy" },
    ],
  },
  "ZC=F": {
    symbol: "ZC=F",
    marketNote: "Corn is critical for food, animal feed, and ethanol (bio-fuel). US dominates global supply.",
    currencyImpacts: [
      { currency: "USD", direction: "positive", strength: "moderate", reason: "US grows ~32% of the world's corn and is the dominant exporter" },
      { currency: "BRL", direction: "positive", strength: "strong",   reason: "Brazil is the 2nd largest corn exporter — corn prices directly boost BRL" },
      { currency: "MXN", direction: "negative", strength: "moderate", reason: "Mexico is a large corn importer; higher prices raise food import costs" },
    ],
  },
  "ZS=F": {
    symbol: "ZS=F",
    marketNote: "Soybeans drive global protein trade. China is the dominant buyer, making US-China trade relations highly relevant.",
    currencyImpacts: [
      { currency: "USD", direction: "positive", strength: "moderate", reason: "US is the world's 2nd largest soybean producer and major exporter" },
      { currency: "BRL", direction: "positive", strength: "strong",   reason: "Brazil is the world's largest soybean exporter — a key BRL driver" },
      { currency: "CNY", direction: "negative", strength: "moderate", reason: "China imports ~60% of globally traded soybeans; higher prices increase import costs" },
    ],
  },
  "ES=F": {
    symbol: "ES=F",
    marketNote: "S&P 500 futures signal US equity sentiment and global risk appetite before market open.",
    currencyImpacts: [
      { currency: "USD", direction: "positive", strength: "moderate", reason: "Rising equities reflect confidence in US economy, attracting capital inflows to USD" },
      { currency: "JPY", direction: "negative", strength: "strong",   reason: "Risk-on equity rallies push investors out of safe-haven yen into higher-yield assets" },
      { currency: "CHF", direction: "negative", strength: "moderate", reason: "CHF weakens as risk appetite rises and safe-haven demand falls" },
      { currency: "AUD", direction: "positive", strength: "moderate", reason: "AUD is a risk-on currency; equity rallies correlate with commodity demand optimism" },
    ],
  },
  "YM=F": {
    symbol: "YM=F",
    marketNote: "Dow futures represent industrial and blue-chip US stocks. A gauge of traditional economic health.",
    currencyImpacts: [
      { currency: "USD", direction: "positive", strength: "moderate", reason: "Stronger Dow signals US economic resilience, supporting USD demand" },
      { currency: "JPY", direction: "negative", strength: "moderate", reason: "Higher Dow reflects risk-on mood, reducing yen safe-haven demand" },
    ],
  },
  "NQ=F": {
    symbol: "NQ=F",
    marketNote: "Nasdaq futures track tech stocks. Highly sensitive to interest rate expectations and AI/tech sentiment.",
    currencyImpacts: [
      { currency: "USD", direction: "positive", strength: "moderate", reason: "Tech-sector strength attracts global capital to US markets, supporting USD" },
      { currency: "JPY", direction: "negative", strength: "moderate", reason: "Risk-on tech rally typically accompanies yen carry trade activity" },
      { currency: "KRW", direction: "positive", strength: "weak",     reason: "South Korea's large tech export sector correlates with global tech sentiment" },
    ],
  },
};
