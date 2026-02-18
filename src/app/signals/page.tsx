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
  const scanDate = summary?.scan_date || new Date().toISOString().split('T')[0];

  const [bullSignals, bearSignals] = await Promise.all([
    getOvernightSignals(scanDate, 'bull', 0, 100), // Get all valid signals (score > 0)
    getOvernightSignals(scanDate, 'bear', 0, 100),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto px-4 py-8">
         <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline mb-2">Overnight Signals</h1>
            <p className="text-muted-foreground">
                Institutional options flow detected overnight — {scanDate}
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
