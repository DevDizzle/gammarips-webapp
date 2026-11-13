import { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { PoolPreview } from "@/components/landing/pool-preview";
import { PoolRule } from "@/components/landing/pool-rule";
import { InstallCta } from "@/components/landing/install-cta";
import { ConnectTabs } from "@/components/landing/connect-tabs";
import Faq, { buildFaqs } from "@/components/landing/faq";
import { getReceipts } from "@/lib/receipts-server";
import { getLatestOvernightSummary, getDailyReport, getOvernightSignals } from "@/lib/firebase-admin";

export const revalidate = 60; // keep the daily pool summary fresh without a full static rebuild

// No openGraph block here on purpose: the page inherits the root layout's,
// images included. If one is ever added it MUST carry images: [OG_IMAGE].
// The description stays disclaimer-free (owner-settled 2026-08-08).
export const metadata: Metadata = {
  title: "Better option contracts and a trade plan in your AI | GammaRips",
  description:
    "GammaRips gives Claude, ChatGPT, Cursor, or Codex better option contracts every night and the history to set the target and the stop. Your AI builds the trade plan.",
  alternates: {
    canonical: '/',
  },
};


export default async function LandingPage() {
  const summary = await getLatestOvernightSummary();
  const reportDate = summary ? (summary.report_date || summary.scan_date) : null;
  const report = reportDate ? await getDailyReport(reportDate) : null;
  const faqs = buildFaqs(await getReceipts());

  // A sample of the pool, not a ranking. Nothing here may sort the names or
  // present them as top choices. The selection research (2026-08-22) lives on
  // /methodology and /lab.
  const poolSample = summary ? await getOvernightSignals(summary.scan_date, 'bull', 0, 5) : [];

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GammaRips",
    "image": "https://gammarips.com/og-image.png?v=3",
    "url": "https://gammarips.com",
    "description": summary?.market_narrative || "Better option contracts every trading night and the history to plan the exit, served to your AI over MCP. Your AI builds the trade plan.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://gammarips.com/reports?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const dynamicDailySchema = poolSample.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": report?.title || summary?.headline || "Today's curated options-flow pool",
    "description": report?.seoMetadata?.seoDescription || summary?.market_narrative || "The overnight pool: liquidity-ranked bullish names, one out-of-the-money call each.",
    "url": "https://gammarips.com",
    "publisher": {
      "@type": "Organization",
      "name": "GammaRips",
      "logo": { "@type": "ImageObject", "url": "https://gammarips.com/icon.png" }
    },
    "datePublished": reportDate ? `${reportDate}T08:30:00Z` : (summary?.scan_date ? `${summary.scan_date}T08:30:00Z` : new Date().toISOString()),
    "articleBody": report?.content?.substring(0, 800) || summary?.market_narrative,
    "mainEntity": {
      "@type": "ItemList",
      "name": "A sample of today's pool",
      "itemListElement": poolSample.map((signal: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": `${signal.ticker} bullish call candidate`,
        "description": signal.thesis || `${signal.ticker} pool candidate`
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

      <main className="flex-1 container mx-auto px-4 py-8 space-y-14 max-w-5xl">
        {/* Streamlined dataset funnel: Hero -> PoolPreview -> PoolRule ->
            ConnectTabs -> Faq -> closing CTA. */}
        <Hero />

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

        <section className="rounded-2xl border border-primary/30 bg-card/60 px-4 py-10 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-balance mb-3">
            Give your AI the nightly filtered options dataset.
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8">
            Start your free trial of Pro MCP access, connect the AI client or
            open-source harness you already use, and build your trade plan before
            the next open.
          </p>
          <InstallCta />
        </section>
      </main>
    </div>
  );
}
