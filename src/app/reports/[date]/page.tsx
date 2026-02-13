import Link from "next/link";
import { notFound } from "next/navigation";
import { getOvernightSummary, getOvernightSignals } from "@/lib/firebase-admin";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Lock, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { format, parseISO } from "date-fns";
import { EmailCapture } from "@/components/email-capture";

interface Props {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const summary = await getOvernightSummary(date);
  const formattedDate = format(parseISO(date), 'MMMM d, yyyy');
  
  return {
    title: `Overnight Edge Report: ${summary?.headline || 'Daily Signals'} — ${formattedDate} | GammaRips`,
    description: summary?.market_narrative || `Institutional options flow analysis for ${formattedDate}. See what smart money did overnight.`,
    openGraph: {
      title: `The Overnight Edge — ${formattedDate}`,
      description: summary?.market_narrative || `Institutional options flow analysis for ${formattedDate}.`,
      type: 'article',
      publishedTime: date,
    },
  };
}

export default async function ReportDetailPage({ params }: Props) {
  const { date } = await params;
  const summary = await getOvernightSummary(date);
  
  if (!summary) {
    return notFound();
  }

  const [bullSignals, bearSignals] = await Promise.all([
    getOvernightSignals(date, 'bull', 6, 10),
    getOvernightSignals(date, 'bear', 6, 10),
  ]);

  const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Overnight Edge Report: ${summary.headline}`,
    datePublished: date,
    author: {
      '@type': 'Organization',
      name: 'GammaRips',
      url: 'https://gammarips.com',
    },
    description: summary.market_narrative,
    publisher: {
      '@type': 'Organization',
      name: 'GammaRips',
    },
  };

  const formatMoney = (amount: number) => {
    if (Math.abs(amount) >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    return `$${(amount / 1_000).toFixed(0)}K`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
            <Link href="/reports" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Archive
            </Link>
            
            <Badge variant="outline" className="mb-4 text-muted-foreground">
                {formattedDate}
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold font-headline mb-4 leading-tight">
                {summary.headline}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                <span className="font-semibold text-foreground">{summary.total_signals}</span> Signals Scanned
                <span className="hidden sm:inline">•</span>
                <span className="text-green-500 font-medium">{summary.bull_count} Bullish</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-red-500 font-medium">{summary.bear_count} Bearish</span>
            </div>

            {/* Market Narrative */}
            <div className="prose prose-invert max-w-none mb-8 text-lg leading-relaxed text-muted-foreground border-l-4 border-primary/50 pl-6 py-2 bg-muted/10 rounded-r-lg">
                {summary.market_narrative}
            </div>

            {/* Themes */}
            {summary.top_themes && (
                <div className="flex flex-wrap gap-2 mb-12">
                    {summary.top_themes.map((theme) => (
                    <Badge key={theme} className="text-sm py-1 px-3 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                        {theme}
                    </Badge>
                    ))}
                </div>
            )}
        </div>

        {/* Top Signals Tables */}
        <div className="grid gap-12 mb-16">
            {/* Bullish Table */}
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-500">
                    <TrendingUp className="w-5 h-5" /> Top Bullish Flows
                </h3>
                <div className="rounded-md border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ticker</TableHead>
                                <TableHead className="text-center">Score</TableHead>
                                <TableHead className="text-right">Move</TableHead>
                                <TableHead className="text-right">Positioning</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bullSignals.map((signal) => (
                                <TableRow key={signal.id}>
                                    <TableCell className="font-bold font-mono">
                                        <Link href={`/signals/${signal.ticker}`} className="hover:underline underline-offset-4">
                                            {signal.ticker}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className={signal.signal_score >= 8 ? "text-green-500" : ""}>{signal.signal_score}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-green-500 font-medium">
                                        +{Math.abs(signal.move_pct).toFixed(1)}%
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-muted-foreground">
                                        {formatMoney(signal.new_positioning_usd)}
                                    </TableCell>
                                     <TableCell>
                                        <Link href={`/signals/${signal.ticker}`} title={`View analysis for ${signal.ticker}`}>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

             {/* Bearish Table */}
             <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-500">
                    <TrendingDown className="w-5 h-5" /> Top Bearish Flows
                </h3>
                <div className="rounded-md border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ticker</TableHead>
                                <TableHead className="text-center">Score</TableHead>
                                <TableHead className="text-right">Move</TableHead>
                                <TableHead className="text-right">Positioning</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bearSignals.map((signal) => (
                                <TableRow key={signal.id}>
                                    <TableCell className="font-bold font-mono">
                                        <Link href={`/signals/${signal.ticker}`} className="hover:underline underline-offset-4">
                                            {signal.ticker}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className={signal.signal_score >= 8 ? "text-red-500" : ""}>{signal.signal_score}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-red-500 font-medium">
                                        -{Math.abs(signal.move_pct).toFixed(1)}%
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-muted-foreground">
                                        {formatMoney(signal.new_positioning_usd)}
                                    </TableCell>
                                     <TableCell>
                                        <Link href={`/signals/${signal.ticker}`} title={`View analysis for ${signal.ticker}`}>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>

        {/* CTA Block */}
        <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lock className="w-24 h-24 text-primary" />
            </div>
            <CardContent className="p-8 md:p-12 text-center relative z-10">
                <h3 className="text-2xl font-bold font-headline mb-4">Want the Full Analysis?</h3>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                    Unlock the AI trade thesis, recommended contracts, strike prices, and key support/resistance levels for all {summary.total_signals} signals.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8 text-left text-sm">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary shrink-0" />
                        <span>AI Trade Thesis & Setup</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Lock className="w-4 h-4 text-primary shrink-0" />
                        <span>Exact Contract & Strike</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Lock className="w-4 h-4 text-primary shrink-0" />
                        <span>Key Support/Resistance</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Lock className="w-4 h-4 text-primary shrink-0" />
                        <span>Risk/Reward Analysis</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                    <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base" asChild>
                        <Link href="/#pricing">Subscribe Now — $49/mo</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base" asChild>
                        <Link href="/signals">View Dashboard</Link>
                    </Button>
                </div>

                <div className="max-w-md mx-auto">
                    <div className="text-sm text-muted-foreground mb-4">Or get free daily previews delivered to your inbox:</div>
                    <EmailCapture variant="minimal" />
                </div>
            </CardContent>
        </Card>

        <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>Report generated by The Overnight Edge scanner at 4:25 AM EST on {formattedDate}.</p>
        </footer>
      </main>
    </div>
  );
}
