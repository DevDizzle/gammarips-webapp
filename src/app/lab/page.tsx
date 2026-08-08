import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlaskConical } from 'lucide-react';
import { OG_IMAGE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'The Lab — Published Experiments',
  description:
    'GammaRips runs experiments on its own options-flow data substrate and publishes the results — hypothesis, method, sample size, verdict — including the ideas that got killed. Transparency into how the pool is curated.',
  alternates: { canonical: 'https://gammarips.com/lab' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'The Lab — Published Experiments | GammaRips',
    description:
      'Hypothesis, method, N, verdict — including the killed ideas. How the GammaRips pool methodology earns its keep, in public.',
    url: 'https://gammarips.com/lab',
  },
};

type Verdict = 'CONFIRMED' | 'KILLED' | 'CONDITIONAL';

// Seed entries, hardcoded for launch. Same shape as a future Firestore
// `lab_findings` collection so migration is a data move, not a rewrite.
const findings: {
  slug: string;
  title: string;
  verdict: Verdict;
  hypothesis: string;
  method: string;
  result: string;
  changed: string;
  mcp: string;
}[] = [
  {
    slug: 'naive-pool-baseline',
    title: 'Buying the whole pool blindly is profitable',
    verdict: 'KILLED',
    hypothesis:
      'The curated pool is high-signal — so mechanically buying every contract in it each morning, under one fixed exit rule, should be profitable.',
    method:
      'Daily bracket replay of the full enriched pool (not just selected names) under the fixed same-day exit, logged to the outcome substrate. Composite tracked across the full labeled window.',
    result:
      'Robustly negative — a composite on the order of −2 to −6% per contract per day depending on window, with a win rate around 30%. The excursion data shows real winners inside the pool; the fixed exit and the blind sizing destroy them in aggregate.',
    changed:
      'This finding shaped the product. We do not publish a "buy the pool" index, we do not sell picks, and we tell you on the homepage that blind buying loses. The pool is a surface for analysis — the edge lives in selection and exits.',
    mcp: 'Reproduce it: query_outcomes(view="labels") + query_outcomes(view="summary") over any window you like.',
  },
  {
    slug: 'delta-separates-outcomes',
    title: 'Contract delta separates winners from losers',
    verdict: 'CONFIRMED',
    hypothesis:
      'Some observable, point-in-time contract feature distinguishes trades that ended up winning from those that lost.',
    method:
      'Feature-by-feature comparison of won vs. lost trades on 1,375 historically labeled trades (realized option P&L, not underlying moves), with leakage-checked, as-of-scan-time features only.',
    result:
      'Delta was the only feature that cleanly separated the two groups. A mid-delta band (roughly |delta| 0.20–0.46) concentrated the favorable outcomes; scores, narrative features, and volume statistics did not separate.',
    changed:
      'The delta band became a live ranking lever in pool curation. It is also why the data layer exposes per-contract feature vectors — the lever is only usable if you can see delta at selection time.',
    mcp: 'Reproduce it: get_pool(view="features") + query_outcomes, group by delta bucket.',
  },
  {
    slug: 'voloi-gates-remove-winners',
    title: 'Volume/OI liquidity gates improve the pool',
    verdict: 'KILLED',
    hypothesis:
      'Filtering candidates on scan-time volume-to-open-interest and open-interest floors should remove junk and improve pool quality.',
    method:
      'Backtested the gate stack against the labeled outcome set; audited which historical winners each gate would have excluded.',
    result:
      'The gates removed real winners. Root cause: scan-time open interest is stale — the overnight sweep that makes a name interesting only becomes visible OI the next morning, so the filter punished exactly the fresh-flow setups the scanner exists to find.',
    changed:
      'The selection-time V/OI and OI gates were removed (2026-06-04). Liquidity is now handled where it is actually knowable: fresh open interest near the open, not stale snapshots at scan time.',
    mcp: 'Reproduce it: get_playbook(name="schema") documents which fields are stale-by-construction and how they are walled off.',
  },
  {
    slug: 'momentum-exit-conditional',
    title: '60-day momentum adds edge to the delta band',
    verdict: 'CONDITIONAL',
    hypothesis:
      'Underlying 60-day momentum (mom_60 ≥ +0.35), stacked on the mid-delta band, beats the bullish-pool baseline.',
    method:
      'Cohort comparison on the labeled study set across exit styles: the live same-day bracket exit vs. a 3-day hold. Point-in-time momentum only; forward validation arm accruing before the lever graduates.',
    result:
      'Real but exit-conditional: the momentum-stacked cohort beats baseline under a 3-day hold and shows no detectable edge under the same-day exit. Same signal, different exit, opposite conclusion — exits are not a detail.',
    changed:
      'Momentum is used as a soft pre-rank tilt in curation, not a hard gate, and we are accruing an independent forward sample before claiming more. Published here precisely because it is fragile — that is what honest research status looks like.',
    mcp: 'Reproduce it: query_outcomes(view="exit_rule", target_pct=, stop_pct=) with your own target/stop/horizon, then query_outcomes(view="summary") grouped by momentum.',
  },
];

const verdictStyles: Record<Verdict, string> = {
  CONFIRMED: 'bg-green-500/15 text-green-500 border-green-500/30',
  KILLED: 'bg-red-500/15 text-red-500 border-red-500/30',
  CONDITIONAL: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
};

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'The Lab — GammaRips Published Experiments',
  description:
    'Experiments run on the GammaRips options-flow data substrate, published with hypothesis, method, sample size, and verdict — including the killed ideas.',
  url: 'https://gammarips.com/lab',
  publisher: {
    '@type': 'Organization',
    name: 'GammaRips',
    logo: { '@type': 'ImageObject', url: 'https://gammarips.com/icon.png' },
  },
};

export default function LabPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <main className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="h-5 w-5 text-primary" />
            <p className="text-sm uppercase tracking-wider text-muted-foreground">The Lab</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight mb-4">
            We publish our experiments. Including the dead ones.
          </h1>
          <p className="text-lg text-muted-foreground">
            Every finding below was produced on the engine&apos;s own data
            substrate — point-in-time, leakage-checked, with the sample size
            and conditions attached. This is the research that shapes how the
            pool is curated. When a hypothesis dies, it stays on this page
            with a verdict, because a methodology you can&apos;t audit is a
            story, not a method.
          </p>
        </header>

        <div className="space-y-6 mb-16">
          {findings.map((f) => (
            <Card key={f.slug} id={f.slug}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <h2 className="text-xl font-bold">{f.title}</h2>
                  <Badge variant="outline" className={verdictStyles[f.verdict]}>
                    {f.verdict}
                  </Badge>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    <span className="font-semibold text-foreground">Hypothesis. </span>
                    {f.hypothesis}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Method. </span>
                    {f.method}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Result. </span>
                    {f.result}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">What changed. </span>
                    {f.changed}
                  </p>
                  <p className="text-xs font-mono text-primary/90 pt-1">{f.mcp}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="text-center space-y-4 border rounded-lg p-8 bg-card/50">
          <h2 className="text-2xl font-bold font-headline">
            Your agent can run these same queries
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Every experiment on this page was run against the same substrate
            the MCP serves: the labeled outcome database, opportunity
            surfaces, point-in-time features, and exit-rule simulation.
            Connect your agent and check our work — or find what we missed.
          </p>
          <Button asChild size="lg">
            <Link href="/developers">Connect Your Agent &rarr;</Link>
          </Button>
        </section>

        <p className="text-xs text-muted-foreground text-center mt-12 leading-relaxed">
          Research on paper-trading data, educational only. Not investment
          advice. Findings are historical, conditional on the stated exit
          rules and windows, and not a promise of future results.
        </p>
      </main>
    </>
  );
}
