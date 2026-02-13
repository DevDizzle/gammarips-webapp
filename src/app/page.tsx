import Link from "next/link";
import { UserNav } from "@/components/auth/user-nav";
import { Hero } from "@/components/landing/hero";
import Faq from "@/components/landing/faq";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Scan, Brain, Sparkles, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "GammaRips | The Overnight Edge — Institutional Options Flow Intelligence",
  description: "Every night, we scan institutional options flow across 5,230+ tickers. See what smart money did while you slept — before the market opens.",
  alternates: {
    canonical: '/',
  },
};

const steps = [
  { icon: <Scan className="h-6 w-6 text-primary" />, title: 'Scan', desc: '5,230+ tickers scanned at 4 AM EST' },
  { icon: <Brain className="h-6 w-6 text-primary" />, title: 'Score', desc: 'Signals scored 1-10 on institutional conviction' },
  { icon: <Sparkles className="h-6 w-6 text-primary" />, title: 'Enrich', desc: 'AI-powered thesis, contracts, key levels' },
  { icon: <Send className="h-6 w-6 text-primary" />, title: 'Deliver', desc: 'Ready before the opening bell' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline">
            <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/how-it-works" className="text-muted-foreground hover:text-primary">How It Works</Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-primary">Pricing</Link>
            <Link href="/scorecard" className="text-muted-foreground hover:text-primary">Scorecard</Link>
            <Link href="/about" className="text-muted-foreground hover:text-primary">About</Link>
          </nav>
          <div className="flex items-center gap-4">
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-12 max-w-5xl">
        <Hero />

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

        {/* Value Props */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl font-bold font-headline">What Smart Money Did Last Night</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our scanner analyzes overnight institutional options flow — volume, open interest, unusual activity, dollar flow — across the entire market. Every signal is timestamped and publicly tracked. No cherry-picking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/pricing">
                Get The Overnight Edge <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/how-it-works">Learn How It Works</Link>
            </Button>
          </div>
        </section>

        {/* Pricing Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/50 text-center">
            <CardContent className="p-6">
              <p className="text-2xl font-bold font-headline">Free</p>
              <p className="text-sm text-muted-foreground mt-2">Daily signal previews, top movers, market themes</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 text-center border-primary/30">
            <CardContent className="p-6">
              <p className="text-sm text-primary font-semibold">THE OVERNIGHT EDGE</p>
              <p className="text-2xl font-bold font-headline">$49/mo</p>
              <p className="text-sm text-muted-foreground mt-2">Full AI thesis, recommended contracts, key levels</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 text-center">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground font-semibold">THE WAR ROOM</p>
              <p className="text-2xl font-bold font-headline">$149/mo</p>
              <p className="text-sm text-muted-foreground mt-2">Real-time alerts, direct analyst access, priority signals</p>
            </CardContent>
          </Card>
        </section>

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
