import Link from "next/link";
import { getLatestOvernightSummary, getOvernightSignals, getRecentSignals } from "@/lib/firebase-admin";
import { SignalsTable } from "@/components/overnight/signals-table";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Metadata } from "next";

export const metadata: Metadata = {
  // Root layout applies the `%s | GammaRips` title template — no suffix here.
  title: "Overnight Options Flow Scanner — Daily Unusual Options Activity",
  description:
    "The ~50 bullish setups from each overnight scan of about 3,500 optionable US stocks: volume, open interest, and directional dollar flow, ranked before the open.",
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
    "description": "The ~50 bullish setups GammaRips analyzes each morning, drawn from an overnight scan across about 3,500 optionable US stocks and reported before the market opens.",
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
            The bullish setups GammaRips analyzed today, from an overnight scan across about 3,500 optionable US stocks, reported {reportDate}.
            {summary?.underlying_scan_date && summary.underlying_scan_date !== reportDate && (
              <span className="block text-sm opacity-80 mt-1">Based on overnight flow from {summary.underlying_scan_date}</span>
            )}
          </p>
          <div className="text-sm text-muted-foreground space-y-3 max-w-3xl leading-relaxed">
            <p>
              GammaRips is a daily options data scanner. Every night at 23:00 ET, the engine ranks every optionable US common stock by <Link href="/methodology" className="text-primary hover:underline">liquidity</Link>: <strong className="text-foreground">3M+ shares traded that session, a chain carrying 25 or more listed strikes, then the top 100 by combined chain dollar volume and share volume</strong>. A BULLISH-only gate keeps the bullish names and we price one out-of-the-money call in each, chosen on contract liquidity. What you see below is that set, roughly 40 to 50 contracts (we trade calls only). The rank decides which names you see; it is not a claim that they will go up.
            </p>
            <p>
              This page is the human-readable view, and it&apos;s free forever. The same pool, plus <Link href="/developers" className="text-primary hover:underline">point-in-time features, opportunity surfaces, and a queryable outcome history</Link>, is served to AI agents over MCP. Every field is leakage-checked: nothing here contains information that wasn&apos;t knowable at scan time. A <Link href="/scorecard" className="text-primary hover:underline">paper-traded cohort</Link> tracks the pool daily, in public, winners and losers counted the same way.
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
          <SignalsTable title="Bullish Flow" signals={bullSignals} />
        </div>

        {/* Recent Signals — keeps prior-day detail pages one click from this
            high-priority hub instead of going orphan the day after their scan. */}
        {recentSignals.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold font-headline mb-2">Recent Signals</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
              Top flow from the last few sessions. Each links to its full institutional options-flow breakdown.
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
