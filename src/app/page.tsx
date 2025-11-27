
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Bot, Gem, Target, Github, Scale, Shield, LineChart, Star, Users, XCircle, Search, BrainCircuit, Zap } from "lucide-react";
import { UserNav } from "@/components/auth/user-nav";
import HomePageClientContent from "./home-page-client-content";
import Faq, { faqs } from "@/components/landing/faq";
import SignalsPreview from "@/components/landing/signals-preview";
import PerformanceTracker, { PerformanceTrackerSkeleton } from "@/components/performance-tracker";

export default async function LandingPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GammaRips",
    "description": "One simple playbook for daily options rippers. GammaRips uses AI to hunt for high-conviction options ideas on stocks that are ready to move.",
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
      "description": "Monthly subscription, cancel anytime. 7-day money-back guarantee on your first month."
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "88"
    },
    "softwareHelp": {
      "@type": "CreativeWork",
      "url": "https://gammarips.com/about"
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
              <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
            </Link>
            <UserNav />
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="text-center py-20 sm:py-28 px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
              One Simple Options Playbook. Daily Rips.
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              GammaRips uses AI to hunt for Rips. These are high-conviction options setups on stocks that are ready to move. You get a tight daily list of call & put Rips and clean AI breakdowns. No tourist signals. No 20-strategy zoo. Just the heat.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
               <Suspense>
                <HomePageClientContent showButton={true} buttonText="Become a Ripper ($19/mo)"/>
               </Suspense>
            </div>
             <p className="mt-3 text-sm text-muted-foreground">Flat monthly rate. Cancel anytime. 7-day money-back guarantee on your first month.</p>
             <p className="mt-4 text-xs text-muted-foreground max-w-md mx-auto">GammaRips is an AI-driven options research tool, not a broker or advisor. Options are risky and can result in 100% loss of premium.</p>
          </section>

          {/* New "Who This Is For" Section */}
          <section className="pb-16 sm:pb-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold font-headline">Who GammaRips Is For (and Not For)</h2>
                 <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">We built this tool for Rippers. It is not a beginner playground or a generic signal service.</p>
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
                    <p>✓ You are an active options trader. You place multiple trades per month.</p>
                    <p>✓ You want a short, focused list of daily Rips. No complex labs or endless scrolling.</p>
                    <p>✓ You understand risk. You are comfortable buying premium and managing your own trades.</p>
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
                    <p>✗ You are a total beginner. You are still learning the basics of options.</p>
                    <p>✗ You are a "tourist." You like to watch but rarely execute trades.</p>
                    <p>✗ You only trade major indices (like SPY or QQQ). We focus exclusively on single-stock Rips.</p>
                    <p>✗ You are a buy-and-hold investor. You don't trade volatility.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Signals Preview Section */}
          <Suspense fallback={<div>Loading today's signals...</div>}>
            <SignalsPreview />
          </Suspense>

          {/* Performance Tracker Section */}
          <section className="py-16 sm:py-24 bg-muted/50">
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

          {/* New Process Section */}
          <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold font-headline">How Daily Rippers Fit Into Your Trading Day</h2>
              </div>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto font-bold text-xl">1</div>
                  <h3 className="mt-6 text-xl font-semibold">Grab Today’s Rippers</h3>
                  <p className="mt-2 text-muted-foreground">
                    Every session, GammaRips scans the Russell 1000 and surfaces a tight list of Call & Put Rippers- ideas where the stock, volatility, and options structure all line up. No 500-row table, no 20 strategies. Just the handful worth a look.
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto font-bold text-xl">2</div>
                  <h3 className="mt-6 text-xl font-semibold">Skim the “Why” in 60 Seconds</h3>
                  <p className="mt-2 text-muted-foreground">
                    Each Ripper comes with a fast AI Briefing: what’s driving the setup (trend, earnings, catalysts, risk flags), and where it can break. You get the story, not just a ticker and a Greek salad.
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto font-bold text-xl">3</div>
                  <h3 className="mt-6 text-xl font-semibold">Run Your Own Playbook</h3>
                  <p className="mt-2 text-muted-foreground">
                    We don’t touch your orders. GammaRips is research only. You decide entries, size, stops, and exits. We hunt for potential rips; you decide how much heat you want to put on.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* New Features Section */}
          <section className="py-16 sm:py-24 bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              
              {/* What the Engine Does */}
              <div>
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold font-headline">What the GammaRips Engine Actually Does</h2>
                  <p className="mt-4 text-muted-foreground">
                    Forget buzzwords. Here’s the job description for the engine under the hood:
                  </p>
                </div>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3"><Target className="text-primary"/>Starts with the Stock</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">We don't scan for random option volume in a vacuum. We identify the Top 20% strongest stocks using our AI conviction score first. If the underlying stock isn't ready to move, the option chain doesn't matter.</CardContent>
                  </Card>
                  <Card className="bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3"><Zap className="text-primary"/>Deploys the "Rip Hunter" Protocol</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">For those high-conviction winners, the engine switches modes. It hunts for aggressive, high-gamma contracts (3-60 days out)-prioritizing explosive acceleration over "perfect" spreads. It finds the contracts designed to move fast, not just the ones that look safe on paper.</CardContent>
                  </Card>
                  <Card className="bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3"><Shield className="text-primary"/>Auto-Adjusts for Safety</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">It uses dynamic filtering: loosening the ropes for elite breakouts to catch them early, while enforcing strict liquidity and spread rules for everything else. You get a short, lethal list of Rippers, not a spreadsheet to scroll through.</CardContent>
                  </Card>
                </div>
              </div>

              {/* AI Co-Pilot */}
              <div>
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold font-headline">Your AI Co-Pilot (Not Your Broker)</h2>
                  <p className="mt-4 text-muted-foreground">
                    Yes, there’s real AI in here. No, it’s not a magic money machine.
                  </p>
                </div>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                   <Card className="bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3"><Search className="text-primary"/>Reads the Boring Stuff</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">Earnings call transcripts, SEC filings, headlines- things most people pretend to read. The model condenses that into a directional view and risk notes you can skim.</CardContent>
                  </Card>
                   <Card className="bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3"><BrainCircuit className="text-primary"/>Translates Data Into Plain Language</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">“Bullish bias with elevated volatility; earnings just passed; watch [X] level as a line in the sand.”</CardContent>
                  </Card>
                   <Card className="bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3"><XCircle className="text-primary"/>Never Presses the Buy Button</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">GammaRips doesn’t execute trades. It’s there to inform your decisions, not replace your judgment.</CardContent>
                  </Card>
                </div>
              </div>

            </div>
          </section>
          
          {/* Membership/Pricing Section */}
          <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="bg-primary/10 border-primary/20 p-8 sm:p-12 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold font-headline">Get the Daily Playbook</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                      Become a ripper to get full access to our daily ranked options, the interactive dashboard, and the complete AI analysis behind every signal.
                    </p>
                    <div className="mt-8">
                        <Button asChild size="lg">
                             <Link href="/dashboard">
                                Become a Ripper – $19/mo <ArrowRight className="ml-2 h-5 w-5"/>
                            </Link>
                        </Button>
                         <p className="text-xs text-muted-foreground mt-3">Billed monthly, cancel anytime. 7-day money-back guarantee on your first month.</p>
                    </div>
                </Card>
            </div>
          </section>
          
          {/* FAQ Section */}
          <section className="py-16 sm:py-24 bg-muted/50">
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
