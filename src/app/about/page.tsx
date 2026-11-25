import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Bot, User, Terminal } from 'lucide-react';
import ContactForm from './contact-form';
import {
  BUILD_STANDARD_PRICE,
  BUILD_TURNAROUND_DAYS,
  HARNESS_REPO,
  OG_IMAGE,
  TOOL_COUNT,
  TRIAL_DAYS,
} from '@/lib/constants';
import { AgentQuickConnect, ProAwareCta } from '@/components/account/agent-quick-connect';

// Root layout applies `%s | GammaRips` — never add `| GammaRips` here.
export const metadata: Metadata = {
  title: 'About Us: Institutional Market Data for AI Agents',
  description:
    'Meet the ML engineer behind GammaRips: building nightly US stock, 2x ETF, and options intelligence over MCP plus custom Python trading agents.',
  alternates: { canonical: 'https://gammarips.com/about' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'About Us: Institutional Market Data for AI Agents | GammaRips',
    description:
      'Meet the ML engineer behind GammaRips: clean nightly market data over MCP and safety-hardened custom trading bots.',
    url: 'https://gammarips.com/about',
  },
};

const proofStats = [
  { value: '50.1%', label: '5-min open fill rate at OI >= 500 (vs 30.3% baseline)' },
  { value: '35.4%', label: '3-day +40% touch rate inside our pricing band (vs 27.6%)' },
  { value: '5,575', label: 'historical contracts audited walk-forward across 66 dates' },
  { value: '5 Days', label: `fixed-scope custom bot delivery (${BUILD_STANDARD_PRICE} flat)` },
];

const principles = [
  'Clean data over black-box picks. Our own walk-forward tests showed black-box single-pick models fail out-of-sample, while simple liquidity and volatility rules hold up. We publish both the wins and the killed ideas.',
  'Trade whichever instrument fits you. Options flow surfaces strong setups, but you never have to trade options — every nightly setup maps directly to the underlying stock (1x), 2x/inverse ETFs, and a liquid option contract.',
  'Built for real-world execution. Thin books, wide spreads, and blind market orders wreck retail traders. Both our nightly filter and our custom agent builds put fill safety first.',
  'Your AI, your rules, your account. GammaRips never manages money, never touches your broker keys, and never tells you what to buy.',
];

interface AboutPageProps {
  searchParams: Promise<{ welcome?: string; session_id?: string }>;
}

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const { welcome, session_id } = await searchParams;
  const isWelcome = welcome === '1';

  // Provision entitlement synchronously from the checkout session, redundant
  // with the Stripe webhook on purpose: the paying user's first landing must
  // not depend on webhook registration or delivery. Idempotent; never throws.
  if (isWelcome && session_id) {
    const { provisionFromCheckoutSession } = await import('@/lib/stripe-sync');
    await provisionFromCheckoutSession(session_id);
  }

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About GammaRips',
    description:
      'Built by ML engineer Evan Parra: nightly US stock, 2x ETF, and options intelligence for AI trading agents over MCP, plus fixed-scope custom trading bot engineering. Educational only, not investment advice.',
    url: 'https://gammarips.com/about',
    publisher: {
      '@type': 'Organization',
      name: 'GammaRips',
      logo: { '@type': 'ImageObject', url: 'https://gammarips.com/og-image.png?v=4' },
    },
  };

  return (
    <>
      <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {isWelcome && (
          <Card className="bg-primary/5 border-primary/40 mb-12">
            <CardHeader>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Welcome to GammaRips Pro
              </p>
              <CardTitle className="font-headline text-2xl sm:text-3xl">
                You&apos;re in. Connect your AI in 60 seconds.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <AgentQuickConnect forceProPrompt={true} />
              <div className="flex flex-wrap gap-3 pt-1">
                <Button asChild>
                  <Link href="/account?welcome=1">Manage Billing &amp; API Keys &rarr;</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/developers#connect">View All Client Configs</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                Your {TRIAL_DAYS}-day free trial is active. Manage or cancel anytime on your account page. Educational market data only, not investment advice.
              </p>
            </CardContent>
          </Card>
        )}

        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">About</p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-bold font-headline tracking-tight">
            Built by an ML engineer
            <span className="block mt-1.5 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              for traders who build with AI.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            GammaRips started from a simple frustration: AI models are brilliant at reasoning, yet
            terrible at market prep when fed noisy headlines and illiquid tickers. We built the
            clean nightly data pipeline and safety-hardened bot engine we wanted for ourselves.
          </p>
        </header>

        <Separator className="my-12" />

        <section id="team" className="scroll-mt-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline">Who builds GammaRips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10 shrink-0">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-headline">Evan Parra</h3>
                    <p className="text-sm text-muted-foreground">Founder &amp; ML Engineer</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Machine-learning engineer and data architect building production cloud pipelines
                  and autonomous trading infrastructure. Evan built GammaRips end to end: the
                  nightly market scanner, the walk-forward research lab, the {TOOL_COUNT}-tool MCP
                  server, and our live X-Trader benchmark engine.
                </p>
                <p className="text-sm text-muted-foreground">
                  Also advises teams on AI architecture at{' '}
                  <Link href="https://evanparra.ai" target="_blank" className="underline hover:text-primary">
                    evanparra.ai
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-primary/30">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10 shrink-0">
                    <Terminal className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-headline">Two Ways We Help Traders</h3>
                    <p className="text-sm text-muted-foreground">DIY MCP Data &amp; Custom Bot Builds</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">1. DIY Pro MCP:</strong> Stream nightly
                  stocks, 2x/inverse ETFs, and options setups into Claude, ChatGPT, Cursor, or the
                  open-source{' '}
                  <a href={HARNESS_REPO} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                    gammarips-harness
                  </a>
                  .
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">2. Custom Agent Engineering:</strong> Bring
                  your written rules on{' '}
                  <Link href="/build" className="text-primary hover:underline font-medium">
                    /build
                  </Link>{' '}
                  and get a safety-hardened Python bot delivered to your private GitHub repo in{' '}
                  {BUILD_TURNAROUND_DAYS} business days ({BUILD_STANDARD_PRICE} flat).
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        <section id="research" className="scroll-mt-24">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline">
              Backed by Walk-Forward Data &amp; Public Benchmarks
            </h2>
            <p className="mt-2 max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground">
              Every filter threshold was audited on 5,575 historical setups, and our own automated
              agent runs in public every morning on X-Trader.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {proofStats.map((s) => (
              <Card key={s.label} className="bg-card/50">
                <CardContent className="p-5 text-center space-y-1">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</div>
                  <p className="text-xs text-muted-foreground leading-snug">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button asChild>
              <Link href="/how-it-works">See How It Works &rarr;</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/xtrader">Watch Live Benchmark Bot</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/lab">Read Published Lab Audits</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-center text-muted-foreground">
            Historical walk-forward research on paper-tracked cohorts. Educational only, not investment advice.
          </p>
        </section>

        <Separator className="my-12" />

        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold font-headline">How we think about trading tools</h2>
          </div>
          <ul className="space-y-3.5 max-w-2xl mx-auto">
            {principles.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Bot className="h-4 w-4 text-primary mt-1 shrink-0" />
                <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <ProAwareCta />
            <Button asChild variant="outline" size="lg">
              <Link href="/build">Custom Agent Build ({BUILD_STANDARD_PRICE})</Link>
            </Button>
          </div>
        </section>

        <Separator className="my-12" />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-foreground">
              Trust &amp; responsibility
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              GammaRips is a market-data and software-engineering vendor. We publish filtered
              market data, historical move statistics, and custom work-for-hire trading software.
              You always trade your own brokerage account and control your own risk.
            </p>
          </div>
          <aside className="bg-muted/50 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Disclaimer</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Educational market data, historical research, and work-for-hire software only. Not
              investment advice. GammaRips does not manage money or recommend securities. Past
              performance does not guarantee future results.
            </p>
          </aside>
        </section>

        <Separator className="my-12" />

        <section id="contact" className="scroll-mt-20">
          <ContactForm />
        </section>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
    </>
  );
}
