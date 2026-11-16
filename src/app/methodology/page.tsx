import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Database, Filter, Calculator, GitBranch, ShieldCheck, Code } from 'lucide-react';
import { OG_IMAGE, PRICE_MONTHLY, TRIAL_DAYS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'GammaRips Methodology: Combo A Microstructure Filters & Point-in-Time Audit',
  description:
    'How the GammaRips nightly dataset is built: ~3,500 optionable US stocks filtered to the top 100 liquid universe and bullish calls passing Combo A gates (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45, rv_iv_ratio). Educational only. Not investment advice.',
  alternates: { canonical: 'https://gammarips.com/methodology' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'GammaRips Methodology: Combo A Microstructure Filters & Point-in-Time Audit',
    description:
      'The data sources, Combo A microstructure and volatility gates, point-in-time leakage wall, and 3-day excursion outcome labeling behind the GammaRips MCP dataset.',
    url: 'https://gammarips.com/methodology',
  },
};

const dataSources = [
  {
    name: 'Polygon.io',
    purpose:
      'End-of-day options chains, contract quotes, open interest, session volume, greeks, and intraday 10-minute contract liquidity snapshots across ~3,500 optionable US stocks.',
    cadence:
      'Pulled at 23:00 ET nightly by overnight-scanner and every 10 minutes (09:02–16:52 ET) during market hours.',
  },
  {
    name: 'FRED (Federal Reserve Economic Data)',
    purpose:
      'VIX and VIX3M daily close, used for the point-in-time term-structure volatility regime context.',
    cadence:
      'Recorded point-in-time per scan date and exposed via get_regime_context.',
  },
  {
    name: 'BigQuery (`profitscout-fida8.profit_scout`)',
    purpose:
      'Canonical storage for overnight signals, leakage-checked enriched feature views (enriched_features_v1), intraday liquidity snapshots, and 3-day excursion outcomes (enriched_option_outcomes).',
    cadence:
      'Written by every stage of the pipeline; every table carries strict as-of timestamps.',
  },
];

const filters = [
  {
    name: 'Liquid Universe: 3M+ session shares, 25+ listed strikes, top 100 by z(chain $ volume) + z(share volume)',
    where: 'overnight-scanner (23:00 ET)',
    why: 'Starts from ~3,500 optionable US stocks and requires 3M+ session share volume and 25+ listed option strikes. The surviving names are ranked by combined chain dollar volume and share volume, keeping the top 100 liquid underlyings.',
  },
  {
    name: 'Combo A Contract Microstructure Floor: Mid >= $1.00 & OI >= 500 (log-saturated to 5,000)',
    where: 'overnight-scanner · contract selection',
    why: 'Sub-dollar options suffer a 5%–15% minimum tick-size friction tax ($0.05 tick increments). Requiring Mid >= $1.00 and resting Open Interest >= 500 eliminates illiquid chains and lifts 5-minute fast execution fills at the open from 30.3% to 50.1% (56.5% at OI >= 1,000) across our walk-forward microstructure study.',
  },
  {
    name: 'Combo A Convexity & Decay Band: Bullish calls, Delta 0.22–0.48, DTE 10–45',
    where: 'overnight-scanner · contract selection',
    why: 'Selects one out-of-the-money call per bullish name inside the gamma/theta sweet spot (Delta 0.22–0.48, DTE 10–45). Filtering out far-OTM lottery tickets (Delta < 0.20) and ultra-short decay traps (DTE < 10) lifts 3-day Option Maximum Favorable Excursion (MFE >= +40%) from 27.6% to 35.4% (N = 5,575 contracts across 66 scan dates).',
  },
  {
    name: 'Realized-to-Implied Volatility Ratio (rv_iv_ratio >= 0.85)',
    where: 'enrichment pipeline (05:30 ET) & enriched_features_v1 (06:30 ET)',
    why: 'Computes rv_iv_ratio = (ATR_14 / Price * sqrt(252)) / IV for every candidate. In walk-forward feature audits on dev.parquet (N = 5,575), rv_iv_ratio is the #1 quantitative predictor of favorable option excursions—separating underpriced volatility from overpriced implied vol.',
  },
  {
    name: '10-Minute Intraday Liquidity Snapshots (09:02–16:52 ET)',
    where: 'intraday liquidity collector · get_liquidity',
    why: 'Overnight scan snapshots freeze after the close. Every 10 minutes during regular market hours, the pipeline snapshots resting open interest, active session volume, and greeks across the pool so agents verify live morning tradability before planning an entry.',
  },
];

const outcomePillars = [
  {
    label: 'Reference Horizon',
    value: '3 Trading Days from 10:00 ET Entry',
    why: 'Every surfaced pool contract is tracked from the 10:00 ET morning reference mark across the subsequent 3 trading sessions in BigQuery (enriched_option_outcomes), recording unclipped excursion paths regardless of any single exit bracket.',
  },
  {
    label: 'Maximum Favorable Excursion (MFE)',
    value: 'Peak Option Return (+20%, +40%, +50%, +100%)',
    why: 'Measures the highest intraday contract mark reached within the 3-day window and before expiration. Used by agents via query_outcomes(view="surface") and view="harvest" to calibrate realistic profit targets.',
  },
  {
    label: 'Maximum Adverse Excursion (MAE)',
    value: 'Drawdown Path & Stop Touches',
    why: 'Measures the deepest adverse drawdown along the same path so agents can evaluate stop placement and position sizing against historical contract volatility.',
  },
  {
    label: 'Fast Execution Fill Audit',
    value: '5-Minute Open Print Verification',
    why: 'Tracks whether real option prints occurred within 5 minutes of the reference entry window, quantifying real-world execution liquidity across Open Interest and spread buckets.',
  },
];

const datasetPrinciples = [
  {
    label: 'Point-in-Time Leakage Wall (enriched_features_v1)',
    detail:
      'Every column exposed to your AI agent is governed by a strict dbt schema contract (get_playbook(name="schema")). Post-entry outcomes, forward returns, and future price marks are physically walled off from scan-time feature vectors so backtests and live agent prompts see the exact same information boundary.',
  },
  {
    label: 'Why We Sell Primitives Instead of Black-Box Picks',
    detail:
      'In our Catalyst Lab walk-forward XGBoost audit across N = 5,575 contracts (66 scan dates), black-box composite models appeared predictive in naive splits only by exploiting late-schema missingness artifacts—and failed out-of-sample once missingness was stripped. Transparent microstructure and volatility primitives (rv_iv_ratio, Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45) held up cleanly out-of-sample.',
  },
  {
    label: 'No Shared Daily Pick Endpoint',
    detail:
      'Pushing one shared contract to every subscriber crowds retail order flow into the same strike at the open, degrading fills for everyone. GammaRips serves the curated 40–50 contract dataset and historical excursion surfaces over MCP so your AI agent builds a plan tailored to your own thesis and risk budget.',
  },
  {
    label: 'Agentic Catalyst Verification (Stage 2)',
    detail:
      'Deterministic Stage 1 filters enforce liquidity, spread, convexity, and volatility gates. Stage 2 belongs to your AI agent or the open-source gammarips-harness: checking earnings dates (get_signal(view="earnings")), verifying 10-minute morning liquidity (get_liquidity), and layering on live X/web catalyst research.',
  },
];

const methodologySchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'GammaRips Methodology: Combo A Microstructure Filters & Point-in-Time Audit',
  description:
    'The data sources, Combo A microstructure and volatility gates, point-in-time leakage wall, and 3-day excursion outcome labeling behind the GammaRips MCP dataset.',
  url: 'https://gammarips.com/methodology',
  publisher: {
    '@type': 'Organization',
    name: 'GammaRips',
    logo: { '@type': 'ImageObject', url: 'https://gammarips.com/og-image.png?v=4' },
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
          <p className="text-sm uppercase tracking-wider text-primary font-semibold mb-3">
            Methodology
          </p>
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight mb-4">
            Where every contract and feature in the dataset comes from.
          </h1>
          <p className="text-lg text-muted-foreground">
            Every threshold, data source, and pipeline stage is deterministic and logged. Pool membership is governed by the <strong className="text-foreground">Combo A</strong> liquidity, convexity, and volatility specification—never a black-box score or human pick. Every feature vector is point-in-time and leakage-checked.
          </p>
        </header>

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-headline">Data sources</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Three systems power the nightly scan, morning enrichment, intraday liquidity snapshots, and outcome labeling:
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
            <h2 className="text-2xl font-bold font-headline">
              Combo A Microstructure &amp; Volatility Filters
            </h2>
          </div>
          <p className="text-muted-foreground mb-6">
            The nightly pipeline filters ~3,500 optionable US stocks down to roughly 40 to 50 liquid bullish call contracts. Every gate is derived from walk-forward Catalyst Lab audits across <strong className="text-foreground">N = 5,575 enriched contracts (66 scan dates)</strong>:
          </p>
          <div className="space-y-4">
            {filters.map((filter, i) => (
              <Card key={filter.name}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-bold text-primary shrink-0 w-8">
                      {i + 1}.
                    </span>
                    <div className="flex-1">
                      <h3 className="font-mono text-sm font-bold mb-1">{filter.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Applied in <code className="text-xs">{filter.where}</code>
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {filter.why}
                      </p>
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
            <h2 className="text-2xl font-bold font-headline">
              3-Day Excursion Outcome Labeling (<code className="text-lg">enriched_option_outcomes</code>)
            </h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Rather than locking the dataset to a single arbitrary day-trade exit, the outcome pipeline labels the full excursion surface of every pool contract so your AI agent can evaluate targets and stops from historical distributions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outcomePillars.map((rule) => (
              <Card key={rule.label}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
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

        <Separator className="my-12" />

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold font-headline">
              Point-in-Time Leakage Wall &amp; Why We Sell Primitives
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

        <Separator className="my-12" />

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <GitBranch className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-headline font-bold">Reproducibility over MCP</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Every table and feature definition is inspectable directly by your AI agent:
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong className="text-foreground">Schema &amp; Leakage Contract:</strong> call{' '}
                <code className="text-xs text-foreground">get_playbook(name=&quot;schema&quot;)</code> to inspect every column&apos;s point-in-time boundary and leakage classification.
              </span>
            </li>
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong className="text-foreground">Historical Excursion Surfaces:</strong> call{' '}
                <code className="text-xs text-foreground">query_outcomes(view=&quot;surface&quot;)</code> and{' '}
                <code className="text-xs text-foreground">query_outcomes(view=&quot;harvest&quot;)</code> to query realized 3-day MFE/MAE distributions across delta, DTE, and volatility buckets.
              </span>
            </li>
            <li className="flex gap-3">
              <Code className="h-4 w-4 text-primary shrink-0 mt-1" />
              <span>
                <strong className="text-foreground">Published Lab Verdicts:</strong> read{' '}
                <Link href="/lab" className="text-primary hover:underline">/lab</Link> for the full record of confirmed and killed hypotheses on the dataset.
              </span>
            </li>
          </ul>
        </section>

        <Separator className="my-12" />

        <section className="text-center">
          <h2 className="text-2xl font-bold font-headline mb-3">
            Connect your AI agent to the dataset
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start with the {TRIAL_DAYS}-day free trial of Pro MCP access ({PRICE_MONTHLY}/mo founding price) to unlock the full daily Combo A pool, 10-minute intraday liquidity snapshots, and 3-day excursion outcome history, or test the 3-contract preview free.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild size="lg">
              <Link href="/pricing">
                Get Pro MCP Access <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/developers">MCP API &amp; Tool Reference</Link>
            </Button>
          </div>
        </section>

        <p className="text-xs text-muted-foreground text-center mt-16">
          Historical options research and paper-tracked outcome data, educational only. Not investment advice. Past performance is not a guarantee of future results.
        </p>
      </main>
    </>
  );
}
