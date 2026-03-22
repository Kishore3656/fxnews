import { NextResponse } from "next/server";

// One function call serves ALL users for 30s — cached at the edge
export const revalidate = 30;

const PAIRS = [
  "EURUSD=X", "GBPUSD=X", "USDJPY=X", "AUDUSD=X",
  "USDCAD=X", "USDCHF=X", "NZDUSD=X", "EURGBP=X",
];

interface YahooMeta {
  symbol: string;
  regularMarketPrice: number;
  previousClose: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  chartPreviousClose: number;
}

interface YahooChart {
  chart: {
    result?: Array<{ meta: YahooMeta }>;
    error?: unknown;
  };
}

async function fetchPair(symbol: string): Promise<{
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
} | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(5000),
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
      symbol,
      price,
      change,
      changePct,
      high: meta.regularMarketDayHigh ?? price,
      low: meta.regularMarketDayLow ?? price,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const results = await Promise.allSettled(PAIRS.map(fetchPair));

  const pairs = results
    .filter((r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof fetchPair>>>> =>
      r.status === "fulfilled" && r.value !== null
    )
    .map(r => r.value);

  return NextResponse.json({ pairs, updatedAt: new Date().toISOString() });
}
