import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'About The Overnight Edge | GammaRips',
  description: 'Learn how The Overnight Edge scans institutional options flow across 5,230+ tickers every night. Meet the team — a founder-engineer and an AI CEO tracking every signal.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "GammaRips",
            "alternateName": "The Overnight Edge",
            "url": "https://gammarips.com",
            "email": "support@gammarips.com",
            "description": "Institutional options flow intelligence platform",
            "founder": {
              "@type": "Person",
              "name": "Evan Parra",
              "jobTitle": "Founder & Chairman"
            },
            "sameAs": [
              "https://twitter.com/GammaRips"
            ]
          })
        }}
      />

      <section className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-6">
          ABOUT THE OVERNIGHT EDGE
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          The Overnight Edge is an institutional options flow intelligence platform. 
          Every night, we scan options activity across 5,230+ tickers to surface 
          what smart money did while you slept.
        </p>
      </section>

      <section className="mb-20">
        <h2 className="text-2xl font-bold font-headline mb-8 text-center uppercase tracking-wider">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                SCAN (4:00 AM EST)
              </CardTitle>
            </CardHeader>
            <CardContent>
              Our scanner analyzes overnight options flow across the entire market — 
              volume, open interest, unusual activity, and dollar flow.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                SCORE (4:25 AM EST)
              </CardTitle>
            </CardHeader>
            <CardContent>
              Each signal is scored 1-10 based on institutional conviction: 
              positioning size, strike breadth, vol/OI ratio, and directional flow imbalance.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                ENRICH (4:30 AM EST)
              </CardTitle>
            </CardHeader>
            <CardContent>
              Top signals (score 6+) get AI-powered analysis: news context, 
              technical levels, trade thesis, and recommended contracts.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                DELIVER (Before Market Open)
              </CardTitle>
            </CardHeader>
            <CardContent>
              Signals land on gammarips.com and via alerts — before the opening bell.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-2xl font-bold font-headline mb-12 text-center uppercase tracking-wider">Meet The Team</h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div className="text-center md:text-left">
            <div className="w-32 h-32 bg-muted rounded-full mx-auto md:mx-0 mb-6 flex items-center justify-center overflow-hidden">
               {/* Placeholder for Evan's photo if available, using a generic avatar for now */}
               <span className="text-4xl">EP</span>
            </div>
            <h3 className="text-xl font-bold">Evan Parra</h3>
            <p className="text-sm text-primary font-medium mb-4">Founder & Chairman</p>
            <p className="text-muted-foreground leading-relaxed">
              ML engineer and data architect. Built the scanner pipeline, enrichment engine, 
              and data infrastructure that powers The Overnight Edge. Background in machine 
              learning, data engineering, and quantitative analysis.
            </p>
          </div>

          <div className="text-center md:text-left">
            <div className="w-32 h-32 bg-muted rounded-full mx-auto md:mx-0 mb-6 flex items-center justify-center overflow-hidden border-2 border-primary">
               {/* Placeholder for GammaMolt avatar */}
               <span className="text-4xl">GM</span>
            </div>
            <h3 className="text-xl font-bold">GammaMolt</h3>
            <p className="text-sm text-primary font-medium mb-4">CEO & Chief Analyst</p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              AI-powered trading analyst and the operational brain behind GammaRips. 
              GammaMolt runs the daily signal generation, market analysis, X engagement, 
              and content engine. Built on Claude (Anthropic) via OpenClaw, GammaMolt is 
              not a chatbot — it's an autonomous operator with skin in the game. Every 
              signal call is timestamped and tracked. No hiding from the results.
            </p>
            <blockquote className="border-l-4 border-primary pl-4 italic text-foreground">
              "I don't talk about trading. I trade. Results over rhetoric." — GammaMolt
            </blockquote>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-2xl font-bold font-headline mb-8 text-center uppercase tracking-wider">What Makes Us Different</h2>
        <ul className="grid gap-4 max-w-2xl mx-auto">
          {[
            "We scan 5,230+ tickers overnight (not just the popular 50)",
            "Every signal is timestamped and publicly tracked — no cherry-picking",
            "AI analysis on every enriched signal — not just raw data dumps",
            "An AI CEO that operates 24/7 with full accountability",
            "Free daily previews — we prove value before asking for payment"
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-primary mt-1">●</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-20 text-center" id="pricing">
        <h2 className="text-2xl font-bold font-headline mb-8 uppercase tracking-wider">Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6 text-left">
            <Card className="border-muted">
                <CardHeader>
                    <CardTitle>FREE</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Daily signal previews, top movers, market themes, public reports</p>
                </CardContent>
            </Card>
             <Card className="border-primary/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1">POPULAR</div>
                <CardHeader>
                    <CardTitle>THE OVERNIGHT EDGE</CardTitle>
                    <p className="text-xl font-bold">$49/mo</p>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Full AI thesis, recommended contracts, key levels, support/resistance, alerts</p>
                </CardContent>
            </Card>
             <Card className="border-muted">
                <CardHeader>
                    <CardTitle>THE WAR ROOM</CardTitle>
                     <p className="text-xl font-bold">$149/mo</p>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Everything in Edge + real-time flow alerts, direct analyst access, priority signals</p>
                </CardContent>
            </Card>
        </div>
        <div className="mt-8">
            <Button size="lg" asChild>
                <Link href="/pricing">View Full Pricing & Subscribe &rarr;</Link>
            </Button>
        </div>
      </section>

      <section className="mb-20" id="faq">
         <h2 className="text-2xl font-bold font-headline mb-4 text-center uppercase tracking-wider">FAQ</h2>
         <p className="text-center text-muted-foreground mb-8">
            See our <Link href="/how-it-works" className="underline hover:text-primary">How It Works</Link> page for more details.
         </p>
         <div className="max-w-2xl mx-auto text-center">
            <Button variant="outline" asChild>
                <Link href="/#faq">Read Common Questions</Link>
            </Button>
         </div>
      </section>

      <section className="text-center border-t pt-12" id="contact">
        <h2 className="text-2xl font-bold font-headline mb-6 uppercase tracking-wider">Contact</h2>
        <div className="flex flex-col gap-2 text-lg">
            <a href="mailto:support@gammarips.com" className="hover:text-primary transition-colors">support@gammarips.com</a>
            <a href="https://twitter.com/GammaRips" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">@GammaRips on X</a>
        </div>
      </section>
    </div>
  );
}
