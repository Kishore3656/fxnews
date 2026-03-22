export type ImpactLevel = "High" | "Medium" | "Low" | "Holiday";

export interface CalendarEvent {
  id: string;
  date: string; // ISO date string
  time: string; // "HH:mm" or "All Day"
  currency: string;
  impact: ImpactLevel;
  event: string;
  actual: string;
  forecast: string;
  previous: string;
  isUpcoming: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  sourceLogo?: string;
  currencies: string[];
  imageUrl?: string;
}

export interface NewsSource {
  name: string;
  url: string;
  logo?: string;
}

export interface MarketSentiment {
  currency: string;
  sentiment: "bullish" | "bearish" | "neutral";
  strength: number; // 0-100
  change24h: number;
}
