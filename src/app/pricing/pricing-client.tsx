'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { event as trackEvent } from '@/lib/gtag';
import {
  TOOL_COUNT,
  PRICE_MONTHLY,
  PRICE_ANNUAL,
  PRICE_STANDARD,
  FOUNDING_CAP,
  TRIAL_DAYS,
} from '@/lib/constants';
import {
  LIVE_RECORD,
  POOL_HIT_RATES,
  CONTRACT_QUALITY,
  RECEIPTS_DISCLAIMER,
  int,
  pct,
  usd,
} from '@/lib/receipts';

// Next inlines a NEXT_PUBLIC_ var at build time only where the full
// process.env.NAME expression is written out, so keep this literal.
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

const agentFeatures = [
  'The full pool every night: roughly 40 to 50 liquid calls, each with its thesis, technicals, catalyst, and contract',
  'The exit lab: how often past pool contracts hit each profit level, how far they moved, and a score for any target and stop',
  'Fresh liquidity and earnings checks for every candidate',
  'Minute and daily price replay for any pool contract',
  `All ${TOOL_COUNT} MCP tools in Claude, ChatGPT, Cursor, Codex, or any MCP client`,
  'Sign in with OAuth, or use an API key',
  `${TRIAL_DAYS}-day free trial · cancel anytime`,
];

const freeFeatures = [
  'The nightly pool, browsable on the site',
  'Daily market report and per-ticker deep dives',
  'The track record: every live trade and the pool hit rates',
  'The Lab: published experiments with method and sample size',
  'Free MCP tools: pool preview, daily report, regime, calendar, playbooks',
  'Methodology, blog, FAQ, and all disclosures',
];

// The three approved headline numbers (src/lib/receipts.ts), each with its N
// and window. The section that shows them carries RECEIPTS_DISCLAIMER.
const proof = [
  {
    label: "Our agent's live record",
    value: `${LIVE_RECORD.wins} of ${LIVE_RECORD.trades}`,
    headline: `real-money trades closed at a profit, ${usd(LIVE_RECORD.netUsd)} net realized`,
    detail: `Claude Code trades the GammaRips pool in a real-money agent account. N=${LIVE_RECORD.trades}, every trade with entries ${LIVE_RECORD.windowLabel}, wins and losses. ${LIVE_RECORD.atTarget} of ${LIVE_RECORD.trades} closed at the agent's pre-set target.`,
  },
  {
    label: 'Pool hit rate',
    value: pct(POOL_HIT_RATES.hit50, 1),
    headline: `of pool contracts hit +50% within ${POOL_HIT_RATES.horizon}`,
    detail: `N=${int(POOL_HIT_RATES.n)} pool contracts, ${POOL_HIT_RATES.windowLabel}. ${pct(POOL_HIT_RATES.hit25, 1)} hit +25% and ${pct(POOL_HIT_RATES.hit100, 1)} hit +100%. The exit lab gives your AI this history to set the target and the stop.`,
  },
  {
    label: 'Contract quality',
    value: int(CONTRACT_QUALITY.medianOi.after),
    headline: `median open interest, vs ${int(CONTRACT_QUALITY.medianOi.before)} before the liquidity rule`,
    detail: `N=${int(CONTRACT_QUALITY.nAfter)} ${CONTRACT_QUALITY.afterLabel}, vs N=${int(CONTRACT_QUALITY.nBefore)} over ${CONTRACT_QUALITY.beforeLabel}. Median session volume ${int(CONTRACT_QUALITY.medianVolume.after)} vs ${int(CONTRACT_QUALITY.medianVolume.before)}.`,
  },
];

const unlocks = [
  {
    title: 'The full pool, every night',
    body: 'Roughly 40 to 50 calls, one per bullish name, each with its thesis, technicals, catalyst, and point-in-time features. Every contract is selected on liquidity, so your AI starts from contracts you can enter and exit near the quote.',
  },
  {
    title: 'The exit lab',
    body: `How often past pool contracts hit +25%, +50%, and +100% within ${POOL_HIT_RATES.horizon}, how far they moved for and against, and a score for any target and stop your AI proposes. The target and the stop come from history.`,
  },
  {
    title: 'Checks before every entry',
    body: 'Fresh open interest and session volume for any contract, and an earnings check before expiration. Your AI drops a name that fails before it reaches your plan.',
  },
  {
    title: 'A plan you decide on',
    body: 'Ask for a trade. Your AI returns 1 to 3 candidates with the entry, target, stop, maximum loss, and a size that fits your risk budget, or tells you why nothing passes today. You make the call.',
  },
];

const steps = [
  {
    title: `Start your ${TRIAL_DAYS}-day trial`,
    body: `Full Pro access from minute one. No charge if you cancel before day ${TRIAL_DAYS}.`,
  },
  {
    title: 'Connect your AI',
    body: 'Sign in from Claude, ChatGPT, Cursor, or Codex, or paste your API key. One step per client.',
  },
  {
    title: 'Ask for a trade plan',
    body: 'Your AI reads the pool, checks liquidity and earnings, sets the exit from history, and gives you the plan. You decide.',
  },
];

export function PricingClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleCheckout(interval: 'month' | 'year' = 'month') {
    const displayPrice = interval === 'year' ? PRICE_ANNUAL : PRICE_MONTHLY;
    trackEvent('begin_checkout', {
      currency: 'USD',
      value: Number(displayPrice.replace(/[^0-9.]/g, '')) || 0,
      plan: 'pro',
      authenticated: !!user,
    });
    if (!user) {
      window.location.href = '/auth/action?mode=signUp&redirect=/pricing';
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      // Captured by the ga-client-id-capture script in layout.tsx; without them
      // the webhook cannot attribute the purchase event to this browser/session.
      const gaClientId =
        typeof window !== 'undefined' ? localStorage.getItem('ga_client_id') : null;
      const gaSessionId =
        typeof window !== 'undefined' ? localStorage.getItem('ga_session_id') : null;
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: 'pro',
          interval,
          ...(gaClientId ? { gaClientId } : {}),
          ...(gaSessionId ? { gaSessionId } : {}),
        }),
      });
      if (!res.ok) throw new Error('Checkout failed');
      const { sessionId } = await res.json();
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) throw result.error;
    } catch (err) {
      console.error('Checkout error:', err);
      toast({
        title: 'Something went wrong',
        description: 'We couldn\'t start your checkout. Please try again or contact evan@gammarips.com.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  }

  return (
    <section className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <header className="text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Pricing
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
          Give your AI the full pool and the exit lab.
          <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            It builds the trade plan with you.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Pro opens every GammaRips tool in Claude, ChatGPT, Cursor, or Codex:
          better-quality option contracts every night, the history to set the
          target and the stop, and fresh liquidity and earnings checks before
          you enter. You decide on every trade. {PRICE_MONTHLY}/month founding
          price, {TRIAL_DAYS}-day free trial, cancel anytime.
        </p>
      </header>

      {/* Proof: the approved numbers, each with N and window, plus the marker */}
      <section aria-label="The receipts" className="mb-16 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {proof.map((p) => (
            <Card key={p.label} className="bg-card/50">
              <CardContent className="p-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {p.label}
                </p>
                <div className="text-3xl font-bold">{p.value}</div>
                <p className="text-sm text-foreground leading-snug">{p.headline}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground text-center">
          {RECEIPTS_DISCLAIMER}{' '}
          <Link href="/scorecard" className="text-primary hover:underline">
            See every trade &rarr;
          </Link>
        </p>
      </section>

      <h2 className="text-center text-xl sm:text-2xl font-bold font-headline mb-8">
        Humans browse free. Agents subscribe.
      </h2>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free card */}
        <Card className="bg-card/50">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-2xl font-bold font-headline">You</CardTitle>
            <div className="mt-2">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground ml-2">forever</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              The whole website and the free MCP tools. Browse the pool, read
              the reports, see the track record. No card, no account required.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3 mb-6">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-foreground leading-tight">{f}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/signals">Browse the pool free &rarr;</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Agent Access card */}
        <Card className="bg-card/50 border-primary/50 ring-1 ring-primary/20 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            The Product
          </div>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-2xl font-bold font-headline">Your Agent</CardTitle>
            <div className="mt-2">
              <span className="text-4xl font-bold">{PRICE_MONTHLY}</span>
              <span className="text-muted-foreground ml-2">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Everything your AI needs to build the trade plan with you: the
              full pool, the exit lab, and the checks. In Claude, ChatGPT,
              Cursor, Codex, or any MCP client. {TRIAL_DAYS}-day free trial.
            </p>
            <p className="text-sm text-foreground mt-3">
              Founding price: {PRICE_MONTHLY}/mo for the first {FOUNDING_CAP}{' '}
              subscribers, locked as long as you stay subscribed.{' '}
              {PRICE_STANDARD}/mo after that.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3 mb-6">
              {agentFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-foreground leading-tight">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="w-full"
              onClick={() => handleCheckout('month')}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting checkout…
                </>
              ) : (
                `Start Your ${TRIAL_DAYS}-Day Free Trial`
              )}
            </Button>
            {ANNUAL_PRICE_ID ? (
              <p className="text-xs text-center mt-3">
                <button
                  type="button"
                  onClick={() => handleCheckout('year')}
                  disabled={loading}
                  className="text-muted-foreground underline underline-offset-4 hover:text-foreground disabled:opacity-50"
                >
                  or {PRICE_ANNUAL}/yr
                </button>
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground text-center mt-3">
              No charge during the trial. After checkout, sign in from your AI
              client, or create an API key on your account page (the key is
              shown once, so copy it then). Cancel anytime from your account.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* What Pro unlocks */}
      <section className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold font-headline text-center mb-8">
          What {PRICE_MONTHLY} a month gives your AI
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {unlocks.map((u) => (
            <div key={u.title} className="space-y-2">
              <h3 className="font-semibold text-foreground">{u.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{u.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center">
          Liquid contracts are the ones you can enter and exit near the quote. A
          thin contract costs you on the way in and again on the way out. In a{' '}
          {CONTRACT_QUALITY.noFill.label}, no-fill at the 10:00 ET entry fell from{' '}
          {pct(CONTRACT_QUALITY.noFill.before, 1)} to{' '}
          {pct(CONTRACT_QUALITY.noFill.after, 1)} after the engine moved to the
          liquidity rule.
        </p>
      </section>

      {/* How it works */}
      <section className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold font-headline text-center mb-8">
          Three steps to your first plan
        </h2>
        <ol className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="space-y-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {i + 1}
              </span>
              <h3 className="font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-center text-sm">
          <Link href="/developers#connect" className="text-primary hover:underline">
            See the connect steps for your AI &rarr;
          </Link>
        </p>
      </section>

      {/* Pricing FAQ */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold font-headline text-center mb-8">
          Pricing FAQ
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              How does the {TRIAL_DAYS}-day trial work?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Card on file, no charge for {TRIAL_DAYS} days, full MCP access
              from minute one. If you cancel before day {TRIAL_DAYS} you pay
              nothing. After day {TRIAL_DAYS} your card is charged{' '}
              {PRICE_MONTHLY} and you&apos;re billed monthly until you cancel.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Why don&apos;t you just tell me what to buy?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your AI builds a plan for your account and your risk: the
              candidates, the entry, a target and a stop set from history, and
              the size. One shared list crowds everyone into the same
              contracts. A plan built from the data, for your account, does
              not. You decide on every trade.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              How do I know the numbers are real?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every number on this page carries its sample size and window. The
              live record counts every real-money trade in the window, wins and
              losses, and the{' '}
              <Link href="/scorecard" className="text-primary hover:underline">
                track record
              </Link>{' '}
              lists each one. The{' '}
              <Link href="/lab" className="text-primary hover:underline">
                Lab
              </Link>{' '}
              publishes each experiment with its hypothesis, method, sample
              size, and verdict. The free MCP tools let your AI read the pool
              and the methodology before you pay anything.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              What happens if I cancel?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Pro tools stop at the end of your billing cycle. The website
              and the free MCP tools stay free forever. No retention tricks, no
              downgraded experience.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              What&apos;s the refund policy?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The {TRIAL_DAYS}-day trial gives you a full month to evaluate at
              no charge. After that, billing is monthly, with no pro-rated
              refunds mid-cycle. If something breaks, email evan@gammarips.com
              and we&apos;ll make it right.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Will the price go up?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {PRICE_MONTHLY}/mo is the founding price, for the first{' '}
              {FOUNDING_CAP} subscribers. It stays at that rate as long as you
              stay subscribed. After the first {FOUNDING_CAP}, the price is{' '}
              {PRICE_STANDARD}/mo. If you cancel and subscribe again later, you
              pay the rate that applies then.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              I subscribed to an older GammaRips plan. What now?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              That plan is retired. Agent Access replaces it: your AI builds its
              own trade plan from the full pool and the exit lab. Email
              evan@gammarips.com with any billing question and we&apos;ll make
              it right.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-16 text-xs text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
        {RECEIPTS_DISCLAIMER} You trade your own account. GammaRips does not
        manage your money or place trades for you. Past performance is not a
        guarantee of future results.
      </p>
    </section>
  );
}
