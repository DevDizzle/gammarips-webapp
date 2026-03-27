import { getLatestOvernightSummary, getOvernightSignals } from "@/lib/firebase-admin";
import { SignalsTable } from "@/components/overnight/signals-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'All Overnight Signals | GammaRips',
  description: 'Full list of institutional options flow signals detected overnight.',
  alternates: { canonical: 'https://gammarips.com/signals' },
};

export default async function SignalsPage() {
  const summary = await getLatestOvernightSummary();
  // We use report_date if available (from previous fallback logic) or scan_date (the primary date going forward)
  const reportDate = summary?.report_date || summary?.scan_date || new Date().toISOString().split('T')[0];
  
  // Always query signals using the summary's scan_date (which matches the signals' scan_date)
  const queryDate = summary?.scan_date || reportDate;

  const [bullSignals, bearSignals] = await Promise.all([
    getOvernightSignals(queryDate, 'bull', 0, 100), // Get all valid signals (score > 0)
    getOvernightSignals(queryDate, 'bear', 0, 100),
  ]);

  const allSignals = [...bullSignals, ...bearSignals];
  const indexSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Overnight Options Flow Signals",
    "description": "Full list of institutional options flow signals detected overnight.",
    "url": "https://gammarips.com/signals",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": allSignals.slice(0, 30).map((signal, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://gammarips.com/signals/${signal.ticker.toLowerCase()}`
      }))
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(indexSchema) }} />
      <main className="flex-1 container mx-auto px-4 py-8">
         <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline mb-2">Overnight Signals</h1>
            <p className="text-muted-foreground">
                Institutional options flow reported on {reportDate}
                {summary?.underlying_scan_date && summary.underlying_scan_date !== reportDate && (
                  <span className="block text-sm opacity-80 mt-1">Based on overnight flow from {summary.underlying_scan_date}</span>
                )}
            </p>
         </div>
         
         <div className="grid gap-12">
            <SignalsTable 
                title="Bullish Flow" 
                signals={bullSignals} 
            />
            <SignalsTable 
                title="Bearish Flow" 
                signals={bearSignals} 
            />
         </div>
      </main>
    </div>
  );
}
