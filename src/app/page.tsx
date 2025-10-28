
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Bot, Gem, Target, Github } from "lucide-react";
import { UserNav } from "@/components/auth/user-nav";
import HomePageClientContent from "./home-page-client-content";
import Faq, { faqs } from "@/components/landing/faq";
import { Badge } from "@/components/ui/badge";
import SignalsPreview from "@/components/landing/signals-preview";

export default async function LandingPage() {
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

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ProfitScout",
    "description": "AI-powered options research tool for Russell 1000 stocks; delivers daily call/put setups and supporting AI analysis.",
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
        "billingIncrement": "month"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "88"
    },
    "softwareHelp": {
      "@type": "CreativeWork",
      "url": "https://profitscout.app/about"
    },
    "freeTrial": {
        "@type": "Offer",
        "name": "30-Day Free Trial",
        "description": "Get 30 days of unlimited access to everything ProfitScout has to offer.",
        "price": "0",
        "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
       <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <Suspense>
        <HomePageClientContent />
      </Suspense>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold font-headline text-primary">
              ProfitScout
            </Link>
            <UserNav />
          </div>
        </header>

        <main className="flex-1">
          {/* Hero Section */}
          <section className="text-center py-20 sm:py-28 px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
              Options Scanner for the Russell 1000 – Daily Call & Put Trade Setups
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Stop drowning in data. Our AI analyzes thousands of stocks and options contracts to deliver clear, data-driven trade ideas directly to your inbox and dashboard.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
               <Suspense>
                <HomePageClientContent showButton={true} buttonText="Start Your Free 30-Day Trial"/>
               </Suspense>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">No credit card required. Get instant access.</p>
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
                  <h3 className="mt-6 text-xl font-semibold">Get Daily Setups</h3>
                  <p className="mt-2 text-muted-foreground">
                    Wake up to our top-ranked Call and Put setups for the Russell 1000, delivered to your inbox daily. We find the signals so you can focus on the strategy.
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto font-bold text-xl">2</div>
                  <h3 className="mt-6 text-xl font-semibold">Dive Deeper with AI Analysis</h3>
                  <p className="mt-2 text-muted-foreground">
                    Go beyond the signal. Understand the "why" with our AI Analyst Briefing, which synthesizes company filings, earnings calls, and technical data into a clear, actionable summary.
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground mx-auto font-bold text-xl">3</div>
                  <h3 className="mt-6 text-xl font-semibold">Make Informed Decisions</h3>
                  <p className="mt-2 text-muted-foreground">
                    Use our interactive dashboard to explore key metrics, chart price action, and supplement your own research. We provide the data; you maintain full control.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div>
                   <Badge variant="outline" className="border-primary/50 text-primary">Daily Delivery</Badge>
                  <h3 className="mt-4 text-3xl font-bold font-headline">High-Potential Setups, Emailed Daily</h3>
                  <p className="mt-4 text-muted-foreground">
                    Our models score thousands of options contracts daily based on liquidity, volatility, and alignment with the underlying stock's trend. You get a filtered list of the highest-scoring opportunities, saving you hours of research.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1"><Bot size={24} className="text-primary" /></div>
                        <div>
                            <h3 className="text-lg font-semibold">Your Personal AI Analyst</h3>
                            <p className="text-muted-foreground text-sm">Forget spending hours reading SEC filings and earnings transcripts. Our AI does the heavy lifting, giving you a clear, easy-to-read rationale for every stock's outlook, including risks, catalysts, and key support levels.</p>
                        </div>
                    </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="bg-card p-6 rounded-lg lg:order-last">
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1"><Gem size={24} className="text-primary" /></div>
                        <div>
                            <h3 className="text-lg font-semibold">The Confluence Dashboard</h3>
                            <p className="text-muted-foreground text-sm">See where our data aligns. Our dashboard instantly highlights stocks that have both a strong bullish/bearish AI rating and a high-scoring options setup. It's the ultimate at-a-glance view of the market's strongest signals.</p>
                        </div>
                    </div>
                </div>
                 <div>
                  <Badge variant="outline" className="border-primary/50 text-primary">At-a-Glance Insights</Badge>
                  <h3 className="mt-4 text-3xl font-bold font-headline">The Confluence Dashboard</h3>
                  <p className="mt-4 text-muted-foreground">
                    See where our data aligns. Our dashboard instantly highlights stocks that have both a strong bullish/bearish AI rating and a high-scoring options setup. It's the ultimate at-a-glance view of the market's strongest signals.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Trust & Transparency Section */}
          <section className="py-16 sm:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
                <Github className="h-10 w-10 text-primary mx-auto"/>
              <h2 className="mt-4 text-3xl font-bold font-headline">Built on Transparency. Powered by Open-Source AI.</h2>
              <p className="mt-4 text-muted-foreground">
                We believe in showing our work. The core AI engine that powers ProfitScout is open-source. We invite you to explore the code, understand our methodology, and see exactly how we turn complex data into market insights. Your trust is our priority.
              </p>
               <Button asChild variant="outline" className="mt-6">
                <a href="https://github.com/DevDizzle/profitscout-engine" target="_blank" rel="noopener noreferrer">
                  Explore the Code
                </a>
              </Button>
            </div>
          </section>

           {/* Offer Section */}
          <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="bg-primary/10 border-primary/20 p-8 sm:p-12 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold font-headline">Get Full Access for 30 Days. Absolutely Free.</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Sign up today and get 30 days of unlimited access to everything ProfitScout has to offer.</p>
                    <div className="mt-8 max-w-sm mx-auto space-y-3 text-left">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary shrink-0"/>
                            <span className="font-medium">Daily AI-Powered Options Setups</span>
                        </div>
                         <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary shrink-0"/>
                            <span className="font-medium">Full AI Analyst Briefings</span>
                        </div>
                         <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary shrink-0"/>
                            <span className="font-medium">Interactive Stock & Options Dashboard</span>
                        </div>
                         <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary shrink-0"/>
                            <span className="font-medium">And more!</span>
                        </div>
                    </div>
                    <div className="mt-8">
                        <Suspense>
                            <HomePageClientContent showButton={true} buttonText="Get Started for Free" />
                        </Suspense>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">After your trial, you can upgrade to Pro for just $19/month to continue receiving daily setups and full access.</p>
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
