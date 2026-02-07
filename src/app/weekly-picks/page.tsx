import { Metadata } from "next";
import Link from "next/link";
import { getLandingPageData } from "@/app/landing-page-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Weekly AI Options Picks | Top Calls & Puts | GammaRips",
  description: "View this week's highest conviction options trading signals identified by GammaRips AI. Curated lists of top call and put setups.",
  keywords: ["weekly options picks", "best options to buy", "ai trading signals", "top calls", "top puts", "stock market picks"],
  alternates: {
    canonical: "/weekly-picks",
  },
};

export default async function WeeklyPicksPage() {
  const data = await getLandingPageData();
  const displayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Filter top 5
  const topCalls = data.bullish.items.slice(0, 5);
  const topPuts = data.bearish.items.slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
        <header className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Calendar className="h-4 w-4" />
                <span>Week of {displayDate}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
                Weekly AI Options Picks
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our AI scans the entire market to find the highest probability setups. Here are the top Call and Put signals for the week based on conviction score.
            </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Top Calls */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold font-headline">Top 5 Call Rips</h2>
                </div>
                {topCalls.length > 0 ? (
                    <div className="space-y-4">
                        {topCalls.map((pick) => (
                            <Link key={pick.id || pick.contract_symbol} href={`/${pick.ticker}`}>
                                <Card className="hover:border-green-500/50 transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-lg">{pick.ticker}</span>
                                                <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">
                                                    Score: {Math.round(pick.weighted_score || 0)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {pick.summary || "High conviction bullish setup."}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 border rounded-lg text-center text-muted-foreground bg-muted/20">
                        No high-conviction Call signals found yet this week. Check back later.
                    </div>
                )}
            </section>

             {/* Top Puts */}
             <section className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-full bg-red-500/10 text-red-500">
                        <TrendingDown className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold font-headline">Top 5 Put Rips</h2>
                </div>
                {topPuts.length > 0 ? (
                    <div className="space-y-4">
                        {topPuts.map((pick) => (
                            <Link key={pick.id || pick.contract_symbol} href={`/${pick.ticker}`}>
                                <Card className="hover:border-red-500/50 transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-lg">{pick.ticker}</span>
                                                <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/10">
                                                    Score: {Math.round(pick.weighted_score || 0)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {pick.summary || "High conviction bearish setup."}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                     <div className="p-6 border rounded-lg text-center text-muted-foreground bg-muted/20">
                        No high-conviction Put signals found yet this week. Check back later.
                    </div>
                )}
            </section>
        </div>

        <section className="bg-muted/30 rounded-xl p-8 text-center border">
            <h3 className="text-2xl font-bold font-headline mb-4">Want Daily Updates?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                These are just the highlights. Our dashboard updates in real-time with new signals, live option flow analysis, and full thesis details for over 500 stocks.
            </p>
            <Button size="lg" asChild>
                <Link href="/dashboard">Access Full Dashboard</Link>
            </Button>
        </section>
    </div>
  );
}
