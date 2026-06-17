import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Shield, Bot, User, CheckCircle2, Clock, MessageSquare, AlarmClock } from 'lucide-react';
import Faq, { faqs } from '@/components/landing/faq';
import ContactForm from './contact-form';

export const metadata: Metadata = {
  title: 'About GammaRips — One options trade a day, pushed at 7:30 AM ET',
  description: "The engine, the methodology, and the person behind GammaRips. One pick a day, scored while you sleep, picked by a bracket tournament, pushed to your phone at 07:30 ET. Paper-trading performance, educational only.",
  alternates: { canonical: 'https://gammarips.com/about' },
  openGraph: {
    title: 'About GammaRips — One options trade a day, pushed at 7:30 AM ET',
    description: "The engine, the methodology, and the person behind GammaRips. Paper-trading performance, educational only.",
    url: 'https://gammarips.com/about',
  },
};

const engineSteps = [
  {
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: 'Overnight scan',
    description: 'At 23:00 ET the scanner ingests Polygon end-of-day options data across 5,230+ tickers — volume, open interest, unusual activity, dollar flow.',
  },
  {
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
    title: 'Enrichment',
    description: 'After the scan, candidates clear a thin enrichment bar: overnight_score ≥ 4 with directional UOA > $500K, then a BULLISH-only gate and a delta edge-rank to the ~50 strongest bullish setups.',
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    title: 'One pick, or none',
    description: 'At 07:30 ET, two safety rails run first (no earnings during the same-day hold, VIX ≤ VIX3M), then a randomized bracket tournament over the ~50 bullish setups picks one ticker by 3-bracket consensus. Some days the pool is empty or it fails closed and the push says no trade.',
  },
  {
    icon: <AlarmClock className="h-6 w-6 text-primary" />,
    title: 'Exit reminder',
    description: 'The trade is held the same day with a −30% option stop and +40% target, exiting flat at 15:45 ET. Pro subscribers get the exit reminder pushed to WhatsApp the same minute the engine writes it.',
  },
];

const whyList = [
  'One pick per day, or none. No firehose, no FOMO, no "look how many signals we have."',
  'Every pick carries its exit rules and its paper-trading outcome, updated automatically in the public ledger.',
  'Free users and Pro subscribers see the same pick at the exact same second. No paid-first tier.',
  'Selection runs a leakage-checked LLM tournament; execution is fixed code. Every filter, threshold, and bracket rule is documented and logged.',
  'Paper-trading performance only. Nothing marketed until the V7 ledger has ≥30 closed trades. This page is about what was built, not what it returned.',
];

interface AboutPageProps {
  searchParams: Promise<{ welcome?: string; session_id?: string }>;
}

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const { welcome, session_id } = await searchParams;
  const isWelcome = welcome === '1';
  const whatsappInvite = isWelcome && session_id ? process.env.WHATSAPP_GROUP_INVITE_URL : undefined;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
    })),
  };

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About GammaRips",
    "description": "One options pick a day, scored while you sleep, picked by a bracket tournament, pushed to your phone at 07:30 ET.",
    "url": "https://gammarips.com/about",
    "publisher": { "@type": "Organization", "name": "GammaRips", "logo": { "@type": "ImageObject", "url": "https://gammarips.com/og-image.png?v=3" } }
  };

  return (
    <>
      <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {isWelcome && (
          <Card className="bg-primary/5 border-primary/40 mb-12">
            <CardHeader>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Welcome to GammaRips Pro</p>
              <CardTitle className="font-headline text-2xl sm:text-3xl">You&apos;re in. Here&apos;s your 07:30 ET routine.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {whatsappInvite && (
                <div className="rounded-lg border border-primary/40 bg-background p-4">
                  <p className="text-sm font-semibold text-foreground mb-2">Step 1 — Join the private WhatsApp group</p>
                  <p className="text-xs text-muted-foreground mb-3">Your invite is ready. Click below on your phone or open the link on any device with WhatsApp installed.</p>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <a href={whatsappInvite} target="_blank" rel="noopener noreferrer">Join GammaRips Pro group</a>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">A welcome email with this same link is also in your inbox (check Spam / Promotions / All Mail if you don&apos;t see it).</p>
                </div>
              )}
              <ul className="space-y-3 text-sm text-foreground/90">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Tomorrow at 07:30 ET, today&apos;s pick lands in the group. Or the pick says &ldquo;no trade today&rdquo; and you do nothing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Exit reminder pushes at 15:45 ET the same day. −30% option stop, +40% target, whichever comes first.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Tag @gamma in the group to ask about today&apos;s pick, the open position, or any row in the 30-day ledger.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Your trial is active for 7 days. Cancel anytime from your account page — no charge if you cancel before day-7.</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild variant="outline">
                  <Link href="/">See today&apos;s pick</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/account">Manage subscription</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
                Paper-trading performance, educational content only. Not investment advice. You trade your own account; GammaRips does not manage your money.
              </p>
            </CardContent>
          </Card>
        )}

        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">About</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
            One options trade a day.
            <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Scored while you sleep. Pushed at 07:30 ET.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            GammaRips is a systematic options scanner wrapped around a single daily push. The engine runs overnight, one pick (or none) lands in your phone at the open, and every trade — winners and losers — is written to a public paper-trading ledger. That&apos;s the whole product.
          </p>
        </header>

        <Separator className="my-12 sm:my-16" />

        <section id="how-it-works" className="scroll-mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-headline">How the engine works</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              V7 &ldquo;GIGO&rdquo; (Get In, Get Out) &mdash; the only active strategy &mdash; is a scanned, enriched, tournament-selected, single-pick-per-day pipeline: one option, traded and closed the same day. No discretion, no override, no paid-first tier.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {engineSteps.map((step) => (
              <Card key={step.title} className="bg-card/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-bold font-headline">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section id="team">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Who&apos;s behind this</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-headline">Evan Parra</h3>
                    <p className="text-sm text-muted-foreground">Founder &amp; operator</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  ML engineer and data architect. Built the scanner, the enrichment layer, the V7 tournament, and the execution policy. Solo operator — no team of analysts, no &ldquo;room of traders.&rdquo; One person with a pipeline.
                </p>
                <p className="text-sm text-muted-foreground">
                  Also runs <Link href="https://evanparra.ai" target="_blank" className="underline hover:text-primary">evanparra.ai</Link> &mdash; AI strategy and data integration consulting.
                </p>
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
                  The autonomous AI operator behind GammaRips&apos; daily pipeline &mdash; scanning overnight institutional options flow, scoring signals, enriching with contract recommendations, and delivering morning alerts. Built on Claude Opus via OpenClaw. Inside the WhatsApp group, GammaMolt is the @gamma chat agent &mdash; ask about today&apos;s pick, historical signals, open positions, or any data in the system. Powered by real-time BigQuery queries, not canned responses.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Why it&apos;s built this way</h2>
          </div>
          <ul className="space-y-3 max-w-2xl mx-auto">
            {whyList.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-primary mt-1 shrink-0">✓</span>
                <span className="text-muted-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section>
          <Card className="text-center bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Two ways to use GammaRips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-w-2xl mx-auto">
                <div className="p-4 rounded-lg bg-background">
                  <p className="font-bold text-lg">Free</p>
                  <p className="text-primary font-semibold text-xs mb-1">$0 · FOREVER</p>
                  <p className="text-muted-foreground">Today&apos;s pick at 07:30 ET on the home page, full signals list, daily report, public ledger.</p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-primary/30">
                  <p className="font-bold text-lg">Pro</p>
                  <p className="text-primary font-semibold text-xs mb-1">$39/MO · 7-DAY TRIAL</p>
                  <p className="text-muted-foreground">WhatsApp push at 07:30 ET, same-day exit reminder, AI chat agent in the private group.</p>
                </div>
              </div>
              <Button asChild size="lg">
                <Link href="/pricing">
                  See pricing <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section id="faq" className="scroll-mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-headline">Frequently asked questions</h2>
          </div>
          <Faq />
        </section>

        <Separator className="my-12 sm:my-16" />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-headline text-3xl text-foreground">Trust &amp; responsibility</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Financial content falls under &ldquo;Your Money or Your Life&rdquo; (YMYL). GammaRips presents paper-trading performance and educational content only. Every pick, page, and push carries the disclaimer.
            </p>
          </div>
          <aside className="bg-muted/50 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Disclaimer</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Paper-trading performance, educational content only. Not investment advice. You trade your own account; GammaRips does not manage your money. Past performance is not a guarantee of future results.
            </p>
          </aside>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section id="contact" className="scroll-mt-20">
          <ContactForm />
        </section>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
