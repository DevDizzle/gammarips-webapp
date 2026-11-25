import Link from "next/link";
import { getLatestOvernightSummary, getOvernightSignals, getRecentSignals } from "@/lib/firebase-admin";
import { SignalsPoolClient } from "@/components/overnight/signals-pool-client";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Disclosure } from "@/components/ui/disclosure";
import { Metadata } from "next";
import { OG_IMAGE } from "@/lib/constants";

export const metadata: Metadata = {
  // Root layout applies the `%s | GammaRips` title template — no suffix here.
  title: "Overnight Options Flow Scanner & Daily Stock Pool",
  description:
    "Free preview of today's overnight options flow scanner across 3,500+ US stocks: liquid setups mapped to stocks, 2x/inverse ETFs, and options. Updated nightly.",
  alternates: { canonical: 'https://gammarips.com/signals' },
  openGraph: {
    images: [OG_IMAGE],
    title: "Overnight Options Flow Scanner & Daily Stock Pool | GammaRips",
    description:
      "Free preview of today's overnight options flow scan across 3,500+ US stocks: liquid bullish setups mapped to stocks, 2x/inverse ETFs, and options.",
    url: 'https://gammarips.com/signals',
  },
};

export default async function SignalsPage() {
  const summary = await getLatestOvernightSummary();
  const reportDate = summary?.report_date || summary?.scan_date || new Date().toISOString().split('T')[0];
  const queryDate = summary?.scan_date || reportDate;

  const [bullSignals, recentSignals] = await Promise.all([
    getOvernightSignals(queryDate, 'bull', 0, 100),
    getRecentSignals(queryDate, 4, 6),
  ]);

  const previewSignals = bullSignals.slice(0, 3);
  const indexSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Overnight Options Flow Scanner & Daily Stock Pool",
    "description": "Free preview of today's overnight options flow scanner across 3,500+ US stocks, mapped to stocks, 2x/inverse ETFs, and liquid options.",
    "url": "https://gammarips.com/signals",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": previewSignals.map((signal, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": signal.ticker
      }))
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(indexSchema) }} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Daily Pool" }]} />

        {/* Crisp 2-line header so the live data table appears immediately above the fold */}
        <header className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold font-headline tracking-tight">
            Daily Pool &amp; Overnight Options Flow Scanner
          </h1>
          <p className="text-muted-foreground max-w-3xl leading-relaxed">
            Published {reportDate} from our nightly scan of 3,500+ US stocks. Every setup is
            pre-filtered for real liquidity and mapped to stocks, 2x/inverse ETFs, and options.
            {summary?.underlying_scan_date && summary.underlying_scan_date !== reportDate && (
              <span className="block text-sm opacity-80 mt-1">
                Based on overnight flow from {summary.underlying_scan_date}.
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-4 text-sm pt-1">
            <Link href="/reports" className="text-primary hover:underline">Morning briefings &rarr;</Link>
            <Link href="/how-it-works" className="text-primary hover:underline">How it works &rarr;</Link>
            <Link href="/xtrader" className="text-primary hover:underline">Live agent benchmark &rarr;</Link>
            <Link href="/signals/archive" className="text-primary hover:underline">Full ticker archive &rarr;</Link>
          </div>
        </header>

        <SignalsPoolClient
          queryDate={queryDate}
          previewSignals={previewSignals}
          totalCount={bullSignals.length}
        />

        {/* Layer-3 progressive disclosure: technical filter rules below the data table */}
        <Disclosure
          label="How today's pool is filtered (nightly scan rules)"
          hint="23:00 ET liquidity floors, 05:30 ET enrichment & 10-min morning checks"
        >
          <p className="leading-relaxed">
            Every trading night at 23:00 ET, the scanner walks ~3,500 optionable US stocks, narrows
            to the 100 most liquid names (3M+ session shares, 25+ listed strikes), and selects
            bullish setups whose call contracts clear hard liquidity floors (
            <code className="text-xs text-foreground">Mid &gt;= $1.00</code>,{' '}
            <code className="text-xs text-foreground">OI &gt;= 500</code>,{' '}
            <code className="text-xs text-foreground">Delta 0.22–0.48</code>,{' '}
            <code className="text-xs text-foreground">DTE 10–45</code>).
          </p>
          <p className="leading-relaxed">
            At 05:30 ET, surviving setups are enriched with Realized-vs-Implied Volatility (
            <code className="text-xs text-foreground">rv_iv_ratio</code>), mapped execution
            vehicles (1x stock, 2x long/inverse ETFs, and liquid option contract), technicals, and
            grounded news catalysts. From 09:02 to 16:52 ET, 10-minute intraday snapshots track
            live morning volume and open interest.{' '}
            <Link href="/methodology" className="text-primary hover:underline font-medium">
              Read the full methodology &rarr;
            </Link>
          </p>
          <p className="text-xs opacity-80">
            Educational market data only. Not investment advice.
          </p>
        </Disclosure>

        {/* Recent Signals — keeps prior-day detail pages one click from this hub. */}
        {recentSignals.length > 0 && (
          <section className="pt-4">
            <h2 className="text-2xl font-bold font-headline mb-2">Recent Setups</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
              Recent names from the last few sessions. Click any ticker for its stock &amp; options-flow breakdown.
            </p>
            <div className="flex flex-wrap gap-2">
              {recentSignals.map((s) => (
                <Link
                  key={`${s.scan_date}_${s.ticker}`}
                  href={`/signals/${s.ticker}`}
                  className="inline-flex items-center gap-2 rounded-full border border-muted px-3 py-1.5 text-sm hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <span className="font-mono font-semibold">{s.ticker}</span>
                  <span className={s.direction === 'BULLISH' ? 'text-green-500' : 'text-red-500'}>
                    {s.direction === 'BULLISH' ? 'BULL' : 'BEAR'}
                  </span>
                  <span className="text-muted-foreground text-xs">{s.scan_date}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
