"use client";

import useSWR from "swr";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { cn, formatRelativeTime, currencyFlag } from "@/lib/utils";
import type { NewsItem } from "@/lib/types";
import { Newspaper, ExternalLink, RefreshCw, AlertTriangle, Rss } from "lucide-react";

interface NewsResponse {
  items: NewsItem[];
  sources: string[];
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

const CURRENCY_OPTIONS = [
  { value: "ALL", label: "All Currencies" },
  ...["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD", "CNY"].map(c => ({
    value: c,
    label: `${currencyFlag(c)} ${c}`,
  })),
];

const SOURCE_COLORS: Record<string, string> = {
  FXStreet: "text-blue-400",
  DailyFX: "text-purple-400",
  "Investing.com": "text-orange-400",
  MarketWatch: "text-green-400",
  ForexLive: "text-cyan-400",
};

function NewsCard({ item }: { item: NewsItem }) {
  const sourceColor = SOURCE_COLORS[item.source] ?? "text-muted-foreground";
  const timeAgo = formatRelativeTime(item.pubDate);
  const isRecent = Date.now() - new Date(item.pubDate).getTime() < 30 * 60 * 1000;

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block px-4 py-3 border-b border-border/50 hover:bg-accent/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs font-medium", sourceColor)}>{item.source}</span>
            {isRecent && (
              <span className="flex items-center gap-1 text-xs text-primary font-medium">
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                New
              </span>
            )}
            {item.currencies.slice(0, 3).map(c => (
              <span key={c} className="text-xs text-muted-foreground font-mono">
                {currencyFlag(c)} {c}
              </span>
            ))}
          </div>
          <p className="text-sm text-foreground font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </p>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-xs text-muted-foreground tabular-nums">{timeAgo}</span>
        </div>
      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="px-4 py-3 border-b border-border/50 animate-pulse">
      <div className="flex gap-2 mb-2">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-3 w-10 bg-muted rounded" />
      </div>
      <div className="h-4 w-full bg-muted rounded mb-1" />
      <div className="h-4 w-3/4 bg-muted rounded mb-2" />
      <div className="h-3 w-full bg-muted/60 rounded" />
    </div>
  );
}

export function NewsFeed() {
  const [currency, setCurrency] = useState("ALL");

  const apiUrl = currency === "ALL" ? "/api/news" : `/api/news?currency=${currency}`;

  const { data, isLoading, error, mutate } = useSWR<NewsResponse>(
    apiUrl,
    fetcher,
    { refreshInterval: 3 * 60 * 1000 }
  );

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-wrap gap-y-2">
        <Newspaper className="w-4 h-4 text-primary" />
        <CardTitle>Market News</CardTitle>
        {data?.items && (
          <Badge variant="outline" className="ml-1 text-xs">
            {data.items.length} articles
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Select
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={e => setCurrency(e.target.value)}
          />
          <button
            onClick={() => mutate()}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardHeader>

      {/* Source legend */}
      {data?.sources && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 py-2 border-b border-border/50 bg-muted/10">
          {data.sources.map(s => (
            <span key={s} className={cn("text-xs flex items-center gap-1", SOURCE_COLORS[s] ?? "text-muted-foreground")}>
              <Rss className="w-2.5 h-2.5" />{s}
            </span>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : error ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" /> Failed to load news
          </div>
        ) : data?.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
            <Newspaper className="w-6 h-6" />
            No news found for this filter
          </div>
        ) : (
          data?.items.map(item => <NewsCard key={item.id} item={item} />)
        )}
      </div>

      {data?.updatedAt && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border flex items-center gap-1">
          <Rss className="w-3 h-3" />
          Live RSS · Updated {new Date(data.updatedAt).toLocaleTimeString()}
        </div>
      )}
    </Card>
  );
}
