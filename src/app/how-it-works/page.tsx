import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How GammaRips Works — Overnight Options Scanner, AI Enrichment, Daily Signals',
  description: 'Learn how our scanner analyzes overnight institutional options flow across 5,230+ tickers. Understand our scoring system, enrichment process, and what makes a high-conviction signal.',
  alternates: { canonical: 'https://gammarips.com/how-it-works' },
  openGraph: {
    title: 'How GammaRips Works — Overnight Options Scanner',
    description: 'Learn how our scanner analyzes overnight institutional options flow across 5,230+ tickers.',
    url: 'https://gammarips.com/how-it-works',
  }
};

export default function HowItWorksPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How GammaRips Works — Overnight Options Scanner",
    "description": "Learn how our scanner analyzes overnight institutional options flow across 5,230+ tickers.",
    "image": "https://gammarips.com/og-image.png?v=2",
    "author": { "@type": "Organization", "name": "GammaRips", "url": "https://gammarips.com" },
    "publisher": { "@type": "Organization", "name": "GammaRips", "logo": { "@type": "ImageObject", "url": "https://gammarips.com/og-image.png?v=2" } }
  };

  return (
    <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Education</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
          How The Overnight Edge Works
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Here's exactly what lands on your screen before the market opens — and how we find it.
        </p>
      </header>

      <Separator className="my-12 sm:my-16" />

      {/* Your Morning */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">Your Morning With The Overnight Edge</h2>
        <div className="p-6 rounded-lg border bg-primary/5 border-primary/20 text-muted-foreground space-y-4">
          <p>
            It's 6:15 AM. You open gammarips.com with your coffee.
          </p>
          <p>
            Three tickers are highlighted — all scored 8+ overnight. One has $14M in new call positioning across 58 strike prices. The AI thesis says it's an agentic AI infrastructure play with earnings in two weeks. Specific contracts are listed. Key support and resistance levels are marked.
          </p>
          <p>
            By 9:25 AM, you know exactly which setups you're watching at the open. Most traders are still scrolling X for tips. You already have the institutional playbook.
          </p>
          <p className="text-primary font-semibold">
            That's The Overnight Edge.
          </p>
        </div>
      </section>

      <Separator className="my-12 sm:my-16" />

      {/* What is UOA */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">What is Unusual Options Activity?</h2>
        <p className="text-muted-foreground">
          Unusual Options Activity (UOA) occurs when options trading volume significantly exceeds normal levels for a particular stock. This can signal that institutional traders — hedge funds, pension funds, or large trading desks — are building new positions.
        </p>
        <p className="text-muted-foreground">
          Key indicators include the <strong className="text-foreground">volume-to-open-interest ratio</strong> (how much new activity is happening vs. existing positions), <strong className="text-foreground">dollar flow</strong> (total capital deployed into a position), and <strong className="text-foreground">directional imbalance</strong> (are they buying calls or puts?).
        </p>
        <p className="text-muted-foreground">
          The Overnight Edge tracks this activity across 5,230+ tickers every night, surfacing the signals that matter most — before the market opens.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      {/* Scoring System */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">Our Scoring System</h2>
        <p className="text-muted-foreground">
          Every signal detected by our scanner is scored from 1 to 10 based on institutional conviction. The score combines four key dimensions:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Positioning Size</h3>
              <p className="text-sm text-muted-foreground mt-1">Total dollar value of new options positions opened overnight. Larger positioning = higher conviction.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Strike Breadth</h3>
              <p className="text-sm text-muted-foreground mt-1">Number of active strike prices with unusual activity. More strikes = broader institutional interest.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Vol/OI Ratio</h3>
              <p className="text-sm text-muted-foreground mt-1">Volume relative to open interest. High ratios indicate fresh positioning, not just existing holders rolling.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Directional Imbalance</h3>
              <p className="text-sm text-muted-foreground mt-1">Call vs. put dollar flow ratio. Strong imbalances signal clear directional bets by institutions.</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-muted-foreground mt-4">
          Signals scoring <strong className="text-foreground">6 or above</strong> are flagged for enrichment — the AI analysis layer that adds context and trade thesis.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      {/* Enrichment Layer */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The Enrichment Layer</h2>
        <p className="text-muted-foreground">
          Raw flow data tells you <em>what</em> happened. Enrichment tells you <em>why it matters</em>.
        </p>
        <p className="text-muted-foreground">
          For every signal scoring 6+, our AI engine generates:
        </p>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4">
          <li><strong className="text-foreground">News Context</strong> — Recent catalysts, earnings, FDA events, macro themes</li>
          <li><strong className="text-foreground">Technical Levels</strong> — Key support/resistance, trend analysis, volume profile</li>
          <li><strong className="text-foreground">Trade Thesis</strong> — AI-generated narrative connecting flow to context</li>
          <li><strong className="text-foreground">Recommended Contracts</strong> — Specific strikes and expiries based on the flow pattern</li>
        </ul>
      </section>

      <Separator className="my-12 sm:my-16" />

      {/* Example Signal */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">Reading a Signal</h2>
        <p className="text-muted-foreground">
          Here&apos;s what a real Overnight Edge signal looks like:
        </p>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold font-headline">FSLY</h3>
                <p className="text-sm text-muted-foreground">Fastly Inc.</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">9/10</p>
                <p className="text-xs text-muted-foreground">Conviction Score</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
              <div className="bg-background rounded p-2">
                <p className="text-muted-foreground">Direction</p>
                <p className="font-bold text-green-400">BULLISH</p>
              </div>
              <div className="bg-background rounded p-2">
                <p className="text-muted-foreground">Move</p>
                <p className="font-bold">+76%</p>
              </div>
              <div className="bg-background rounded p-2">
                <p className="text-muted-foreground">Positioning</p>
                <p className="font-bold">$12.4M</p>
              </div>
              <div className="bg-background rounded p-2">
                <p className="text-muted-foreground">Active Strikes</p>
                <p className="font-bold">58</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              Thesis: Agentic AI infrastructure play — institutions positioning for breakout as edge compute demand accelerates.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12 sm:my-16" />

      {/* Disclaimer */}
      <section>
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold font-headline text-lg">Signal vs. Trade Recommendation</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Overnight Edge signals represent institutional flow data and AI-generated analysis for informational purposes only. They are <strong>not</strong> financial advice or trade recommendations. All trading decisions are yours. We track our signals publicly so you can evaluate accuracy, but past performance does not guarantee future results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12 sm:my-16" />

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold font-headline mb-4">Ready to See Tomorrow Morning's Flow?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/pricing">View Pricing <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/scorecard">Check Our Track Record</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
