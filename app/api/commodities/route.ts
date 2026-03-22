import { NextResponse } from "next/server";

export const COMMODITY_LIST = [
  { symbol: "CL=F",  name: "Crude Oil WTI",   category: "Energy",    unit: "$/bbl" },
  { symbol: "BZ=F",  name: "Brent Crude",      category: "Energy",    unit: "$/bbl" },
  { symbol: "NG=F",  name: "Natural Gas",       category: "Energy",    unit: "$/MMBtu" },
  { symbol: "GC=F",  name: "Gold",              category: "Metals",    unit: "$/oz" },
  { symbol: "SI=F",  name: "Silver",            category: "Metals",    unit: "$/oz" },
  { symbol: "HG=F",  name: "Copper",            category: "Metals",    unit: "$/lb" },
  { symbol: "PL=F",  name: "Platinum",          category: "Metals",    unit: "$/oz" },
  { symbol: "ZW=F",  name: "Wheat",             category: "Grains",    unit: "¢/bu" },
  { symbol: "ZC=F",  name: "Corn",              category: "Grains",    unit: "¢/bu" },
  { symbol: "ZS=F",  name: "Soybeans",          category: "Grains",    unit: "¢/bu" },
  { symbol: "ES=F",  name: "S&P 500 Futures",   category: "Indices",   unit: "pts" },
  { symbol: "YM=F",  name: "Dow Jones Futures", category: "Indices",   unit: "pts" },
  { symbol: "NQ=F",  name: "Nasdaq Futures",    category: "Indices",   unit: "pts" },
];

export interface CommodityData {
  symbol: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  prevClose: number;
}

interface YahooChart {
  chart: {
    result?: Array<{
      meta: {
        regularMarketPrice: number;
        previousClose: number;
        chartPreviousClose: number;
        regularMarketDayHigh: number;
        regularMarketDayLow: number;
      };
    }>;
  };
}

async function fetchOne(sym: { symbol: string; name: string; category: string; unit: string }): Promise<CommodityData | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym.symbol)}?interval=1d&range=5d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json: YahooChart = await res.json();
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price = meta.regularMarketPrice ?? 0;
    const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prev;
    const changePct = prev !== 0 ? (change / prev) * 100 : 0;

    return {
      ...sym,
      price,
      change,
      changePct,
      high: meta.regularMarketDayHigh ?? price,
      low: meta.regularMarketDayLow ?? price,
      prevClose: prev,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const results = await Promise.allSettled(COMMODITY_LIST.map(fetchOne));
  const commodities = results
    .filter((r): r is PromiseFulfilledResult<CommodityData> => r.status === "fulfilled" && r.value !== null)
    .map(r => r.value);

  return NextResponse.json({ commodities, updatedAt: new Date().toISOString() });
}
