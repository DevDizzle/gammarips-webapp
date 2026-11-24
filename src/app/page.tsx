import { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { PoolPreview } from "@/components/landing/pool-preview";
import { PoolRule } from "@/components/landing/pool-rule";
import { InstallCta } from "@/components/landing/install-cta";
import { ConnectTabs } from "@/components/landing/connect-tabs";
import Faq, { buildFaqs } from "@/components/landing/faq";
import { getLatestOvernightSummary, getDailyReport, getOvernightSignals } from "@/lib/firebase-admin";

export const revalidate = 60; // keep the daily pool summary fresh without a full static rebuild

// No openGraph block here on purpose: the page inherits the root layout's,
// images included. If one is ever added it MUST carry images: [OG_IMAGE].
// The description stays disclaimer-free (owner-settled 2026-08-08).
export const metadata: Metadata = {
  title: "Nightly Combo A Options Dataset for AI Agents | GammaRips",
  description:
    "GammaRips streams a nightly filtered options dataset (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45, RV/IV), 10-minute intraday liquidity snapshots, and 3-day excursion history to Claude, ChatGPT, Cursor, or Codex over MCP.",
  alternates: {
    canonical: 'https://gammarips.com',
  },
};


export default async function LandingPage() {
  const summary = await getLatestOvernightSummary();
  const reportDate = summary ? (summary.report_date || summary.scan_date) : null;
  const report = reportDate ? await getDailyReport(reportDate) : null;
  const faqs = buildFaqs();

  // 3-contract preview sample matching get_pool(view="preview").
  const poolSample = summary ? await getOvernightSignals(summary.scan_date, 'bull', 0, 3) : [];

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GammaRips",
    "image": "https://gammarips.com/og-image.png?v=4",
    "url": "https://gammarips.com",
    "description": summary?.market_narrative || "Nightly Combo A options dataset, 10-minute intraday liquidity snapshots, and 3-day excursion outcome history served to your AI agent over MCP.",
  };

  const dynamicDailySchema = poolSample.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": report?.title || summary?.headline || "Today's Combo A options dataset preview",
    "description": report?.seoMetadata?.seoDescription || summary?.market_narrative || "The overnight Combo A pool: top 100 liquid US stocks, bullish calls passing Mid >= $1.00, OI >= 500, Delta 0.22–0.48, and DTE 10–45.",
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
      "name": "GammaRips Combo A Nightly US Options Dataset"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Today's 3-contract pool preview",
      "itemListElement": poolSample.map((signal: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://gammarips.com/signals/${signal.ticker}`,
        "name": `${signal.ticker} bullish call candidate`,
        "description": signal.thesis || `${signal.ticker} Combo A pool candidate`
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

        <section className="rounded-2xl border border-primary/30 bg-card/60 px-4 py-10 md:p-12 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-balance">
            Power your own AI agent—or have us deploy one for your rules.
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Connect Pro MCP in Claude, ChatGPT, Cursor, or Codex to trade stocks, 2x/inverse ETFs,
            or options—or submit your written strategy on{' '}
            <a href="/build" className="text-primary hover:underline font-medium">
              Build an Agent
            </a>{' '}
            for a fixed-scope custom Python trading daemon in 5 business days.
          </p>
          <div className="pt-2">
            <InstallCta />
          </div>
        </section>
      </main>
    </div>
  );
}
