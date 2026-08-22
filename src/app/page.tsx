import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import Faq, { faqs } from "@/components/landing/faq";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FlaskConical } from "lucide-react";
import { getLatestOvernightSummary, getDailyReport, getOvernightSignals, getBlogPostsAdmin } from "@/lib/firebase-admin";
import { BlogTeaserList } from "@/components/blog/blog-teaser-list";
import { HarnessCta } from "@/components/landing/harness-cta";
import { ConnectTabs } from "@/components/landing/connect-tabs";
import { TRIAL_DAYS } from "@/lib/constants";

export const revalidate = 60; // keep the daily pool summary fresh without a full static rebuild

export const metadata: Metadata = {
  title: "GammaRips | Options-flow data for AI agents",
  description:
    "Overnight scan of about 3,500 optionable US stocks for unusual options activity, curated to a small bullish pool. Free to browse, or pipe it to your AI agent over MCP.",
  alternates: {
    canonical: '/',
  },
};


export default async function LandingPage() {
  const summary = await getLatestOvernightSummary();
  const reportDate = summary ? (summary.report_date || summary.scan_date) : null;
  const report = reportDate ? await getDailyReport(reportDate) : null;
  const blogPosts = await getBlogPostsAdmin();

  const topBull = summary ? await getOvernightSignals(summary.scan_date, 'bull', 0, 5) : [];
  const topSignals = [...topBull]
    .sort((a, b) => (b.overnight_score || 0) - (a.overnight_score || 0))
    .slice(0, 5);

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GammaRips",
    "image": "https://gammarips.com/og-image.png?v=3",
    "url": "https://gammarips.com",
    "description": summary?.market_narrative || "Options-flow data for AI agents: overnight unusual-activity scans, curated to a high-signal pool and served over MCP.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://gammarips.com/reports?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const dynamicDailySchema = topSignals.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": report?.title || summary?.headline || "Today's curated options-flow pool",
    "description": report?.seoMetadata?.seoDescription || summary?.market_narrative || "Overnight options-flow signals: the curated, conviction-scored bullish pool.",
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
      "name": "Top Signals",
      "itemListElement": topSignals.map((signal: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": `${signal.ticker} BULL Options Flow. Score: ${signal.overnight_score}`,
        "description": signal.thesis || `${signal.ticker} signal`
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
      {/* Header */}

      <main className="flex-1 container mx-auto px-4 py-8 space-y-12 max-w-5xl">
        <Hero />

        {/* Activation above the fold: per-client connect (free first, then the
            honest pro line), then the open-source harness. Proof (today's pool,
            the honesty section) follows. Order per the 2026-08-13 landing plan. */}
        <ConnectTabs />

        <HarnessCta />

        {/* Today's Market Snapshot */}
        {summary && (
          <section>
            <Card className="border-primary/30 bg-card/80">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(reportDate || summary.scan_date).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
                      })}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold font-headline mt-1">
                      {report?.title || summary.headline || "Today's curated pool"}
                    </h2>
                  </div>
                  <Link href={`/reports/${reportDate || summary.scan_date}`}>
                    <Button variant="outline" size="sm">
                      Full Report <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Pool counts: the enriched candidate set. Bullish-only is a
                    deliberate gate (see methodology), so bear is expected to be 0. */}
                <p className="text-xs text-muted-foreground mb-2">Today&apos;s enriched pool (bullish-only by design)</p>
                <div className="flex gap-6 mb-4">
                  <div>
                    <span className="text-3xl font-bold">{report?.total_signals || summary.total_signals}</span>
                    <span className="text-sm text-muted-foreground ml-2">candidates enriched</span>
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-green-500">{report?.bullish_count || summary.bullish_count || 0}</span>
                    <span className="text-sm text-muted-foreground ml-2">📈 bull</span>
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-red-500">{report?.bearish_count || summary.bearish_count || 0}</span>
                    <span className="text-sm text-muted-foreground ml-2">📉 bear</span>
                  </div>
                </div>

                {/* Market narrative */}
                {summary.market_narrative && (
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {summary.market_narrative}
                  </p>
                )}

                {/* Theme badges */}
                {summary.top_themes && summary.top_themes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {summary.top_themes.slice(0, 5).map((theme: string) => (
                      <Badge key={theme} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Top of today's pool */}
        {topSignals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold font-headline">From Today&apos;s Pool</h2>
              <Link href="/signals" className="text-sm text-primary hover:underline">
                View the full pool →
              </Link>
            </div>
            <div className="grid gap-3">
              {topSignals.map((signal: any) => (
                <Card key={signal.id} className="bg-card/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/20 text-green-500">
                        📈 BULL
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-headline text-lg">{signal.ticker}</span>
                        </div>
                        {signal.thesis && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-md">
                            {signal.thesis}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <div className="font-bold">Score: {signal.overnight_score}</div>
                      </div>
                      {/* All info is free */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* The honesty section */}
        <section id="honesty" className="scroll-mt-24 text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold font-headline">Read this before you pay us</h2>
          <p className="text-muted-foreground">
            If you bought every contract in our pool every morning with a fixed
            exit, you would lose money. We know because we tested it, and we{' '}
            <Link href="/scorecard" className="text-primary hover:underline">
              publish the ledger
            </Link>
            . The pool is where opportunity concentrates, and the outcome data
            shows the winners are in there. But which ones, and how
            they&apos;re traded, is analysis. That&apos;s your
            agent&apos;s job. Anyone who sells you a shortcut past that step is
            selling you a story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/pricing">
                Start Your {TRIAL_DAYS}-Day Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/how-it-works">See How the Engine Works</Link>
            </Button>
          </div>
        </section>

        {/* Lab teaser */}
        <section>
          <Card className="bg-card/50">
            <CardContent className="p-6 md:p-8 text-center space-y-3">
              <div className="flex justify-center">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-headline">The Lab</h2>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                We run experiments on our own data and publish the results
                (hypothesis, method, sample size, verdict), including
                the ideas that got killed. It&apos;s how the pool&apos;s
                methodology earns its keep, in public.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/lab">Read the experiments &rarr;</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Latest from the blog: cross-link into the /blog section so posts
            get crawled and pick up link-equity from the highest-traffic page. */}
        {blogPosts.length > 0 && (
          <BlogTeaserList
            posts={blogPosts}
            heading="From the Blog"
            subheading="How the engine reads institutional options flow: methodology, research, and plain-English explainers."
            limit={3}
          />
        )}

        {/* FAQ */}
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
