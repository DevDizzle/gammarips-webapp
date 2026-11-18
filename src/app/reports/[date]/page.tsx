import { getDailyReport, getAdjacentReports, getOvernightSignals } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { McpConversionCard } from "@/components/mcp-conversion-card";
import { remarkTickerLinks } from "@/lib/remark-ticker-links";
import { OG_IMAGE } from '@/lib/constants';

interface Props {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const report = await getDailyReport(date);
  
  const title = report?.seoMetadata?.seoTitle || report?.title || `GammaRips Daily Report — ${date}`;
  const description = report?.seoMetadata?.seoDescription || (report
    ? `GammaRips daily intelligence report for ${date} — the overnight scan, the curated bullish pool, and market context. ${report.total_signals} signals scanned. ${report.bullish_count} bullish, ${report.bearish_count} bearish.`
    : `GammaRips daily intelligence report for ${date}.`);

  return {
    title,
    description,
    alternates: {
      canonical: `https://gammarips.com/reports/${date}`,
    },
    openGraph: {
      images: [OG_IMAGE],
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
  // that constrains ticker auto-linking) plus the two neighbouring reports.
  const [bullSignals, bearSignals, neighbours] = await Promise.all([
    getOvernightSignals(report.scan_date, 'bull', 0, 8),
    getOvernightSignals(report.scan_date, 'bear', 0, 8),
    getAdjacentReports(report.scan_date),
  ]);
  const reportSignals = [...bullSignals, ...bearSignals].sort(
    (a, b) => (b.overnight_score || 0) - (a.overnight_score || 0)
  );
  const tickerAllowList = new Set(reportSignals.map((s) => s.ticker.toUpperCase()));

  // Neighbours give a crawlable report chain that spans the whole archive.
  const { newer: newerReport, older: olderReport } = neighbours;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": report.title || `GammaRips Daily Report — ${date}`,
    "image": "https://gammarips.com/og-image.png?v=4",
    "datePublished": `${report.scan_date}T08:00:00Z`,
    "dateModified": `${report.scan_date}T08:00:00Z`,
    "author": {
      "@type": "Person",
      "name": "Evan Parra",
      "jobTitle": "Founder & CEO",
      "url": "https://gammarips.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GammaRips",
      "logo": { "@type": "ImageObject", "url": "https://gammarips.com/icon.png" }
    },
    "description": report.seoMetadata?.seoDescription || `GammaRips daily intelligence report for ${date} — overnight scan, curated bullish pool, and market context. ${report.total_signals} signals scanned.`,
    "about": {
      "@type": "Dataset",
      "@id": "https://gammarips.com/developers#combo-a-dataset",
      "name": "GammaRips Combo A Nightly US Options Dataset",
    },
    "disclaimer": "Paper-trading performance, educational only. Not investment advice.",
    ...(report.seoMetadata?.keywords ? { "keywords": report.seoMetadata.keywords.join(', ') } : {}),
    "mainEntityOfPage": `https://gammarips.com/reports/${report.scan_date}`
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `GammaRips Combo A options dataset — ${report.scan_date}`,
    "description": `Overnight Combo A options-flow scan for ${report.scan_date}. ${report.total_signals} signals enriched.`,
    "url": `https://gammarips.com/reports/${report.scan_date}`,
    "datePublished": `${report.scan_date}T08:00:00Z`,
    "creator": { "@type": "Organization", "name": "GammaRips", "url": "https://gammarips.com" },
    "license": "https://gammarips.com/terms",
    "isAccessibleForFree": true,
    "isPartOf": {
      "@type": "Dataset",
      "@id": "https://gammarips.com/developers#combo-a-dataset",
      "name": "GammaRips Combo A Nightly US Options Dataset"
    },
    "variableMeasured": [
      "rv_iv_ratio",
      "open_interest",
      "delta",
      "dte",
      "volume_oi_ratio",
      "VIX-VIX3M regime",
      "3-day MFE/MAE excursion",
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

      <div className="mt-12">
        <McpConversionCard source={`report_${report.scan_date}`} />
      </div>

      {/* Prev/next report chain + preview link. */}
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
          <Link href="/signals" className="text-muted-foreground hover:text-primary">Today&apos;s 3-contract preview</Link>
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
