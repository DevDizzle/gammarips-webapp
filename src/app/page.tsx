import { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { PoolPreview } from "@/components/landing/pool-preview";
import { PoolRule } from "@/components/landing/pool-rule";
import { InstallCta } from "@/components/landing/install-cta";
import { ConnectTabs } from "@/components/landing/connect-tabs";
import Faq, { buildFaqs } from "@/components/landing/faq";
import { getLatestOvernightSummary, getDailyReport, getOvernightSignals } from "@/lib/firebase-admin";
import { BUILD_STANDARD_PRICE, BUILD_TURNAROUND_DAYS } from "@/lib/constants";

export const revalidate = 60; // keep the daily pool summary fresh without a full static rebuild

// Same-segment metadata uses `title.absolute` so root layout's `%s | GammaRips`
// template never doubles the brand suffix. Description stays disclaimer-free
// (owner-settled 2026-08-08).
export const metadata: Metadata = {
  title: {
    absolute: "AI Trading Data for Stocks, 2x ETFs & Options | GammaRips",
  },
  description:
    "Stream nightly institutional flow & volatility data for stocks, 2x ETFs, and options into Claude, ChatGPT, or Cursor via MCP—or hire us to build your agent.",
  alternates: {
    canonical: 'https://gammarips.com',
  },
};

export default async function LandingPage() {
  const summary = await getLatestOvernightSummary();
  const reportDate = summary ? (summary.report_date || summary.scan_date) : null;
  const report = reportDate ? await getDailyReport(reportDate) : null;
  const faqs = buildFaqs();

  // 3-setup preview sample matching get_pool(view="preview").
  const poolSample = summary ? await getOvernightSignals(summary.scan_date, 'bull', 0, 3) : [];

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GammaRips",
    "image": "https://gammarips.com/og-image.png?v=4",
    "url": "https://gammarips.com",
    "description":
      summary?.market_narrative ||
      "Nightly institutional flow and volatility intelligence for AI trading agents across US stocks, 2x/inverse ETFs, and options over MCP, plus 5-day custom agent builds.",
  };

  const dynamicDailySchema = poolSample.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": report?.title || summary?.headline || "Today's daily market intelligence pool preview",
    "description":
      report?.seoMetadata?.seoDescription ||
      summary?.market_narrative ||
      "Today's nightly scan preview across the 100 most liquid US stocks, mapped to stocks, 2x/inverse ETFs, and liquid options.",
    "url": "https://gammarips.com",
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
    "datePublished": reportDate ? `${reportDate}T08:30:00Z` : (summary?.scan_date ? `${summary.scan_date}T08:30:00Z` : new Date().toISOString()),
    "articleBody": report?.content?.substring(0, 800) || summary?.market_narrative,
    "about": {
      "@type": "Dataset",
      "@id": "https://gammarips.com/developers#combo-a-dataset",
      "name": "GammaRips Nightly US Market & Options Intelligence Dataset"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Today's 3-setup pool preview",
      "itemListElement": poolSample.map((signal: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://gammarips.com/signals/${signal.ticker}`,
        "name": `${signal.ticker} bullish market setup`,
        "description": signal.thesis || `${signal.ticker} daily pool setup`
      }))
    }
  } : null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
    }))
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      {dynamicDailySchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dynamicDailySchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-16 max-w-5xl">
        {/* 3-Layer Progressive Disclosure Funnel:
            Layer 1 (Hero) -> Layer 2 (Interactive Showcase + Live Pool + Two Speeds)
            -> Streamlined Connect -> Plain-English FAQ -> Closing CTA */}
        <Hero />

        <ProductShowcase />

        <PoolPreview
          summary={summary}
          report={report}
          reportDate={reportDate}
          signals={poolSample}
        />

        <PoolRule />

        <ConnectTabs />

        <section>
          <div className="text-center">
            <h2 className="text-3xl font-bold font-headline">Frequently Asked Questions</h2>
          </div>
          <Faq faqs={faqs} />
        </section>

        <section className="rounded-2xl border border-primary/30 bg-card/60 px-4 py-10 md:p-12 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold font-headline">
            Connect your own AI — or let us build your trading agent.
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Start your free trial of Pro MCP across US stocks, 2x/inverse ETFs, and options — or
            submit your written strategy on{' '}
            <Link href="/build" className="text-primary hover:underline font-medium">
              Custom Build
            </Link>{' '}
            for a safety-hardened Python bot delivered in {BUILD_TURNAROUND_DAYS} business days (
            {BUILD_STANDARD_PRICE} flat).
          </p>
          <div className="pt-2">
            <InstallCta showClientLinks={false} />
          </div>
        </section>
      </main>
    </div>
  );
}
