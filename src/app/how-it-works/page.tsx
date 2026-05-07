import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How GammaRips Works — Overnight Options Scanner, V5.3 Execution',
  description: 'The scanner ingests overnight institutional options flow across 5,230+ tickers, applies three deterministic gates, and selects one V5.3 pick per day with pre-set stop and target. Here is the full pipeline — no discretion, no paid-first tier.',
  alternates: { canonical: 'https://gammarips.com/how-it-works' },
  openGraph: {
    title: 'How GammaRips Works — Overnight Options Scanner',
    description: 'Mechanical, filtered, single-pick-per-day pipeline across 5,230+ tickers.',
    url: 'https://gammarips.com/how-it-works',
  }
};

export default function HowItWorksPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How GammaRips Works — Overnight Options Scanner, V5.3 Execution",
    "description": "Mechanical, filtered, single-pick-per-day pipeline across 5,230+ tickers.",
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
          How GammaRips Works
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          One V5.3 options trade a day, or none. Scored while you sleep, pushed to your phone at 07:30 ET. Here&apos;s the full pipeline.
        </p>
      </header>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">Your morning at 07:30 ET</h2>
        <div className="p-6 rounded-lg border bg-primary/5 border-primary/20 text-muted-foreground space-y-4 leading-relaxed">
          <p>
            At 07:30 ET, one message lands in your phone. Either it&apos;s today&apos;s single V5.3 pick &mdash; one ticker, one contract, a pre-set &minus;60% stop and +80% target &mdash; or the engine says <em>no trade today</em> and you do nothing.
          </p>
          <p>
            At 10:00 ET, you place the trade: buy one contract at market, arm both GTC exit orders, put your phone down. At 15:50 ET on day-3, an exit reminder fires if the trade is still open. Close at market, log the outcome, move on.
          </p>
          <p className="text-primary font-semibold">
            That&apos;s the whole product. Everything below is how the engine gets to that one message.
          </p>
        </div>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">What is unusual options activity?</h2>
        <p className="text-muted-foreground leading-relaxed">
          Unusual options activity (UOA) occurs when options trading volume significantly exceeds normal levels for a particular stock. It can signal that institutional traders &mdash; hedge funds, pension funds, large trading desks &mdash; are building new positions.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Key indicators include the <strong className="text-foreground">volume-to-open-interest ratio</strong> (fresh activity vs. existing positions), <strong className="text-foreground">dollar flow</strong> (total capital deployed), and <strong className="text-foreground">directional imbalance</strong> (calls vs. puts).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          GammaRips tracks this across 5,230+ tickers every night, then applies deterministic filters to isolate the single highest-conviction setup.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The enrichment gate</h2>
        <p className="text-muted-foreground leading-relaxed">
          Each night the scanner produces hundreds of raw flow events. Three deterministic gates narrow that list down to enrichment-worthy candidates:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Overnight score &ge; 1</h3>
              <p className="text-sm text-muted-foreground mt-1">The scanner&apos;s internal conviction score must clear a minimum floor &mdash; combines positioning size, strike breadth, Vol/OI, and directional imbalance.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Spread &le; 10%</h3>
              <p className="text-sm text-muted-foreground mt-1">The bid-ask spread on the recommended contract must be tight enough to be tradeable at market. Wide spreads on thin contracts are dropped.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Directional UOA &gt; $500K</h3>
              <p className="text-sm text-muted-foreground mt-1">The name-level net directional dollar flow must exceed $500K. Institutional footprint, not single-contract anomalies.</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-muted-foreground mt-6 leading-relaxed">
          Anything that fails any gate is discarded. Whatever survives is enriched with news context, technical levels, and a recommended contract &mdash; that full list is published to <Link href="/signals" className="text-primary hover:underline">/signals</Link>.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">Selecting the one V5.3 pick</h2>
        <p className="text-muted-foreground leading-relaxed">
          At 07:30 ET, the notifier runs a second filter stack over the enriched list and picks <strong className="text-foreground">at most one</strong> contract:
        </p>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4 leading-relaxed">
          <li><strong className="text-foreground">V/OI &gt; 2</strong> &mdash; the day&apos;s flow on that contract must be more than double its standing open interest.</li>
          <li><strong className="text-foreground">Moneyness 5&ndash;15% OTM</strong> &mdash; the recommended contract must sit 5 to 15 percent out-of-the-money, not at-the-money and not deep OTM lottery tickets.</li>
          <li><strong className="text-foreground">VIX &le; VIX3M</strong> &mdash; the term structure must be in contango. If VIX is above VIX3M (backwardation), the regime gate fails closed and the engine skips the day.</li>
          <li><strong className="text-foreground">Deterministic tiebreak</strong> &mdash; when multiple candidates survive, a five-key deterministic ordering picks the same contract every time given the same inputs. No randomness, no human judgment.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Some days the filters eliminate every candidate and the 09:00 message says so. That&apos;s the correct behavior &mdash; skipping beats forcing a trade.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">Execution rules (V5.3)</h2>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4 leading-relaxed">
          <li><strong className="text-foreground">Entry:</strong> 10:00 ET day-1 at market.</li>
          <li><strong className="text-foreground">Stop:</strong> &minus;60% option price, GTC.</li>
          <li><strong className="text-foreground">Target:</strong> +80% option price, GTC.</li>
          <li><strong className="text-foreground">Hold:</strong> up to three sessions.</li>
          <li><strong className="text-foreground">Exit:</strong> 15:50 ET day-3 at market if stop and target both untouched.</li>
          <li><strong className="text-foreground">Conservative tiebreak:</strong> if a single bar touches both stop and target, the stop wins (lower-bound assumption).</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Every closed trade &mdash; winners and losers, counted the same way &mdash; is written to the public paper-trading ledger at <Link href="/scorecard" className="text-primary hover:underline">/scorecard</Link>.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section>
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold font-headline text-lg">Signals vs. trade recommendations</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  GammaRips publishes paper-trading performance and educational content. Every pick and ledger row is the output of a mechanical engine &mdash; not personalized advice. You trade your own account; GammaRips does not manage your money. Past performance does not guarantee future results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12 sm:my-16" />

      <div className="text-center">
        <h2 className="text-2xl font-bold font-headline mb-4">Ready for tomorrow&apos;s 07:30 ET pick?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/pricing">See pricing <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/scorecard">Check the public ledger</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
