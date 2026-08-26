import Link from "next/link";
import { getSignalTickersForSitemap } from "@/lib/firebase-admin";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Metadata } from "next";

export const metadata: Metadata = {
  // Root layout applies the `%s | GammaRips` title template — no suffix here.
  title: "Signal Archive: Every Ticker in the Overnight Options Flow Scan",
  description:
    "Every ticker that has appeared in a GammaRips overnight options flow scan, with the date of its most recent appearance. Each links to its flow breakdown.",
  alternates: { canonical: "https://gammarips.com/signals/archive" },
};

/* The crawl-path backbone for our largest page inventory: the sitemap only
 * hints the last ~90 days of tickers (see sitemap.ts), so this page is what
 * keeps every historical /signals/:ticker one internal link from a hub
 * instead of a sitemap-only orphan. Grouped A–Z, plain text links. */
export default async function SignalArchivePage() {
  const tickers = await getSignalTickersForSitemap();
  tickers.sort((a, b) => a.ticker.localeCompare(b.ticker));

  const groups = new Map<string, Array<{ ticker: string; scanDate: string }>>();
  for (const t of tickers) {
    const letter = /^[A-Z]/.test(t.ticker) ? t.ticker[0] : "#";
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(t);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumbs
          className="mb-6"
          items={[
            { name: "Home", href: "/" },
            { name: "Overnight Signals", href: "/signals" },
            { name: "Archive" },
          ]}
        />
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-bold font-headline mb-2">Signal Archive</h1>
          <p className="text-muted-foreground leading-relaxed">
            Every ticker that has appeared in a GammaRips overnight scan, with the date of its most
            recent appearance. What an appearance means depends on the date. From 2026-08-25,
            membership is a liquidity rank: the 100 most liquid optionable US names, bullish only.
            Before that date, the scan selected on unusual options activity and included bearish
            names. The two sets are not one population. The full rule is on the{" "}
            <Link href="/methodology" className="text-primary hover:underline">methodology page</Link>.
            This is a historical record, not a recommendation. Each link opens the ticker&apos;s most
            recent options-flow breakdown.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Looking for today&apos;s pool? See the <Link href="/signals" className="text-primary hover:underline">live signals page</Link>.
          </p>
        </div>

        {tickers.length === 0 ? (
          <p className="text-muted-foreground">The archive is temporarily unavailable.</p>
        ) : (
          <div className="space-y-8">
            {Array.from(groups.entries()).map(([letter, items]) => (
              <section key={letter}>
                <h2 className="text-xl font-bold font-headline mb-3 border-b border-muted pb-1">
                  {letter}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {items.map((t) => (
                    <Link
                      key={t.ticker}
                      href={`/signals/${t.ticker}`}
                      className="inline-flex items-center gap-2 rounded-full border border-muted px-3 py-1.5 text-sm hover:border-primary/50 hover:bg-muted/30 transition-colors"
                    >
                      <span className="font-mono font-semibold">{t.ticker}</span>
                      {t.scanDate && (
                        <span className="text-muted-foreground text-xs">{t.scanDate}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
