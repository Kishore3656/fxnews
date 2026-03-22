"use client";

import useSWR from "swr";
import { cn, impactColor, currencyFlag } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/types";
import { Clock, AlertTriangle } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

function timeUntil(dateStr: string, timeStr: string): string {
  try {
    const dt = new Date(`${dateStr}T${timeStr}:00Z`);
    const diffMs = dt.getTime() - Date.now();
    if (diffMs < 0) return "Released";
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ${hrs % 24}h`;
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
  } catch {
    return "";
  }
}

export function UpcomingHighImpact() {
  const { data } = useSWR<{ events: CalendarEvent[] }>("/api/calendar", fetcher, {
    refreshInterval: 60 * 1000,
  });

  const upcoming = (data?.events ?? [])
    .filter(ev => ev.impact === "High" && ev.isUpcoming)
    .slice(0, 5);

  if (upcoming.length === 0) return null;

  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        <span className="text-xs font-semibold text-red-400">High Impact Events</span>
      </div>
      <div className="space-y-1.5">
        {upcoming.map(ev => (
          <div key={ev.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span>{currencyFlag(ev.currency)}</span>
              <span className={cn("font-medium", impactColor(ev.impact))}>{ev.currency}</span>
              <span className="text-foreground truncate max-w-[160px]" title={ev.event}>{ev.event}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground shrink-0">
              <Clock className="w-3 h-3" />
              <span className="font-mono">{timeUntil(ev.date, ev.time)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
