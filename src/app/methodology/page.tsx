import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Database, Filter, Calculator, GitBranch, ShieldCheck, Code } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GammaRips Methodology — Where every number comes from',
  description:
    'The data sources, gate thresholds, bracket math, and tiebreakers behind every V5.4 pick. Polygon end-of-day options, FRED VIX, BigQuery ledger. Deterministic, reproducible, paper-trading only.',
  alternates: { canonical: 'https://gammarips.com/methodology' },
  openGraph: {
    title: 'GammaRips Methodology — Where every number comes from',
    description:
      'The data sources, gate thresholds, bracket math, and tiebreakers behind every V5.4 pick. Deterministic and reproducible.',
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
    cadence: 'Pulled at signal-decision time (07:30 ET) by signal-notifier.',
  },
  {
    name: 'BigQuery (`profitscout-fida8.profit_scout`)',
    purpose: 'Canonical storage for overnight signals, enriched signals, the forward paper-trading ledger, and signal performance outcomes.',
    cadence: 'Written by every service in the pipeline; queries reproducible from any timestamp.',
  },
];

const gates = [
  {
    name: 'overnight_score ≥ 1',
    where: 'enrichment-trigger',
    why: 'Five deterministic premium-flow flags. A score of 1 means at least one flag fired — minimum quality threshold for any candidate to enter the daily pool.',
  },
  {
    name: 'spread ≤ 8%',
    where: 'enrichment-trigger',
    why: 'Bid/ask spread relative to mid. Anything wider than 8% gets cleared at the wrong end and ruins the bracket math. Hard cap (tightened from 10% on 2026-06-02).',
  },
  {
    name: 'directional UOA > $500K',
    where: 'enrichment-trigger',
    why: 'Direction-aware unusual options activity. Bullish picks need call dollar volume above $500K; bearish picks need put dollar volume above $500K. Below this, flow is too thin to be informative.',
  },
  {
    name: '5–13% out-of-the-money',
    where: 'signal-notifier',
    why: 'Moneyness band. Closer than 5% OTM is closer-to-ATM and behaves more like delta-1 stock; further than 13% OTM is too lottery-ticket. The 5–13% band is the gamma-sensitive zone V5.4 targets (cap widened from 10% on 2026-06-02).',
  },
  {
    name: 'VIX ≤ VIX3M (no backwardation)',
    where: 'signal-notifier',
    why: 'Term-structure regime gate. When 30-day VIX exceeds 90-day VIX3M, the market is pricing acute near-term stress and directional options trades degrade. Skip the day.',
  },
  {
    name: 'LIMIT 1, deterministic tiebreaker',
    where: 'signal-notifier',
    why: '4-key cascade: overnight_score → open interest → tighter spread → alphabetical ticker. Same inputs, same output. No "best of three" judgment calls. (Re-ranked 2026-06-02 to drop V/OI, which realized-PnL analysis showed had no selection value.)',
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
    value: '−60% on option premium',
    why: 'GTC stop-limit on the contract. Bracket-sweep research showed −60% beats tighter stops on 3-day holds because gamma whipsaw kills tighter exits.',
  },
  {
    label: 'Target',
    value: '+80% on option premium',
    why: 'GTC limit sell. Asymmetric vs. the stop — 4:3 reward/risk in option-premium space, which after delta and gamma typically translates to a positive expected value at modest hit rate.',
  },
  {
    label: 'Hold',
    value: '3 trading days',
    why: 'Long enough for the directional flow thesis to play out, short enough to avoid theta decay dominating.',
  },
  {
    label: 'Exit',
    value: '15:50 ET, day 3',
    why: 'If neither stop nor target filled, market sell at 15:50 — before the close-print volatility, after most of the day\'s move is in.',
  },
];

const dontDoList = [
  {
    label: 'No LLMs in pricing decisions.',
    detail: 'Gemini powers webapp text and editorial blog posts. Never trade selection. Selection is deterministic SQL + Python.',
  },
  {
    label: 'No manual override of the engine.',
    detail: 'Whatever clears all gates is the pick. No "I\'ve got a feeling" veto, no last-minute swap.',
  },
  {
    label: 'No live execution.',
    detail: 'Every position is paper-traded against the same data feed using the same bracket. The ledger is a forward simulator, not a brokerage.',
  },
  {
    label: 'No track-record marketing pre-30-trades.',
    detail: 'Until V5.4 has 30 closed paper trades the engine ships methodology only. No win rate, no Sharpe, no expectancy claims.',
  },
];

const methodologySchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'GammaRips Methodology — Where every number comes from',
  description:
    'The data sources, gate thresholds, bracket math, and tiebreakers behind every V5.4 pick. Deterministic and reproducible.',
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
            Every threshold, every data source, every tiebreaker — documented. The GammaRips engine is
            deterministic: same inputs produce the same output, every time. This page is the audit
            trail.
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
            <h2 className="text-2xl font-bold">The V5.4 gate stack</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Six deterministic checks, applied in order. A signal that fails any one gate is
            discarded. On a typical morning, ~40% of trading days produce zero picks because nothing
            clears all six.
          </p>
          <div className="space-y-4">
            {gates.map((gate, i) => (
              <Card key={gate.name}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-bold text-primary shrink-0 w-8">{i + 1}.</span>
                    <div className="flex-1">
                      <h3 className="font-mono text-sm font-bold mb-1">{gate.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Applied in <code className="text-xs">{gate.where}</code>
                      </p>
                      <p className="text-sm">{gate.why}</p>
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
            <Calculator className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">The bracket math</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Every V5.4 pick ships with the same execution rules. The bracket isn't a guess — it
            came out of a sweep across thousands of historical signals where a −60/+80/3-day
            envelope was the highest-EV configuration tested.
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
                in BigQuery. The same row is rendered into the public scorecard.
              </span>
            </li>
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Decision trail</strong> — every change to V5.4 (or its predecessors V3, V4)
                ships with a dated decision document explaining the rationale and the evidence.
              </span>
            </li>
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong>Trace logging</strong> — enrichment, agent-arena, and overnight-report-generator
                each write structured trace rows so a downstream auditor can reconstruct any
                specific morning's reasoning end-to-end.
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
          <h2 className="text-2xl font-bold mb-3">Want the daily pick delivered?</h2>
          <p className="text-muted-foreground mb-6">
            Browse the haystack on the signals page free, or get the curated single V5.4 pick
            delivered to your inbox + private WhatsApp group at 07:30 ET each weekday.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild>
              <Link href="/pricing">
                See pricing <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signals">Browse free signals</Link>
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
