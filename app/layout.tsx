import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FXNews — Forex Trading News & Economic Calendar",
  description: "Real-time forex trading news aggregated from top financial sources with live economic calendar and currency rates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
