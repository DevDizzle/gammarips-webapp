
import Link from "next/link";
import { TickerSearch } from "@/components/ticker-search";
import TodaysWinners from "@/app/dashboard/todays-winners";
import { Suspense } from "react";
import HomePageClientContent from "./home-page-client-content";
import PerformanceTracker, { PerformanceTrackerSkeleton } from "@/components/performance-tracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

// Force dynamic rendering to ensure performance data is always fresh.
export const revalidate = 0;

export default function LandingPage() {
  return (
    <>
      <Suspense>
        <HomePageClientContent />
      </Suspense>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center gap-4">
            <Link href="/" className="text-2xl font-bold font-headline text-primary shrink-0">
              ProfitScout
            </Link>
            <div className="flex w-full items-center justify-end space-x-4">
              <TickerSearch />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">
          {/* Hero */}
          <section className="text-center py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
              AI-Powered Research for Options Traders
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Analyze data-driven insights to identify potential options setups in the Russell 1000. Enhance your research process and make more informed decisions.
            </p>
          </section>

          {/* Performance Tracker Section */}
          <section className="pb-16 px-4 sm:px-6 lg:px-8">
             <Suspense fallback={<PerformanceTrackerSkeleton />}>
                <PerformanceTracker />
              </Suspense>
          </section>

          {/* Winners Dashboard Section */}
          <section id="winners-dashboard" className="pb-8 scroll-mt-20 px-4 sm:px-6 lg:px-8">
              <TodaysWinners />
          </section>
          
        </main>
      </div>
    </>
  );
}
