import Link from "next/link";
import { TickerSearch } from "@/components/ticker-search";
import TodaysWinners from "@/app/dashboard/todays-winners";
import { Suspense } from "react";
import PerformanceTracker, { PerformanceTrackerSkeleton } from "@/components/performance-tracker";
import HomePageClientContent from "./home-page-client-content";

export default function LandingPage() {
  return (
    <>
      <Suspense>
        <HomePageClientContent />
      </Suspense>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold font-headline text-primary">
              ProfitScout
            </Link>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <TickerSearch />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">
          {/* Hero */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-24">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
              Find Your Next Winning Options Trade
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Get AI-powered stock signals that pinpoint high-potential options setups in the Russell 1000. Stop chasing noise and start trading with confidence.
            </p>
          </section>

          {/* Performance Tracker Section */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <Suspense fallback={<PerformanceTrackerSkeleton />}>
              <PerformanceTracker />
            </Suspense>
          </section>

          {/* Winners Dashboard Section */}
          <section id="winners-dashboard" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 scroll-mt-20">
              <TodaysWinners />
          </section>
          
        </main>
      </div>
    </>
  );
}
