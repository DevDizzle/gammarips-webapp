import { getDailyReport, getAllDailyReports, getOvernightSignals } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { remarkTickerLinks } from "@/lib/remark-ticker-links";

interface Props {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const report = await getDailyReport(date);
  
  const title = report?.seoMetadata?.seoTitle || report?.title || `GammaRips V7 pick for ${date}`;
  const description = report?.seoMetadata?.seoDescription || (report
    ? `GammaRips V7 daily pick and market context for ${date}. ${report.total_signals} signals scanned across the overnight session. ${report.bullish_count} bullish, ${report.bearish_count} bearish.`
    : `GammaRips V7 daily pick for ${date}.`);

  return {
    title,
    description,
    alternates: {
      canonical: `https://gammarips.com/reports/${date}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: report?.scan_date,
      url: `https://gammarips.com/reports/${date}`,
    }
  };
}

export default async function ReportPage({ params }: Props) {
  const { date } = await params;
  const report = await getDailyReport(date);
  if (!report) return notFound();

  // Fetch the scan's signals (for the in-report link block + a safe allow-list
  // that constrains ticker auto-linking) plus the report index (prev/next nav).
  const [bullSignals, bearSignals, allReports] = await Promise.all([
    getOvernightSignals(report.scan_date, 'bull', 0, 8),
    getOvernightSignals(report.scan_date, 'bear', 0, 8),
    getAllDailyReports(60),
  ]);
  const reportSignals = [...bullSignals, ...bearSignals].sort(
    (a, b) => (b.overnight_score || 0) - (a.overnight_score || 0)
  );
  const tickerAllowList = new Set(reportSignals.map((s) => s.ticker.toUpperCase()));

  // Reports are ordered newest-first; neighbours give a crawlable report chain.
  const idx = allReports.findIndex((r) => r.scan_date === report.scan_date);
  const newerReport = idx > 0 ? allReports[idx - 1] : null;
  const olderReport = idx >= 0 && idx < allReports.length - 1 ? allReports[idx + 1] : null;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": report.title || `GammaRips V7 pick for ${date}`,
    "image": "https://gammarips.com/og-image.png?v=3",
    "datePublished": `${report.scan_date}T08:00:00Z`,
    "dateModified": `${report.scan_date}T08:00:00Z`,
    "author": {
      "@type": "Organization",
      "name": "GammaRips",
      "url": "https://gammarips.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GammaRips",
      "logo": { "@type": "ImageObject", "url": "https://gammarips.com/og-image.png?v=3" }
    },
    "description": report.seoMetadata?.seoDescription || `GammaRips V7 daily pick and market context for ${date}. ${report.total_signals} signals scanned. ${report.bullish_count} bullish, ${report.bearish_count} bearish.`,
    "about": {
      "@type": "Thing",
      "name": "Single V7 daily pick with pre-set stop, target, and exit",
    },
    "disclaimer": "Paper-trading performance, educational only. Not investment advice.",
    ...(report.seoMetadata?.keywords ? { "keywords": report.seoMetadata.keywords.join(', ') } : {}),
    "mainEntityOfPage": `https://gammarips.com/reports/${report.scan_date}`
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `GammaRips V7 enriched signals — ${report.scan_date}`,
    "description": `V7 tournament scan of 5,230+ tickers for ${report.scan_date}. ${report.total_signals} signals detected.`,
    "url": `https://gammarips.com/reports/${report.scan_date}`,
    "datePublished": `${report.scan_date}T08:00:00Z`,
    "creator": { "@type": "Organization", "name": "GammaRips" },
    "license": "https://gammarips.com/terms",
    "variableMeasured": [
      "overnight_score",
      "volume_oi_ratio",
      "moneyness_pct",
      "VIX-VIX3M regime",
      "tournament consensus",
      "directional dollar volume",
      "same-day bracket outcome",
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />

      <Breadcrumbs
        className="mb-6"
        items={[
          { name: "Home", href: "/" },
          { name: "Reports", href: "/reports" },
          { name: date },
        ]}
      />

      {report.underlying_scan_date && report.underlying_scan_date !== report.scan_date && (
        <div className="mb-6 p-3 bg-muted/30 border border-muted rounded-md text-muted-foreground text-sm text-center">
          Covering overnight flow from {report.underlying_scan_date}
        </div>
      )}

      <article className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm, [remarkTickerLinks, { tickers: tickerAllowList }]]}>
          {report.content}
        </ReactMarkdown>
      </article>

      {/* Signals in this report — turns the page from a dead-end into a
          distributor of equity to individual ticker pages with dated anchors. */}
      {reportSignals.length > 0 && (
        <section className="mt-12 pt-8 border-t border-muted">
          <h2 className="text-xl font-bold font-headline mb-4">Signals in this report</h2>
          <div className="flex flex-wrap gap-2">
            {reportSignals.map((s) => (
              <Link
                key={s.id}
                href={`/signals/${s.ticker}`}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                <span className="font-mono font-semibold">{s.ticker}</span>
                <span className={s.direction === 'BULLISH' ? 'text-green-500' : 'text-red-500'}>
                  {s.direction === 'BULLISH' ? 'BULL' : 'BEAR'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Prev/next report chain + back to the live pick. */}
      <nav className="mt-10 pt-6 border-t border-muted flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex flex-wrap gap-4">
          {newerReport && (
            <Link href={`/reports/${newerReport.scan_date}`} className="text-primary hover:underline">
              ← Newer briefing ({newerReport.scan_date})
            </Link>
          )}
          {olderReport && (
            <Link href={`/reports/${olderReport.scan_date}`} className="text-primary hover:underline">
              Older briefing ({olderReport.scan_date}) →
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/reports" className="text-muted-foreground hover:text-primary">All reports</Link>
          <Link href="/" className="text-muted-foreground hover:text-primary">See today&apos;s pick</Link>
        </div>
      </nav>

      <p className="mt-12 pt-6 border-t border-muted text-xs text-muted-foreground leading-relaxed">
        Paper-trading performance, educational content only. Not investment advice.
        Past performance is not a guarantee of future results. Options trading
        involves substantial risk of loss.
      </p>
    </div>
  );
}
