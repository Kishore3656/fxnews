"use client";

import useSWR from "swr";
import { useState } from "react";
import { cn, currencyFlag } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { COMMODITY_CORRELATIONS, type CurrencyImpact } from "@/lib/commodity-correlations";
import type { CommodityData } from "@/app/api/commodities/route";
import {
  TrendingUp, TrendingDown, Minus, BarChart2,
  ChevronDown, ChevronUp, RefreshCw, AlertTriangle, Info,
} from "lucide-react";

interface CommoditiesResponse {
  commodities: CommodityData[];
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

const CATEGORIES = ["All", "Energy", "Metals", "Grains", "Indices"] as const;
type Category = typeof CATEGORIES[number];

// ─── Price display ────────────────────────────────────────────────
function formatPrice(price: number, unit: string): string {
  if (unit === "pts") return price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (price < 10) return price.toFixed(4);
  return price.toFixed(2);
}

// ─── Spark bar (high/low range indicator) ─────────────────────────
function RangeBar({ low, high, price }: { low: number; high: number; price: number }) {
  const range = high - low;
  if (range === 0) return null;
  const pct = Math.min(100, Math.max(0, ((price - low) / range) * 100));
  return (
    <div className="relative h-1 w-full rounded-full bg-zinc-700 mt-1.5">
      <div className="absolute h-full rounded-full bg-gradient-to-r from-red-500/60 to-green-500/60" style={{ width: "100%" }} />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-zinc-900 shadow"
        style={{ left: `calc(${pct}% - 4px)` }}
      />
    </div>
  );
}

// ─── Currency impact pill ─────────────────────────────────────────
function ImpactPill({ impact, pricePct }: { impact: CurrencyImpact; pricePct: number }) {
  const [show, setShow] = useState(false);

  // Flip direction if the commodity is falling
  const effectiveDirection =
    pricePct === 0
      ? impact.direction
      : pricePct > 0
      ? impact.direction
      : impact.direction === "positive"
      ? "negative"
      : impact.direction === "negative"
      ? "positive"
      : "mixed";

  const isPositive = effectiveDirection === "positive";
  const isNegative = effectiveDirection === "negative";

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(v => !v)}
        className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium transition-colors cursor-help",
          isPositive && "bg-green-500/10 border-green-500/30 text-green-400",
          isNegative && "bg-red-500/10 border-red-500/30 text-red-400",
          !isPositive && !isNegative && "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
        )}
      >
        <span>{currencyFlag(impact.currency)}</span>
        <span>{impact.currency}</span>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      </button>

      {show && (
        <div className="absolute bottom-full left-0 mb-1.5 z-50 w-64 rounded-lg border border-border bg-card p-3 shadow-xl text-xs">
          <div className="flex items-start gap-1.5 mb-1.5">
            <Info className="w-3 h-3 text-primary mt-0.5 shrink-0" />
            <span className="font-semibold text-foreground">
              {currencyFlag(impact.currency)} {impact.currency} — {impact.strength} {effectiveDirection} impact
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed">{impact.reason}</p>
        </div>
      )}
    </div>
  );
}

// ─── Expanded detail view ─────────────────────────────────────────
function CommodityDetail({ commodity }: { commodity: CommodityData }) {
  const correlation = COMMODITY_CORRELATIONS[commodity.symbol];
  if (!correlation) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/50 space-y-2.5">
      <p className="text-xs text-muted-foreground leading-relaxed">
        <Info className="w-3 h-3 inline mr-1 text-primary" />
        {correlation.marketNote}
      </p>
      <div>
        <p className="text-xs font-medium text-foreground mb-2">Currency Impact (when price {commodity.changePct >= 0 ? "rises ↑" : "falls ↓"}):</p>
        <div className="flex flex-wrap gap-1.5">
          {correlation.currencyImpacts.map(impact => (
            <ImpactPill key={impact.currency} impact={impact} pricePct={commodity.changePct} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Single commodity card ─────────────────────────────────────────
function CommodityCard({ commodity }: { commodity: CommodityData }) {
  const [expanded, setExpanded] = useState(false);
  const isUp = commodity.changePct > 0;
  const isDown = commodity.changePct < 0;
  const hasCorrelation = !!COMMODITY_CORRELATIONS[commodity.symbol];

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all",
        isUp ? "border-green-500/20 bg-green-500/5" : isDown ? "border-red-500/20 bg-red-500/5" : "border-border bg-muted/10"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground truncate">{commodity.name}</span>
            <span className="text-xs text-muted-foreground font-mono shrink-0">{commodity.unit}</span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-sm font-mono font-bold text-foreground">
              {formatPrice(commodity.price, commodity.unit)}
            </span>
            <span className={cn(
              "text-xs font-mono flex items-center gap-0.5",
              isUp ? "text-green-400" : isDown ? "text-red-400" : "text-muted-foreground"
            )}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {commodity.changePct >= 0 ? "+" : ""}{commodity.changePct.toFixed(2)}%
            </span>
          </div>
          <RangeBar low={commodity.low} high={commodity.high} price={commodity.price} />
          <div className="flex justify-between text-xs text-muted-foreground mt-0.5 font-mono">
            <span>L {formatPrice(commodity.low, commodity.unit)}</span>
            <span>H {formatPrice(commodity.high, commodity.unit)}</span>
          </div>
        </div>

        {hasCorrelation && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="shrink-0 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 mt-0.5"
            title="Show currency impact"
          >
            <span className="text-xs">FX</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Collapsed: show quick currency pills */}
      {!expanded && hasCorrelation && (
        <div className="flex flex-wrap gap-1 mt-2">
          {(COMMODITY_CORRELATIONS[commodity.symbol]?.currencyImpacts ?? []).slice(0, 3).map(impact => {
            const effectiveDir = commodity.changePct >= 0 ? impact.direction : impact.direction === "positive" ? "negative" : impact.direction === "negative" ? "positive" : "mixed";
            return (
              <span
                key={impact.currency}
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded border font-mono",
                  effectiveDir === "positive" && "bg-green-500/10 border-green-500/20 text-green-400",
                  effectiveDir === "negative" && "bg-red-500/10 border-red-500/20 text-red-400",
                  effectiveDir === "mixed" && "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                )}
              >
                {currencyFlag(impact.currency)} {impact.currency} {effectiveDir === "positive" ? "↑" : effectiveDir === "negative" ? "↓" : "~"}
              </span>
            );
          })}
          {(COMMODITY_CORRELATIONS[commodity.symbol]?.currencyImpacts.length ?? 0) > 3 && (
            <button onClick={() => setExpanded(true)} className="text-xs text-muted-foreground hover:text-primary">
              +{(COMMODITY_CORRELATIONS[commodity.symbol]?.currencyImpacts.length ?? 0) - 3} more
            </button>
          )}
        </div>
      )}

      {/* Expanded detail */}
      {expanded && <CommodityDetail commodity={commodity} />}
    </div>
  );
}

// ─── Main panel ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border p-3 animate-pulse space-y-2">
      <div className="h-3 w-24 bg-muted rounded" />
      <div className="h-5 w-20 bg-muted rounded" />
      <div className="h-1 w-full bg-muted rounded" />
    </div>
  );
}

export function CommoditiesPanel() {
  const [category, setCategory] = useState<Category>("All");

  const { data, isLoading, error, mutate } = useSWR<CommoditiesResponse>(
    "/api/commodities",
    fetcher,
    { refreshInterval: 60 * 1000 }
  );

  const items = (data?.commodities ?? []).filter(
    c => category === "All" || c.category === category
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-wrap gap-y-2">
        <BarChart2 className="w-4 h-4 text-primary" />
        <CardTitle>Futures & Commodities</CardTitle>
        <span className="text-xs text-muted-foreground ml-1">— with FX market impact</span>
        <div className="ml-auto flex items-center gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-md border transition-colors",
                category === cat
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {cat}
            </button>
          ))}
          <button onClick={() => mutate()} className="ml-1 text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardHeader>

      <div className="p-3">
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 px-1">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Bullish for currency</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Bearish for currency</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Mixed</span>
          <span className="ml-auto text-xs">Hover pills for details</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" /> Failed to load commodity data
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {items.map(c => <CommodityCard key={c.symbol} commodity={c} />)}
          </div>
        )}

        {data?.updatedAt && (
          <p className="text-xs text-muted-foreground mt-3 text-right">
            Source: Yahoo Finance · Updated {new Date(data.updatedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    </Card>
  );
}
