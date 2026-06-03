import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import Faq, { faqs } from "@/components/landing/faq";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Scan, Brain, Sparkles, Send } from "lucide-react";
import { getLatestOvernightSummary, getDailyReport, getOvernightSignals, getLatestTodaysPick, getCohortStats, getBlogPostsAdmin } from "@/lib/firebase-admin";
import { BlogTeaserList } from "@/components/blog/blog-teaser-list";
import { TodaysPickCard } from "@/components/landing/todays-pick-card";
import { CohortStatsTiles, formatCohortStartDate } from "@/components/landing/cohort-stats-row";
import { ProLock } from "@/components/ui/pro-lock";
import { Separator } from "@/components/ui/separator";

export const revalidate = 60; // keep todays_pick fresh without a full static rebuild

export const metadata: Metadata = {
  title: "GammaRips — One options trade a day. Pushed to your phone at 7:30 AM ET.",
  description: "GammaRips scans institutional options flow overnight and mechanically picks one contract each morning — with stop, target, and exit pre-set. Browse the signals haystack free, or get the curated daily pick delivered to your inbox + WhatsApp at 07:30 ET. Paper-trading, educational only.",
  alternates: {
    canonical: '/',
  },
};

const steps = [
  { icon: <Scan className="h-6 w-6 text-primary" />, title: 'See Everything', desc: 'Institutional moves across 5,230+ tickers — not just the popular 50 everyone watches' },
  { icon: <Brain className="h-6 w-6 text-primary" />, title: 'Know What Matters', desc: 'Each signal scored 1-10 so you focus on high-conviction setups, not noise' },
  { icon: <Sparkles className="h-6 w-6 text-primary" />, title: 'Get the Trade', desc: 'Specific contracts, strikes, and the AI thesis explaining why institutions are positioned' },
  { icon: <Send className="h-6 w-6 text-primary" />, title: 'Act First', desc: 'In your hands before 9:30 AM — while everyone else is still reading headlines' },
];

export default async function LandingPage() {
  const summary = await getLatestOvernightSummary();
  const reportDate = summary ? (summary.report_date || summary.scan_date) : null;
  const report = reportDate ? await getDailyReport(reportDate) : null;
  const todaysPick = await getLatestTodaysPick();
  const cohortStats = await getCohortStats();
  const blogPosts = await getBlogPostsAdmin();

  const topBull = summary ? await getOvernightSignals(summary.scan_date, 'bull', 0, 3) : [];
  const topBear = summary ? await getOvernightSignals(summary.scan_date, 'bear', 0, 2) : [];
  const topSignals = [...topBull, ...topBear]
    .sort((a, b) => (b.overnight_score || 0) - (a.overnight_score || 0))
    .slice(0, 5);

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GammaRips",
    "image": "https://gammarips.com/og-image.png?v=3",
    "url": "https://gammarips.com",
    "description": summary?.market_narrative || "One options trade a day, scored before you wake up.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://gammarips.com/reports?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const dynamicDailySchema = topSignals.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": report?.title || summary?.headline || "Today's V5.4 pick",
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
        "name": `${signal.ticker} ${signal.direction === 'BULLISH' ? 'BULL' : 'BEAR'} Options Flow. Score: ${signal.overnight_score}`,
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

        {/* V5.4 Live Panel — single brand-bordered container that visually
            unifies (a) the public cohort-stats tiles and (b) the paywalled
            today's-pick card. Stats are above the divider and visible to all;
            pick details are below and paywalled via <ProLock> for non-subs.
            Both are explicitly framed as the SAME GammaRips strategy so the
            stats can't be read in isolation from the pick that produced them. */}
        {todaysPick && (
          <section id="todays-pick">
            <Card className="border-primary/40 bg-card/90 shadow-[0_0_30px_rgba(234,179,8,0.08)]">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-primary font-semibold">
                      GammaRips · V5.4 Live
                    </p>
                    <h2 className="text-xl md:text-2xl font-bold font-headline mt-1">
                      One pick a day. Tracked openly.
                    </h2>
                  </div>
                  {cohortStats && (
                    <Badge variant="outline" className="text-[11px] text-muted-foreground border-muted-foreground/30">
                      Cohort since {formatCohortStartDate(cohortStats.cohort_start)}
                    </Badge>
                  )}
                </div>

                <CohortStatsTiles stats={cohortStats} />

                <Separator />

                <ProLock
                  title="Today's Pick"
                  description="Subscribe to get the curated daily pick delivered to your inbox + WhatsApp group at 07:30 ET."
                >
                  <TodaysPickCard pick={todaysPick} embedded />
                </ProLock>

                <p className="text-[11px] text-muted-foreground text-center leading-tight">
                  Paper-traded · Educational only · Not investment advice
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* How It Works Summary */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step) => (
            <Card key={step.title} className="bg-card/50 text-center">
              <CardContent className="p-5">
                <div className="flex justify-center mb-3">{step.icon}</div>
                <h3 className="font-bold font-headline">{step.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
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
                      {report?.title || summary.headline || "Today's V5.4 pick"}
                    </h2>
                  </div>
                  <Link href={`/reports/${reportDate || summary.scan_date}`}>
                    <Button variant="outline" size="sm">
                      Full Report <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                {/* Signal counts */}
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

        {/* Top Signals Preview */}
        {topSignals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold font-headline">Top Signals</h2>
              <Link href="/signals" className="text-sm text-primary hover:underline">
                View all options signals →
              </Link>
            </div>
            <div className="grid gap-3">
              {topSignals.map((signal: any) => (
                <Card key={signal.id} className="bg-card/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        signal.direction === 'BULLISH' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {signal.direction === 'BULLISH' ? '📈 BULL' : '📉 BEAR'}
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

        {/* Value Props */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl font-bold font-headline">Stop Trading Blind</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Most retail traders find out about institutional moves after the stock already popped. You'll see the positions at 8:30 AM — hours before the move. Every signal timestamped, every call tracked publicly. No cherry-picking, no hindsight.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/signals">
                Explore Signals <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/how-it-works">See How It Works</Link>
            </Button>
          </div>
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
