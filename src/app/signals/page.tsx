import Link from "next/link";
import { getLatestOvernightSummary, getOvernightSignals, getRecentSignals } from "@/lib/firebase-admin";
import { SignalsTable } from "@/components/overnight/signals-table";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overnight Options Flow Scanner — Daily Unusual Options Activity | GammaRips",
  description: "Daily options signals scanner. GammaRips detects overnight unusual options activity across 5,230+ tickers — volume, open interest, directional dollar flow — and ranks it before the market opens. One pick a day, pushed to phone at 07:30 ET.",
  alternates: { canonical: 'https://gammarips.com/signals' },
};

export default async function SignalsPage() {
  const summary = await getLatestOvernightSummary();
  const reportDate = summary?.report_date || summary?.scan_date || new Date().toISOString().split('T')[0];
  const queryDate = summary?.scan_date || reportDate;

  const [bullSignals, bearSignals, recentSignals] = await Promise.all([
    getOvernightSignals(queryDate, 'bull', 0, 100),
    getOvernightSignals(queryDate, 'bear', 0, 100),
    getRecentSignals(queryDate, 4, 6),
  ]);

  const allSignals = [...bullSignals, ...bearSignals];
  const indexSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Overnight Options Flow Scanner",
    "description": "Daily unusual options activity across 5,230+ tickers, reported before the market opens.",
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
            Full list of unusual options activity detected overnight across 5,230+ tickers, reported on {reportDate}.
            {summary?.underlying_scan_date && summary.underlying_scan_date !== reportDate && (
              <span className="block text-sm opacity-80 mt-1">Based on overnight flow from {summary.underlying_scan_date}</span>
            )}
          </p>
          <div className="text-sm text-muted-foreground space-y-3 max-w-3xl leading-relaxed">
            <p>
              GammaRips is a daily options signals scanner. Every night at 23:00 ET, the engine ingests institutional options flow &mdash; volume, open interest, unusual activity, and directional dollar flow &mdash; across every optionable U.S. equity. Candidates clear a thin <Link href="/methodology" className="text-primary hover:underline">enrichment bar</Link>: <strong className="text-foreground">overnight score &ge; 4 with directional UOA &gt; $500K, both directions</strong>. There are no per-contract selection gates. What you see below is the full enriched flow for today.
            </p>
            <p>
              From this list, <Link href="/how-it-works" className="text-primary hover:underline">one single contract</Link> is chosen by a randomized bracket tournament and pushed to the private WhatsApp group at <strong className="text-foreground">07:30 ET</strong> with pre-set stop (&minus;60%), target (+80%), and a 3-day hold window. Free readers see the same pick on the home page at the exact same second. No paid-first tier. Browse the raw scan here, or subscribe for the one-a-day WhatsApp push.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link href="/how-it-works" className="text-primary hover:underline">How the scan works →</Link>
            <Link href="/scorecard" className="text-primary hover:underline">Track record →</Link>
            <Link href="/reports" className="text-primary hover:underline">Daily reports →</Link>
          </div>
        </div>

        <div className="grid gap-12">
          <SignalsTable title="Bullish Flow" signals={bullSignals} />
          <SignalsTable title="Bearish Flow" signals={bearSignals} />
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
