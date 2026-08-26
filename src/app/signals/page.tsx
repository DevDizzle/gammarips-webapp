import Link from "next/link";
import { getLatestOvernightSummary, getOvernightSignals, getRecentSignals } from "@/lib/firebase-admin";
import { SignalsTable } from "@/components/overnight/signals-table";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Metadata } from "next";

export const metadata: Metadata = {
  // Root layout applies the `%s | GammaRips` title template — no suffix here.
  title: "Overnight Options Flow Scanner: Daily Bullish Call Pool",
  description:
    "Every bullish name in the 100 most liquid optionable US stocks, with one out-of-the-money call each. Roughly 40 to 50 contracts, published nightly. Free.",
  alternates: { canonical: 'https://gammarips.com/signals' },
};

export default async function SignalsPage() {
  const summary = await getLatestOvernightSummary();
  const reportDate = summary?.report_date || summary?.scan_date || new Date().toISOString().split('T')[0];
  const queryDate = summary?.scan_date || reportDate;

  const [bullSignals, recentSignals] = await Promise.all([
    getOvernightSignals(queryDate, 'bull', 0, 100),
    getRecentSignals(queryDate, 4, 6),
  ]);

  const allSignals = bullSignals;
  const indexSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Overnight Options Flow Scanner",
    "description": "Every bullish name in the 100 most liquid optionable US stocks, with one out-of-the-money call each. Roughly 40 to 50 contracts, published nightly. Free.",
    "url": "https://gammarips.com/signals",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": allSignals.slice(0, 30).map((signal, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": signal.ticker
      }))
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(indexSchema) }} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" items={[{ name: "Home", href: "/" }, { name: "Overnight Signals" }]} />
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline mb-2">Overnight Options Flow</h1>
          <p className="text-muted-foreground mb-6">
            Today&apos;s pool, published {reportDate}. One out-of-the-money call for every bullish name in the 100 most liquid optionable US stocks.
            {summary?.underlying_scan_date && summary.underlying_scan_date !== reportDate && (
              <span className="block text-sm opacity-80 mt-1">Based on overnight flow from {summary.underlying_scan_date}</span>
            )}
          </p>
          <div className="text-sm text-muted-foreground space-y-3 max-w-3xl leading-relaxed">
            <p>
              GammaRips is a daily options data scanner. The engine runs at 23:00 ET and the whole rule fits in one breath. <strong className="text-foreground">Start with about 3,500 optionable US stocks. Keep the names that traded 3M or more shares that session and carry 25 or more listed strikes. <Link href="/methodology" className="text-primary hover:underline">Rank those by combined chain dollar volume and share volume</Link> and take the top 100. Keep the bullish names. Price one out-of-the-money call in each, chosen on contract liquidity.</strong> That set is the table below, roughly 40 to 50 contracts. Calls only.
            </p>
            <p>
              Liquidity decides membership, not unusual activity. Flow gives context. It does not decide who gets in. The cap of 50 does not bind, so the pool is every bullish name in the top 100. There is no hidden ranking behind it. Note what the rank measures: the most liquid names, then one contract inside each. It is not the most liquid contracts in the market, which would be SPY and QQQ every day. Being in the pool is not a forecast that a name will go up.
            </p>
            <p>
              Liquidity is here for one reason. Over the 60 trading days ending 2026-08-14, a study measured the old flow-first funnel with no fill at 10:00 ET on 40.5% of contracts. The liquid universe measured 6.1% on the same tape. Those are study numbers on a past window. They are not a live property of tonight&apos;s pool.
            </p>
            <p>
              This page is the human-readable view and it is free. The same pool, plus <Link href="/developers" className="text-primary hover:underline">point-in-time features, opportunity surfaces, and a queryable outcome history</Link>, is served to AI agents over MCP. Every field is leakage-checked. Nothing here contains information that was not knowable at scan time. A <Link href="/scorecard" className="text-primary hover:underline">paper-traded cohort</Link> tracks the pool in public, winners and losers counted the same way. Buying the whole pool on one fixed exit loses money. We publish that, and it is why there is no pick on this site. The analysis is your agent&apos;s job.
            </p>
            <p className="text-xs opacity-80">
              Paper trading and educational data only. Not investment advice.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link href="/how-it-works" className="text-primary hover:underline">How the scan works →</Link>
            <Link href="/scorecard" className="text-primary hover:underline">Track record →</Link>
            <Link href="/reports" className="text-primary hover:underline">Daily reports →</Link>
            <Link href="/signals/archive" className="text-primary hover:underline">Full signal archive →</Link>
          </div>
        </div>

        <div className="grid gap-12">
          <div>
            <SignalsTable title="The Pool" signals={bullSignals} />
            <p className="mt-3 text-xs text-muted-foreground max-w-3xl">
              The table is ordered by the scan score. That score is descriptive context. It is not a quality rank and it is not a forecast.
            </p>
          </div>
        </div>

        {/* Recent Signals — keeps prior-day detail pages one click from this
            high-priority hub instead of going orphan the day after their scan. */}
        {recentSignals.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold font-headline mb-2">Recent Signals</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
              A sample from the last few sessions. Each one links to its options-flow breakdown.
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
