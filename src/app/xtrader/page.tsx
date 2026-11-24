import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { InstallCta } from '@/components/landing/install-cta';
import { Button } from '@/components/ui/button';
import { XTraderDashboard } from '@/components/xtrader/xtrader-dashboard';
import { getXTraderSessions, getXTraderSummary } from '@/lib/xtrader';
import {
  BUILD_STANDARD_PRICE,
  BUILD_TURNAROUND_DAYS,
  HARNESS_REPO,
  OG_IMAGE,
} from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'X-Trader Live Agent Log: 2x/Inverse ETFs vs. Options | GammaRips',
  description:
    'Near-live daily decision log, multi-agent Gemini reasoning, and head-to-head paper-trading P&L (2x/inverse ETFs & stocks vs. single-leg options) built on the GammaRips Combo A MCP dataset. Educational market data only, not investment advice.',
  alternates: { canonical: 'https://gammarips.com/xtrader' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'X-Trader Live Agent Log: 2x/Inverse ETFs vs. Options | GammaRips',
    description:
      'Near-live daily decision log, multi-agent reasoning, and dual-book cohort P&L (2x/inverse ETFs vs. options) built on GammaRips MCP.',
    url: 'https://gammarips.com/xtrader',
  },
};

export default async function XTraderPage() {
  const [summary, sessions] = await Promise.all([
    getXTraderSummary(),
    getXTraderSessions(60),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-10">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'X-Trader Live Log' },
          ]}
        />

        <section className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
            X-Trader Live Multi-Instrument Benchmark
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl leading-relaxed">
            Every trading morning, our reference multi-agent daemon pulls the{' '}
            <Link href="/signals" className="text-primary hover:underline">
              GammaRips Combo A pool
            </Link>
            , runs parallel Gemini Researcher and Scorer pairs over 24-hour X catalyst activity, and
            executes one shared signal across two isolated paper books:{' '}
            <strong className="text-foreground">Book A (2x Long / Inverse ETFs &amp; Stocks)</strong>{' '}
            vs. <strong className="text-foreground">Book B (Combo A Options)</strong>.
          </p>
        </section>

        <XTraderDashboard summary={summary} sessions={sessions} />

        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-primary/30 bg-card/60 px-5 py-8 md:p-8 text-center space-y-4">
            <h2 className="text-xl md:text-2xl font-bold font-headline text-balance">
              DIY: Connect the same MCP intelligence to your AI.
            </h2>
            <p className="text-sm text-muted-foreground">
              Stream the daily Combo A dataset and mapped <code className="text-xs">execution_vehicles</code>{' '}
              into Claude, ChatGPT, Cursor, Codex, or the open-source{' '}
              <a
                href={HARNESS_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                gammarips-harness
              </a>
              .
            </p>
            <div className="pt-1">
              <InstallCta />
            </div>
          </div>

          <div className="rounded-2xl border border-primary/40 bg-card/70 px-5 py-8 md:p-8 text-center space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold font-headline text-balance">
                Done-For-You: Custom Trading Agent in {BUILD_TURNAROUND_DAYS} Days ({BUILD_STANDARD_PRICE})
              </h2>
              <p className="text-sm text-muted-foreground">
                Have your own rules for stocks, 2x/inverse ETFs, or options? We engineer and harden
                your autonomous Python bot on the exact limit-order, fill-stop, and restart-safe
                ledger architecture running above—delivered to your private GitHub repo.
              </p>
            </div>
            <div className="pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/build">Submit Your Agent Spec ({BUILD_STANDARD_PRICE}) &rarr;</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
