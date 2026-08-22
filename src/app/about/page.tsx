import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Bot, User, CheckCircle2 } from 'lucide-react';
import ContactForm from './contact-form';
import { TOOL_COUNT, TRIAL_DAYS, OG_IMAGE } from '@/lib/constants';
export const metadata: Metadata = {
  title: 'About GammaRips: The options-flow data layer for AI agents',
  description:
    "The engine, the methodology, and the person behind GammaRips: a nightly scan of about 3,500 optionable US stocks curated to a pool. Paper-trading, educational.",
  alternates: { canonical: 'https://gammarips.com/about' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'About GammaRips: The options-flow data layer for AI agents',
    description: "The engine, the methodology, and the person behind GammaRips. Paper-trading data, educational only.",
    url: 'https://gammarips.com/about',
  },
};


const whyList = [
  'A small curated pool, not a firehose. No FOMO, no "look how many signals we have."',
  'No pick endpoint, on purpose. Shared picks crowd thin contracts; data lets every agent reach its own conclusion.',
  'The honest baseline is published: buying the whole pool blindly under a fixed exit loses. The Lab shows the receipts, including the killed hypotheses.',
  'Everything is leakage-checked and mechanical. Every filter, threshold, and selection rule is documented, logged, and shipped as playbooks your agent can read.',
  'Paper-trading data only. No aggregate performance marketing until a cohort has ≥30 closed trades. This page is about what was built, not what it returned.',
];

interface AboutPageProps {
  searchParams: Promise<{ welcome?: string; session_id?: string }>;
}

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const { welcome, session_id } = await searchParams;
  const isWelcome = welcome === '1';

  // Provision entitlement synchronously from the checkout session, redundant
  // with the Stripe webhook on purpose: the paying user's first landing must
  // not depend on webhook registration or delivery. Idempotent; never throws.
  if (isWelcome && session_id) {
    const { provisionFromCheckoutSession } = await import('@/lib/stripe-sync');
    await provisionFromCheckoutSession(session_id);
  }

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About GammaRips",
    "description": "The options-flow data layer for AI agents: a nightly scan of about 3,500 optionable US stocks curated to a high-signal bullish pool, validated by a public paper-traded cohort, served over MCP.",
    "url": "https://gammarips.com/about",
    "publisher": { "@type": "Organization", "name": "GammaRips", "logo": { "@type": "ImageObject", "url": "https://gammarips.com/og-image.png?v=3" } }
  };

  return (
    <>
      <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {isWelcome && (
          <Card className="bg-primary/5 border-primary/40 mb-12">
            <CardHeader>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Welcome to Agent Access</p>
              <CardTitle className="font-headline text-2xl sm:text-3xl">You&apos;re in. Let&apos;s get your agent connected.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-foreground/90">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Step 1: Generate your API key.</strong> Head to your <Link href="/account?welcome=1" className="text-primary hover:underline">account page</Link> and click Generate API key. The key is shown once, so copy it right then. Any trouble, email <a href="mailto:evan@gammarips.com" className="text-primary hover:underline">evan@gammarips.com</a> and we&apos;ll sort it immediately.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Step 2: Add the server to your agent, with your key or a sign-in.</strong> Claude Code, Codex, Cursor, Gemini CLI, or any MCP client that can send a bearer key. A chat client that cannot send a key adds the /pro endpoint and signs in with OAuth instead. Exact steps per client are in the <Link href="/#connect" className="text-primary hover:underline">connect section</Link> on the homepage.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Step 3: Run your first brief.</strong> Ask your agent to run the <code className="text-primary">morning_brief</code> prompt, or just say &ldquo;pull the GammaRips pool and tell me what&apos;s interesting.&rdquo;</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Your trial is active for {TRIAL_DAYS} days. Cancel anytime from your account page. No charge if you cancel before day {TRIAL_DAYS}.</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild variant="outline">
                  <Link href="/developers">MCP setup docs</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/account">Manage subscription</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
                Data on a paper-trading basis, educational content only. Not investment advice. What your agent concludes is your analysis; you trade your own account.
              </p>
            </CardContent>
          </Card>
        )}

        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">About</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
            An options-flow engine
            <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              built for the agentic era.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            GammaRips is a systematic overnight scanner that curates unusual options activity into a small, high-signal pool, free for humans to browse and served to AI agents over MCP. A public paper-traded cohort validates the methodology every market day, winners and losers counted the same way. Data, receipts, and no pick to follow: that&apos;s the product.
          </p>
        </header>

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
                  ML engineer and data architect. Built the scanner, the enrichment layer, the V7 tournament, and the execution policy. Solo operator, no team of analysts, no &ldquo;room of traders.&rdquo; One person with a pipeline.
                </p>
                <p className="text-sm text-muted-foreground">
                  Also runs <Link href="https://evanparra.ai" target="_blank" className="underline hover:text-primary">evanparra.ai</Link> for AI strategy and data integration consulting.
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
                  The autonomous AI operator behind GammaRips&apos; daily pipeline: scanning overnight institutional options flow, scoring signals, enriching with contract recommendations, and publishing the pool. Built on Claude via OpenClaw, powered by real-time BigQuery queries. GammaMolt was the first agent ever wired to the GammaRips MCP, and the same {TOOL_COUNT} tools your agent gets are the ones it runs on.
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

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-headline text-3xl text-foreground">Trust &amp; responsibility</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Financial content falls under &ldquo;Your Money or Your Life&rdquo; (YMYL). GammaRips presents options-flow data, paper-trading performance, and educational content only. Every page and dataset carries the disclaimer.
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
    </>
  );
}
