import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  return `${diffDays}d ago`;
}

export function formatEventTime(timeStr: string): string {
  if (!timeStr || timeStr === "All Day" || timeStr === "Tentative") return timeStr;
  return timeStr;
}

export function impactColor(impact: string): string {
  switch (impact?.toLowerCase()) {
    case "high": return "text-red-400";
    case "medium": return "text-orange-400";
    case "low": return "text-yellow-500";
    default: return "text-zinc-500";
  }
}

export function impactBg(impact: string): string {
  switch (impact?.toLowerCase()) {
    case "high": return "bg-red-500/15 border-red-500/30";
    case "medium": return "bg-orange-500/15 border-orange-500/30";
    case "low": return "bg-yellow-500/15 border-yellow-500/30";
    default: return "bg-zinc-800 border-zinc-700";
  }
}

export function extractCurrencies(text: string): string[] {
  const major = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD", "CNY", "HKD"];
  return major.filter(c => text.toUpperCase().includes(c));
}

export function currencyFlag(currency: string): string {
  const flags: Record<string, string> = {
    USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
    AUD: "🇦🇺", CAD: "🇨🇦", CHF: "🇨🇭", NZD: "🇳🇿",
    CNY: "🇨🇳", HKD: "🇭🇰", SGD: "🇸🇬", MXN: "🇲🇽",
    ZAR: "🇿🇦", NOK: "🇳🇴", SEK: "🇸🇪", DKK: "🇩🇰",
  };
  return flags[currency] ?? "🌐";
}
