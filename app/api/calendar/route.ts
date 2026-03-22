import { NextResponse } from "next/server";
import type { CalendarEvent, ImpactLevel } from "@/lib/types";

// Cached at the edge for 15 minutes — economic events don't change every second
export const revalidate = 900;

// ForexFactory public calendar JSON — widely used public endpoint
const FF_CALENDAR_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";

interface FFEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
  actual?: string;
}

function normalizeImpact(raw: string): ImpactLevel {
  const lower = raw?.toLowerCase() ?? "";
  if (lower.includes("high")) return "High";
  if (lower.includes("medium")) return "Medium";
  if (lower.includes("low")) return "Low";
  if (lower.includes("holiday")) return "Holiday";
  return "Low";
}

function parseDateTime(isoDate: string): { date: string; time: string } {
  try {
    const d = new Date(isoDate);
    const date = d.toISOString().split("T")[0];
    const hours = d.getUTCHours().toString().padStart(2, "0");
    const mins = d.getUTCMinutes().toString().padStart(2, "0");
    const time = hours === "00" && mins === "00" ? "All Day" : `${hours}:${mins}`;
    return { date, time };
  } catch {
    return { date: isoDate, time: "" };
  }
}

export async function GET() {
  try {
    const res = await fetch(FF_CALENDAR_URL, {
      next: { revalidate: 300 }, // cache 5 minutes
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FXNews/1.0)",
        Accept: "application/json",
      },
    });

    if (!res.ok) throw new Error(`FF calendar returned ${res.status}`);

    const raw: FFEvent[] = await res.json();
    const now = new Date();

    const events: CalendarEvent[] = raw.map((ev, i) => {
      const { date, time } = parseDateTime(ev.date);
      const eventDate = new Date(ev.date);
      return {
        id: `ff-${i}-${ev.date}`,
        date,
        time,
        currency: ev.country?.toUpperCase() ?? "USD",
        impact: normalizeImpact(ev.impact),
        event: ev.title,
        actual: ev.actual ?? "",
        forecast: ev.forecast ?? "",
        previous: ev.previous ?? "",
        isUpcoming: eventDate > now,
      };
    });

    return NextResponse.json({ events, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("Calendar fetch error:", err);
    return NextResponse.json({ events: [], error: "Failed to load calendar", updatedAt: new Date().toISOString() });
  }
}
