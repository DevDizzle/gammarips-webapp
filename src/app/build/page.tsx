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

export const metadata: Metadata = {
  title: 'Custom AI Trading Agent Build ($1,000 Fixed Scope) | GammaRips',
  description:
    'Bring your written trading rules across stocks, 2x/inverse ETFs, or options. We engineer, safety-harden, and deliver your autonomous Python trading agent in 5 business days for $1,000 flat.',
  alternates: { canonical: 'https://gammarips.com/build' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Custom AI Trading Agent Build ($1,000 Fixed Scope) | GammaRips',
    description:
      'Work-for-hire Python & AI trading agent engineering across stocks, 2x/inverse ETFs, and options. Hard limit-order & stop guardrails, Paper-first handoff, 5-day delivery.',
    url: 'https://gammarips.com/build',
  },
};

const safetyRails = [
  {
    icon: Lock,
    title: 'Limit-Orders Only (Zero Market Orders)',
    body: 'Every equity, 2x/inverse ETF, and option adapter enforces tick-rounded limit prices with configurable spread gates so wide books never slip a fill.',
  },
  {
    icon: ShieldAlert,
    title: 'Fill-Derived Stops & Flat-by-Close',
    body: 'Hard percentage stops, max daily loss breakers, and NYSE holiday/early-close exit timers derive automatically from actual broker fill prices.',
  },
  {
    icon: FileCheck2,
    title: 'Restart-Safe Order-Intent Ledger',
    body: 'Idempotent order-intent state files ensure a daemon restart or network timeout reconciles open orders instead of ever double-buying.',
  },
  {
    icon: GitBranch,
    title: '100% Your Private Repo & API Keys',
    body: 'Delivered to your private GitHub repo with Docker + systemd unit + unit tests in Paper Mode. You hold your own broker keys on your own machine or VPS.',
  },
];

const standardIncluded = [
  '1 written deterministic or LLM-assisted entry, sizing, stop, and exit rule set in Python 3.12',
  'Multi-instrument support: US stocks (1x), 2x long / inverse single-stock ETFs, or single-leg US options',
  '1 market-data adapter: GammaRips Pro MCP, Polygon/Massive, Alpaca, TradingView webhook, or your REST feed',
  '1 broker adapter: Robinhood MCP, Alpaca, Tradier, Interactive Brokers (IBKR Gateway), + mandatory PaperBroker',
  'Hardened x-trader safety architecture: limit-only orders, fill-derived stops, idempotent intent ledger, JSONL decision traces',
  `${BUILD_TURNAROUND_DAYS}-business-day delivery to your private GitHub repo + Docker/systemd setup + 1 revision round`,
];

const outOfScope = [
  'Recommending trading strategies, alpha discovery, or promising returns (you supply the rules)',
  'Holding custody of your capital or storing your live broker credentials on GammaRips servers',
  `Multi-leg options structures (iron condors/calendars), custom web UIs, or multi-broker routing (quoted at ${BUILD_CUSTOM_MIN_PRICE}+)`,
];

export default async function BuildAgentPage() {
  const xtraderSummary = await getXTraderSummary().catch(() => null);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-5xl space-y-14">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'Build an Agent' },
          ]}
        />

        {/* Hero */}
        <section className="space-y-5 text-center max-w-4xl mx-auto">
          <Badge className="bg-primary/20 text-primary border-primary/40 uppercase tracking-wider text-xs">
            Done-For-You Trading Agent Engineering · {BUILD_STANDARD_PRICE} Fixed Scope
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold font-headline tracking-tight text-balance">
            Bring your trading rules.
            <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              We engineer &amp; deploy your autonomous agent in {BUILD_TURNAROUND_DAYS} days.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Whether your system trades <strong className="text-foreground">US stocks</strong>,{' '}
            <strong className="text-foreground">2x long &amp; inverse ETFs</strong>, or{' '}
            <strong className="text-foreground">options</strong>, we turn your written strategy into
            a production-hardened Python daemon using{' '}
            <Link href="/developers" className="text-primary hover:underline">
              GammaRips MCP intelligence
            </Link>{' '}
            or your own market-data feed. {BUILD_STANDARD_PRICE} one-time build, optional{' '}
            {AGENT_CARE_PRICE}/mo maintenance, Paper-first handoff, and 100% code ownership.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg">
              <a href="#spec-intake">Submit Spec &amp; Lock {BUILD_STANDARD_PRICE} Slot &rarr;</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/xtrader">Inspect Our Live X-Trader Agent &rarr;</Link>
            </Button>
          </div>
        </section>

        {/* Live Engineering Proof Banner */}
        <section className="rounded-2xl border border-primary/30 bg-card/60 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary">
              <Terminal className="h-4 w-4" />
              <span>Live Reference Architecture — Not Pitchware</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-headline text-foreground">
              Built on the same core daemon powering GammaRips X-Trader
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Every morning at 10:05 ET, our autonomous multi-agent system ingests the GammaRips
              Combo A dataset, runs Gemini catalyst scoring, and executes isolated paper books across{' '}
              <strong className="text-foreground">2x/inverse ETFs &amp; stocks</strong> and{' '}
              <strong className="text-foreground">OPRA options</strong>{' '}
              {xtraderSummary?.total_sessions
                ? `(${xtraderSummary.total_sessions} published sessions logged in public)`
                : '(streaming live session logs in public)'}
              .
            </p>
          </div>
          <Button asChild variant="secondary" className="shrink-0">
            <Link href="/xtrader">View Live Telemetry Log &rarr;</Link>
          </Button>
        </section>

        {/* 4 Safety Rails */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline">
              Production Safety Guardrails Included in Every Build
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Most DIY trading scripts blow up on market orders, crash loops, or missed early-close
              calendars. Every standard build ships on our battle-tested risk kernel.
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
        </section>

        {/* Transparent Scope & Pricing */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline">
              Clear Fixed Scope &amp; Optional Ongoing Care
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              One flat engineering fee to ship your agent, plus optional post-handoff maintenance so
              broker or API changes never stall your workflow.
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
                    Explicitly Outside {BUILD_STANDARD_PRICE} Standard Scope
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
                    Covers broker/data API drift patches, Python dependency updates, bug fixes, and
                    small parameter adjustments (up to 2 hrs/mo, 24–48h business response).
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
                    Custom Scope SOW
                  </CardTitle>
                  <div className="pt-1">
                    <span className="text-2xl font-bold">{BUILD_CUSTOM_MIN_PRICE}+</span>
                    <span className="text-xs text-muted-foreground"> custom quote</span>
                  </div>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground leading-relaxed">
                  Need multi-leg spreads, custom web dashboards, multiple broker accounts, or custom
                  research pipelines? Submit your spec using the free 24-hour scope check below.
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
