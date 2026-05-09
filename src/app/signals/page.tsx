import { getLatestOvernightSummary, getOvernightSignals } from "@/lib/firebase-admin";
import { SignalsTable } from "@/components/overnight/signals-table";
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

  const [bullSignals, bearSignals] = await Promise.all([
    getOvernightSignals(queryDate, 'bull', 0, 100),
    getOvernightSignals(queryDate, 'bear', 0, 100),
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
              GammaRips is a daily options signals scanner. Every night at 23:00 ET, the engine ingests institutional options flow &mdash; volume, open interest, unusual activity, and directional dollar flow &mdash; across every optionable U.S. equity. Candidates clear three deterministic gates: <strong className="text-foreground">overnight score &ge; 1, spread &le; 10%, directional UOA &gt; $500K</strong>. What you see below is the full post-gate flow for today.
            </p>
            <p>
              From this list, one single V5.4 contract is selected and pushed to the private WhatsApp group at <strong className="text-foreground">07:30 ET</strong> with pre-set stop (&minus;60%), target (+80%), and a 3-day hold window. Free readers see the same pick on the home page at the exact same second. No paid-first tier. Browse the raw scan here, or subscribe for the one-a-day WhatsApp push.
            </p>
          </div>
        </div>

        <div className="grid gap-12">
          <SignalsTable title="Bullish Flow" signals={bullSignals} />
          <SignalsTable title="Bearish Flow" signals={bearSignals} />
        </div>
      </main>
    </div>
  );
}
