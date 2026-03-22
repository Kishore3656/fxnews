"use client";

import useSWR from "swr";
import { cn, currencyFlag } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

// Forex pairs data from Yahoo Finance public endpoint
const PAIRS = [
  { symbol: "EURUSD=X", label: "EUR/USD", base: "EUR", quote: "USD" },
  { symbol: "GBPUSD=X", label: "GBP/USD", base: "GBP", quote: "USD" },
  { symbol: "USDJPY=X", label: "USD/JPY", base: "USD", quote: "JPY" },
  { symbol: "AUDUSD=X", label: "AUD/USD", base: "AUD", quote: "USD" },
  { symbol: "USDCAD=X", label: "USD/CAD", base: "USD", quote: "CAD" },
  { symbol: "USDCHF=X", label: "USD/CHF", base: "USD", quote: "CHF" },
  { symbol: "NZDUSD=X", label: "NZD/USD", base: "NZD", quote: "USD" },
  { symbol: "EURGBP=X", label: "EUR/GBP", base: "EUR", quote: "GBP" },
];

interface PairData {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
}

interface PricesResponse {
  pairs: PairData[];
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

function PairTicker({ pair, data }: { pair: typeof PAIRS[0]; data?: PairData }) {
  const isUp = (data?.changePct ?? 0) > 0;
  const isDown = (data?.changePct ?? 0) < 0;

  return (
    <div className={cn(
      "flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors",
      isUp ? "border-green-500/20 bg-green-500/5" : isDown ? "border-red-500/20 bg-red-500/5" : "border-border bg-muted/20"
    )}>
      <div className="flex items-center gap-2">
        <span className="text-base">{currencyFlag(pair.base)}</span>
        <div>
          <div className="text-xs font-semibold text-foreground">{pair.label}</div>
          {data && (
            <div className="text-xs text-muted-foreground font-mono">
              H: {data.high.toFixed(4)} L: {data.low.toFixed(4)}
            </div>
          )}
        </div>
      </div>
      <div className="text-right">
        {data ? (
          <>
            <div className="text-sm font-mono font-bold text-foreground">
              {data.price.toFixed(4)}
            </div>
            <div className={cn(
              "text-xs font-mono flex items-center justify-end gap-0.5",
              isUp ? "text-green-400" : isDown ? "text-red-400" : "text-muted-foreground"
            )}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {data.changePct >= 0 ? "+" : ""}{data.changePct.toFixed(2)}%
            </div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground animate-pulse">Loading…</div>
        )}
      </div>
    </div>
  );
}

export function MarketOverview() {
  const { data } = useSWR<PricesResponse>("/api/prices", fetcher, {
    refreshInterval: 30 * 1000, // 30s
  });

  const pairMap = new Map(data?.pairs.map(p => [p.symbol, p]));

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Live Forex Rates</h2>
        {data?.updatedAt && (
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(data.updatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {PAIRS.map(pair => (
          <PairTicker key={pair.symbol} pair={pair} data={pairMap.get(pair.symbol)} />
        ))}
      </div>
    </div>
  );
}
