"use client";

import useSWR from "swr";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { cn, impactColor, currencyFlag } from "@/lib/utils";
import type { CalendarEvent, ImpactLevel } from "@/lib/types";
import { CalendarDays, TrendingUp, RefreshCw, AlertTriangle } from "lucide-react";

interface CalendarResponse {
  events: CalendarEvent[];
  updatedAt: string;
  error?: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

const IMPACT_OPTIONS = [
  { value: "ALL", label: "All Impact" },
  { value: "High", label: "🔴 High" },
  { value: "Medium", label: "🟠 Medium" },
  { value: "Low", label: "🟡 Low" },
];

const CURRENCY_OPTIONS = [
  { value: "ALL", label: "All Currencies" },
  ...[  "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD", "CNY"].map(c => ({
    value: c,
    label: `${currencyFlag(c)} ${c}`,
  })),
];

function ImpactDots({ impact }: { impact: ImpactLevel }) {
  const levels: ImpactLevel[] = ["High", "Medium", "Low"];
  const rank = impact === "High" ? 3 : impact === "Medium" ? 2 : 1;
  return (
    <span className="flex gap-0.5 items-center">
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            i <= rank
              ? impact === "High"
                ? "bg-red-400"
                : impact === "Medium"
                ? "bg-orange-400"
                : "bg-yellow-500"
              : "bg-zinc-700"
          )}
        />
      ))}
    </span>
  );
}

function EventRow({ event }: { event: CalendarEvent }) {
  const isNow = !event.isUpcoming && event.actual === "";
  return (
    <div
      className={cn(
        "grid grid-cols-[60px_44px_1fr_72px_72px_72px] gap-2 px-3 py-2.5 text-xs border-b border-border/50 hover:bg-accent/30 transition-colors",
        isNow && "bg-primary/5 border-l-2 border-l-primary"
      )}
    >
      <span className="text-muted-foreground font-mono tabular-nums">{event.time}</span>
      <span className="font-medium flex items-center gap-1">
        <span>{currencyFlag(event.currency)}</span>
        <span className={impactColor(event.impact)}>{event.currency}</span>
      </span>
      <span className="text-foreground truncate" title={event.event}>
        <span className="mr-1.5"><ImpactDots impact={event.impact} /></span>
        {event.event}
      </span>
      <span className={cn(
        "font-mono text-right tabular-nums",
        event.actual && event.forecast && parseFloat(event.actual) > parseFloat(event.forecast)
          ? "text-green-400"
          : event.actual && event.forecast && parseFloat(event.actual) < parseFloat(event.forecast)
          ? "text-red-400"
          : "text-foreground"
      )}>
        {event.actual || "—"}
      </span>
      <span className="font-mono text-right tabular-nums text-muted-foreground">{event.forecast || "—"}</span>
      <span className="font-mono text-right tabular-nums text-muted-foreground">{event.previous || "—"}</span>
    </div>
  );
}

function GroupedByDate({ events }: { events: CalendarEvent[] }) {
  const groups: Record<string, CalendarEvent[]> = {};
  for (const ev of events) {
    if (!groups[ev.date]) groups[ev.date] = [];
    groups[ev.date].push(ev);
  }

  return (
    <>
      {Object.entries(groups).map(([date, evs]) => (
        <div key={date}>
          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30 border-b border-border/50 sticky top-0">
            {new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
          {evs.map(ev => <EventRow key={ev.id} event={ev} />)}
        </div>
      ))}
    </>
  );
}

export function EconomicCalendar() {
  const [impact, setImpact] = useState("ALL");
  const [currency, setCurrency] = useState("ALL");

  const { data, isLoading, error, mutate } = useSWR<CalendarResponse>(
    "/api/calendar",
    fetcher,
    { refreshInterval: 5 * 60 * 1000 }
  );

  const events = (data?.events ?? []).filter(ev => {
    if (impact !== "ALL" && ev.impact !== impact) return false;
    if (currency !== "ALL" && ev.currency !== currency) return false;
    return true;
  });

  const highImpactCount = (data?.events ?? []).filter(
    ev => ev.impact === "High" && ev.isUpcoming
  ).length;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-wrap gap-y-2">
        <CalendarDays className="w-4 h-4 text-primary" />
        <CardTitle>Economic Calendar</CardTitle>
        {highImpactCount > 0 && (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border ml-1">
            {highImpactCount} high impact upcoming
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Select
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={e => setCurrency(e.target.value)}
          />
          <Select
            options={IMPACT_OPTIONS}
            value={impact}
            onChange={e => setImpact(e.target.value)}
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

      {/* Table header */}
      <div className="grid grid-cols-[60px_44px_1fr_72px_72px_72px] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border bg-muted/20">
        <span>Time</span>
        <span>Cur.</span>
        <span>Event</span>
        <span className="text-right">Actual</span>
        <span className="text-right">Forecast</span>
        <span className="text-right">Previous</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading calendar…
          </div>
        ) : error || data?.error ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" /> Failed to load calendar
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
            <TrendingUp className="w-6 h-6" />
            No events match the current filter
          </div>
        ) : (
          <GroupedByDate events={events} />
        )}
      </div>

      {data?.updatedAt && (
        <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
          Source: ForexFactory · Updated {new Date(data.updatedAt).toLocaleTimeString()}
        </div>
      )}
    </Card>
  );
}
