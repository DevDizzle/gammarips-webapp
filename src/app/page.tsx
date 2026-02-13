import Link from "next/link";
import { getLandingPageData } from "./landing-page-actions";
import { Hero } from "@/components/landing/hero";
import { SignalsTable } from "@/components/overnight/signals-table";
import { PublicHeader } from "@/components/layout/public-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'The Overnight Edge | GammaRips',
  description: 'Institutional options flow analysis delivered before the market opens.',
};

import { EmailCapture } from "@/components/email-capture";

export default async function LandingPage() {
  const { summary, bullSignals, bearSignals, recentReports } = await getLandingPageData();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero 
          headline={summary?.headline} 
          narrative={summary?.market_narrative} 
        />

        {/* Summary Bar */}
        {summary && (
          <section className="bg-muted/30 border-y py-4">
            <div className="container px-4 mx-auto flex flex-wrap gap-6 justify-center text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Scanned:</span>
                <span className="font-mono font-bold">{summary.total_signals} Tickers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Bullish:</span>
                <span className="font-mono font-bold text-green-500">{summary.bull_count}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Bearish:</span>
                <span className="font-mono font-bold text-red-500">{summary.bear_count}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="font-semibold text-muted-foreground">Generated:</span>
                 <span className="font-mono text-muted-foreground">{new Date(summary.generated_at?.toDate?.() || summary.generated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit', timeZone: 'America/New_York' })} ET</span>
              </div>
            </div>
          </section>
        )}

        {/* Email Capture */}
        <section className="py-8 container px-4 mx-auto max-w-xl">
            <EmailCapture />
        </section>

        {/* Signals Tables */}
        <section className="py-12 md:py-16 container px-4 mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <SignalsTable 
              title="Top Bull Signals" 
              signals={bullSignals} 
            />
            <SignalsTable 
              title="Top Bear Signals" 
              signals={bearSignals} 
            />
          </div>
        </section>

        {/* Recent Reports */}
        {recentReports && recentReports.length > 0 && (
            <section className="py-12 bg-muted/5 border-y">
                <div className="container px-4 mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold font-headline">Recent Reports</h2>
                        <Button variant="ghost" asChild>
                            <Link href="/reports">View Archive &rarr;</Link>
                        </Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {recentReports
                            .filter(r => r.scan_date !== summary?.scan_date)
                            .slice(0, 3)
                            .map(report => (
                                <Card key={report.scan_date} className="hover:border-primary/50 transition-colors h-full">
                                    <Link href={`/reports/${report.scan_date}`} className="block h-full">
                                        <CardHeader>
                                            <div className="text-sm text-muted-foreground mb-1">
                                                {new Date(report.scan_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                                            </div>
                                            <CardTitle className="text-lg leading-tight line-clamp-2">
                                                {report.headline || "Daily Overnight Signals"}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="text-green-500 font-medium">{report.bull_count} Bull</span>
                                                <span>•</span>
                                                <span className="text-red-500 font-medium">{report.bear_count} Bear</span>
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))
                        }
                    </div>
                </div>
            </section>
        )}

        {/* Themes */}
        {summary?.top_themes && summary.top_themes.length > 0 && (
          <section className="py-8 bg-muted/10 border-y">
             <div className="container px-4 mx-auto text-center">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Overnight Themes</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {summary.top_themes.map((theme, i) => (
                    <Badge key={i} variant="outline" className="text-base py-1 px-3 border-primary/20 bg-primary/5">
                      {theme}
                    </Badge>
                  ))}
                </div>
             </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-20 md:py-32 text-center container px-4">
          <h2 className="text-3xl md:text-5xl font-bold font-headline mb-6">
            Don't Trade Alone.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Get the full analysis, strike prices, and key levels for every signal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Button size="lg" className="h-12 px-8 text-lg" asChild>
                <Link href="#pricing">Unlock All Signals</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg" asChild>
                <Link href="/signals">View Dashboard</Link>
              </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
