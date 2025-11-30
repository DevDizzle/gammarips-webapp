
import Link from "next/link";
import { Suspense } from "react";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Bot, Gem, Target, Github, Scale, Shield, LineChart, Star, Users, XCircle, Search, BrainCircuit, Zap } from "lucide-react";
import { UserNav } from "@/components/auth/user-nav";
import HomePageClientContent from "./home-page-client-content";
import Faq, { faqs } from "@/components/landing/faq";
import SignalsPreview from "@/components/landing/signals-preview";
import PerformanceTracker, { PerformanceTrackerSkeleton } from "@/components/performance-tracker";
import MarketMovers from "@/components/landing/market-movers";
import placeholderImageData from '@/app/lib/placeholder-images.json';

export default async function LandingPage() {
  const { hero } = placeholderImageData;
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
           <section
            className="relative text-center h-[60vh] min-h-[400px] flex flex-col items-center justify-center bg-cover bg-center bg-black"
            style={{ backgroundImage: `url(${hero.src})` }}
          >
            <div className="absolute inset-0 bg-black/60 z-0" />
            <div className="relative z-10 p-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline tracking-tight text-white">
                One Simple Options Playbook.
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-neutral-200 max-w-3xl mx-auto">
                High-conviction Call & Put setups on stocks primed to move. You get a tight daily list of contracts and clean AI breakdowns. No complex strategies. Just the Rips.
              </p>
            </div>
          </section>

          {/* Market Movers Section */}
          <Suspense fallback={<div>Loading today's market movers...</div>}>
            <MarketMovers />
          </Suspense>


          {/* New "Who This Is For" Section */}
          <section className="py-16 sm:py-24">
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
                    <p>✓ You are an active options trader. You execute multiple trades per month.</p>
                    <p>✓ You want specific contracts. You want a tight list of high-conviction Call & Put strikes, not a "choose your own adventure" lab.</p>
                    <p>✓ You trade directional volatility. You are comfortable buying premium (Long Calls/Puts) and managing the risk of long options.</p>
                    <p>✓ You treat trading like a business. You want data and logic, not excitement.</p>
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
                    <p>✗ You are a total beginner. You are still learning what a "strike price" is.</p>
                    <p>✗ You are a "tourist." You like to watch the market but rarely pull the trigger.</p>
                    <p>✗ You only trade major indices. We focus exclusively on single-stock setups (no SPY/QQQ).</p>
                    <p>✗ You represent a "theta gang" strategy. We hunt for explosive moves (buying premium), not sideways chop (selling premium).</p>
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
          <section className="pb-16 sm:pb-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-primary/10 border-primary/20 p-8 sm:p-12 text-center">
                <h2 className="text-3xl font-bold font-headline">Live Performance. No Hiding.</h2>
                <p className="mt-4 max-w-3xl mx-auto text-muted-foreground">
                  Our models track the performance of every Call and Put setup we publish. We show the wins, the losses, and the flat trades. This is a live record of every contract we flagged. It is not a cherry-picked highlight reel. Past performance does not guarantee future results
                </p>
                <div className="mt-8">
                  <Suspense fallback={<PerformanceTrackerSkeleton />}>
                    <PerformanceTracker />
                  </Suspense>
                </div>
                <p className="mt-8 text-xs text-muted-foreground max-w-xl mx-auto">
                  Performance tracking began on 11/28/2025. We track each Rip from the moment it is picked (late afternoon ET). We use the NBBO mid price (bid+ask)/2 during regular options hours. We update prices after the next day’s open (~10:00 a.m. ET) and daily until the contract expires.
                </p>
              </Card>
            </div>
          </section>

          {/* The Daily Routine Section */}
          <section className="pb-16 sm:pb-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold font-headline">How to Use the Playbook</h2>
              </div>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto font-bold text-xl">1</div>
                  <h3 className="mt-6 text-xl font-semibold">Get the Daily Contracts</h3>
                  <p className="mt-2 text-muted-foreground">
                    Every session, we scan the Russell 1000 to find a tight list of specific Call and Put contracts. These are setups where the stock, volatility, and option strike price align. No 500-row spreadsheet. No 20-strategy zoo. Just the handful worth a look.
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto font-bold text-xl">2</div>
                  <h3 className="mt-6 text-xl font-semibold">Check the Logic</h3>
                  <p className="mt-2 text-muted-foreground">
                    Each contract comes with a clean AI Breakdown covering trend, catalysts, and risk flags. You get the full story in 60 seconds. We give you the market context. We do not just give you a ticker and a "Greek salad" of data.
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto font-bold text-xl">3</div>
                  <h3 className="mt-6 text-xl font-semibold">Execute Your Trade</h3>
                  <p className="mt-2 text-muted-foreground">
                    We provide the research. You are the trader. You decide your entry price, position size, and stop loss. We hunt for the potential moves. You manage the capital.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Under the Hood Section */}
          <section className="py-16 sm:py-24 bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold font-headline">Real Logic. No Black Box.</h2>
                  <p className="mt-4 text-muted-foreground">
                    We do not scan for random options volume in a vacuum. Here is how the engine actually works.
                  </p>
                </div>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="bg-card/50 text-center">
                    <CardHeader className="items-center">
                       <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Search className="h-6 w-6" />
                      </div>
                      <CardTitle>Stock First, Options Second</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">If the underlying stock is not ready to move, the option chain does not matter. We identify the top strongest stocks using our AI conviction score first. Then we look for the trade.</CardContent>
                  </Card>
                  <Card className="bg-card/50 text-center">
                    <CardHeader className="items-center">
                       <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Zap className="h-6 w-6" />
                      </div>
                      <CardTitle>The "Rip Hunter" Protocol</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">For those high-conviction stocks, the engine hunts for aggressive, high-gamma contracts. We look for setups geared toward buying premium (Long Calls/Puts). We prioritize explosive potential over "safe on paper" spreads.</CardContent>
                  </Card>
                  <Card className="bg-card/50 text-center">
                    <CardHeader className="items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <BrainCircuit className="h-6 w-6" />
                      </div>
                      <CardTitle>AI Without the Hype</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">Our AI reads the boring stuff like earnings transcripts, SEC filings, and dense reports. It translates them into plain English risk notes. It is not a magic money machine. It is an analyst that never sleeps.</CardContent>
                  </Card>
                </div>
            </div>
          </section>
          
          {/* Membership/Pricing Section */}
          <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="bg-primary/10 border-primary/20 p-8 sm:p-12 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold font-headline">Get the Daily Playbook</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                      Become a Ripper to get full access to our daily ranked Call & Put contracts. Unlock the interactive dashboard and the complete AI analysis behind every trade.
                    </p>
                    <div className="mt-8">
                        <HomePageClientContent showButton={true} buttonText="Become a Ripper ($19/mo)" />
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
