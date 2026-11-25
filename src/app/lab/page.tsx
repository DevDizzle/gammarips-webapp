import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlaskConical } from 'lucide-react';
import { OG_IMAGE } from '@/lib/constants';

// Root layout applies `%s | GammaRips` — never add `| GammaRips` here.
export const metadata: Metadata = {
  title: 'Research Lab: Walk-Forward Options & Vol Audits',
  description:
    'Published walk-forward market experiments with hypothesis, sample size (N=5,575), and verdict—including the black-box ML models we tested and killed.',
  alternates: { canonical: 'https://gammarips.com/lab' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Research Lab: Walk-Forward Options & Vol Audits | GammaRips',
    description:
      'Hypothesis, method, sample size (N), and verdict — including the black-box ideas we tested and killed.',
    url: 'https://gammarips.com/lab',
  },
};

type Verdict = 'CONFIRMED' | 'KILLED' | 'RUNNING LIVE';

const findings: {
  slug: string;
  title: string;
  verdict: Verdict;
  takeaway: string;
  hypothesis: string;
  method: string;
  result: string;
  changed: string;
  mcp: string;
  href?: string;
}[] = [
  {
    slug: 'rv-iv-ratio-predictor',
    title: 'Realized vs. Implied Volatility (RV/IV) is our #1 move predictor',
    verdict: 'CONFIRMED',
    takeaway: 'Stocks whose actual daily range justifies what options markets charge outperform overpriced high-IV hype.',
    hypothesis:
      'Setups where the stock’s recent realized range (14-day annualized ATR) is high relative to implied volatility (IV) produce stronger 3-day moves than overpriced lottery tickets.',
    method:
      'Walk-forward feature importance and quartile excursion audit across N = 5,575 historical setups over 66 scan dates.',
    result:
      'rv_iv_ratio emerged as the #1 quantitative predictor of favorable 3-day moves across every point-in-time feature tested, with >= 0.85 marking the clearest separation.',
    changed:
      'rv_iv_ratio is computed every morning at 05:30 ET and included on every Pro MCP setup so your AI agent can screen for fairly priced volatility.',
    mcp: 'Verify over MCP: get_pool(view="features") + query_outcomes(view="surface").',
  },
  {
    slug: 'xgboost-composite-missingness',
    title: 'Black-box XGBoost pick ranker beats simple liquidity & vol rules',
    verdict: 'KILLED',
    takeaway: 'Black-box ML pick scores overfit historical artifacts — transparent liquidity and volatility rules beat them out-of-sample.',
    hypothesis:
      'A gradient-boosted tree trained across all enriched columns can rank daily top picks better than simple, transparent contract quality rules.',
    method:
      'Strict walk-forward out-of-sample audit across N = 5,575 setups (66 scan dates), comparing full-feature XGBoost against missingness-cleaned features and deterministic Combo A liquidity floors.',
    result:
      'Apparent in-sample lift came from the tree exploiting schema missingness across earlier eras. Once cleaned, the black-box composite failed out-of-sample while simple liquidity and volatility primitives held up.',
    changed:
      'We killed black-box daily pick rankings permanently. GammaRips serves clean filtered data and historical move distributions so your AI builds your plan transparently.',
    mcp: 'Verify over MCP: get_playbook(name="schema") + get_pool(view="features").',
  },
  {
    slug: 'resting-oi-fast-fills',
    title: 'Requiring Open Interest >= 500 & Mid >= $1.00 lifts opening fill rates',
    verdict: 'CONFIRMED',
    takeaway: 'Cutting sub-dollar contracts and thin order books lifted fast 5-minute opening fills from 30.3% to 50.1%.',
    hypothesis:
      'Dropping sub-dollar contracts ($0.05 minimum tick tax) and requiring at least 500 resting open-interest contracts improves real opening fills.',
    method:
      'Audited 5-minute morning opening print rates and bid-ask tick friction across historical pool sessions segmented by OI and mid-price buckets.',
    result:
      'Requiring OI >= 500 lifted 5-minute fast fills from 30.3% to 50.1% (and 56.5% at OI >= 1,000), with gains leveling off near OI = 5,000. Mid >= $1.00 eliminated the sub-dollar spread drag.',
    changed:
      'Mid >= $1.00 and OI >= 500 became permanent nightly scanner floors, backed by live 10-minute intraday liquidity snapshots (09:02–16:52 ET).',
    mcp: 'Verify over MCP: get_liquidity() + query_outcomes(view="surface").',
  },
  {
    slug: 'gamma-theta-sweet-spot',
    title: 'Delta 0.22–0.48 & 10–45 DTE concentrates strong 3-day upside moves',
    verdict: 'CONFIRMED',
    takeaway: 'Removing far-out-of-the-money lottery tickets and rapid decay traps lifted 3-day +40% touch rates from 27.6% to 35.4%.',
    hypothesis:
      'Cutting far-OTM contracts (Delta < 0.22) and rapid expiration traps (< 10 days) improves the base rate of meaningful 3-day upside moves.',
    method:
      'Cohort comparison of 3-day Maximum Favorable Excursion (MFE >= +40%) across N = 5,575 historical setups over 66 scan dates.',
    result:
      'Restricting contracts to Delta 0.22–0.48 and 10–45 days to expiration lifted the 3-day +40% touch rate from 27.6% baseline to 35.4%.',
    changed:
      'Delta 0.22–0.48 and DTE 10–45 are locked into our nightly contract selection spec.',
    mcp: 'Verify over MCP: get_pool(view="enriched") + query_outcomes(view="harvest").',
  },
  {
    slug: 'dual-book-etf-vs-options',
    title: '2x/Inverse Single-Stock ETFs vs. Options on identical nightly signals',
    verdict: 'RUNNING LIVE',
    takeaway: 'Testing in public whether 2x leveraged ETFs capture the same directional moves without option spread drag and time decay.',
    hypothesis:
      'Executing identical morning setups via mapped 2x long/inverse single-stock ETFs (or 1x shares) avoids option bid-ask friction and theta decay compared to single-leg calls.',
    method:
      'Every market morning at 10:05 ET, our live autonomous agent (X-Trader) runs two isolated paper accounts side by side on the exact same signal: Book A (2x ETFs & Stocks) vs. Book B (Options).',
    result:
      'Live daily logs, reasoning traces, and realized P&L publish continuously on the X-Trader benchmark page.',
    changed:
      'Every nightly pool setup now ships with mapped execution_vehicles (1x stock, 2x/inverse ETFs, and liquid option contract) over MCP.',
    mcp: 'Inspect live daily logs: /xtrader',
    href: '/xtrader',
  },
];

const verdictStyles: Record<Verdict, string> = {
  CONFIRMED: 'bg-green-500/15 text-green-500 border-green-500/30',
  KILLED: 'bg-red-500/15 text-red-500 border-red-500/30',
  'RUNNING LIVE': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
};

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Research Lab — GammaRips Published Experiments',
  description:
    'Walk-forward market experiments published with hypothesis, method, sample size (N), and verdict — including the black-box models we killed.',
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
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="h-5 w-5 text-primary" />
            <p className="text-sm uppercase tracking-wider text-primary font-semibold">Research Lab</p>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-headline tracking-tight mb-4">
            We publish our experiments. Including the dead ones.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Every filter rule in GammaRips had to earn its place on clean, leakage-checked
            walk-forward data — with full sample sizes (N) and conditions shown in public.
          </p>
        </header>

        <div className="space-y-6 mb-14">
          {findings.map((f) => (
            <Card key={f.slug} id={f.slug}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <h2 className="text-xl font-bold font-headline">{f.title}</h2>
                  <Badge variant="outline" className={verdictStyles[f.verdict]}>
                    {f.verdict}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-foreground bg-muted/40 border border-border/60 rounded-lg px-3.5 py-2.5">
                  Plain-English takeaway: {f.takeaway}
                </p>
                <div className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    <span className="font-semibold text-foreground">Hypothesis: </span>
                    {f.hypothesis}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Method: </span>
                    {f.method}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Result: </span>
                    {f.result}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">What changed: </span>
                    {f.changed}
                  </p>
                  {f.href ? (
                    <Link href={f.href} className="inline-block text-xs font-mono text-primary hover:underline pt-1">
                      Inspect the live head-to-head benchmark on /xtrader &rarr;
                    </Link>
                  ) : (
                    <p className="text-xs font-mono text-primary/90 pt-1">{f.mcp}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="text-center space-y-4 border rounded-xl p-8 bg-card/50">
          <h2 className="text-2xl font-bold font-headline">
            Your AI agent can verify these numbers directly
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Every experiment above runs on the exact same nightly data, live liquidity snapshots,
            and 3-day move history served over GammaRips MCP.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/developers">Connect Your Agent &rarr;</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/xtrader">Watch Live Benchmark</Link>
            </Button>
          </div>
        </section>

        <p className="text-xs text-muted-foreground text-center mt-12 leading-relaxed">
          Historical market research on paper-tracked data; educational only, not investment advice. Past performance is not a guarantee of future results.
        </p>
      </main>
    </>
  );
}
