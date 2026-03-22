import { NextResponse } from "next/server";
import type { NewsItem } from "@/lib/types";
import { extractCurrencies } from "@/lib/utils";

// One function call serves ALL users for 3 minutes — cached at the edge
export const revalidate = 180;

interface RSSItem {
  title?: string;
  contentSnippet?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  enclosure?: { url?: string };
  "media:content"?: { $?: { url?: string } };
}

interface FeedResult {
  items: RSSItem[];
}

const NEWS_SOURCES = [
  {
    name: "FXStreet",
    url: "https://www.fxstreet.com/rss/news",
  },
  {
    name: "DailyFX",
    url: "https://www.dailyfx.com/feeds/all",
  },
  {
    name: "Investing.com",
    url: "https://www.investing.com/rss/news_25.rss",
  },
  {
    name: "MarketWatch",
    url: "https://feeds.marketwatch.com/marketwatch/marketpulse/",
  },
  {
    name: "ForexLive",
    url: "https://www.forexlive.com/feed/news",
  },
];

async function parseFeed(source: { name: string; url: string }): Promise<NewsItem[]> {
  try {
    const res = await fetch(source.url, {
      next: { revalidate: 180 }, // 3 minutes
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FXNews/1.0; +https://fxnews.app)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];

    const xml = await res.text();

    // Simple XML RSS parser (no external dependency needed for basic fields)
    const items: NewsItem[] = [];
    const itemMatches = Array.from(xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi));

    let index = 0;
    for (const match of itemMatches) {
      if (index >= 15) break; // max 15 per source
      const block = match[1];

      const title = decodeXML(extractTag(block, "title"));
      const link = extractTag(block, "link") || extractCDATALink(block);
      const pubDate = extractTag(block, "pubDate") || extractTag(block, "dc:date");
      const description = decodeXML(
        stripHTML(extractTag(block, "description") || extractTag(block, "content:encoded") || "")
      ).slice(0, 200);

      if (!title || !link) { index++; continue; }

      const isoDate = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
      const combined = `${title} ${description}`;

      items.push({
        id: `${source.name}-${index}-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        link: link.trim(),
        pubDate: isoDate,
        source: source.name,
        currencies: extractCurrencies(combined),
      });

      index++;
    }

    return items;
  } catch {
    return [];
  }
}

function extractTag(xml: string, tag: string): string {
  const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i"));
  if (cdataMatch) return cdataMatch[1];
  const plainMatch = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (plainMatch) return plainMatch[1];
  return "";
}

function extractCDATALink(block: string): string {
  // Some feeds put link outside of tags
  const m = block.match(/<link>(https?:\/\/[^<]+)<\/link>/i);
  return m?.[1] ?? "";
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeXML(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const currency = searchParams.get("currency");

  // Fetch all sources concurrently
  const results = await Promise.allSettled(NEWS_SOURCES.map(parseFeed));

  let allItems: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // Sort by date descending
  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // Remove duplicates by title similarity
  const seen = new Set<string>();
  allItems = allItems.filter(item => {
    const key = item.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Filter by currency if specified
  if (currency && currency !== "ALL") {
    allItems = allItems.filter(
      item => item.currencies.includes(currency) || item.title.toUpperCase().includes(currency)
    );
  }

  return NextResponse.json({
    items: allItems.slice(0, 60),
    sources: NEWS_SOURCES.map(s => s.name),
    updatedAt: new Date().toISOString(),
  });
}
