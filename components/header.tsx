"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";

export function Header() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground tracking-tight">FX</span>
            <span className="text-sm font-bold text-primary tracking-tight">News</span>
          </div>
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
          <a href="#calendar" className="px-2.5 py-1 rounded hover:bg-accent hover:text-foreground transition-colors">
            Calendar
          </a>
          <a href="#news" className="px-2.5 py-1 rounded hover:bg-accent hover:text-foreground transition-colors">
            News
          </a>
          <a href="#commodities" className="px-2.5 py-1 rounded hover:bg-accent hover:text-foreground transition-colors">
            Commodities
          </a>
        </nav>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="live-dot w-2 h-2 rounded-full bg-green-400 inline-block" />
          <span className="text-xs text-green-400 font-medium hidden sm:inline">LIVE</span>
        </div>

        {/* Clock */}
        <div className="ml-auto text-right hidden md:block">
          <div className="text-sm font-mono font-bold text-foreground tabular-nums">{time}</div>
          <div className="text-xs text-muted-foreground">{date} · UTC</div>
        </div>
      </div>
    </header>
  );
}
