import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { InstallCta } from '@/components/landing/install-cta';
import { Button } from '@/components/ui/button';
import { GlossaryTip } from '@/components/ui/glossary-tip';
import { XTraderDashboard } from '@/components/xtrader/xtrader-dashboard';
import { getXTraderSessions, getXTraderSummary } from '@/lib/xtrader';
import {
  BUILD_STANDARD_PRICE,
  BUILD_TURNAROUND_DAYS,
  HARNESS_REPO,
  OG_IMAGE,
} from '@/lib/constants';

export const dynamic = 'force-dynamic';

// Root layout applies `%s | GammaRips` — never add `| GammaRips` here.
export const metadata: Metadata = {
  title: 'Live AI Trading Agent Log: 2x ETFs vs. Options',
  description:
    'Watch our autonomous AI trading agent trade nightly signals across two live paper books: 2x/inverse ETFs & stocks vs. options. Full daily logs & P&L.',
  alternates: { canonical: 'https://gammarips.com/xtrader' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Live AI Trading Agent Log: 2x ETFs vs. Options | GammaRips',
    description:
      'Watch our autonomous AI trading agent trade the same nightly signals across two live paper accounts: 2x/inverse ETFs & stocks vs. options.',
    url: 'https://gammarips.com/xtrader',
  },
};

export default async function XTraderPage() {
  const [summary, sessions] = await Promise.all([
    getXTraderSummary(),
    getXTraderSessions(60),
  ]);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Live AI Trading Agent Benchmark: 2x ETFs & Stocks vs. Options',
    description:
      'Daily decision logs and head-to-head paper-trading benchmark comparing 2x/inverse ETFs & stocks against single-leg options on the GammaRips nightly pool.',
    url: 'https://gammarips.com/xtrader',
    publisher: {
      '@type': 'Organization',
      name: 'GammaRips',
      url: 'https://gammarips.com',
      logo: { '@type': 'ImageObject', url: 'https://gammarips.com/icon.png' },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-10">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'Live Agent Benchmark' },
          ]}
        />

        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Public Paper-Trading Benchmark · Updated Every Market Morning
          </p>
          <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
            Live AI Trading Agent Benchmark: 2x ETFs &amp; Stocks vs. Options
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl leading-relaxed">
            Can you capture the same nightly setups using 2x leveraged ETFs without paying option
            time decay or wide bid-ask spreads? Every market morning at 10:05 ET, our live paper
            agent reads the{' '}
            <Link href="/signals" className="text-primary hover:underline">
              GammaRips daily pool
            </Link>
            , scans 24-hour news &amp; X catalysts, and trades the exact same setup across two
            separate paper accounts:{' '}
            <strong className="text-foreground">Book A (2x/Inverse ETFs &amp; Stocks)</strong> vs.{' '}
            <strong className="text-foreground">Book B (Liquid Options)</strong>.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-card/50 px-4 py-3 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <span>
                Tracks{' '}
                <strong className="text-foreground">MFE / MAE</strong>
                <GlossaryTip
                  term="MFE / MAE"
                  explanation="Maximum Favorable Excursion (highest unrealized gain) and Maximum Adverse Excursion (deepest unrealized pullback) while a paper trade is open."
                />
              </span>
              <span>
                Uses{' '}
                <strong className="text-foreground">Limit-Only Quotes</strong>
                <GlossaryTip
                  term="Limit-Only Quotes (NBBO)"
                  explanation="The agent checks live National Best Bid/Offer quotes and only enters via limit orders — never blind market orders."
                />
              </span>
            </div>
            <Link href="/build" className="text-primary hover:underline font-medium shrink-0">
              Want a bot built on this engine for your rules ({BUILD_STANDARD_PRICE})? &rarr;
            </Link>
          </div>
        </section>

        <XTraderDashboard summary={summary} sessions={sessions} />

        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-primary/30 bg-card/60 px-5 py-8 md:p-8 text-center space-y-4">
            <h2 className="text-xl md:text-2xl font-bold font-headline">
              DIY: Connect the same market feed to your AI.
            </h2>
            <p className="text-sm text-muted-foreground">
              Stream the nightly pool and mapped stock, 2x/inverse ETF, and option vehicles into
              Claude, ChatGPT, Cursor, Codex, or the open-source{' '}
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
              <InstallCta showClientLinks={false} />
            </div>
          </div>

          <div className="rounded-2xl border border-primary/40 bg-card/70 px-5 py-8 md:p-8 text-center space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold font-headline">
                Done-For-You: Custom Trading Bot in {BUILD_TURNAROUND_DAYS} Days ({BUILD_STANDARD_PRICE})
              </h2>
              <p className="text-sm text-muted-foreground">
                Bring your own rules for stocks, 2x/inverse ETFs, or options. We build and harden
                your automated Python bot on the exact limit-order, fill-stop, and duplicate-order
                safety engine running above — delivered to your private GitHub repo.
              </p>
            </div>
            <div className="pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto font-semibold">
                <Link href="/build">Submit Your Rules ({BUILD_STANDARD_PRICE}) &rarr;</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
