import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import Faq, { faqs } from "@/components/landing/faq";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Scan, LineChart, Bot, FlaskConical } from "lucide-react";
import { getLatestOvernightSummary, getDailyReport, getOvernightSignals, getCohortStats, getBlogPostsAdmin } from "@/lib/firebase-admin";
import { BlogTeaserList } from "@/components/blog/blog-teaser-list";
import { AgentDemo } from "@/components/landing/agent-demo";
import { CohortStatsTiles, formatCohortStartDate } from "@/components/landing/cohort-stats-row";
import { Separator } from "@/components/ui/separator";

export const revalidate = 60; // keep the daily pool summary fresh without a full static rebuild

export const metadata: Metadata = {
  title: "GammaRips — Options-flow data for AI agents",
  description: "Stop asking AI for stock picks. Start giving it real data. GammaRips scans 5,000+ tickers overnight for unusual options activity and curates it to a small high-signal pool — browse it free, or connect Claude, ChatGPT, or your own agent over MCP for the full data layer. Your agent analyzes. You decide. Paper-trading data, educational only.",
  alternates: {
    canonical: '/',
  },
};

const pillars = [
  { icon: <Scan className="h-6 w-6 text-primary" />, title: 'The Curated Pool', desc: 'The market prints hundreds of unusual-flow names a night. The engine scores and cuts them to a pool your agent can actually reason over — flow, technicals, and context attached.' },
  { icon: <LineChart className="h-6 w-6 text-primary" />, title: 'The Opportunity Surface', desc: 'For every historical setup: what was actually possible. Peak excursion, worst drawdown, the full path — wins and losses. Your agent learns how these contracts really behave.' },
  { icon: <Bot className="h-6 w-6 text-primary" />, title: 'Your Agent, Your Conclusion', desc: 'There is no pick endpoint. On purpose. 23 MCP tools return data and methodology; your agent reasons to its own contract. A thousand users, a thousand different conclusions.' },
];

export default async function LandingPage() {
  const summary = await getLatestOvernightSummary();
  const reportDate = summary ? (summary.report_date || summary.scan_date) : null;
  const report = reportDate ? await getDailyReport(reportDate) : null;
  const cohortStats = await getCohortStats();
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
    "description": report?.seoMetadata?.seoDescription || summary?.market_narrative || "Overnight options flow signals explicitly ranked by conviction.",
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

        {/* Live panel — public validation-cohort stats above the divider,
            an illustrative agent session below it. The pick itself is not a
            product; the pool + the data layer are. */}
        <section id="engine-live">
          <Card className="border-primary/40 bg-card/90 shadow-[0_0_30px_rgba(234,179,8,0.08)]">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary font-semibold">
                    GammaRips · V7 Engine Live
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold font-headline mt-1">
                    The engine validates itself in public.
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    A paper-traded cohort tests the selection methodology every
                    market day, under fixed mechanical rules. Every outcome is
                    logged, nothing is edited after the fact.
                  </p>
                </div>
                {cohortStats && (
                  <Badge variant="outline" className="text-[11px] text-muted-foreground border-muted-foreground/30">
                    Cohort since {formatCohortStartDate(cohortStats.cohort_start)}
                  </Badge>
                )}
              </div>

              <CohortStatsTiles stats={cohortStats} />

              <Separator />

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 text-center">
                  What working the pool with an agent looks like
                </h3>
                <AgentDemo />
              </div>

              <p className="text-[11px] text-muted-foreground text-center leading-tight">
                Paper-traded · Educational only · Not investment advice
              </p>
            </CardContent>
          </Card>
        </section>

        {/* What your agent gets */}
        <section>
          <h2 className="text-2xl font-bold font-headline text-center mb-6">What your agent gets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pillars.map((pillar) => (
              <Card key={pillar.title} className="bg-card/50 text-center">
                <CardContent className="p-5">
                  <div className="flex justify-center mb-3">{pillar.icon}</div>
                  <h3 className="font-bold font-headline">{pillar.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{pillar.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

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

                {/* Signal counts — raw overnight scan (all directions), before
                    the BULLISH-only gate. The curated pool is bullish-only. */}
                <p className="text-xs text-muted-foreground mb-2">Raw overnight scan (all directions)</p>
                <div className="flex gap-6 mb-4">
                  <div>
                    <span className="text-3xl font-bold">{report?.total_signals || summary.total_signals}</span>
                    <span className="text-sm text-muted-foreground ml-2">signals scanned</span>
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
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold font-headline">Read this before you pay us</h2>
          <p className="text-muted-foreground">
            If you bought every contract in our pool every morning with a fixed
            exit, you would lose money. We know because we tested it, and we
            publish the ledger. The pool is where opportunity concentrates —
            the excursion data proves the winners are in there — but which
            ones, and how they&apos;re traded, is analysis. That&apos;s your
            agent&apos;s job. Anyone who sells you a shortcut past that step is
            selling you a story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/developers">
                Connect Your Agent <ArrowRight className="ml-2 h-5 w-5" />
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
                We run experiments on our own data substrate and publish the
                results — hypothesis, method, sample size, verdict — including
                the ideas that got killed. It&apos;s how the pool&apos;s
                methodology earns its keep, in public.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/lab">Read the experiments &rarr;</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Latest from the blog — cross-link into the /blog section so posts
            get crawled and pick up link-equity from the highest-traffic page. */}
        {blogPosts.length > 0 && (
          <BlogTeaserList
            posts={blogPosts}
            heading="From the Blog"
            subheading="How the engine reads institutional options flow — methodology, research, and plain-English explainers."
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
