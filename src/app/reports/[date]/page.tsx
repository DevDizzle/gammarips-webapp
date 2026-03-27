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
  
  const title = report?.seoMetadata?.seoTitle || report?.title || `Report ${date} | GammaRips`;
  const description = report?.seoMetadata?.seoDescription || (report 
    ? `Overnight institutional options flow report. ${report.total_signals} signals scanned. ${report.bullish_count} bullish, ${report.bearish_count} bearish.`
    : `Overnight Edge report for ${date}`);

  return {
    title,
    description,
    alternates: {
      canonical: `https://gammarips.com/reports/${date}`,
    },
    openGraph: {
      title: `${title} — Overnight Edge`,
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
    "headline": report.title || `GammaRips Overnight Report ${date}`,
    "datePublished": report.scan_date,
    "dateModified": report.scan_date,
    "author": {
      "@type": "Organization",
      "name": "GammaRips",
      "url": "https://gammarips.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GammaRips",
      "logo": { "@type": "ImageObject", "url": "https://gammarips.com/og-image.png?v=2" }
    },
    "description": report.seoMetadata?.seoDescription || `Overnight institutional options flow report. ${report.total_signals} signals scanned. ${report.bullish_count} bullish, ${report.bearish_count} bearish.`,
    ...(report.seoMetadata?.keywords ? { "keywords": report.seoMetadata.keywords.join(', ') } : {}),
    "mainEntityOfPage": `https://gammarips.com/reports/${report.scan_date}`
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `GammaRips Overnight Signals — ${report.scan_date}`,
    "description": `Institutional options flow scan of 5,230+ tickers. ${report.total_signals} signals detected.`,
    "url": `https://gammarips.com/reports/${report.scan_date}`,
    "datePublished": report.scan_date,
    "creator": { "@type": "Organization", "name": "GammaRips" },
    "license": "https://gammarips.com/terms",
    "variableMeasured": ["options volume", "open interest", "unusual activity score", "institutional flow"]
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
    </div>
  );
}
