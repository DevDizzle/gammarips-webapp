import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Database, Filter, Calculator, GitBranch, ShieldCheck, Code } from 'lucide-react';
import { OG_IMAGE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'GammaRips Methodology — Where every number comes from',
  description:
    "The data sources, the enrichment bar, the selection tournament, and the bracket math behind the GammaRips pool and its validation cohort. Polygon end-of-day options, FRED VIX, BigQuery ledger. Auditable, fully logged, paper-trading only.",
  alternates: { canonical: 'https://gammarips.com/methodology' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'GammaRips Methodology — Where every number comes from',
    description:
      'The enrichment bar, the bracket tournament, and the validation-cohort math behind the GammaRips pool. Auditable and fully logged.',
    url: 'https://gammarips.com/methodology',
  },
};

const dataSources = [
  {
    name: 'Polygon.io',
    purpose: 'End-of-day options chains, volume, open interest, dollar flow, contract metadata across 5,230+ tickers.',
    cadence: 'Pulled at 23:00 ET nightly by overnight-scanner.',
  },
  {
    name: 'FRED (Federal Reserve Economic Data)',
    purpose: 'VIX and VIX3M daily close — used for the term-structure regime gate.',
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
    name: 'overnight_score ≥ 4',
    where: 'enrichment-trigger',
    why: 'Deterministic premium-flow flags (call/put dollar skew, Vol/OI, active strikes, new positioning, price momentum, plus a divergence bonus) sum to a base score, and a sector-cluster boost can lift it — capped at 10. The floor was raised from 1 to 4 on 2026-06-05 to drop the proven-weak low-score dregs. It is a floor, not a ceiling — we deliberately do not cap the top, because the tournament does the discriminating from here.',
  },
  {
    name: 'directional UOA > $500K',
    where: 'enrichment-trigger',
    why: 'Direction-aware unusual options activity. Bullish candidates need call dollar volume above $500K. Below this, flow is too thin to be informative.',
  },
  {
    name: 'BULLISH-only + delta edge-rank to top ~50',
    where: 'enrichment-trigger',
    why: 'A hard bullish gate (since 2026-06-11): only call setups enter the pool. The surviving bullish names are then delta-edge-ranked to the ~50 strongest setups before the tournament.',
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
    why: 'Stop-limit on the contract. The intraday V7 envelope tightens the stop to −30% — on a same-day hold there is no overnight gamma whipsaw to ride out.',
  },
  {
    label: 'Target',
    value: '+40% on option premium',
    why: 'Limit sell. Asymmetric vs. the stop — 4:3 reward/risk in option-premium space. The bracket is a measurement instrument for the validation cohort, not a profitability claim: our own published research shows a fixed bracket applied blindly across the whole pool loses.',
  },
  {
    label: 'Hold',
    value: 'Same trading day',
    why: 'V7 “GIGO” — Get In, Get Out. Enter at the open, take profit or stop intraday, and flatten before the close. Nothing carries overnight.',
  },
  {
    label: 'Exit',
    value: '15:45 ET, same day',
    why: 'If neither stop nor target filled, market sell at 15:45 the same day — before the close-print volatility, after most of the day\'s move is in.',
  },
];

const dontDoList = [
  {
    label: 'No black-box scoring model.',
    detail: 'The selection tournament is an LLM, but it has no learned weights, no rubric, and no memory of past trades — just a simple prompt and a randomized bracket, run three times for consensus. Every candidate is leakage-checked before the model ever sees it.',
  },
  {
    label: 'No model in the execution path.',
    detail: 'The tournament picks the ticker; it never sets the price levels. Entry, the −30% stop, the +40% target, and the same-day exit are fixed code with no model in the loop.',
  },
  {
    label: 'No manual override of the engine.',
    detail: 'Whatever wins the tournament is the pick. No "I\'ve got a feeling" veto, no last-minute swap.',
  },
  {
    label: 'No live execution.',
    detail: 'Every position is paper-traded against the same data feed using the same bracket. The ledger is a forward simulator, not a brokerage.',
  },
  {
    label: 'No track-record marketing pre-30-trades.',
    detail: 'The raw ledger and preliminary aggregates are public from day one, always with sample size attached — but until a cohort has 30 closed paper trades we make no marketing claims from them: no advertised win rate, no Sharpe, no expectancy claims.',
  },
];

const methodologySchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'GammaRips Methodology — Where every number comes from',
  description:
    'The data sources, the enrichment bar, the selection tournament, and the bracket math behind the GammaRips pool. Auditable and fully logged.',
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
            Every threshold, every data source, every step — documented and logged. Selection runs an
            LLM bracket tournament; execution is fixed code. Nothing in the selection path is human-curated,
            and every candidate is leakage-checked. This page is the audit trail.
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
            <h2 className="text-2xl font-bold">The enrichment bar and two safety rails</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            In V7, selection remains the <strong className="text-foreground">BULLISH-only gate plus a
            delta edge-rank to the top ~50 bullish setups</strong>. The old moneyness, open-interest,
            volume, DTE, and V/OI filters were removed on 2026-06-04 — they choked real winners on
            stale scan-time data. The ~50 bullish setups that clear the enrichment bar below and the
            two safety rails go into the tournament; the engine does its discriminating there, not
            with a filter cascade. (Bid/ask spread is no longer shown or
            gated — this Polygon data tier serves no live options quotes, so there is no real spread
            to display.)
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
            Once the enriched pool clears the two safety rails — on a busy day that&apos;s around 50
            bullish candidates — one pick is chosen by a <strong className="text-foreground">randomized
            bracket tournament</strong>. Not a scoring formula, not a human.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <Calculator className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Three independent brackets.</strong> Each one shuffles the ~50-name bullish
                pool into a fresh random order, then reduces it in batches of ≤10: an LLM (Gemini)
                reads each batch and advances the top 2, round after round, until one winner remains
                (≈50 → 10 → 1 per bracket).
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
                <strong>Dead-simple prompt.</strong> Each batch call gets one instruction — make money
                buying a single option and sell it for a profit within one day — plus the daily
                report and a per-contract JSON. No memory, no rubric, no composite weights.
              </span>
            </li>
            <li className="flex gap-3">
              <Calculator className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Fail-closed.</strong> Any error — a timeout, a pick outside the eligible set,
                an all-leakage day — produces no email and a no-trade day. There is no fallback path;
                tournament uptime is the only SLO.
              </span>
            </li>
            <li className="flex gap-3">
              <Calculator className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Live liquidity check.</strong> At selection time (~09:50 ET, just before the
                10:00 paper entry), the engine re-checks each candidate&apos;s live open interest and
                drops any contract too illiquid to actually trade — the validation cohort only
                simulates contracts a real trader could realistically enter and exit at fair prices.
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
            The validation cohort's bracket rules are fixed within a cohort and versioned across eras —
            the live V7 configuration is −30/+40/same-day intraday. The bracket isn't a guess: it came
            out of a sweep across thousands of historical signals.
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
                <strong>Forward paper-trading ledger</strong> — every entry, exit, and outcome lives
                in BigQuery. The whole pool&apos;s outcomes are aggregated into the public Track Record; per-row data is queryable over the MCP.
              </span>
            </li>
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Decision trail</strong> — every change to the strategy (V7 today, and its
                predecessors back to V3) ships with a dated decision document explaining the rationale
                and the evidence.
              </span>
            </li>
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Trace logging</strong> — enrichment, the tournament judge, and
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
            Browse the pool free on the signals page — or connect Claude, ChatGPT, or your own
            agent over MCP and let it query the pool, the opportunity surfaces, and the outcome
            history directly. The methodology on this page ships as playbooks your agent can run.
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
