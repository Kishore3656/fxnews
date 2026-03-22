import { Header } from "@/components/header";
import { EconomicCalendar } from "@/components/economic-calendar";
import { NewsFeed } from "@/components/news-feed";
import { UpcomingHighImpact } from "@/components/upcoming-events";
import { CommoditiesPanel } from "@/components/commodities-panel";
import { SWRProvider } from "@/components/swr-provider";

export default function Home() {
  return (
    <SWRProvider>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-4 space-y-4">
          {/* Upcoming High Impact Alert */}
          <UpcomingHighImpact />

          {/* Commodities & Futures with FX Impact */}
          <section id="commodities">
            <CommoditiesPanel />
          </section>

          {/* Main Grid: Calendar + News */}
          <section
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            style={{ height: "calc(100vh - 260px)", minHeight: "600px" }}
          >
            <div id="calendar" className="flex flex-col min-h-0">
              <EconomicCalendar />
            </div>
            <div id="news" className="flex flex-col min-h-0">
              <NewsFeed />
            </div>
          </section>
        </main>

        <footer className="border-t border-border py-3 px-4 text-center text-xs text-muted-foreground">
          FXNews — Data from ForexFactory, FXStreet, DailyFX, Investing.com, ForexLive, MarketWatch, Yahoo Finance · For informational purposes only
        </footer>
      </div>
    </SWRProvider>
  );
}
