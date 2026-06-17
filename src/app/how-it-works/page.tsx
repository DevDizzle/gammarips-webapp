import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How GammaRips Works — Overnight Options Scanner, V7 Intraday',
  description: "The scanner ingests overnight institutional options flow across 5,230+ tickers, enriches the standouts, applies a BULLISH-only gate and delta edge-rank to the top ~50 bullish setups, and a randomized bracket tournament picks one bullish call per day. V7 'GIGO' (Get In, Get Out) trades and closes it the same day with pre-set stop and target. Here is the full pipeline — no discretion, no paid-first tier.",
  alternates: { canonical: 'https://gammarips.com/how-it-works' },
  openGraph: {
    title: 'How GammaRips Works — Overnight Options Scanner',
    description: 'Scanned, enriched, tournament-selected: one pick a day across 5,230+ tickers.',
    url: 'https://gammarips.com/how-it-works',
  }
};

export default function HowItWorksPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How GammaRips Works — Overnight Options Scanner, V7 Intraday",
    "description": "Scanned, enriched, tournament-selected: one pick a day across 5,230+ tickers.",
    "image": "https://gammarips.com/og-image.png?v=3",
    "author": { "@type": "Organization", "name": "GammaRips", "url": "https://gammarips.com" },
    "publisher": { "@type": "Organization", "name": "GammaRips", "logo": { "@type": "ImageObject", "url": "https://gammarips.com/og-image.png?v=3" } }
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
          One options trade a day, or none. Scored while you sleep, picked by a bracket tournament, pushed to your phone at 07:30 ET. Here&apos;s the full pipeline.
        </p>
      </header>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">Your morning at 07:30 ET</h2>
        <div className="p-6 rounded-lg border bg-primary/5 border-primary/20 text-muted-foreground space-y-4 leading-relaxed">
          <p>
            At 07:30 ET, one message lands in your phone. Either it&apos;s today&apos;s single pick &mdash; one ticker, one contract, a pre-set &minus;30% stop and +40% target &mdash; or the engine says <em>no trade today</em> and you do nothing. This is V7 &ldquo;GIGO&rdquo; &mdash; Get In, Get Out: one option, traded and closed the same day.
          </p>
          <p>
            At 10:00 ET, you place the trade: buy one contract at market, arm both exit orders, put your phone down. At 15:45 ET the same day, an exit reminder fires if the trade is still open. Close at market, log the outcome, move on &mdash; nothing carries overnight.
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
        <h2 className="text-3xl font-bold font-headline">The enrichment bar</h2>
        <p className="text-muted-foreground leading-relaxed">
          Each night the scanner produces hundreds of raw flow events. A small enrichment bar narrows that list down to the candidates worth a closer look:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Overnight score &ge; 4</h3>
              <p className="text-sm text-muted-foreground mt-1">The scanner&apos;s internal conviction score must clear a floor that combines positioning size, strike breadth, Vol/OI, and directional imbalance. A floor, not a ceiling &mdash; the tournament does the discriminating from here.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Directional UOA &gt; $500K</h3>
              <p className="text-sm text-muted-foreground mt-1">The name-level net directional dollar flow must exceed $500K. Institutional footprint, not single-contract anomalies.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Bullish only</h3>
              <p className="text-sm text-muted-foreground mt-1">Bullish calls only &mdash; a hard gate since 2026-06-11. The pool is then delta-edge-ranked to the ~50 strongest bullish setups.</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-muted-foreground mt-6 leading-relaxed">
          Whatever clears the bar is enriched with news context, technical levels, and a recommended contract &mdash; the ~50 bullish setups are published to <Link href="/signals" className="text-primary hover:underline">/signals</Link>.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">Picking the one trade: the tournament</h2>
        <p className="text-muted-foreground leading-relaxed">
          At 07:30 ET, two <strong className="text-foreground">safety rails</strong> run over the enriched list first &mdash; and they are the only filters left:
        </p>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4 leading-relaxed">
          <li><strong className="text-foreground">No earnings during the hold</strong> &mdash; any ticker reporting earnings the same trading day is dropped. Holding long options through an earnings print is a documented loss pattern.</li>
          <li><strong className="text-foreground">VIX &le; VIX3M</strong> &mdash; the term structure must be in contango. If VIX is above VIX3M (backwardation), the regime gate fails closed and the engine skips the day.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Everything that survives the two rails &mdash; on a busy day around 50 bullish setups &mdash; goes into a <strong className="text-foreground">randomized bracket tournament</strong>:
        </p>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4 leading-relaxed">
          <li><strong className="text-foreground">Three independent brackets.</strong> Each shuffles the pool into a fresh random order and reduces it in batches of ≤10 &mdash; an LLM advances the top 2 from each batch, round after round, until one winner remains.</li>
          <li><strong className="text-foreground">Consensus vote.</strong> The three bracket winners are compared: 3/3 agree &rarr; high confidence, 2/3 &rarr; medium, 1/3 &rarr; low. The consensus ticker is the pick.</li>
          <li><strong className="text-foreground">No memory, no rubric, no weights.</strong> Each batch gets a dead-simple prompt plus the daily report. Every candidate is leakage-checked before the model sees it, and any error fails closed &mdash; no trade rather than a forced one.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Some days the rails eliminate every candidate, the pool is empty, or the tournament fails closed &mdash; and the 07:30 message says <em>no trade today</em>. That&apos;s the correct behavior &mdash; skipping beats forcing a trade.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">Execution rules</h2>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4 leading-relaxed">
          <li><strong className="text-foreground">Entry:</strong> 10:00 ET at market.</li>
          <li><strong className="text-foreground">Stop:</strong> &minus;30% option price.</li>
          <li><strong className="text-foreground">Target:</strong> +40% option price.</li>
          <li><strong className="text-foreground">Hold:</strong> the same trading day &mdash; nothing carries overnight.</li>
          <li><strong className="text-foreground">Exit:</strong> 15:45 ET the same day at market if stop and target both untouched.</li>
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
