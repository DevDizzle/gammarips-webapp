import { getDailyReport } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const report = await getDailyReport(date);
  
  const title = report?.seoMetadata?.seoTitle || report?.title || `GammaRips V5.4 pick for ${date}`;
  const description = report?.seoMetadata?.seoDescription || (report
    ? `GammaRips V5.4 daily pick and market context for ${date}. ${report.total_signals} signals scanned across the overnight session. ${report.bullish_count} bullish, ${report.bearish_count} bearish.`
    : `GammaRips V5.4 daily pick for ${date}.`);

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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": report.title || `GammaRips V5.4 pick for ${date}`,
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
    "description": report.seoMetadata?.seoDescription || `GammaRips V5.4 daily pick and market context for ${date}. ${report.total_signals} signals scanned. ${report.bullish_count} bullish, ${report.bearish_count} bearish.`,
    "about": {
      "@type": "Thing",
      "name": "Single V5.4 daily pick with pre-set stop, target, and exit",
    },
    "disclaimer": "Paper-trading performance, educational only. Not investment advice.",
    ...(report.seoMetadata?.keywords ? { "keywords": report.seoMetadata.keywords.join(', ') } : {}),
    "mainEntityOfPage": `https://gammarips.com/reports/${report.scan_date}`
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `GammaRips V5.4 enriched signals — ${report.scan_date}`,
    "description": `V5.4 gate-stack scan of 5,230+ tickers for ${report.scan_date}. ${report.total_signals} signals detected.`,
    "url": `https://gammarips.com/reports/${report.scan_date}`,
    "datePublished": `${report.scan_date}T08:00:00Z`,
    "creator": { "@type": "Organization", "name": "GammaRips" },
    "license": "https://gammarips.com/terms",
    "variableMeasured": [
      "overnight_score",
      "volume_oi_ratio",
      "moneyness_pct",
      "VIX-VIX3M regime",
      "V5.4 gate status",
      "directional dollar volume",
      "3-day bracket outcome",
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />

      {report.underlying_scan_date && report.underlying_scan_date !== report.scan_date && (
        <div className="mb-6 p-3 bg-muted/30 border border-muted rounded-md text-muted-foreground text-sm text-center">
          Covering overnight flow from {report.underlying_scan_date}
        </div>
      )}

      <article className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.content}</ReactMarkdown>
      </article>

      <p className="mt-12 pt-6 border-t border-muted text-xs text-muted-foreground leading-relaxed">
        Paper-trading performance, educational content only. Not investment advice.
        Past performance is not a guarantee of future results. Options trading
        involves substantial risk of loss.
      </p>
    </div>
  );
}
