import Link from "next/link";
import { getAllDailyReports } from "@/lib/firebase-admin";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Metadata } from "next";

export const metadata: Metadata = {
  // Root layout applies the `%s | GammaRips` title template — no suffix here.
  title: "Report Archive — Every Daily Options-Flow Briefing",
  description:
    "The complete archive of GammaRips daily options-flow reports, every trading day since the scan went live. Each entry links to that morning's institutional flow breakdown.",
  alternates: { canonical: "https://gammarips.com/reports/archive" },
};

/* The crawl-path backbone for the report inventory.
 *
 * Reports are the only surface with demonstrated organic pull — GSC has them
 * ranking pos 3.0 for "market flow options gamma cta liquidity 2026-06" and
 * pos 9.3 for "sector rotation june 2026", because dated analyst-shaped queries
 * are close to uncontested. But the sitemap was windowed to 30 and the /reports
 * hub caps at 50, which left ~43 live, indexed report pages reachable only by
 * typing the URL. Orphaned pages lose crawl frequency and decay.
 *
 * Unlike a ticker page, a dated market report does not go stale as a search
 * asset — the date IS the asset. So this lists everything, permanently.
 *
 * Reads daily_reports directly rather than going through
 * getAllOvernightSummaries: that helper does an N+1 lookup into
 * overnight_summaries and DROPS any report whose summary doc is missing, which
 * would silently re-orphan exactly the pages this hub exists to reach. */
export default async function ReportArchivePage() {
  const reports = await getAllDailyReports(1000);

  // Newest first, grouped by month. Reports are already ordered scan_date desc.
  const groups = new Map<string, typeof reports>();
  for (const r of reports) {
    if (!r.scan_date) continue;
    const month = r.scan_date.slice(0, 7); // YYYY-MM
    if (!groups.has(month)) groups.set(month, []);
    groups.get(month)!.push(r);
  }

  const monthLabel = (ym: string) =>
    new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

  const dayLabel = (d: string) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumbs
          className="mb-6"
          items={[
            { name: "Home", href: "/" },
            { name: "Daily Reports", href: "/reports" },
            { name: "Archive" },
          ]}
        />
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-bold font-headline mb-2">Report Archive</h1>
          <p className="text-muted-foreground leading-relaxed">
            Every daily options-flow briefing GammaRips has published, oldest kept and newest
            first. Each report is the record of what the overnight scan saw that morning across
            about 3,500 optionable US stocks: the bull/bear split, the themes institutional money leaned into, and
            the pool that cleared the{" "}
            <Link href="/methodology" className="text-primary hover:underline">
              enrichment bar
            </Link>
            . These are historical records of observed flow, not recommendations, and the
            numbers in them describe paper-traded results only.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Looking for the latest? See the{" "}
            <Link href="/reports" className="text-primary hover:underline">
              morning briefing
            </Link>
            .
          </p>
        </div>

        {reports.length === 0 ? (
          <p className="text-muted-foreground">The archive is temporarily unavailable.</p>
        ) : (
          <div className="space-y-8">
            {Array.from(groups.entries()).map(([month, items]) => (
              <section key={month}>
                <h2 className="text-xl font-bold font-headline mb-3 border-b border-muted pb-1">
                  {monthLabel(month)}
                </h2>
                <ul className="space-y-2">
                  {items.map((r) => (
                    <li key={r.scan_date} className="flex gap-3 text-sm leading-relaxed">
                      <span className="font-mono text-muted-foreground shrink-0 w-16">
                        {dayLabel(r.scan_date)}
                      </span>
                      <Link
                        href={`/reports/${r.scan_date}`}
                        className="text-primary hover:underline"
                      >
                        {r.title || `Daily options-flow report — ${r.scan_date}`}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
