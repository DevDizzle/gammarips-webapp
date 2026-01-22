import Link from "next/link";
import { UserNav } from "@/components/auth/user-nav";
import { TickerSearch } from "@/components/ticker-search";
import { Hero } from "@/components/landing/hero";
import { MarketHub } from "@/components/landing/market-hub";
import { PerformanceTile } from "@/components/landing/performance-tile";
import EconomicEventsWidget from "@/components/dashboard/economic-events-widget";
import { NewsFeedWidget } from "@/components/dashboard/news-feed";
import { getLandingPageData } from "@/app/landing-page-actions";
import { DashboardUsageTracker } from "@/components/dashboard/dashboard-usage-tracker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GammaRips | Daily AI Options Analysis & Market Research",
  description: "Real-time AI options signals, gamma exposure analysis, and market performance tracking.",
  alternates: {
    canonical: '/',
  },
};

export default async function LandingPage() {
  const data = await getLandingPageData();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardUsageTracker />
      
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline">
            <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
          </Link>
          <div className="flex items-center gap-4">
            <TickerSearch />
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-6 max-w-5xl">
        <Hero />
        
        <div className="space-y-6">
            <section id="market-hub">
                <MarketHub data={data} />
            </section>
            
            <section id="performance">
                <PerformanceTile data={data} />
            </section>
            
            <div className="space-y-6">
                <section id="economic-calendar">
                    <EconomicEventsWidget />
                </section>
                <section id="market-news">
                    <NewsFeedWidget />
                </section>
            </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-xs text-muted-foreground border-t mt-12">
        <div className="container">
          <p>© {new Date().getFullYear()} GammaRips. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}