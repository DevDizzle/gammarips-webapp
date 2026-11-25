import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Check,
  Code2,
  Cpu,
  FileCheck2,
  GitBranch,
  Lock,
  ShieldAlert,
  Terminal,
  X,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Disclosure } from '@/components/ui/disclosure';
import { BuildIntakeForm } from '@/components/build/build-intake-form';
import { getXTraderSummary } from '@/lib/xtrader';
import {
  AGENT_CARE_MCP_PRICE,
  AGENT_CARE_PRICE,
  BUILD_CUSTOM_MIN_PRICE,
  BUILD_STANDARD_PRICE,
  BUILD_TURNAROUND_DAYS,
  OG_IMAGE,
  PRICE_ANNUAL,
} from '@/lib/constants';

export const dynamic = 'force-dynamic';

const BUILD_PRICE_NUMERIC = (Number(BUILD_STANDARD_PRICE.replace(/[^0-9.]/g, '')) || 0).toFixed(2);

// Root layout applies `%s | GammaRips` — never add `| GammaRips` here.
export const metadata: Metadata = {
  title: `Custom AI Trading Agent Build (${BUILD_STANDARD_PRICE}, ${BUILD_TURNAROUND_DAYS} Days)`,
  description: `Turn your rules for stocks, 2x ETFs, or options into a safety-hardened Python trading bot in ${BUILD_TURNAROUND_DAYS} days for ${BUILD_STANDARD_PRICE} flat. Paper-first, 100% your private repo.`,
  alternates: { canonical: 'https://gammarips.com/build' },
  openGraph: {
    images: [OG_IMAGE],
    title: `Custom AI Trading Agent Build (${BUILD_STANDARD_PRICE}, ${BUILD_TURNAROUND_DAYS} Days) | GammaRips`,
    description: `Work-for-hire Python & AI trading bot engineering across stocks, 2x/inverse ETFs, and options. Limit-only orders, automatic stops, Paper-first handoff, ${BUILD_TURNAROUND_DAYS}-day delivery.`,
    url: 'https://gammarips.com/build',
  },
};

const safetyRails = [
  {
    icon: Lock,
    title: 'No Bad Market-Order Fills',
    body: 'Limit orders only — zero blind market orders. Every stock, 2x ETF, and option order checks the live bid-ask spread before submitting.',
  },
  {
    icon: ShieldAlert,
    title: 'Automatic Stops & Flat-by-Close',
    body: 'Hard stop-losses, daily max-loss breakers, and automatic end-of-day exits (including NYSE holidays and half-days) calculate straight from your real fill price.',
  },
  {
    icon: FileCheck2,
    title: 'Crash-Safe Duplicate-Order Protection',
    body: 'If your internet drops or your server restarts mid-session, our order ledger reconciles open positions so your bot never double-buys by mistake.',
  },
  {
    icon: GitBranch,
    title: '100% Your Private Code & Broker Keys',
    body: 'Delivered to your own private GitHub repo with ready-to-run server files and unit tests in Paper Mode. You hold your broker keys on your own machine or cloud server.',
  },
];

const standardIncluded = [
  'Your written entry, sizing, stop, and exit rules built cleanly in Python 3.12 (rule-based or AI-assisted)',
  'Trade US stocks (1x), 2x long / inverse single-stock ETFs, or single-leg US options',
  '1 market-data feed: GammaRips Pro MCP, Polygon/Massive, Alpaca, TradingView webhooks, or your own API',
  '1 broker connection: Robinhood MCP, Alpaca, Tradier, or Interactive Brokers — plus a built-in Paper Mode simulator',
  'Full production safety suite: limit-only orders, fill-based stops, duplicate-order protection, and clear daily decision logs',
  `${BUILD_TURNAROUND_DAYS}-business-day delivery to your private GitHub repo + server startup files + 1 revision round`,
];

const outOfScope = [
  'Recommending strategies, picking trades for you, or promising returns (you supply and own the rules)',
  'Holding custody of your money or storing your live brokerage credentials on GammaRips servers',
  `Multi-leg option spreads (iron condors/calendars), custom web dashboards, or multi-broker routing (quoted at ${BUILD_CUSTOM_MIN_PRICE}+)`,
];

export default async function BuildAgentPage() {
  const xtraderSummary = await getXTraderSummary().catch(() => null);

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'GammaRips Custom AI Trading Agent Build',
    description: `Fixed-scope custom Python trading bot engineering for stocks, 2x/inverse ETFs, or options delivered in Paper Mode in ${BUILD_TURNAROUND_DAYS} business days.`,
    provider: {
      '@type': 'Organization',
      name: 'GammaRips',
      url: 'https://gammarips.com',
    },
    url: 'https://gammarips.com/build',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: BUILD_PRICE_NUMERIC,
      url: 'https://gammarips.com/build',
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-5xl space-y-14">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'Custom Build' },
          ]}
        />

        {/* Hero — Problem-First Framing */}
        <section className="space-y-5 text-center max-w-4xl mx-auto">
          <Badge className="bg-primary/20 text-primary border-primary/40 uppercase tracking-wider text-xs">
            Done-For-You Trading Bot Engineering · {BUILD_STANDARD_PRICE} Flat
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold font-headline tracking-tight">
            Bring your trading rules.
            <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              We build your safety-hardened bot in {BUILD_TURNAROUND_DAYS} days.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Most DIY trading scripts blow up on bad market orders, crash loops, or missed early
            closes. Whether you trade <strong className="text-foreground">US stocks</strong>,{' '}
            <strong className="text-foreground">2x/inverse ETFs</strong>, or{' '}
            <strong className="text-foreground">options</strong>, we turn your written rules into a
            reliable Python bot wired to{' '}
            <Link href="/developers" className="text-primary hover:underline">
              GammaRips MCP
            </Link>{' '}
            or your own data feed — delivered in Paper Mode with 100% code ownership.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="font-semibold">
              <a href="#spec-intake">Submit Rules &amp; Lock {BUILD_STANDARD_PRICE} Slot &rarr;</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/xtrader">Watch Our Live Benchmark Bot &rarr;</Link>
            </Button>
          </div>
        </section>

        {/* Live Engineering Proof Banner */}
        <section className="rounded-2xl border border-primary/30 bg-card/60 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary">
              <Terminal className="h-4 w-4" />
              <span>Proven In Public — Not Slideware</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-headline text-foreground">
              Built on the same engine running our live X-Trader benchmark
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Every market morning at 10:05 ET, our own automated agent reads the GammaRips nightly
              pool, checks live news catalysts, and runs two isolated paper accounts side by side:{' '}
              <strong className="text-foreground">2x/inverse ETFs &amp; stocks</strong> vs.{' '}
              <strong className="text-foreground">options</strong>{' '}
              {xtraderSummary?.total_sessions
                ? `(${xtraderSummary.total_sessions} public sessions logged)`
                : '(live daily decision logs open to inspect)'}
              .
            </p>
          </div>
          <Button asChild variant="secondary" className="shrink-0">
            <Link href="/xtrader">Inspect Live Daily Log &rarr;</Link>
          </Button>
        </section>

        {/* 4 Safety Rails */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline">
              Four Safety Guardrails Built Into Every Bot
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              You focus on your trading rules; we make sure the software handles real-world broker
              edge cases safely from day one.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {safetyRails.map((rail) => {
              const Icon = rail.icon;
              return (
                <Card key={rail.title} className="bg-card/50 border-border/80">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-primary/15 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">
                        {rail.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {rail.body}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="max-w-3xl mx-auto">
            <Disclosure
              label="Under the hood: architecture & deployment details for developers"
              hint="Docker, systemd, idempotent intent ledger & JSONL logs"
            >
              <p className="leading-relaxed">
                Every standard build ships as a clean Python 3.12 repository containing your
                strategy module, broker adapter + mandatory <code className="text-foreground">PaperBroker</code>,
                idempotent order-intent state files, tick-rounded limit-price helpers, NYSE holiday
                &amp; early-close calendar guards, structured JSONL decision traces, pytest unit
                tests, a <code className="text-foreground">Dockerfile</code>, and a{' '}
                <code className="text-foreground">systemd</code> service unit for hands-off VPS or
                local hosting.
              </p>
            </Disclosure>
          </div>
        </section>

        {/* Transparent Scope & Pricing */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline">
              Clear Fixed Scope &amp; Optional Ongoing Care
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              One flat engineering fee to ship your bot, plus optional monthly maintenance if you
              want us to handle broker or API updates after handoff.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <Card className="md:col-span-2 border-primary/50 bg-card/60">
              <CardHeader className="border-b border-border/70 pb-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <CardTitle className="text-xl sm:text-2xl font-bold font-headline">
                    Standard Custom Agent Build
                  </CardTitle>
                  <div>
                    <span className="text-3xl sm:text-4xl font-bold">{BUILD_STANDARD_PRICE}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">one-time</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Delivered in {BUILD_TURNAROUND_DAYS} business days to your private GitHub
                  repository, verified in live-market Paper Mode.
                </p>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                <ul className="space-y-2.5">
                  {standardIncluded.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-border/70 pt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Outside {BUILD_STANDARD_PRICE} Standard Scope
                  </p>
                  <ul className="space-y-1.5">
                    {outOfScope.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <X className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card className="bg-card/50 border-border/80">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-primary">
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Optional at Handoff</span>
                  </div>
                  <CardTitle className="text-lg font-bold font-headline mt-1">
                    Agent Care Plan
                  </CardTitle>
                  <div className="pt-1">
                    <span className="text-2xl font-bold">{AGENT_CARE_PRICE}</span>
                    <span className="text-xs text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2.5 leading-relaxed">
                  <p>
                    Covers broker or data API changes, dependency updates, bug fixes, and small rule
                    tweaks (up to 2 hrs/mo, 24–48h business-day response).
                  </p>
                  <p className="text-foreground font-medium">
                    Bundle option: {AGENT_CARE_MCP_PRICE}/mo includes Agent Care + full{' '}
                    <Link href="/pricing" className="text-primary hover:underline">
                      GammaRips Pro MCP
                    </Link>{' '}
                    ({PRICE_ANNUAL}/yr standalone). Never billed during build week.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/80">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
                    <Code2 className="h-3.5 w-3.5" />
                    <span>Multi-Agent / Multi-Leg</span>
                  </div>
                  <CardTitle className="text-lg font-bold font-headline mt-1">
                    Custom Scope Project
                  </CardTitle>
                  <div className="pt-1">
                    <span className="text-2xl font-bold">{BUILD_CUSTOM_MIN_PRICE}+</span>
                    <span className="text-xs text-muted-foreground"> custom quote</span>
                  </div>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed">
                  Need multi-leg option spreads, custom web dashboards, multiple broker accounts, or
                  custom research pipelines? Submit your idea for a free 24-hour scope check below.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Interactive Intake Form */}
        <Suspense
          fallback={
            <Card className="border-border/70 bg-card/50">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Loading specification intake form…
              </CardContent>
            </Card>
          }
        >
          <BuildIntakeForm />
        </Suspense>

        <p className="text-xs text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed">
          GammaRips is a market-data and software-engineering vendor, not an investment adviser or
          broker-dealer. Custom builds implement client-authored rules on a work-for-hire basis and
          ship in Paper Mode by default. Trading stocks, leveraged ETFs, and options involves
          substantial risk of loss.
        </p>
      </main>
    </div>
  );
}
