import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How GammaRips Works — Overnight Options Scanner, V7 Intraday',
  description: "The scanner ingests overnight institutional options flow across 5,230+ tickers, enriches the standouts, and applies a BULLISH-only gate and delta edge-rank to curate the top ~50 bullish setups. A paper-traded validation cohort tests the selection methodology daily under fixed rules. Humans browse the pool free; AI agents get the full data layer over MCP. Here is the full pipeline — no discretion, no black box.",
  alternates: { canonical: 'https://gammarips.com/how-it-works' },
  openGraph: {
    title: 'How GammaRips Works — Overnight Options Scanner',
    description: 'Scanned, enriched, curated: 5,230+ tickers cut to a high-signal bullish pool nightly, validated by a public paper-traded cohort.',
    url: 'https://gammarips.com/how-it-works',
  }
};

export default function HowItWorksPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How GammaRips Works — Overnight Options Scanner, V7 Intraday",
    "description": "Scanned, enriched, curated: 5,230+ tickers cut to a high-signal bullish pool nightly, validated by a public paper-traded cohort.",
    "image": "https://gammarips.com/og-image.png?v=3",
    "author": { "@type": "Organization", "name": "GammaRips", "url": "https://gammarips.com" },
    "publisher": { "@type": "Organization", "name": "GammaRips", "logo": { "@type": "ImageObject", "url": "https://gammarips.com/og-image.png?v=3" } }
  };

  return (
    <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Learn</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
          How GammaRips Works
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Every night the engine scans 5,230+ tickers for unusual options flow and curates the firehose down to a small bullish pool &mdash; scored, enriched, and leakage-checked while you sleep. Here&apos;s the full pipeline, end to end.
        </p>
      </header>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The daily cycle</h2>
        <div className="p-6 rounded-lg border bg-primary/5 border-primary/20 text-muted-foreground space-y-4 leading-relaxed">
          <p>
            <strong className="text-foreground">23:00 ET</strong> &mdash; the scanner ingests the day&apos;s institutional options flow across every optionable US equity and scores it. <strong className="text-foreground">Overnight</strong> &mdash; the standouts are enriched: news context, technicals, flow dollars, a recommended contract per name. <strong className="text-foreground">By the open</strong> &mdash; the curated bullish pool (~50 names) is live on <Link href="/signals" className="text-primary hover:underline">/signals</Link> and, in structured form, on the MCP for connected agents.
          </p>
          <p>
            <strong className="text-foreground">~09:50 ET</strong> &mdash; the safety rails and a live liquidity re-check run, and the engine&apos;s validation cohort selects and paper-trades one setup under fixed mechanical rules (10:00 entry, &minus;30% stop, +40% target, flat by 15:45 ET) so the selection methodology is tested against reality every single market day. That cohort runs privately as a measurement instrument; what&apos;s public is the <em>whole pool&apos;s</em> outcome record on the <Link href="/scorecard" className="text-primary hover:underline">Track Record</Link> page.
          </p>
          <p className="text-primary font-semibold">
            The product is the data layer: the pool, the surfaces, and the methodology. Everything below is how it&apos;s built.
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
        <h2 className="text-3xl font-bold font-headline">The selection tournament</h2>
        <p className="text-muted-foreground leading-relaxed">
          At selection time (~09:50 ET), two <strong className="text-foreground">safety rails</strong> run over the enriched list first &mdash; and they are the only filters left:
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
          <li><strong className="text-foreground">Live liquidity check.</strong> At selection time, the engine re-checks each candidate&apos;s live open interest and drops any contract too illiquid to actually trade &mdash; the validation cohort only simulates contracts a real trader could enter and exit at fair prices.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Some days the rails eliminate every candidate, the pool is empty, or the tournament fails closed &mdash; and the engine stands down. No forced trade, no fallback. Skipping is correct behavior.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The tournament is also published as a <strong className="text-foreground">methodology playbook on the MCP</strong> &mdash; <code className="text-primary text-sm">run_your_own_tournament</code> &mdash; so a connected agent can run the same selection pattern against <em>your</em> objective, horizon, and risk tolerance instead of the engine&apos;s fixed one.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The validation cohort&apos;s execution rules</h2>
        <p className="text-muted-foreground leading-relaxed">
          The paper-traded cohort runs one deliberately rigid exit bracket, so the selection
          methodology is measured under fixed, unfudgeable rules:
        </p>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4 leading-relaxed">
          <li><strong className="text-foreground">Entry:</strong> 10:00 ET at market.</li>
          <li><strong className="text-foreground">Stop:</strong> &minus;30% option price.</li>
          <li><strong className="text-foreground">Target:</strong> +40% option price.</li>
          <li><strong className="text-foreground">Hold:</strong> the same trading day &mdash; nothing carries overnight.</li>
          <li><strong className="text-foreground">Exit:</strong> 15:45 ET the same day at market if stop and target both untouched.</li>
          <li><strong className="text-foreground">Conservative tiebreak:</strong> if a single bar touches both stop and target, the stop wins (lower-bound assumption).</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Every pool candidate &mdash; winners and losers, counted the same way &mdash; is tracked to its realized outcome in the public <Link href="/scorecard" className="text-primary hover:underline">Track Record</Link>; the cohort itself stays private per our no-small-sample-marketing rule. One honest caveat, straight from <Link href="/lab" className="text-primary hover:underline">the Lab</Link>: a fixed bracket like this is a measurement instrument, not a strategy &mdash; our own research shows the same setups produce very different outcomes under different exits. That&apos;s exactly why the MCP ships an exit-rule simulator instead of a rule to copy.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">What is agentic trading &mdash; and how do you try it?</h2>
        <p className="text-muted-foreground leading-relaxed">
          Agentic trading means using an AI agent &mdash; Claude, ChatGPT, or one you build &mdash;
          as your own market analyst instead of following someone else&apos;s calls. You don&apos;t ask
          it for a pick. You give it real data, it reasons over the whole surface &mdash; today&apos;s
          pool, how similar setups actually resolved, what the volatility regime looks like &mdash;
          and it hands you a decision surface. The judgment, the sizing, and the trade stay yours.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The catch most people discover the hard way: a chatbot without data will happily improvise.
          Ask a raw model about a ticker&apos;s options flow and you get confident fiction &mdash; its
          knowledge froze months ago and no options-flow data exists in any training set. The fix is
          not a smarter model; it&apos;s a connected one.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Here&apos;s the on-ramp, cheapest step first. <strong className="text-foreground">Step 1 — free,
          no account:</strong> browse <Link href="/signals" className="text-primary hover:underline">today&apos;s
          pool</Link> and the <Link href="/scorecard" className="text-primary hover:underline">Track
          Record</Link> yourself; that&apos;s the same data your agent would reason over.{' '}
          <strong className="text-foreground">Step 2 &mdash; free, no card:</strong> point any MCP-capable
          agent at our server&apos;s anonymous tier and let it taste the pool preview, daily reports, and
          methodology playbooks. <strong className="text-foreground">Step 3 &mdash; the full data
          layer:</strong> with <Link href="/developers" className="text-primary hover:underline">Agent
          Access</Link>, your agent queries the complete outcome history, opportunity surfaces, and
          exit-rule simulator &mdash; and can even run our bracket-tournament selection pattern against
          your own objective. Setup for all three takes minutes, and the{' '}
          <Link href="/developers" className="text-primary hover:underline">For Your Agent</Link> page
          walks you through it.
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
                  GammaRips publishes options-flow data, paper-trading performance, and educational content. Every signal and ledger row is the output of a mechanical engine &mdash; not personalized advice &mdash; and anything your AI agent concludes from the data is your analysis. You trade your own account; GammaRips does not manage your money. Past performance does not guarantee future results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12 sm:my-16" />

      <div className="text-center">
        <h2 className="text-2xl font-bold font-headline mb-4">Put an agent on tomorrow&apos;s pool</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/developers">Connect your agent <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/scorecard">See the Track Record</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
