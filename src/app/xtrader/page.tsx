import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { InstallCta } from '@/components/landing/install-cta';
import { XTraderDashboard } from '@/components/xtrader/xtrader-dashboard';
import { getXTraderSessions, getXTraderSummary } from '@/lib/xtrader';
import { HARNESS_REPO, OG_IMAGE } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'X-Trader Live Agent Log | GammaRips',
  description:
    'Near-live daily decision log, multi-agent Gemini reasoning, and paper-trading P&L from an autonomous options agent built on the GammaRips Combo A MCP dataset. Educational market data only, not investment advice.',
  alternates: { canonical: 'https://gammarips.com/xtrader' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'X-Trader Live Agent Log | GammaRips',
    description:
      'Near-live daily decision log, multi-agent reasoning, and complete cohort P&L from an autonomous agent built on GammaRips MCP.',
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
            X-Trader Live Agent Log
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl leading-relaxed">
            Every trading morning, our reference multi-agent system pulls the{' '}
            <Link href="/signals" className="text-primary hover:underline">
              GammaRips Combo A pool
            </Link>
            , checks real-time OPRA NBBO quotes, runs parallel Gemini Researcher and Scorer pairs
            over 24-hour X catalyst activity, and streams every decision, pass, and trade live to
            this page.
          </p>
        </section>

        <XTraderDashboard summary={summary} sessions={sessions} />

        <section className="rounded-2xl border border-primary/30 bg-card/60 px-5 py-10 md:p-10 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-balance">
            Build your own agent on the same Combo A dataset.
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            X-Trader consumes the exact same GammaRips MCP primitives available to your AI client or
            open-source harness. Inspect the{' '}
            <a
              href={HARNESS_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              gammarips-harness
            </a>{' '}
            starter kit or connect over MCP.
          </p>
          <div className="pt-2">
            <InstallCta />
          </div>
        </section>
      </main>
    </div>
  );
}
