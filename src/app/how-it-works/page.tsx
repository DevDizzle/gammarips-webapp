import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Disclosure } from '@/components/ui/disclosure';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, Layers, ShieldCheck, MessageSquareText } from 'lucide-react';
import {
  BUILD_STANDARD_PRICE,
  BUILD_TURNAROUND_DAYS,
  HARNESS_REPO,
  OG_IMAGE,
  PRICE_ANNUAL,
  PRICE_MONTHLY,
  TRIAL_DAYS,
} from '@/lib/constants';
import { INSTALL_LINKS } from '@/lib/receipts';

const DESCRIPTION =
  'See how GammaRips scans 3,500+ US stocks nightly for liquidity and volatility edge, streaming setups for stocks, 2x ETFs, and options to your AI over MCP.';

// Root layout applies `%s | GammaRips` — never add `| GammaRips` here.
export const metadata: Metadata = {
  title: 'How It Works: Nightly Market Data Pipeline & MCP',
  description: DESCRIPTION,
  alternates: { canonical: 'https://gammarips.com/how-it-works' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'How It Works: Nightly Market Data Pipeline & MCP | GammaRips',
    description: DESCRIPTION,
    url: 'https://gammarips.com/how-it-works',
  },
};

const pillars = [
  {
    icon: Layers,
    title: '1. Nightly Liquidity Filter',
    body: 'Every night we narrow 3,500+ US stocks down to 40–50 highly liquid setups — cutting thin books, wide spreads, and short-term decay traps automatically.',
  },
  {
    icon: ShieldCheck,
    title: '2. Live Morning Verification',
    body: 'Before you act, your AI checks live 10-minute morning liquidity, upcoming earnings dates, and 3-day historical move ranges to size targets and stops.',
  },
  {
    icon: MessageSquareText,
    title: '3. Trade Your Preferred Vehicle',
    body: 'Every setup maps to the underlying stock (1x), 2x/inverse single-stock ETFs, and a liquid call option. Run it inside your AI or have us build a custom bot.',
  },
];

const pipelineTimeline = [
  {
    time: '23:00 ET',
    stage: 'Nightly Universe & Liquidity Scan',
    detail:
      'Scans ~3,500 optionable US stocks, narrows to the 100 most liquid names (3M+ session shares, 25+ strikes), and keeps bullish setups whose contracts clear strict pricing and open-interest floors.',
  },
  {
    time: '05:30 ET',
    stage: 'Volatility Value, ETF Mapping & News Catalysts',
    detail:
      'Scores realized-vs-implied volatility for each setup, maps the matching 1x stock and 2x long/inverse single-stock ETFs, computes technical levels, and attaches grounded news catalysts.',
  },
  {
    time: '06:30–07:00 ET',
    stage: 'Clean Dataset & Morning Briefing Publish',
    detail:
      'Publishes the leakage-checked daily dataset over MCP alongside our plain-English Morning Briefing before the opening bell.',
  },
  {
    time: '09:02–16:52 ET',
    stage: 'Live 10-Minute Morning & Intraday Liquidity Checks',
    detail:
      'Captures fresh contract open interest and active session volume every 10 minutes via get_liquidity so your AI verifies real morning depth before sizing any plan.',
  },
];

const researchFindings = [
  {
    gate: 'Realized vs. Implied Volatility',
    stat: '#1 historical move predictor (N = 5,575)',
    plain:
      'Highlights stocks whose actual recent daily range justifies what options markets are charging — helping your AI separate fairly priced volatility from overpriced hype.',
  },
  {
    gate: 'Minimum $1.00 Contract Floor',
    stat: 'Eliminates $0.05 penny-tick drag',
    plain:
      'Sub-dollar contracts often carry 5%–15% hidden bid-ask spread taxes on entry and exit. Cutting them upfront protects fill quality.',
  },
  {
    gate: 'Deep Resting Open Interest (500+)',
    stat: '5-minute open fills: 30.3% → 50.1%',
    plain:
      'Auditing historical opening fills showed that requiring at least 500 resting contracts lifted fast 5-minute fills from 30.3% to 50.1% (and 56.5% at 1,000+ OI).',
  },
  {
    gate: 'Balanced Pricing & Expiration Band',
    stat: '3-day +40% touches: 27.6% → 35.4%',
    plain:
      'Cutting far-out-of-the-money lottery tickets (Delta < 0.22) and rapid decay traps (< 10 days) lifted historical 3-day +40% touch rates from 27.6% to 35.4%.',
  },
];

export const revalidate = 3600;

export default async function HowItWorksPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How GammaRips Turns 3,500+ US Stocks Into Clean AI Trading Data',
    description: DESCRIPTION,
    image: 'https://gammarips.com/og-image.png?v=4',
    url: 'https://gammarips.com/how-it-works',
    mainEntityOfPage: 'https://gammarips.com/how-it-works',
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
  };

  return (
    <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Learn · How It Works
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-bold font-headline tracking-tight">
          How GammaRips turns 3,500+ US stocks into clean AI trading data.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
          Raw AI chats guess from stale headlines and can&apos;t see options liquidity or market
          flow. Every night we filter the US market into 40–50 clean setups mapped to stocks, 2x
          ETFs, and options — ready for your AI over MCP.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title} className="bg-card/50">
              <CardContent className="p-5">
                <Icon className="h-6 w-6 text-primary" />
                <h2 className="mt-3 font-bold font-headline text-lg">{p.title}</h2>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{p.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mid-page Dual CTA */}
      <div className="mt-8 rounded-xl border border-primary/30 bg-card/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          <p className="font-semibold text-foreground">
            Ready to test it in Claude, ChatGPT, or Cursor?
          </p>
          <p className="text-muted-foreground">
            Start a {TRIAL_DAYS}-day free trial ({PRICE_MONTHLY}/mo or {PRICE_ANNUAL}/yr) or order a
            custom 5-day trading bot ({BUILD_STANDARD_PRICE}).
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Button asChild size="sm">
            <Link href="/pricing">Start Free Trial &rarr;</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/build">Custom Agent Build</Link>
          </Button>
        </div>
      </div>

      <Separator className="my-12" />

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-headline">
            The Daily Schedule (All Times ET)
          </h2>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Every number is locked before the opening bell so backtests and live AI prompts see the
            exact same data — then refreshed every 10 minutes during trading hours.
          </p>
        </div>

        <div className="space-y-3.5">
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
            Earnings &amp; Live News: Verified Before You Enter
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Upcoming earnings are never silently hidden from the pool. Instead, your AI checks each
            candidate&apos;s earnings date (<code className="text-xs text-foreground">get_signal(view=&quot;earnings&quot;)</code>),
            confirms live morning volume (<code className="text-xs text-foreground">get_liquidity()</code>),
            and can layer on live news &amp; X research using the open-source{' '}
            <a
              href={HARNESS_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-mono text-xs"
            >
              gammarips-harness
            </a>
            .
          </p>
        </div>
      </section>

      <Separator className="my-12" />

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-headline">
            Why These Filters Matter (Audited Across 5,575 Contracts)
          </h2>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Every filter rule came from testing real historical cohorts across{' '}
            <strong className="text-foreground">5,575 setups over 66 trading dates</strong> — keeping
            what improved fills and move quality, and cutting what didn&apos;t.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {researchFindings.map((item) => (
            <Card key={item.gate} className="bg-card/50">
              <CardContent className="p-5 space-y-2">
                <p className="text-xs font-mono text-primary font-semibold">
                  {item.stat}
                </p>
                <h3 className="font-bold font-headline text-lg text-foreground">
                  {item.gate}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.plain}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Disclosure
          label="Exact technical thresholds & formulas (Combo A specification)"
          hint="For quantitative analysts & developers"
        >
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm leading-relaxed">
            <li>
              <strong className="text-foreground">Contract floors (23:00 ET):</strong>{' '}
              <code className="text-foreground">Mid &gt;= $1.00</code>,{' '}
              <code className="text-foreground">OI &gt;= 500</code> (log-saturated to 5,000),{' '}
              <code className="text-foreground">Delta 0.22–0.48</code>,{' '}
              <code className="text-foreground">DTE 10–45</code>.
            </li>
            <li>
              <strong className="text-foreground">Volatility enrichment (05:30 ET):</strong>{' '}
              <code className="text-foreground">rv_iv_ratio = (ATR_14 / Underlying_Price × √252) / IV</code>{' '}
              (benchmark threshold <code className="text-foreground">&gt;= 0.85</code> used by agents to screen underpriced volatility).
            </li>
            <li>
              <strong className="text-foreground">Full research writeups:</strong>{' '}
              <Link href="/methodology" className="text-primary hover:underline">Methodology</Link> ·{' '}
              <Link href="/lab" className="text-primary hover:underline">Research Lab</Link> ·{' '}
              <Link href="/blog/catalyst-lab-combo-a-options-microstructure-audit" className="text-primary hover:underline">Walk-Forward Audit Post</Link>.
            </li>
          </ul>
        </Disclosure>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Historical walk-forward research on paper-tracked cohorts (N = 5,575 across 66 scan dates). Educational only, not investment advice.
        </p>
      </section>

      <Separator className="my-12" />

      <section className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold font-headline">
          What is unusual options activity — and how do we use it?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Unusual options activity happens when options volume spikes far above a stock&apos;s
          normal daily level — often signaling large funds or institutions positioning ahead of a
          move. Traders watch{' '}
          <Link href="/blog/how-to-read-options-volume-vs-open-interest" className="text-primary hover:underline font-medium">
            volume vs. open interest
          </Link>
          , total dollar flow, and call-vs-put balance.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">How GammaRips is different:</strong> Liquidity and
          tradability decide which names enter the pool — not noisy unusual-activity alerts alone.
          We publish a simple 0–10 descriptive flow checklist alongside every setup as extra context
          for your AI, never as a blind buy rating.
        </p>

        <Disclosure label="See what the 0–10 flow checklist measures" hint="5 descriptive context signals">
          <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-outside ml-4">
            <li><strong className="text-foreground">One-sided money:</strong> Option dollars leaning clearly toward calls over puts.</li>
            <li><strong className="text-foreground">Fresh activity:</strong> Today&apos;s volume compared to contracts already open.</li>
            <li><strong className="text-foreground">Multi-strike interest:</strong> Activity spread across several strikes rather than one lottery ticket.</li>
            <li><strong className="text-foreground">Dollar commitment:</strong> Total premium moving on the dominant side.</li>
            <li><strong className="text-foreground">Stock confirmation:</strong> Whether the underlying stock price moved in the same direction.</li>
          </ul>
        </Disclosure>
      </section>

      <Separator className="my-12" />

      <section>
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold font-headline text-lg">Your analysis, your brokerage account</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  GammaRips is a market-data and software-engineering vendor. We publish filtered
                  market data, historical move statistics, and work-for-hire trading bots — never
                  personalized investment advice. You control your own account and risk. Past
                  results do not guarantee future performance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <div className="text-center space-y-5">
        <h2 className="text-2xl font-bold font-headline">Put your AI on tonight&apos;s market pool</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Start your {TRIAL_DAYS}-day free trial of Pro MCP ({PRICE_MONTHLY}/mo or {PRICE_ANNUAL}/yr),
          browse today&apos;s free 3-setup preview, or have us build a custom bot in{' '}
          {BUILD_TURNAROUND_DAYS} days ({BUILD_STANDARD_PRICE}).
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="font-semibold">
            <Link href="/pricing">
              Start {TRIAL_DAYS}-Day Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/build">Custom Agent Build ({BUILD_STANDARD_PRICE})</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signals">Free 3-Setup Preview</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 justify-center pt-1">
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
