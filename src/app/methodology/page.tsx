import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Database, Filter, Calculator, GitBranch, ShieldCheck, Code, Layers } from 'lucide-react';
import { BUILD_STANDARD_PRICE, OG_IMAGE, PRICE_ANNUAL, PRICE_MONTHLY, TRIAL_DAYS } from '@/lib/constants';

// Root layout applies `%s | GammaRips` — never add `| GammaRips` here.
export const metadata: Metadata = {
  title: 'Methodology: Liquidity, Volatility & Audit Rules',
  description:
    'Transparent data sources, liquidity & volatility filters, point-in-time leakage walls, and 3-day historical outcome tracking behind the GammaRips dataset.',
  alternates: { canonical: 'https://gammarips.com/methodology' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Methodology: Liquidity, Volatility & Audit Rules | GammaRips',
    description:
      'Data sources, liquidity & volatility filters, multi-instrument ETF mapping, point-in-time leakage controls, and 3-day move tracking.',
    url: 'https://gammarips.com/methodology',
  },
};

const dataSources = [
  {
    name: 'Polygon / Massive Market Data',
    purpose:
      'End-of-day option chains, contract quotes, open interest, session volume, greeks, and 10-minute intraday liquidity snapshots across ~3,500 optionable US stocks.',
    cadence:
      'Scanned nightly at 23:00 ET and refreshed every 10 minutes (09:02–16:52 ET) during market hours.',
  },
  {
    name: 'FRED (Federal Reserve Economic Data)',
    purpose:
      'Daily VIX and VIX3M closes used to compute point-in-time volatility term-structure regime context.',
    cadence: 'Recorded point-in-time per scan date and exposed via get_regime_context.',
  },
  {
    name: 'Point-in-Time Analytical Warehouse',
    purpose:
      'Cloud SQL warehouse storing nightly scan outputs, leakage-checked feature views, intraday liquidity snapshots, and 3-day historical excursion outcomes.',
    cadence: 'Every row carries strict as-of timestamps so backtests match live agent queries.',
  },
];

const filters = [
  {
    name: 'Top-100 Liquid US Stock Universe',
    spec: '3M+ session shares, 25+ listed strikes, top 100 by z(chain $ volume) + z(share volume)',
    where: 'Nightly Scanner (23:00 ET)',
    why: 'Starts from ~3,500 optionable US stocks and drops thinly traded names before contract selection. Ranking by combined stock share volume and options dollar volume keeps the pool focused on deep, active underlyings.',
  },
  {
    name: 'Hard Contract Liquidity Floors (Combo A)',
    spec: 'Mid >= $1.00 & Open Interest >= 500 (log-saturated at 5,000)',
    where: 'Nightly Scanner · Contract Selection (23:00 ET)',
    why: 'Sub-dollar options suffer a 5%–15% minimum tick-size friction tax ($0.05 increments). Requiring Mid >= $1.00 and Open Interest >= 500 eliminates thin books and lifted 5-minute open fill rates from 30.3% to 50.1% (56.5% at OI >= 1,000) in our walk-forward audit.',
  },
  {
    name: 'Balanced Pricing & Expiration Band (Combo A)',
    spec: 'Bullish calls · Delta 0.22–0.48 · DTE 10–45',
    where: 'Nightly Scanner · Contract Selection (23:00 ET)',
    why: 'Selects one call per bullish setup inside the gamma/theta sweet spot — cutting far-OTM lottery tickets (Delta < 0.22) and rapid short-term decay traps (< 10 days). Lifted 3-day +40% touch rates from 27.6% to 35.4% across N = 5,575 historical setups.',
  },
  {
    name: 'Realized-vs-Implied Volatility & Multi-Instrument Enrichment',
    spec: 'rv_iv_ratio = (ATR_14 / Price × √252) / IV + mapped execution_vehicles',
    where: 'Morning Enrichment Pipeline (05:30 ET)',
    why: 'Computes rv_iv_ratio for every pool candidate (the #1 historical predictor of favorable 3-day moves in our walk-forward study, with >= 0.85 as the benchmark threshold agents screen on), maps 1x stocks and 2x/inverse single-stock ETFs, and attaches grounded news catalysts.',
  },
  {
    name: 'Live 10-Minute Morning & Intraday Liquidity Checks',
    spec: '09:02–16:52 ET live open interest, session volume & greeks',
    where: 'Intraday Collector · get_liquidity',
    why: 'Overnight scan figures freeze at the close. Snapshotting the active pool every 10 minutes during trading hours lets your AI confirm real morning depth before building a trade plan.',
  },
];

const outcomePillars = [
  {
    label: 'Reference Horizon',
    value: '3 Trading Days from 10:00 ET',
    why: 'Every pool contract is tracked from the 10:00 ET reference mark across the next 3 trading sessions, recording full intraday price paths regardless of any single fixed exit.',
  },
  {
    label: 'Maximum Favorable Excursion (MFE)',
    value: 'Peak Upside Move (+20%, +40%, +50%, +100%)',
    why: 'Tracks the highest upside mark reached within 3 days and before expiration so your AI can set realistic profit targets via query_outcomes(view="surface") and view="harvest".',
  },
  {
    label: 'Maximum Adverse Excursion (MAE)',
    value: 'Deepest Drawdown Path',
    why: 'Tracks the deepest pullback along the same window so your AI can calibrate stop losses and position sizing against historical contract swings.',
  },
  {
    label: 'Opening Fill Audit',
    value: '5-Minute Open Print Check',
    why: 'Measures whether real market prints traded within 5 minutes of the reference window, quantifying fill reliability across Open Interest and spread buckets.',
  },
];

const datasetPrinciples = [
  {
    label: 'Point-in-Time Leakage Wall',
    detail:
      'Every column exposed over MCP is governed by a strict schema contract (inspectable via get_playbook(name="schema")). Forward prices and outcomes are physically walled off from scan-time features so backtests and live agent prompts see the exact same information boundary.',
  },
  {
    label: 'Transparent Data Over Black-Box Pick Scores',
    detail:
      'In walk-forward XGBoost audits across N = 5,575 setups (66 scan dates), black-box composite scores only looked predictive in naive splits by exploiting schema missingness — and failed out-of-sample once cleaned. Simple liquidity and volatility primitives held up cleanly.',
  },
  {
    label: 'No Shared Daily Pick Endpoint',
    detail:
      'Pushing one shared contract to every subscriber crowds retail order flow into the same strike at the open, hurting fills for everyone. Serving the 40–50 setup pool + historical move ranges lets your AI build a plan sized to your own risk rules.',
  },
  {
    label: 'Agentic Catalyst & Earnings Verification',
    detail:
      'Our nightly filter enforces clean liquidity and pricing floors; your AI agent handles earnings verification (get_signal(view="earnings")), live morning volume checks (get_liquidity), and breaking news/X catalyst research.',
  },
];

const methodologySchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'GammaRips Methodology: Liquidity, Volatility & Point-in-Time Audit Rules',
  description:
    'Transparent data sources, Combo A liquidity & volatility filters, multi-instrument ETF mapping, point-in-time leakage walls, and 3-day excursion tracking.',
  url: 'https://gammarips.com/methodology',
  mainEntityOfPage: 'https://gammarips.com/methodology',
  datePublished: '2026-08-24T00:00:00Z',
  dateModified: '2026-11-25T00:00:00Z',
  author: {
    '@type': 'Person',
    name: 'Evan Parra',
    jobTitle: 'Founder & CEO',
    url: 'https://gammarips.com/about',
  },
  publisher: {
    '@type': 'Organization',
    name: 'GammaRips',
    url: 'https://gammarips.com',
    logo: { '@type': 'ImageObject', url: 'https://gammarips.com/icon.png' },
  },
  about: {
    '@type': 'Dataset',
    '@id': 'https://gammarips.com/developers#combo-a-dataset',
    name: 'GammaRips Nightly US Market & Options Intelligence Dataset',
    description:
      'Nightly US stock, 2x/inverse ETF, and options dataset filtered on Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45 and enriched with rv_iv_ratio across the top 100 liquid US stocks.',
    url: 'https://gammarips.com/developers',
    license: 'https://gammarips.com/terms',
    isAccessibleForFree: true,
  },
};

export default function MethodologyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(methodologySchema) }}
      />
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        <header className="mb-12">
          <p className="text-sm uppercase tracking-wider text-primary font-semibold mb-3">
            Methodology · Technical Reference
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold font-headline tracking-tight mb-4">
            Where every setup and number in the dataset comes from.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Every threshold, data source, and pipeline timestamp is deterministic and verifiable.
            Pool membership is governed by transparent liquidity and pricing floors (our{' '}
            <strong className="text-foreground">Combo A</strong> spec) — never a black-box score or
            human pick — and every setup maps to stocks, 2x/inverse ETFs, and liquid options.
          </p>
        </header>

        <section className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-headline">1. Data Sources</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-5">
            In plain English: three systems power the nightly scan, morning enrichment, live 10-minute liquidity checks, and historical move database.
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

        <Separator className="my-10" />

        <section className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-headline">
              2. Nightly Liquidity &amp; Volatility Filters (Combo A)
            </h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            In plain English: we cut illiquid tickers, wide bid-ask spreads, and lottery-ticket expirations upfront, then score realized-vs-implied volatility each morning. Derived from walk-forward audits across <strong className="text-foreground">N = 5,575 setups (66 scan dates)</strong>:
          </p>
          <div className="space-y-4">
            {filters.map((filter, i) => (
              <Card key={filter.name}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-bold text-primary shrink-0 w-7">
                      {i + 1}.
                    </span>
                    <div className="flex-1 space-y-1.5">
                      <h3 className="font-bold font-headline text-base text-foreground">{filter.name}</h3>
                      <p className="font-mono text-xs text-primary">{filter.spec}</p>
                      <p className="text-xs text-muted-foreground">{filter.where}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                        {filter.why}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-10" />

        <section className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <Layers className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-headline">
              3. Multi-Instrument Mapping (<code className="text-lg font-mono">execution_vehicles</code>)
            </h2>
          </div>
          <Card>
            <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Options flow and volatility pricing are powerful signals even if you prefer not to hold expiring option contracts. Every pool candidate served via <code className="text-xs text-foreground">get_pool</code> and <code className="text-xs text-foreground">get_signal</code> includes a structured <code className="text-xs text-foreground">execution_vehicles</code> object mapping:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-foreground">Underlying Stock (1x):</strong> direct equity ticker for clean directional exposure with zero theta decay.</li>
                <li><strong className="text-foreground">2x Long &amp; Inverse Single-Stock ETFs:</strong> verified leveraged single-stock ETFs (where listed) for amplified stock-like execution with standard limit stops.</li>
                <li><strong className="text-foreground">Liquid Call Option:</strong> the specific contract passing our Combo A liquidity and delta/DTE rules.</li>
              </ul>
              <p className="text-xs">
                Watch how 2x/inverse ETFs compare head-to-head against options on identical nightly setups in our{' '}
                <Link href="/xtrader" className="text-primary hover:underline font-medium">
                  live X-Trader benchmark &rarr;
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        <section className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <Calculator className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-headline">
              4. 3-Day Move History (MFE &amp; MAE Outcome Tracking)
            </h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            In plain English: rather than assuming one rigid exit rule, we track how far every past setup ran up (MFE) and pulled back (MAE) across 3 trading days so your AI can calibrate realistic targets and stops.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outcomePillars.map((rule) => (
              <Card key={rule.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                    {rule.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold mb-2">{rule.value}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rule.why}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-10" />

        <section className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-headline">
              5. Point-in-Time Leakage Controls &amp; Research Integrity
            </h2>
          </div>
          <div className="space-y-4">
            {datasetPrinciples.map((item) => (
              <Card key={item.label}>
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-10" />

        <section className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-headline font-bold">6. Verify It Directly Over MCP</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong className="text-foreground">Schema &amp; Timestamp Contract:</strong> call{' '}
                <code className="text-xs text-foreground">get_playbook(name=&quot;schema&quot;)</code> to inspect every field&apos;s point-in-time boundary.
              </span>
            </li>
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong className="text-foreground">Historical Move Distributions:</strong> call{' '}
                <code className="text-xs text-foreground">query_outcomes(view=&quot;surface&quot;)</code> and{' '}
                <code className="text-xs text-foreground">query_outcomes(view=&quot;harvest&quot;)</code> to query 3-day MFE/MAE distributions.
              </span>
            </li>
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong className="text-foreground">Published Lab Verdicts:</strong> read{' '}
                <Link href="/lab" className="text-primary hover:underline">Research Lab (/lab)</Link> for both confirmed and killed experiments.
              </span>
            </li>
          </ul>
        </section>

        <Separator className="my-10" />

        <section className="text-center">
          <h2 className="text-2xl font-bold font-headline mb-3">
            Connect your AI — or let us engineer your custom bot
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-sm sm:text-base">
            Start a {TRIAL_DAYS}-day free trial of Pro MCP ({PRICE_MONTHLY}/mo or {PRICE_ANNUAL}/yr)
            to unlock all 40–50 nightly setups across stocks, 2x ETFs, and options — or submit your
            written rules on <Link href="/build" className="text-primary hover:underline">/build</Link> ({BUILD_STANDARD_PRICE}).
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild size="lg" className="font-semibold">
              <Link href="/pricing">
                Start {TRIAL_DAYS}-Day Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/developers">MCP API Reference</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/build">Custom Agent Build</Link>
            </Button>
          </div>
        </section>

        <p className="text-xs text-muted-foreground text-center mt-14">
          Historical market research and paper-tracked outcome data; educational only, not investment advice. Past performance is not a guarantee of future results.
        </p>
      </main>
    </>
  );
}
