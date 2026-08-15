import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { OG_IMAGE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'How GammaRips Works | Overnight Options Scanner, V7 Intraday',
  description:
    "The full pipeline: overnight flow across 3,500+ optionable US stocks, an enrichment bar, a bullish-only gate, and a delta edge-rank down to about 50 setups.",
  alternates: { canonical: 'https://gammarips.com/how-it-works' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'How GammaRips Works | Overnight Options Scanner',
    description: 'Scanned, enriched, curated: 3,500+ optionable US stocks cut to a high-signal bullish pool nightly, validated by a public paper-traded cohort.',
    url: 'https://gammarips.com/how-it-works',
  }
};

export default function HowItWorksPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How GammaRips Works | Overnight Options Scanner, V7 Intraday",
    "description": "Scanned, enriched, curated: 3,500+ optionable US stocks cut to a high-signal bullish pool nightly, validated by a public paper-traded cohort.",
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
          Every night the engine scans 3,500+ optionable US stocks for unusual options flow and curates the firehose down to a small bullish pool: scored, enriched, and checked for hindsight data while you sleep. Here&apos;s the full pipeline, end to end.
        </p>
      </header>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The daily cycle</h2>
        <div className="p-6 rounded-lg border bg-primary/5 border-primary/20 text-muted-foreground space-y-4 leading-relaxed">
          <p>
            <strong className="text-foreground">23:00 ET:</strong> the scanner ingests the day&apos;s institutional options flow across every optionable US equity and scores it. <strong className="text-foreground">Overnight:</strong> the standouts are enriched with news context, technicals, flow dollars, and a recommended contract per name. <strong className="text-foreground">By the open:</strong> the curated bullish pool (~50 names) is live on <Link href="/signals" className="text-primary hover:underline">/signals</Link> and, in structured form, on the MCP for connected agents.
          </p>
          <p>
            <strong className="text-foreground">~09:50 ET:</strong> the safety rails and a live liquidity re-check run, and the engine&apos;s validation cohort selects and paper-trades one setup under fixed mechanical rules (10:00 entry, &minus;30% stop, +40% target, flat by 15:45 ET) so the selection methodology is tested against reality every single market day. That cohort runs privately as a measurement instrument; what&apos;s public is the <em>whole pool&apos;s</em> outcome record on the <Link href="/scorecard" className="text-primary hover:underline">Track Record</Link> page.
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
          Unusual options activity (UOA) occurs when options trading volume significantly exceeds normal levels for a particular stock. It can signal that institutional traders (hedge funds, pension funds, large trading desks) are building new positions.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Key indicators include the <strong className="text-foreground">volume-to-open-interest ratio</strong> (fresh activity vs. existing positions), <strong className="text-foreground">dollar flow</strong> (total capital deployed), and <strong className="text-foreground">directional imbalance</strong> (calls vs. puts).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          GammaRips tracks this across 3,500+ optionable US stocks every night, then curates them to the strongest ~50 setups, the pool your agent reasons over.
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
              <p className="text-sm text-muted-foreground mt-1">The scanner&apos;s internal conviction score must clear a floor that combines positioning size, strike breadth, Vol/OI, and directional imbalance. A floor, not a ceiling: the tournament does the discriminating from here. Decoded in plain English below.</p>
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
              <p className="text-sm text-muted-foreground mt-1">Bullish calls only, a hard gate since 2026-06-11. Survivors are ranked by the research levers: the delta band the study confirmed (contracts in the middle ground, not cheap lottery tickets and not expensive sure things), plus a boost for stocks already moving up. Then a hard cap at the top ~50.</p>
            </CardContent>
          </Card>
        </div>
        <div id="conviction-score" className="mt-6 rounded-lg border bg-card/50 p-5 space-y-3 scroll-mt-24">
          <h3 className="font-bold font-headline text-lg">The conviction score, in plain English</h3>
          <p className="text-sm text-muted-foreground">
            The score is a checklist, not a model. Every night, for every stock, the scanner asks five plain questions about where option money went. Each yes is a point, a strong yes is usually two:
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-outside ml-4">
            <li><strong className="text-foreground">One-sided money.</strong> Option dollars piled onto one side (calls way over puts).</li>
            <li><strong className="text-foreground">New money.</strong> Today&apos;s trading dwarfs the positions already on the books. Fresh bets, not old ones adjusting.</li>
            <li><strong className="text-foreground">Built like an institution.</strong> Buying spread across several strikes, not one lotto ticket.</li>
            <li><strong className="text-foreground">Real size.</strong> At least $500K of new money on that side.</li>
            <li><strong className="text-foreground">The stock moved too.</strong> The price confirmed with a real move on the day.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Small bonuses when smart money bets against the crowd (heavy call buying on a red day) or a whole industry lights up the same direction at once.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Reading it:</strong> 4 or 5 means enough independent evidence to clear the bar. 6 or 7 means most of the checklist fired. 8 to 10 means everything lit up at once. That&apos;s rare, and it often means the story is already public. The score counts evidence of positioning; it&apos;s not a prediction, and higher isn&apos;t automatically better. That&apos;s why 4 is a floor, not a ranking.
          </p>
        </div>
        <p className="text-muted-foreground mt-6 leading-relaxed">
          Whatever clears the bar is enriched with news context, technical levels, and a recommended contract. The ~50 bullish setups are published to <Link href="/signals" className="text-primary hover:underline">/signals</Link>.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The selection tournament</h2>
        <p className="text-muted-foreground leading-relaxed">
          At selection time (~09:50 ET), two <strong className="text-foreground">safety rails</strong> run over the enriched list first, and they are the only filters left:
        </p>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4 leading-relaxed">
          <li><strong className="text-foreground">No earnings during the hold.</strong> Any ticker reporting earnings the same trading day is dropped. Holding options through an earnings report is a documented way to lose money.</li>
          <li><strong className="text-foreground">VIX &le; VIX3M.</strong> Short-term fear must sit at or below long-term fear. If it doesn&apos;t (VIX above VIX3M), the gate fails closed and the engine skips the day.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Everything that survives the two rails (on a busy day around 50 bullish setups) goes into a <strong className="text-foreground">randomized bracket tournament</strong>:
        </p>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4 leading-relaxed">
          <li><strong className="text-foreground">Three independent brackets.</strong> Each shuffles the pool into a fresh random order and reduces it in batches of ≤10; an LLM advances the top 2 from each batch, round after round, until one winner remains.</li>
          <li><strong className="text-foreground">Consensus vote.</strong> The three bracket winners are compared: 3/3 agree &rarr; high confidence, 2/3 &rarr; medium, 1/3 &rarr; low. The consensus ticker is the pick.</li>
          <li><strong className="text-foreground">No memory, no rubric, no weights.</strong> Each batch gets a dead-simple prompt plus the daily report. Every candidate is checked for hindsight data before the model sees it, and any error fails closed: no trade rather than a forced one.</li>
          <li><strong className="text-foreground">Live liquidity check.</strong> At selection time, the engine re-checks each candidate&apos;s live open interest and drops any contract too thinly traded to actually trade. The validation cohort only simulates contracts a real trader could enter and exit at fair prices.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Some days the rails eliminate every candidate, the pool is empty, or the tournament fails closed, and the engine stands down. No forced trade, no fallback. Skipping is correct behavior.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The tournament is also published as a <strong className="text-foreground">methodology playbook on the MCP</strong> (<code className="text-primary text-sm">run_your_own_tournament</code>) so a connected agent can run the same selection pattern against <em>your</em> objective, horizon, and risk tolerance instead of the engine&apos;s fixed one.
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
          <li><strong className="text-foreground">Hold:</strong> the same trading day; nothing carries overnight.</li>
          <li><strong className="text-foreground">Exit:</strong> 15:45 ET the same day at market if stop and target both untouched.</li>
          <li><strong className="text-foreground">Conservative tiebreak:</strong> if a single bar touches both stop and target, the stop wins (lower-bound assumption).</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Every pool candidate (winners and losers, counted the same way) is tracked to its real outcome in the public <Link href="/scorecard" className="text-primary hover:underline">Track Record</Link>; the cohort itself stays private per our no-small-sample-marketing rule. One honest caveat, straight from <Link href="/lab" className="text-primary hover:underline">the Lab</Link>: a fixed bracket like this is a measurement instrument, not a strategy. Our own research shows the same setups produce very different outcomes under different exits. That&apos;s exactly why the MCP ships an exit-rule simulator instead of a rule to copy.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">What is agentic trading, and how do you try it?</h2>
        <p className="text-muted-foreground leading-relaxed">
          Agentic trading means using an AI agent (Claude, ChatGPT, or one you build)
          as your own market analyst instead of following someone else&apos;s calls. You don&apos;t ask
          it for a pick. You give it real data, it reasons over the whole surface (today&apos;s
          pool, how similar setups actually resolved, how stressed the market is),
          and it lays out the picture. The judgment, the sizing, and the trade stay yours.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The catch most people discover the hard way: a chatbot without data will happily improvise.
          Ask a raw model about a ticker&apos;s options flow and you get confident fiction. Its
          knowledge froze months ago and no options-flow data exists in any training set. The fix is
          not a smarter model; it&apos;s a connected one.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Here&apos;s the on-ramp, cheapest step first. <strong className="text-foreground">Step 1 (free,
          no account):</strong> browse <Link href="/signals" className="text-primary hover:underline">today&apos;s
          pool</Link> and the <Link href="/scorecard" className="text-primary hover:underline">Track
          Record</Link> yourself; that&apos;s the same data your agent would reason over.{' '}
          <strong className="text-foreground">Step 2 (free, no card):</strong> point any MCP-capable
          agent at our server&apos;s anonymous tier and let it taste the pool preview, daily reports, and
          methodology playbooks. <strong className="text-foreground">Step 3 (the full data
          layer):</strong> with <Link href="/developers" className="text-primary hover:underline">Agent
          Access</Link>, your agent queries the complete outcome history, opportunity surfaces, and
          exit-rule simulator, and can even run our bracket-tournament selection pattern against
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
                  GammaRips publishes options-flow data, paper-trading performance, and educational content. Every signal and ledger row is the output of a mechanical engine, not personalized advice, and anything your AI agent concludes from the data is your analysis. You trade your own account; GammaRips does not manage your money. Past performance does not guarantee future results.
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
