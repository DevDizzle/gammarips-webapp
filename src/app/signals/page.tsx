import Link from "next/link";
import { getLatestOvernightSummary, getOvernightSignals, getRecentSignals } from "@/lib/firebase-admin";
import { SignalsPoolClient } from "@/components/overnight/signals-pool-client";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Metadata } from "next";

export const metadata: Metadata = {
  // Root layout applies the `%s | GammaRips` title template — no suffix here.
  title: "Overnight Options Flow Scanner: Daily Bullish Call Pool Preview",
  description:
    "Preview today's Combo A options dataset: 3,500+ optionable US stocks filtered to the top 100 liquid universe and bullish calls passing Mid >= $1.00, OI >= 500, Delta 0.22–0.48, and DTE 10–45.",
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

  const previewSignals = bullSignals.slice(0, 3);
  const indexSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Overnight Options Flow Scanner",
    "description": "Preview today's Combo A options dataset: 3,500+ optionable US stocks filtered to the top 100 liquid universe and bullish calls passing Mid >= $1.00, OI >= 500, Delta 0.22–0.48, and DTE 10–45.",
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
      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" items={[{ name: "Home", href: "/" }, { name: "Overnight Signals" }]} />
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline mb-2">Overnight Options Dataset</h1>
          <p className="text-muted-foreground mb-6">
            Today&apos;s pool preview, published {reportDate}. Filtered from the 100 most liquid optionable US stocks under the Combo A contract specification.
            {summary?.underlying_scan_date && summary.underlying_scan_date !== reportDate && (
              <span className="block text-sm opacity-80 mt-1">Based on overnight flow from {summary.underlying_scan_date}</span>
            )}
          </p>
          <div className="text-sm text-muted-foreground space-y-3 max-w-3xl leading-relaxed">
            <p>
              Every trading night at 23:00 ET, the GammaRips engine runs the deterministic <strong className="text-foreground">Combo A</strong> scan: <strong className="text-foreground">3,500+ optionable US stocks &rarr; top 100 liquid universe (3M+ session shares, 25+ listed strikes, ranked by combined chain dollar volume and share volume) &rarr; bullish calls passing <code className="text-xs text-foreground">Mid &gt;= $1.00</code>, <code className="text-xs text-foreground">OI &gt;= 500</code>, <code className="text-xs text-foreground">Delta 0.22–0.48</code>, and <code className="text-xs text-foreground">DTE 10–45</code>.</strong>
            </p>
            <p>
              Each surviving candidate is enriched at 05:30 ET with point-in-time Realized-vs-Implied Volatility (<code className="text-xs text-foreground">rv_iv_ratio</code>), technical structure, flow context, and grounded news catalysts. During market hours (09:02–16:52 ET), 10-minute intraday snapshots verify resting open interest and active session volume.
            </p>
            <p>
              Below is the <strong className="text-foreground">3-contract preview</strong> matching <code className="text-xs text-foreground">get_pool(view=&quot;preview&quot;)</code> on the Free MCP tier. Unlock the full daily dataset of roughly 40 to 50 enriched contracts, live 10-minute intraday liquidity snapshots, and 3-day excursion outcome history over <Link href="/developers" className="text-primary hover:underline">Pro MCP</Link>.
            </p>
            <p className="text-xs opacity-80">
              Educational market data only. Not investment advice.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link href="/how-it-works" className="text-primary hover:underline">How the scan works →</Link>
            <Link href="/methodology" className="text-primary hover:underline">Methodology →</Link>
            <Link href="/reports" className="text-primary hover:underline">Daily reports →</Link>
            <Link href="/signals/archive" className="text-primary hover:underline">Signal archive →</Link>
          </div>
        </div>

        <SignalsPoolClient
          queryDate={queryDate}
          previewSignals={previewSignals}
          totalCount={bullSignals.length}
        />

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
