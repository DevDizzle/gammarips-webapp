import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { MarketHub } from "@/components/landing/market-hub";
import { PerformanceTile } from "@/components/landing/performance-tile";
import EconomicEventsWidget from "@/components/dashboard/economic-events-widget";
import { NewsFeedWidget } from "@/components/dashboard/news-feed";
import { getLandingPageData } from "@/app/landing-page-actions";
import { DashboardUsageTracker } from "@/components/dashboard/dashboard-usage-tracker";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Search, BarChart3, ShieldCheck, Database, Zap } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";

export const metadata: Metadata = {
  title: "GammaRips | Daily AI Options Analysis & Market Research",
  description: "High-conviction options signals powered by AI. Fundamentals, technicals, and flow analysis combined. $19/mo.",
  alternates: {
    canonical: '/',
  },
};

export default async function LandingPage() {
  const data = await getLandingPageData();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardUsageTracker />
      
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-16 max-w-5xl">
        <Hero />

        {/* Value Prop & Intro */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold font-headline">Don't Trade in the Dark</h2>
            <p className="text-lg text-muted-foreground">
                Most traders lose money because they rely on intuition or delayed indicators. 
                GammaRips gives you the edge by tracking the "Smart Money" — institutional options flow — 
                and combining it with AI-driven technical and fundamental analysis.
            </p>
        </section>
        
        {/* Today's Top Signals (Market Hub) */}
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-bold font-headline">Today's Market Pulse</h2>
                 <Link href="/dashboard" className="text-primary hover:underline text-sm font-medium">View All Signals &rarr;</Link>
             </div>
            <section id="market-hub">
                <MarketHub data={data} />
            </section>
        </div>

        {/* How It Works */}
        <section className="py-8">
            <h2 className="text-3xl font-bold font-headline text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center border-none shadow-none bg-transparent">
                    <CardContent className="pt-6">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <Search className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">1. We Scan</h3>
                        <p className="text-muted-foreground">
                            Our AI monitors thousands of tickers and millions of options trades in real-time, filtering for unusual activity and high gamma exposure.
                        </p>
                    </CardContent>
                </Card>
                <Card className="text-center border-none shadow-none bg-transparent">
                     <CardContent className="pt-6">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <BarChart3 className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">2. We Analyze</h3>
                        <p className="text-muted-foreground">
                            We don't just show flow. We contextualize it with technical indicators (RSI, MACD) and fundamental data to verify the setup.
                        </p>
                    </CardContent>
                </Card>
                <Card className="text-center border-none shadow-none bg-transparent">
                     <CardContent className="pt-6">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <Target className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">3. You Execute</h3>
                        <p className="text-muted-foreground">
                            You get a clear, ranked list of "Rips" — high-probability setups with defined conviction scores. No noise, just signal.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </section>
        
        {/* Performance & Trust */}
        <div className="space-y-6">
            <section id="performance">
                <PerformanceTile data={data} />
            </section>
        </div>

        {/* Trust Signals */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8 border-y bg-muted/20 -mx-4 px-4 sm:px-0">
             <div className="flex items-center justify-center gap-3 p-4">
                <ShieldCheck className="text-green-500 h-6 w-6" />
                <span className="font-medium text-sm">Data Integrity Verified</span>
             </div>
             <div className="flex items-center justify-center gap-3 p-4">
                <Database className="text-blue-500 h-6 w-6" />
                <span className="font-medium text-sm">Russell 1000 Covered</span>
             </div>
             <div className="flex items-center justify-center gap-3 p-4">
                <Zap className="text-yellow-500 h-6 w-6" />
                <span className="font-medium text-sm">Real-Time Processing</span>
             </div>
             <div className="flex items-center justify-center gap-3 p-4">
                <Target className="text-primary h-6 w-6" />
                <span className="font-medium text-sm">AI-Driven Confluence</span>
             </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 py-12">
            <h2 className="text-3xl font-bold font-headline">Ready to Find Your Next Trade?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
                Join hundreds of traders using GammaRips to spot institutional moves before they happen.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" asChild>
                    <Link href="/dashboard">Explore Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="/learn">Read Our Methodology</Link>
                </Button>
            </div>
        </section>
            
        <div className="space-y-6">
            <section id="economic-calendar">
                <EconomicEventsWidget />
            </section>
            <section id="market-news">
                <NewsFeedWidget />
            </section>
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
