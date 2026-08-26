import { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { StartHere } from "@/components/landing/start-here";
import { PoolPreview } from "@/components/landing/pool-preview";
import { PoolRule } from "@/components/landing/pool-rule";
import { Honesty } from "@/components/landing/honesty";
import { ConnectTabs } from "@/components/landing/connect-tabs";
import Faq, { faqs } from "@/components/landing/faq";
import { BlogTeaserList } from "@/components/blog/blog-teaser-list";
import { getLatestOvernightSummary, getDailyReport, getOvernightSignals, getBlogPostsAdmin } from "@/lib/firebase-admin";

export const revalidate = 60; // keep the daily pool summary fresh without a full static rebuild

// No openGraph block here on purpose: the page inherits the root layout's,
// images included. If one is ever added it MUST carry images: [OG_IMAGE].
// The description stays disclaimer-free (owner-settled 2026-08-08).
export const metadata: Metadata = {
  title: "GammaRips | Options-flow data for AI agents",
  description:
    "Give your AI agent real options-flow data over MCP. A nightly liquidity-ranked pool of roughly 40 to 50 bullish call contracts, free to browse.",
  alternates: {
    canonical: '/',
  },
};


export default async function LandingPage() {
  const summary = await getLatestOvernightSummary();
  const reportDate = summary ? (summary.report_date || summary.scan_date) : null;
  const report = reportDate ? await getDailyReport(reportDate) : null;
  const blogPosts = await getBlogPostsAdmin();

  // A sample of the pool, not a ranking. Selection research closed 2026-08-22:
  // the pool is not distinguishable from matched random on returns, so nothing
  // here may sort or present as "the best" names.
  const poolSample = summary ? await getOvernightSignals(summary.scan_date, 'bull', 0, 5) : [];

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GammaRips",
    "image": "https://gammarips.com/og-image.png?v=3",
    "url": "https://gammarips.com",
    "description": summary?.market_narrative || "Options-flow data for AI agents: an overnight liquidity ranking of the US options universe, cut to a small pool of tradeable contracts and served over MCP.",
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
        {/* The path, in the order a person walks it: what this is, the four
            steps, then the proof (today's pool, the rule, the unflattering
            numbers). Per-client connect detail sits below as reference. */}
        <Hero />

        <StartHere />

        <PoolPreview
          summary={summary}
          report={report}
          reportDate={reportDate}
          signals={poolSample}
        />

        <PoolRule />

        <Honesty />

        <ConnectTabs />

        {/* Cross-link into /blog so posts get crawled and pick up link-equity
            from the highest-traffic page. */}
        {blogPosts.length > 0 && (
          <BlogTeaserList
            posts={blogPosts}
            heading="From the Blog"
            subheading="How the engine builds the pool: methodology, research, and plain-English explainers."
            limit={3}
          />
        )}

        <section>
          <div className="text-center">
            <h2 className="text-3xl font-bold font-headline">Frequently Asked Questions</h2>
          </div>
          <Faq />
        </section>
      </main>
    </div>
  );
}
