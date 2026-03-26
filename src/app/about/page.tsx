import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Shield, Scan, Brain, Sparkles, Send, Bot, User } from 'lucide-react';
import Faq, { faqs } from '@/components/landing/faq';
import ContactForm from './contact-form';

export const metadata: Metadata = {
  title: 'About GammaRips — The Overnight Edge',
  description: 'While you sleep, institutions place their bets. By 8:30 AM, you know what they did. Meet the team behind The Overnight Edge — a founder-engineer and an AI that tracks every signal.',
  alternates: { canonical: 'https://gammarips.com/about' },
  openGraph: {
    title: 'About GammaRips — The Overnight Edge',
    description: 'Learn how The Overnight Edge scans institutional options flow across 5,230+ tickers every night.',
    url: 'https://gammarips.com/about',
  }
};

const steps = [
  {
    icon: <Scan className="h-8 w-8 text-primary" />,
    time: '4:00 AM EST',
    title: 'SCAN',
    description: 'Our scanner analyzes overnight options flow across the entire market — volume, open interest, unusual activity, dollar flow.',
  },
  {
    icon: <Brain className="h-8 w-8 text-primary" />,
    time: '4:25 AM EST',
    title: 'SCORE',
    description: 'Each signal is scored 1-10 based on institutional conviction: positioning size, strike breadth, vol/OI ratio, directional flow imbalance.',
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    time: '4:30 AM EST',
    title: 'ENRICH',
    description: 'Top signals (score 6+) get AI-powered analysis: news context, technical levels, trade thesis, recommended contracts.',
  },
  {
    icon: <Send className="h-8 w-8 text-primary" />,
    time: 'Before Market Open',
    title: 'DELIVER',
    description: 'Signals land on gammarips.com and via alerts — before the opening bell.',
  },
];

const differentiators = [
  "You're not competing for the same 50 tickers as everyone on fintwit — you're seeing flow across the entire market",
  "Every call we make is public and tracked. Check our scorecard — we can't hide from bad picks",
  "You get a trade plan, not a spreadsheet. The AI tells you why institutions are positioned and what contract to consider",
  "GammaMolt runs the pipeline 24/7 — scanning, scoring, enriching — so you get fresh signals every morning without fail",
  <>Built by Evan Parra, ML engineer and data architect who also consults at <Link href="https://evanparra.ai" target="_blank" className="underline hover:text-primary">evanparra.ai</Link></>,
  "Start free. See the signals. Decide if the full analysis is worth $49/mo after you've watched it work",
];

export default function AboutPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
    })),
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GammaRips",
    "alternateName": "The Overnight Edge",
    "url": "https://gammarips.com",
    "email": "support@gammarips.com",
    "description": "Know what smart money did last night — before the market opens.",
    "founder": { "@type": "Person", "name": "Evan Parra", "jobTitle": "Founder & CEO" },
    "sameAs": ["https://twitter.com/GammaRips"],
  };

  return (
    <>
      <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Page Header */}
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">About</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
            The Overnight Edge
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            While you sleep, institutions place their bets. By 8:30 AM, you know exactly what they did — and how to trade it.
          </p>
        </header>

        <Separator className="my-12 sm:my-16" />

        {/* How It Works */}
        <section id="how-it-works" className="scroll-mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-headline">How It Works</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {steps.map((step) => (
              <Card key={step.title} className="bg-card/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-headline">{step.title}</h3>
                      <p className="text-xs text-muted-foreground">{step.time}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        {/* Meet the Team */}
        <section id="team">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Meet the Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-headline flex items-center">
                      Evan Parra
                    </h3>
                    <p className="text-sm text-muted-foreground">Founder &amp; CEO</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  ML engineer, data architect, and AI strategist. Built the scanner pipeline, enrichment engine, and data infrastructure that powers The Overnight Edge. Background in machine learning, data engineering, and quantitative systems.
                </p>
                <p className="text-sm text-muted-foreground">
                  Also runs <Link href="https://evanparra.ai" target="_blank" className="underline hover:text-primary">evanparra.ai</Link> — providing AI strategy, advisory, and data integration consulting for businesses navigating the AI transition.
                </p>
                <blockquote className="mt-4 border-l-2 border-primary pl-4 italic text-sm text-muted-foreground">
                  &ldquo;Let the AI cook.&rdquo; — Evan Parra
                </blockquote>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-headline">GammaMolt</h3>
                    <p className="text-sm text-muted-foreground">Chief Intelligence Officer</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  The autonomous AI operator behind GammaRips. GammaMolt architects and runs the daily signal generation, market analysis, enrichment pipeline, X engagement, and content engine. Built on Claude (Anthropic) via OpenClaw, GammaMolt isn&apos;t a chatbot — it&apos;s an autonomous agent with skin in the game. Every signal call is timestamped and tracked. No hiding from the results.
                </p>
                <blockquote className="mt-4 border-l-2 border-primary pl-4 italic text-sm text-muted-foreground">
                  &ldquo;I don&apos;t talk about trading. I trade. Results over rhetoric.&rdquo; — GammaMolt
                </blockquote>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        {/* What Makes Us Different */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Why Traders Switch to Us</h2>
          </div>
          <ul className="space-y-3 max-w-2xl mx-auto">
            {differentiators.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-12 sm:my-16" />

        {/* Pricing Summary */}
        <section>
          <Card className="text-center bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Ready to See What Smart Money Did Last Night?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-background">
                  <p className="font-bold text-lg">Free</p>
                  <p className="text-muted-foreground">Daily signal previews, top movers, market themes, public reports</p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-primary/30">
                  <p className="font-bold text-lg">$49/mo</p>
                  <p className="text-primary font-semibold text-xs mb-1">THE OVERNIGHT EDGE</p>
                  <p className="text-muted-foreground">Full AI thesis, recommended contracts, key levels, alerts</p>
                </div>
                <div className="p-4 rounded-lg bg-background">
                  <p className="font-bold text-lg">$149/mo</p>
                  <p className="text-primary font-semibold text-xs mb-1">THE WAR ROOM</p>
                  <p className="text-muted-foreground">Everything in Edge + real-time alerts, direct analyst access</p>
                </div>
              </div>
              <Button asChild size="lg">
                <Link href="/pricing">
                  View Full Pricing <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12 sm:my-16" />

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-headline">Frequently Asked Questions</h2>
          </div>
          <Faq />
        </section>

        <Separator className="my-12 sm:my-16" />

        {/* Trust */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-headline text-3xl text-foreground">Trust &amp; Responsibility</h2>
            <p className="mt-3 text-muted-foreground">
              Financial content falls under &ldquo;Your Money or Your Life&rdquo; (YMYL). Accuracy and reliability are paramount. GammaRips is committed to presenting well-sourced, balanced information with clear, transparent explanations.
            </p>
          </div>
          <aside className="bg-muted/50 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Important Disclaimer</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              GammaRips provides educational and informational content only. It is not financial advice. All trading and investment decisions involve risk. Always conduct your own research and consider consulting a licensed financial advisor before making investment decisions.
            </p>
          </aside>
        </section>

        <Separator className="my-12 sm:my-16" />

        {/* Contact */}
        <section id="contact" className="scroll-mt-20">
          <ContactForm />
        </section>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
    </>
  );
}
