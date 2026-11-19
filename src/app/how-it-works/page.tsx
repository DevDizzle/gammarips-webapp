import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, Layers, Target, MessageSquareText } from 'lucide-react';
import { HARNESS_REPO, MCP_PRO_ENDPOINT, OG_IMAGE, PRICE_MONTHLY, TRIAL_DAYS } from '@/lib/constants';
import { INSTALL_LINKS } from '@/lib/receipts';

const DESCRIPTION =
  'How GammaRips works: every night it scans ~3,500 optionable US stocks, filters the top 100 liquid universe through Combo A microstructure and volatility gates (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45, RV/IV >= 0.85), and serves the dataset to your AI agent over MCP.';

export const metadata: Metadata = {
  title: 'How GammaRips Works | Overnight Options Dataset & Catalyst Lab Research',
  description: DESCRIPTION,
  alternates: { canonical: 'https://gammarips.com/how-it-works' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'How GammaRips Works | Overnight Options Dataset & Catalyst Lab Research',
    description:
      'Curated daily options dataset, empirical microstructure filters from Catalyst Lab walk-forward research, and direct MCP integration for your AI agent.',
    url: 'https://gammarips.com/how-it-works',
  },
};

const pillars = [
  {
    icon: Layers,
    title: 'Curated Daily Options Dataset',
    body: 'Every trading night, the top 100 most liquid US option chains are filtered to bullish calls passing Combo A gates (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45) with point-in-time technicals, flow context, and grounded news catalysts.',
  },
  {
    icon: Target,
    title: 'Empirical Microstructure Filters',
    body: 'Backed by walk-forward Catalyst Lab research (N = 5,575 enriched contracts across 66 scan dates): Realized-vs-Implied Volatility (RV/IV >= 0.85), tick-size friction floors, resting book depth, and gamma/theta convexity bands.',
  },
  {
    icon: MessageSquareText,
    title: 'Plug Into Any AI Agent via MCP',
    body: 'Connect Claude, ChatGPT, Cursor, Codex, or the open-source gammarips-harness over MCP. Your agent verifies 10-minute intraday liquidity snapshots, checks earnings, queries 3-day excursion history, and builds your trade plan.',
  },
];

const pipelineTimeline = [
  {
    time: '23:00 ET',
    stage: 'EOD Universe Scan & Combo A Contract Selection',
    detail:
      'Scans ~3,500 optionable US stocks, requires 3M+ session share volume and 25+ listed strikes, ranks the top 100 by combined chain dollar volume and share volume, and selects one out-of-the-money call per bullish name passing Mid >= $1.00, OI >= 500, Delta 0.22–0.48, and DTE 10–45.',
  },
  {
    time: '05:30 ET',
    stage: 'Point-in-Time Enrichment & Grounded Catalysts',
    detail:
      'Computes Realized-to-Implied Volatility ratio (rv_iv_ratio = (ATR_14 / Price * sqrt(252)) / IV), technical structure (EMA stack, RSI, ATR, 60-day momentum), flow context, and Gemini grounded news catalysts.',
  },
  {
    time: '06:30–07:00 ET',
    stage: 'Clean dbt Feature View & Daily Macro Report',
    detail:
      'Materializes the leakage-checked enriched_features_v1 view in BigQuery and publishes the daily macro and options-flow intelligence report before the pre-market session.',
  },
  {
    time: '09:02–16:52 ET',
    stage: '10-Minute Intraday Liquidity Snapshots',
    detail:
      'Captures 10-minute intraday contract snapshots (get_liquidity / get_pool_liquidity) across regular market hours so agents verify morning open interest and active session volume at the open before planning an entry.',
  },
];

const researchFindings = [
  {
    gate: 'Volatility Ratio (rv_iv_ratio >= 0.85)',
    formula: '(ATR_14 / Price × √252) / IV',
    finding:
      'In walk-forward feature audits across N = 5,575 enriched contracts (66 scan dates on dev.parquet), the Realized-to-Implied Volatility ratio is the #1 quantitative predictor of favorable option excursions—identifying underlyings whose realized daily range justifies the option’s implied volatility.',
  },
  {
    gate: 'Tick-Size Friction Floor (Mid >= $1.00)',
    formula: 'Escapes $0.05 minimum tick penalty',
    finding:
      'Sub-dollar options listed on non-Penny-Pilot series face a $0.05 minimum tick increment, imposing a 5%–15% structural bid-ask tax on entry and exit. Requiring Mid >= $1.00 eliminates sub-dollar tick friction upfront.',
  },
  {
    gate: 'Resting Book Depth (OI >= 500, log-saturated to 5,000)',
    formula: '5-minute fast execution fill rate: 30.3% → 50.1%',
    finding:
      'Auditing intraday execution fills in BigQuery enriched_option_outcomes shows that requiring resting open interest >= 500 lifts 5-minute fast execution fills at the open from 30.3% to 50.1% (and to 56.5% at OI >= 1,000), with liquidity gains log-saturating near OI = 5,000.',
  },
  {
    gate: 'Gamma/Theta Sweet Spot (Delta 0.22–0.48, DTE 10–45)',
    formula: '3-day Option MFE >= +40%: 27.6% → 35.4%',
    finding:
      'Screening out far-OTM lottery tickets (Delta < 0.20) and ultra-short decay traps (DTE < 10) while keeping responsive convexity (Delta 0.22–0.48, DTE 10–45) lifts the 3-day Maximum Favorable Excursion (MFE >= +40%) rate from 27.6% to 35.4% across the walk-forward sample.',
  },
];

export const revalidate = 3600;

export default async function HowItWorksPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How GammaRips Works | Overnight Options Dataset & Catalyst Lab Research',
    description: DESCRIPTION,
    image: 'https://gammarips.com/og-image.png?v=4',
    url: 'https://gammarips.com/how-it-works',
    mainEntityOfPage: 'https://gammarips.com/how-it-works',
    datePublished: '2026-08-24T00:00:00Z',
    dateModified: '2026-11-16T00:00:00Z',
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
  };

  return (
    <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Learn · Pipeline &amp; Research
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
          A curated nightly options dataset. Built for the AI agent you already use.
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Every trading night, GammaRips filters ~3,500 optionable US stocks down to roughly 40 to 50 liquid bullish call contracts using empirical microstructure and volatility gates, then serves the point-in-time dataset and 3-day excursion history to your AI over MCP.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title} className="bg-card/50">
              <CardContent className="p-5">
                <Icon className="h-6 w-6 text-primary" />
                <h2 className="mt-3 font-bold font-headline text-lg">{p.title}</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{p.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-headline">
            The Overnight Pipeline &amp; Intraday Liquidity Check
          </h2>
          <p className="text-muted-foreground leading-relaxed mt-2">
            The GammaRips engine runs on a strict daily clock so every feature is point-in-time before the market opens—and refreshed every 10 minutes during regular trading hours.
          </p>
        </div>

        <div className="space-y-4">
          {pipelineTimeline.map((step) => (
            <div
              key={step.time}
              className="rounded-lg border bg-card/50 p-5 flex flex-col sm:flex-row gap-4"
            >
              <div className="sm:w-36 shrink-0">
                <span className="inline-block font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-primary/15 text-primary">
                  {step.time}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold font-headline text-base text-foreground">
                  {step.stage}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-card/50 p-5 space-y-2">
          <h3 className="font-bold font-headline text-lg">
            Earnings &amp; Catalyst Checks: Your AI Verifies Every Candidate
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The published pool is not pre-filtered for upcoming earnings dates. Instead, your AI agent calls <code className="text-xs text-foreground">get_signal(view=&quot;earnings&quot;)</code> and <code className="text-xs text-foreground">get_liquidity()</code> on each shortlisted candidate, and can layer on live X and web research via the open-source{' '}
            <a
              href={HARNESS_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-mono text-xs"
            >
              gammarips-harness
            </a>{' '}
            before building your trade plan.
          </p>
        </div>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-headline">
            The Research Behind Our Filters (Why Combo A)
          </h2>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Every contract gate in the GammaRips pipeline comes from walk-forward Catalyst Lab audits across{' '}
            <strong className="text-foreground">N = 5,575 enriched contracts over 66 scan dates</strong> (<code className="text-xs text-foreground">dev.parquet</code>) joined to intraday execution and 3-day excursion outcomes in BigQuery (<code className="text-xs text-foreground">enriched_option_outcomes</code>).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {researchFindings.map((item) => (
            <Card key={item.gate} className="bg-card/50">
              <CardContent className="p-5 space-y-2">
                <p className="text-xs font-mono text-primary font-semibold">
                  {item.formula}
                </p>
                <h3 className="font-bold font-headline text-lg text-foreground">
                  {item.gate}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.finding}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Source: <Link href="/blog/catalyst-lab-combo-a-options-microstructure-audit" className="text-primary hover:underline">Catalyst Lab walk-forward feature and microstructure audit</Link> (N = 5,575 enriched option contracts across 66 scan dates, plus BigQuery <code className="text-xs">enriched_option_outcomes</code> 3-day excursion labels). Historical research on paper-tracked option cohorts; educational only, not investment advice.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">What is unusual options activity?</h2>
        <p className="text-muted-foreground leading-relaxed">
          Unusual options activity (UOA) is options volume that runs far above normal levels for a particular stock. It can mean institutional traders, such as hedge funds, pension funds, or large trading desks, are building new positions.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The usual indicators are the <Link href="/blog/how-to-read-options-volume-vs-open-interest" className="text-primary hover:underline font-medium">volume-to-open-interest ratio</Link> (fresh activity against positions already on the books), <strong className="text-foreground">dollar flow</strong> (how much capital moved), and <strong className="text-foreground">directional imbalance</strong> (calls against puts).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">How GammaRips uses it.</strong> Membership in the pool is decided by underlying liquidity and Combo A contract microstructure gates—not unusual activity alone. We measure and publish flow context alongside every contract because it is valuable point-in-time context for an AI agent researching a setup.
        </p>
        <div id="conviction-score" className="mt-6 rounded-lg border bg-card/50 p-5 space-y-3 scroll-mt-24">
          <h3 className="font-bold font-headline text-lg">The flow score, in plain English</h3>
          <p className="text-sm text-muted-foreground">
            Each name in the pool carries a 0 to 10 flow score. It is a descriptive checklist, not a predictive black-box model:
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-outside ml-4">
            <li><strong className="text-foreground">One-sided money.</strong> Option dollars piled onto one side, calls well over puts.</li>
            <li><strong className="text-foreground">New money.</strong> The day&apos;s trading against the positions already on the books.</li>
            <li><strong className="text-foreground">Multi-strike positioning.</strong> Buying spread across several strikes rather than a single lottery ticket.</li>
            <li><strong className="text-foreground">Size of the new positioning.</strong> Total dollar premium committed on that side.</li>
            <li><strong className="text-foreground">Underlying confirmation.</strong> Whether the stock price confirmed with a move on the session.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Reading it:</strong> the score summarizes point-in-time positioning context for your AI. It is not a forecast and never replaces contract microstructure or volatility filters.
          </p>
        </div>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">How to connect your AI agent</h2>
        <p className="text-muted-foreground leading-relaxed">
          With GammaRips connected over MCP, your AI (Claude, ChatGPT, Cursor, Codex, or the open-source harness) works as your options research analyst—reading tonight&apos;s dataset, checking 10-minute morning liquidity and earnings dates, inspecting historical 3-day MFE/MAE outcome surfaces, and laying out a structured plan for your risk budget.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Here is the on-ramp: <strong className="text-foreground">Free 3-contract preview:</strong> browse <Link href="/signals" className="text-primary hover:underline">/signals</Link> on the web or connect any MCP client to the anonymous endpoint for the 3-contract preview, daily macro report, regime context, and playbooks. <strong className="text-foreground">Pro ({PRICE_MONTHLY}/mo full dataset):</strong> connect to <code className="text-xs text-foreground">{MCP_PRO_ENDPOINT}</code> or pass your API key after starting your {TRIAL_DAYS}-day free trial to unlock all 40–50 daily Combo A contracts, 10-minute intraday liquidity snapshots, and full 3-day excursion outcome history. See the <Link href="/developers" className="text-primary hover:underline">MCP &amp; Developers</Link> reference for per-client setup.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section>
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold font-headline text-lg">Your analysis, your account</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  GammaRips publishes curated options market data, historical excursion outcomes, and educational research. The dataset is the output of a deterministic mechanical pipeline, not personalized advice, and anything your AI concludes from the data is your own analysis. You trade your own account. GammaRips does not manage your money. Past results do not promise future results. Educational only. Not investment advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12 sm:my-16" />

      <div className="text-center space-y-5">
        <h2 className="text-2xl font-bold font-headline">Put your AI on tonight&apos;s dataset</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Start your {TRIAL_DAYS}-day free trial of Pro MCP access, or connect the free 3-contract preview in the AI client you already use.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/pricing">
              Get Pro MCP Access ({PRICE_MONTHLY}/mo) <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signals">View 3-contract preview</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          {INSTALL_LINKS.map((l) => (
            <Button key={l.id} asChild variant="ghost" size="sm">
              <Link href={l.href}>Add to {l.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
