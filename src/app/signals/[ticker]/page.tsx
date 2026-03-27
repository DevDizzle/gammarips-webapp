import { getSignalByTicker, getLatestOvernightSummary } from "@/lib/firebase-admin";
import SignalClientPage from "./signal-client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  let title = `${ticker.toUpperCase()} Signal | The Overnight Edge`;
  let description = `Institutional options flow analysis for ${ticker.toUpperCase()}.`;

  try {
    const summary = await getLatestOvernightSummary();
    if (summary) {
      const signal = await getSignalByTicker(summary.scan_date, ticker.toUpperCase());
      if (signal?.seoMetadata) {
        title = signal.seoMetadata.seoTitle || title;
        description = signal.seoMetadata.seoDescription || description;
      }
    }
  } catch (error) {
    console.error("Error fetching signal metadata:", error);
  }

  return {
    title,
    description,
    alternates: { canonical: `https://gammarips.com/signals/${ticker}` },
  };
}

export default async function SignalPage({ params }: PageProps) {
  const { ticker } = await params;
  
  // Get latest scan date
  const summary = await getLatestOvernightSummary();
  if (!summary) {
    return notFound();
  }
  
  const signal = await getSignalByTicker(summary.scan_date, ticker.toUpperCase());
  
  if (!signal) {
    return notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "AnalysisNewsArticle",
    "headline": signal.seoMetadata?.seoTitle || `${signal.ticker} Institutional Options Flow Analysis`,
    "description": signal.seoMetadata?.seoDescription || signal.thesis || `Options analysis for ${ticker.toUpperCase()}`,
    "author": { "@type": "Organization", "name": "GammaRips", "url": "https://gammarips.com" },
    ...(signal.seoMetadata?.keywords ? { "keywords": signal.seoMetadata.keywords.join(', ') } : {})
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <SignalClientPage signal={signal} />
    </>
  );
}
