import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Bot, User, CheckCircle2 } from 'lucide-react';
import ContactForm from './contact-form';
import { TOOL_COUNT, TRIAL_DAYS, OG_IMAGE, MCP_PRO_ENDPOINT, HARNESS_REPO } from '@/lib/constants';
import {
  RECEIPTS_DISCLAIMER,
  int,
  signedPct,
  usd,
} from '@/lib/receipts';
import { getReceipts } from '@/lib/receipts-server';

export const metadata: Metadata = {
  title: 'About GammaRips: the engine, the builder, and the live record',
  description:
    "Who builds GammaRips and why: a nightly liquidity rank of about 3,500 optionable US stocks, cut to a pool of liquid calls, served to your AI over MCP and traded with real money by our own Claude Code agent. Educational only. Not investment advice.",
  alternates: { canonical: 'https://gammarips.com/about' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'About GammaRips: the engine, the builder, and the live record',
    description: "The engine, the builder, and the live record behind GammaRips. Educational only. Not investment advice.",
    url: 'https://gammarips.com/about',
  },
};


const engineSteps = [
  'After the close, the engine ranks about 3,500 optionable US stocks by liquidity.',
  'It keeps the 100 most liquid names, then the bullish ones.',
  'It selects one out-of-the-money call per name, on contract liquidity.',
  'Each trading morning it publishes the pool, roughly 40 to 50 contracts, with thesis, technicals, catalyst, and the outcome history behind the exit lab.',
];

const whyList = [
  'Liquidity first. The pool is selected on contract liquidity, so your AI starts from contracts you can enter and exit near the quote.',
  'Your AI builds the plan. GammaRips serves data and tools, and your AI builds a plan for your account and your risk. Plans built from the data spread out instead of crowding into one shared contract.',
  'The exit comes from history. The exit lab shows how often past pool contracts hit each profit level within 3 trading days, so the target and the stop are set on purpose.',
  'Leakage-checked and documented. Every column carries its as-of boundary, and every filter and rule ships as a playbook your AI can read.',
  'Receipts in public. The live record counts every trade in the window, wins and losses. The Lab publishes each experiment with its method, sample size, and verdict.',
];

interface AboutPageProps {
  searchParams: Promise<{ welcome?: string; session_id?: string }>;
}

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const { LIVE_RECORD, CONTRACT_QUALITY } = await getReceipts();
  const recordStats = [
    { value: `${LIVE_RECORD.wins} of ${LIVE_RECORD.trades}`, label: 'trades closed at a profit' },
    { value: usd(LIVE_RECORD.netUsd), label: 'net realized' },
    { value: `${LIVE_RECORD.atTarget} of ${LIVE_RECORD.trades}`, label: "closed at the agent's pre-set target" },
    { value: signedPct(LIVE_RECORD.medianPct, 1), label: 'median trade, on premium' },
  ];
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
    "description": "The options-flow data layer for AI agents: a nightly liquidity rank of about 3,500 optionable US stocks, cut to a small bullish pool of liquid calls, served over MCP, and traded with real money by the builder's own Claude Code agent. Educational only. Not investment advice.",
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
              <CardTitle className="font-headline text-2xl sm:text-3xl">You&apos;re in. Let&apos;s get your AI connected.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-foreground/90">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Step 1: Add GammaRips to your AI.</strong> In Claude, ChatGPT, Cursor, or Codex, add <code className="text-primary break-all">{MCP_PRO_ENDPOINT}</code> and sign in with this account. Or create an API key on your <Link href="/account?welcome=1" className="text-primary hover:underline">account page</Link> (it is shown once, so copy it right then). Exact steps per client are on the <Link href="/developers#connect" className="text-primary hover:underline">developer page</Link>. Any trouble, email <a href="mailto:evan@gammarips.com" className="text-primary hover:underline">evan@gammarips.com</a> and we&apos;ll sort it immediately.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Step 2: Ask for a trade plan.</strong> Say &ldquo;build me a trade plan from the GammaRips pool.&rdquo; Your AI reads the pool, checks liquidity and earnings, sets the target and the stop from the exit lab, and gives you the plan. Or run the <code className="text-primary">morning_brief</code> prompt for a market overview.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span><strong>Step 3: You decide.</strong> The plan is your AI&apos;s analysis with you. You choose what to trade, in your own account.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Your trial is active for {TRIAL_DAYS} days. Cancel anytime from your account page. No charge if you cancel before day {TRIAL_DAYS}.</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild variant="outline">
                  <Link href="/developers#connect">Connect steps per client</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/account">Manage subscription</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
                Educational only. Not investment advice. What your AI concludes is its analysis with you, and you trade your own account.
              </p>
            </CardContent>
          </Card>
        )}

        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">About</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
            Built by an ML engineer.
            <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Traded by Claude Code, with real money.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            GammaRips ranks the US options market by liquidity every night and gives your AI a pool of roughly 40 to 50 liquid calls, plus the history to plan the exit. We use it ourselves. Claude Code reads the same pool through the same {TOOL_COUNT} MCP tools and trades it in a real-money agent account. Every trade is on the record, and traces of its sessions are public.
          </p>
        </header>

        <Separator className="my-12 sm:my-16" />

        <section id="record" className="scroll-mt-24">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">The live record</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              Claude Code trades the GammaRips pool with real money in an agent account. It sets a target and a stop before every entry. Every trade in the window counts, wins and losses.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recordStats.map((s) => (
              <Card key={s.label} className="bg-card/50">
                <CardContent className="p-5 text-center space-y-1">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</div>
                  <p className="text-xs text-muted-foreground leading-snug">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            N={LIVE_RECORD.trades} real-money trades, entries {LIVE_RECORD.windowLabel}. Realized broker fills.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/scorecard">See every trade &rarr;</Link>
            </Button>
            <Button asChild variant="outline">
              <a href={`${HARNESS_REPO}/tree/main/traces`} target="_blank" rel="noopener noreferrer">
                Read the session traces on GitHub
              </a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-center text-muted-foreground">{RECEIPTS_DISCLAIMER}</p>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section id="team" className="scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Who builds it</h2>
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
                    <p className="text-sm text-muted-foreground">Founder &amp; builder</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  ML engineer and AI architect who ships production AI systems on Google Cloud. He built GammaRips end to end: the nightly scan, the liquidity funnel, the enrichment layer, the outcome history behind the exit lab, and the MCP server your AI connects to.
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
                    <h3 className="text-lg font-bold font-headline">Claude Code</h3>
                    <p className="text-sm text-muted-foreground">The live trader</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Runs unattended on a VM, one bounded session per phase: preflight, entry, monitoring, and review. It reads the GammaRips pool through the same {TOOL_COUNT} MCP tools your AI gets, builds its own plan, sets a target and a stop before every entry, and trades a real-money agent account. Redacted traces of its sessions, with its reasoning quoted verbatim, are public in the <a href={HARNESS_REPO} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">open-source harness repo</a>.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">How the engine works</h2>
          </div>
          <ol className="space-y-3 max-w-2xl mx-auto">
            {engineSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-primary/10 text-xs font-bold text-primary flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-2xl mx-auto text-sm text-muted-foreground leading-relaxed">
            The result: median open interest of the pool contract is {int(CONTRACT_QUALITY.medianOi.after)}, against {int(CONTRACT_QUALITY.medianOi.before)} before the liquidity rule (N={int(CONTRACT_QUALITY.nAfter)} {CONTRACT_QUALITY.afterLabel}, vs N={int(CONTRACT_QUALITY.nBefore)} over {CONTRACT_QUALITY.beforeLabel}). Read the full method on the <Link href="/methodology" className="text-primary hover:underline">methodology page</Link>.
          </p>
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
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/pricing">Start your {TRIAL_DAYS}-day free trial &rarr;</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signals">Browse the pool free</Link>
            </Button>
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-headline text-3xl text-foreground">Trust &amp; responsibility</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              GammaRips is a data vendor. It publishes options data, historical pool outcomes, and our own agent&apos;s real-money record, for education. Your AI builds the plan with you, and you decide and trade your own account. GammaRips never places trades for you and never manages your money.
            </p>
          </div>
          <aside className="bg-muted/50 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Disclaimer</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {RECEIPTS_DISCLAIMER} You trade your own account. GammaRips does not manage your money. Past performance is not a guarantee of future results.
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
