
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Bot, Gem, Target, Github, Scale, Shield, LineChart, Star, Users, XCircle } from "lucide-react";
import { UserNav } from "@/components/auth/user-nav";
import HomePageClientContent from "./home-page-client-content";
import Faq, { faqs } from "@/components/landing/faq";
import SignalsPreview from "@/components/landing/signals-preview";
import PerformanceTracker, { PerformanceTrackerSkeleton } from "@/components/performance-tracker";

export default async function LandingPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ProfitScout",
    "description": "A simple, focused options research tool that provides a daily playbook of high-conviction call & put setups for active traders scanning the Russell 1000.",
    "applicationCategory": "FinancialApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "19.00",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "19.00",
        "priceCurrency": "USD",
        "billingIncrement": "month",
        "unitText": "month"
      },
      "description": "Monthly subscription, cancel anytime. Includes a 7-day money-back guarantee on your first month."
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "88"
    },
    "softwareHelp": {
      "@type": "CreativeWork",
      "url": "https://profitscout.app/about"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Suspense>
        <HomePageClientContent />
      </Suspense>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold font-headline">
              <span className="text-foreground">Profit</span><span className="text-primary">Scout</span>
            </Link>
            <UserNav />
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="text-center py-20 sm:py-28 px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
              One Simple Playbook. Daily Options Setups.
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              We scan the Russell 1000 for a short, focused list of high-conviction Call & Put setups. No clutter, no 20-strategy lab—just a daily list and clear rationale for traders who execute.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
               <Suspense>
                <HomePageClientContent showButton={true} buttonText="Start for $19/month"/>
               </Suspense>
            </div>
             <p className="mt-3 text-sm text-muted-foreground">7-day money-back guarantee on your first month if you don’t find it useful.</p>
          </section>

          {/* New "Who This Is For" Section */}
          <section className="pb-16 sm:pb-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold font-headline">Who ProfitScout Is For</h2>
                 <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">This is a professional research tool designed for a specific type of trader.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-green-400">
                      <CheckCircle />
                      This Is For You If...
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-muted-foreground">
                    <p>✓ You are an active options trader placing multiple trades per month.</p>
                    <p>✓ You want a short, focused list of daily ideas, not a complex lab.</p>
                    <p>✓ You are comfortable with options risk and buying premium.</p>
                  </CardContent>
                </Card>
                 <Card className="bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-red-400">
                      <XCircle />
                      This Is Not For You If...
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-muted-foreground">
                    <p>✗ You are a total beginner in options trading.</p>
                    <p>✗ You rarely or never execute trades.</p>
                    <p>✗ You are a long-term, buy-and-hold equity investor only.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Signals Preview Section */}
          <Suspense fallback={<div>Loading today's signals...</div>}>
            <SignalsPreview />
          </Suspense>

          {/* Process Section */}
          <section className="py-16 sm:py-24 bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold font-headline">Go From Data Overload to Actionable Insight in Minutes</h2>
              </div>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto font-bold text-xl">1</div>
                  <h3 className="mt-6 text-xl font-semibold">Get Daily Options Setups</h3>
                  <p className="mt-2 text-muted-foreground">
                    Get our top-ranked Call and Put setups for the Russell 1000, delivered to your dashboard daily. We find the signals so you can focus on the strategy.
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto font-bold text-xl">2</div>
                  <h3 className="mt-6 text-xl font-semibold">Understand with an AI Stock Briefing</h3>
                  <p className="mt-2 text-muted-foreground">
                    Go beyond the signal. Understand the "why" with our AI Analyst Briefing, which synthesizes company filings, earnings calls, and technicals into a clear summary. We provide the shortlist; you decide the trade.
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto font-bold text-xl">3</div>
                  <h3 className="mt-6 text-xl font-semibold">Manage Your Own Risk & Exits</h3>
                  <p className="mt-2 text-muted-foreground">
                    ProfitScout provides research and data-driven setups. As an active trader, you maintain full control over your risk management, trade execution, and exit strategy.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold font-headline">Your Complete Toolkit for Options Research</h2>
                <p className="mt-4 text-muted-foreground">
                  Our models score thousands of options contracts daily based on liquidity, volatility, and alignment with the underlying stock's trend. You get a filtered list of the highest-scoring opportunities, saving you hours of research.
                </p>
              </div>
              <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card p-6 rounded-lg">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1"><Bot size={24} className="text-primary" /></div>
                        <div>
                            <h3 className="text-lg font-semibold">Your Personal AI Analyst</h3>
                            <p className="text-muted-foreground text-sm">Forget spending hours reading SEC filings and earnings transcripts. Our AI does the heavy lifting, giving you a clear, easy-to-read rationale for every stock's outlook, including risks, catalysts, and key support levels.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-lg">
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1"><Gem size={24} className="text-primary" /></div>
                        <div>
                            <h3 className="text-lg font-semibold">The Confluence Dashboard</h3>
                            <p className="text-muted-foreground text-sm">See where our data aligns. Our dashboard instantly highlights stocks that have both a strong bullish/bearish AI rating and a high-scoring options setup. It's the ultimate at-a-glance view of the market's strongest signals.</p>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Trust & Responsibility Section */}
          <section className="py-16 sm:py-24 bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-headline">Built on Transparency. Powered by Open-Source AI.</h2>
              <p className="mt-4 text-muted-foreground">
                We believe in showing our work. The core AI engine that powers ProfitScout is open-source. We invite you to explore the code, understand our methodology, and see exactly how we turn complex data into market insights. Your trust is our priority.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <Card className="bg-background/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Scale className="h-6 w-6 text-primary"/> Sourced Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">We don't guess. Our AI synthesizes data directly from SEC filings, earnings calls, and financial statements so you can see the source of the analysis.</p>
                  </CardContent>
                </Card>
                <Card className="bg-background/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Github className="h-6 w-6 text-primary"/> Open-Source Engine</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">The core scoring engine that powers ProfitScout is open-source. We believe in showing our work and invite you to <a href="https://github.com/DevDizzle/profitscout-engine" target="_blank" rel="noopener noreferrer" className="underline">review our methodology</a>.</p>
                  </CardContent>
                </Card>
                <Card className="bg-background/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-6 w-6 text-primary"/> Educational Use</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">ProfitScout is an educational research tool, not financial advice. We provide data-driven insights to help you make more informed decisions. Past performance does not guarantee future results.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Performance Tracker Section */}
          <section className="py-16 sm:py-24">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold font-headline">See Our Results in Action</h2>
                    <p className="mt-4 text-muted-foreground">
                        Our models track the performance of every signal. Here's a live look at the data-driven edge we provide. Past performance does not guarantee future results.
                    </p>
                </div>
                <Suspense fallback={<PerformanceTrackerSkeleton />}>
                    <PerformanceTracker />
                </Suspense>
            </div>
          </section>

           {/* Membership/Pricing Section */}
          <section className="py-16 sm:py-24 bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="bg-primary/10 border-primary/20 p-8 sm:p-12 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold font-headline">Get the Daily Playbook</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                      Become a member to get full access to our daily ranked setups, the interactive dashboard, and the complete AI analysis behind every signal.
                    </p>
                    <div className="mt-8 max-w-md mx-auto">
                      <table className="w-full text-left">
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2 font-medium">Price</td>
                            <td className="py-2 text-right font-semibold">$19 / month</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 font-medium">Billing</td>
                            <td className="py-2 text-right">Billed monthly, cancel anytime</td>
                          </tr>
                           <tr className="border-b">
                            <td className="py-2 font-medium">Includes</td>
                            <td className="py-2 text-right">Full access to all features</td>
                          </tr>
                          <tr>
                            <td className="py-2 font-medium">Guarantee</td>
                            <td className="py-2 text-right">7-day money-back guarantee</td>
                          </tr>
                        </tbody>
                      </table>
                       <p className="text-xs text-muted-foreground mt-4">
                        If you don’t find ProfitScout useful in your first 7 days, email us and we’ll refund your first month, no questions asked.
                      </p>
                    </div>
                    <div className="mt-8">
                        <Suspense>
                            <HomePageClientContent showButton={true} buttonText="Start for $19/month" />
                        </Suspense>
                    </div>
                </Card>
            </div>
          </section>
          
          {/* FAQ Section */}
          <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-headline">Frequently Asked Questions</h2>
                </div>
                <Faq />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
