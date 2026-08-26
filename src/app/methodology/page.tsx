import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Database, Filter, Calculator, GitBranch, ShieldCheck, Code } from 'lucide-react';
import { OG_IMAGE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'GammaRips Methodology: Where every number comes from',
  description:
    "How the pool is built: a nightly liquidity rank of about 3,500 optionable US names, cut to roughly 40-50 bullish calls. Polygon options, FRED VIX. Paper-trading, educational only. Not investment advice.",
  alternates: { canonical: 'https://gammarips.com/methodology' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'GammaRips Methodology: Where every number comes from',
    description:
      'The liquidity rule, the two safety rails, and the same-day paper bracket behind the GammaRips pool. Auditable and fully logged.',
    url: 'https://gammarips.com/methodology',
  },
};

const dataSources = [
  {
    name: 'Polygon.io',
    purpose: 'End-of-day options chains, volume, open interest, dollar flow, contract metadata across about 3,500 optionable US stocks.',
    cadence: 'Pulled at 23:00 ET nightly by overnight-scanner.',
  },
  {
    name: 'FRED (Federal Reserve Economic Data)',
    purpose: 'VIX and VIX3M daily close, used for the term-structure regime gate.',
    cadence: 'Pulled at signal-decision time (~09:50 ET, just before the 10:00 entry) by signal-notifier.',
  },
  {
    name: 'BigQuery (`profitscout-fida8.profit_scout`)',
    purpose: 'Canonical storage for overnight signals, enriched signals, the forward paper-trading ledger, and signal performance outcomes.',
    cadence: 'Written by every service in the pipeline; queries reproducible from any timestamp.',
  },
];

const filters = [
  {
    name: 'liquid universe: 3M+ shares, 25+ listed strikes, top 100 by z(chain $ volume) + z(share volume)',
    where: 'overnight-scanner',
    why: 'This is the gate that does the work, and it selects on tradeability rather than on unusual activity. A name must have traded 3M+ shares that session and carry a chain with 25 or more listed strikes, then the top 100 by combined chain dollar volume and share volume survive. Live since 2026-08-24. The $500K directional-UOA floor it replaced was dropped in the same change: inside a liquid universe every name already carries heavy flow, so the floor stopped selecting and only thinned the pool. Open interest is deliberately not an input, because no OI history exists in this stack and ranking on the current snapshot would be lookahead.',
  },
  {
    name: 'overnight_score ≥ 1',
    where: 'enrichment-trigger',
    why: 'Deterministic premium-flow flags (call/put dollar skew, Vol/OI, active strikes, new positioning, price momentum, plus a divergence bonus) sum to a base score, and a sector-cluster boost can lift it, capped at 10. The floor is 1 and it is cosmetic: nearly every name in the liquid universe already clears it. On its own the score barely predicts outcomes, so we do not filter harder on it. Flow orders the pool; it no longer decides membership.',
  },
  {
    name: 'BULLISH-only, one out-of-the-money call per name',
    where: 'enrichment-trigger',
    why: 'A hard bullish gate (since 2026-06-11): only call setups enter the pool. One out-of-the-money call is priced per surviving name, chosen on contract liquidity. The cap of 50 does not currently bind, so the pool is simply every bullish name in the top-100 liquid universe: there is no hidden ranking deciding membership. Note that we surface the most liquid NAMES and then choose a contract inside each, not the most liquid contracts in the market, which would be the same index products every day. Why bullish only: on a 3-day +80/−60 bracket replay of the pre-2026-08-25 pool (N=1,375 fills), the bearish arm measured worse than the bullish one. That is the reason the gate exists, not a signal the funnel acts on. The pool no longer carries a bearish arm, so the comparison cannot be re-run inside it.',
  },
  {
    name: 'no earnings during the same-day hold',
    where: 'signal-notifier · safety rail',
    why: 'Exclude any ticker reporting earnings inside the hold window. Holding long single-leg options through an earnings print is a documented loss pattern (De Silva et al. 2026, Review of Finance; Cao & Han 2013, JFE). Fail-closed if the earnings calendar is unreachable.',
  },
  {
    name: 'VIX ≤ VIX3M (no backwardation)',
    where: 'signal-notifier · safety rail',
    why: 'Term-structure regime gate. When 30-day VIX exceeds 90-day VIX3M, the market is pricing acute near-term stress and directional long-premium trades degrade. Skip the entire day. Fail-closed if either value is missing.',
  },
];

const bracketRules = [
  {
    label: 'Entry',
    value: '10:00 ET, day 1',
    why: 'After the open settles, before midday drift. Buy 1 contract at market.',
  },
  {
    label: 'Stop',
    value: '−30% on option premium',
    why: 'Stop-limit on the contract. The intraday V7 envelope tightens the stop to −30%. On a same-day hold there is no overnight gamma whipsaw to ride out.',
  },
  {
    label: 'Target',
    value: '+40% on option premium',
    why: 'Limit sell. Asymmetric against the stop, 4:3 reward/risk in option-premium space. The bracket is a measurement instrument for the paper cohort, not a profitability claim. Our own published research, measured on the pre-2026-08-25 pool, shows a fixed bracket applied blindly across the whole pool loses.',
  },
  {
    label: 'Hold',
    value: 'Same trading day',
    why: 'V7 “GIGO”: Get In, Get Out. Enter at the open, take profit or stop intraday, and flatten before the close. Nothing carries overnight.',
  },
  {
    label: 'Exit',
    value: '15:45 ET, same day',
    why: 'If neither stop nor target filled, market sell at 15:45 the same day, before the close-print volatility and after most of the day\'s move is in.',
  },
];

const dontDoList = [
  {
    label: 'No black-box scoring model.',
    detail: 'The selection tournament is an LLM, but it has no learned weights, no rubric, and no memory of past trades, just a simple prompt and a randomized bracket, run three times for consensus. Every candidate is leakage-checked before the model ever sees it.',
  },
  {
    label: 'No model in the execution path.',
    detail: 'The tournament picks the ticker; it never sets the price levels. Entry, the −30% stop, the +40% target, and the same-day exit are fixed code with no model in the loop.',
  },
  {
    label: 'No manual override of the engine.',
    detail: 'Whatever wins the tournament is what the cohort tracks. No "I\'ve got a feeling" veto, no last-minute swap.',
  },
  {
    label: 'No live execution.',
    detail: 'Every position is paper-traded against the same data feed using the same bracket. The ledger is a forward simulator, not a brokerage.',
  },
  {
    label: 'No track-record marketing pre-30-trades.',
    detail: 'The raw ledger and preliminary aggregates are public from day one, always with sample size attached. But until a cohort has 30 closed paper trades we make no marketing claims from them: no advertised win rate, no Sharpe, no expectancy claims.',
  },
];

const methodologySchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'GammaRips Methodology: Where every number comes from',
  description:
    'The data sources, the liquidity rule, the two safety rails, and the same-day paper bracket behind the GammaRips pool. Auditable and fully logged.',
  url: 'https://gammarips.com/methodology',
  publisher: {
    '@type': 'Organization',
    name: 'GammaRips',
    logo: { '@type': 'ImageObject', url: 'https://gammarips.com/og-image.png?v=3' },
  },
};

export default function MethodologyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(methodologySchema) }}
      />
      <main className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <header className="mb-12">
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Methodology</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Where every number in our engine comes from.
          </h1>
          <p className="text-lg text-muted-foreground">
            Every threshold, every data source, every step is documented and logged. Pool
            membership is a liquidity rule, not a ranking. Execution is fixed code. Nothing in
            the path is human-curated, and every candidate is leakage-checked. This page is the
            audit trail.
          </p>
        </header>

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Data sources</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Three external systems feed every decision the engine makes. None are proprietary; the
            same data is available to anyone with API access.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dataSources.map((src) => (
              <Card key={src.name}>
                <CardHeader>
                  <CardTitle className="text-base">{src.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>{src.purpose}</p>
                  <p className="text-xs italic">{src.cadence}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">The liquidity rule and two safety rails</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Membership is a <strong className="text-foreground">liquidity rule, not a
            ranking</strong>. Every name in the top-100 liquid universe that reads bullish enters
            the pool. The cap of 50 does not currently bind, so no hidden ranking decides who is
            in. The pool runs roughly 40 to 50 names and it floats with the market, so a down day
            gives a smaller pool. The old moneyness, open-interest, volume, DTE, and V/OI filters
            were removed on 2026-06-04. They choked real winners on stale scan-time data. Bid/ask
            spread is no longer shown or gated, because this Polygon data tier serves no live
            options quotes.
          </p>
          <div className="space-y-4">
            {filters.map((filter, i) => (
              <Card key={filter.name}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-bold text-primary shrink-0 w-8">{i + 1}.</span>
                    <div className="flex-1">
                      <h3 className="font-mono text-sm font-bold mb-1">{filter.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Applied in <code className="text-xs">{filter.where}</code>
                      </p>
                      <p className="text-sm">{filter.why}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <GitBranch className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">The selection tournament</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            The pool that clears the two safety rails runs roughly 40 to 50 bullish candidates.
            The paper cohort tracks one of them per day, chosen by a{' '}
            <strong className="text-foreground">randomized bracket tournament</strong>. Not a
            scoring formula, not a human. That result is not published and there is no pick
            endpoint. Two pre-registered studies on 2026-08-22 measured the pool as
            indistinguishable from matched random contracts, so read the tournament as how the
            cohort chooses one position to track, not as evidence of a selection edge.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <Calculator className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Three independent brackets.</strong> Each one shuffles the bullish pool
                into a fresh random order, then reduces it in batches of ≤10: an LLM (Gemini)
                reads each batch and advances the top 2, round after round, until one winner
                remains (about 45 → 10 → 1 per bracket).
              </span>
            </li>
            <li className="flex gap-3">
              <Calculator className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Consensus vote.</strong> The three bracket winners are compared. 3/3 agreement
                → high confidence, 2/3 → medium, 1/3 → low. The consensus ticker is the pick.
              </span>
            </li>
            <li className="flex gap-3">
              <Calculator className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Dead-simple prompt.</strong> Each batch call gets one instruction, quoted
                verbatim from the prompt: make money buying a single option and sell it for a
                profit within one day. It also gets the daily report and a per-contract JSON. No
                memory, no rubric, no composite weights.
              </span>
            </li>
            <li className="flex gap-3">
              <Calculator className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Fail-closed.</strong> Any error (a timeout, a pick outside the eligible set,
                an all-leakage day) produces no email and a no-trade day.
              </span>
            </li>
            <li className="flex gap-3">
              <Calculator className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Live liquidity check.</strong> At selection time (~09:50 ET, just before
                the 10:00 paper entry), the engine re-checks each candidate&apos;s live open
                interest and recent print activity, then drops any contract that reads too thin.
                It fails closed, and a dropped candidate never comes back. The cohort should not
                simulate a fill nobody could have gotten.
              </span>
            </li>
          </ul>
          <p className="text-muted-foreground mt-6">
            Every candidate is leakage-checked before it can enter a bracket: the judge never sees
            anything that wasn&apos;t known at scan time.
          </p>
        </section>

        <Separator className="my-12" />

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">The bracket math</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            The paper cohort&apos;s bracket is fixed within a cohort and versioned across eras. The
            live V7.1 configuration is a same-day envelope: −30% stop, +40% target, flat at 15:45
            ET. It is not a guess. It came out of a bracket sweep across thousands of historical
            signals, measured on the pre-2026-08-25 pool. It is a measurement instrument, not a
            recommended exit. Your agent picks its own hold.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bracketRules.map((rule) => (
              <Card key={rule.label}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                    {rule.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold mb-2">{rule.value}</p>
                  <p className="text-sm text-muted-foreground">{rule.why}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <GitBranch className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Reproducibility</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            The full pipeline is open-architecture. Every artifact is auditable.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Forward paper-trading ledger</strong>: every entry, exit, and outcome lives
                in BigQuery. The whole pool&apos;s outcomes are aggregated into the public Track Record; per-row data is queryable over the MCP.
              </span>
            </li>
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Decision trail</strong>: every change to the strategy (V7 today, and its
                predecessors back to V3) ships with a dated decision document explaining the rationale
                and the evidence.
              </span>
            </li>
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Trace logging</strong>: enrichment, the tournament judge, and
                overnight-report-generator each write structured trace rows so a downstream auditor can
                reconstruct any specific morning's reasoning end-to-end, including every bracket round.
              </span>
            </li>
          </ul>
        </section>

        <Separator className="my-12" />

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">What this engine does NOT do</h2>
          </div>
          <div className="space-y-4">
            {dontDoList.map((item) => (
              <Card key={item.label}>
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        <section className="text-center">
          <h2 className="text-2xl font-bold mb-3">Want your agent working this methodology?</h2>
          <p className="text-muted-foreground mb-6">
            Browse the pool free on the signals page, or connect your agent over MCP and let it
            query the pool, the 3-day opportunity surfaces (realized MFE and MAE), and the outcome
            history directly. The paid tools run in Claude Code, Codex, Cursor, Gemini CLI, and any
            client that can send a bearer key. The methodology on this page ships as playbooks your
            agent can run.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild>
              <Link href="/developers">
                Connect your agent <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signals">Browse the free pool</Link>
            </Button>
          </div>
        </section>

        <p className="text-xs text-muted-foreground text-center mt-16">
          Paper-trading performance, educational only. Not investment advice. Past performance is
          not a guarantee of future results.
        </p>
      </main>
    </>
  );
}
