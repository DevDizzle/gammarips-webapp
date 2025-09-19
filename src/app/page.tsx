
import { TickerSearch } from "@/components/ticker-search";
import Link from "next/link";
import TodaysWinners from "@/app/dashboard/todays-winners";

export default function LandingPage() {
  return (
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
            Find Your Next Winning Trade
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Get AI-powered stock and options signals on the Russell 1000.
            <br />
            Stop chasing noise. Start acting on actionable intelligence.
          </p>
        </section>

        {/* Winners Dashboard Section */}
        <section id="winners-dashboard" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 scroll-mt-20">
            <TodaysWinners />
        </section>

      </main>
    </div>
  );
}
