import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlaskConical } from 'lucide-react';
import { OG_IMAGE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'The Lab — Catalyst Lab Experiments & Microstructure Audits',
  description:
    'Experiments on the GammaRips options dataset substrate, published with hypothesis, method, sample size (N), and verdict—including the hypotheses that got killed.',
  alternates: { canonical: 'https://gammarips.com/lab' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'The Lab — Catalyst Lab Experiments & Microstructure Audits | GammaRips',
    description:
      'Hypothesis, method, N, verdict—including the killed ideas. How the GammaRips Combo A dataset filters earn their keep.',
    url: 'https://gammarips.com/lab',
  },
};

type Verdict = 'CONFIRMED' | 'KILLED' | 'CONDITIONAL';

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
    slug: 'rv-iv-ratio-predictor',
    title: 'Realized-to-Implied Volatility ratio (rv_iv_ratio >= 0.85) predicts option excursions',
    verdict: 'CONFIRMED',
    hypothesis:
      'Contracts where the underlying’s realized daily range (ATR_14 / Price * sqrt(252)) is high relative to implied volatility (IV) produce stronger 3-day option excursions than high-IV lottery tickets.',
    method:
      'Walk-forward feature importance and quartile excursion audit across N = 5,575 enriched contracts (66 scan dates on dev.parquet) joined to BigQuery enriched_option_outcomes.',
    result:
      'rv_iv_ratio emerged as the #1 quantitative predictor of favorable 3-day option excursions across all point-in-time features.',
    changed:
      'rv_iv_ratio is computed every morning at 05:30 ET and exposed in enriched_features_v1, with rv_iv_ratio >= 0.85 enforced in the Catalyst Lab filter.',
    mcp: 'Reproduce it: get_pool(view="features") + query_outcomes(view="surface").',
  },
  {
    slug: 'xgboost-composite-missingness',
    title: 'Black-box XGBoost composite score beats simple microstructure gates out-of-sample',
    verdict: 'KILLED',
    hypothesis:
      'A non-linear gradient-boosted tree trained across all enriched features can rank daily top picks better than transparent contract microstructure rules.',
    method:
      'Strict walk-forward out-of-sample audit across N = 5,575 contracts (66 scan dates), comparing full-feature XGBoost against missingness-stripped features and deterministic Combo A gates.',
    result:
      'Apparent in-sample lift came from the tree exploiting schema evolution and missingness indicators across historical eras. Once late-schema missingness was stripped, the black-box composite failed out-of-sample, while transparent microstructure and volatility primitives held up.',
    changed:
      'We killed black-box composite pick ranking. GammaRips sells the transparent Combo A dataset and historical excursion surfaces over MCP rather than black-box picks.',
    mcp: 'Reproduce it: get_playbook(name="schema") + get_pool(view="features").',
  },
  {
    slug: 'resting-oi-fast-fills',
    title: 'Resting Open Interest >= 500 lifts 5-minute open execution fills',
    verdict: 'CONFIRMED',
    hypothesis:
      'Requiring Mid >= $1.00 and resting Open Interest >= 500 eliminates sub-dollar tick friction and materially increases fast execution fills at the morning open.',
    method:
      'Audited 5-minute opening print rates and bid-ask tick friction across BigQuery enriched_option_outcomes segmented by OI and mid-price buckets.',
    result:
      'Requiring OI >= 500 lifted 5-minute fast execution fills from 30.3% to 50.1% (and to 56.5% at OI >= 1,000), with liquidity gains log-saturating near OI = 5,000. Requiring Mid >= $1.00 removed the $0.05 minimum tick-size penalty.',
    changed:
      'Mid >= $1.00 and OI >= 500 became hard Stage 1 Combo A floors, paired with 10-minute intraday liquidity snapshots (09:02–16:52 ET).',
    mcp: 'Reproduce it: get_liquidity() + query_outcomes(view="surface").',
  },
  {
    slug: 'gamma-theta-sweet-spot',
    title: 'Delta 0.22–0.48 and DTE 10–45 concentrate 3-day MFE >= +40% excursions',
    verdict: 'CONFIRMED',
    hypothesis:
      'Filtering out far-OTM lottery tickets (Delta < 0.20) and ultra-short decay traps (DTE < 10) increases the base rate of 3-day +40% option excursions.',
    method:
      'Cohort comparison of 3-day Maximum Favorable Excursion (MFE >= +40%) across N = 5,575 enriched contracts over 66 scan dates.',
    result:
      'Restricting contracts to Delta 0.22–0.48 and DTE 10–45 lifted the 3-day Option MFE >= +40% rate from 27.6% baseline to 35.4%.',
    changed:
      'Delta 0.22–0.48 and DTE 10–45 are locked into the Combo A contract selection specification.',
    mcp: 'Reproduce it: get_pool(view="enriched") + query_outcomes(view="harvest").',
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
    'Experiments run on the GammaRips options dataset substrate, published with hypothesis, method, sample size, and verdict—including the killed ideas.',
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
            Every finding below was produced on the engine&apos;s point-in-time data substrate (<code className="text-xs text-foreground">dev.parquet</code> and BigQuery <code className="text-xs text-foreground">enriched_option_outcomes</code>), leakage-checked, with sample size (N) and walk-forward conditions attached.
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
            Every experiment on this page was run against the same substrate the MCP serves: point-in-time feature vectors, 10-minute intraday liquidity snapshots, and 3-day excursion outcome surfaces.
          </p>
          <Button asChild size="lg">
            <Link href="/developers">Connect Your Agent &rarr;</Link>
          </Button>
        </section>

        <p className="text-xs text-muted-foreground text-center mt-12 leading-relaxed">
          Historical options research on paper-tracked data, educational only. Not investment advice. Past performance is not a guarantee of future results.
        </p>
      </main>
    </>
  );
}
