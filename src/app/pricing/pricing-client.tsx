'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
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
import { type Receipts } from '@/lib/receipts';

// Next inlines a NEXT_PUBLIC_ var at build time only where the full
// process.env.NAME expression is written out, so keep this literal.
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

const agentFeatures = [
  'Full daily curated pool (40–50 Combo A contracts) with thesis, technicals, rv_iv_ratio, and grounded catalysts',
  'Live 10-minute intraday liquidity snapshots (09:02–16:52 ET) and earnings date checks',
  'Historical 3-day MFE/MAE outcome surfaces & minute/daily contract price replay',
  `All ${TOOL_COUNT} MCP tools in Claude, ChatGPT, Cursor, Codex, or any MCP client`,
  'Sign in with OAuth 2.1 (/pro), or use a gr_live_ bearer API key',
  `${TRIAL_DAYS}-day free trial · cancel anytime`,
];

const freeFeatures = [
  'Daily 3-contract pool preview on web (/signals) and MCP (get_pool(view="preview"))',
  'Daily macro & options-flow intelligence reports and per-ticker archive',
  'Free MCP tools: 3-contract preview, daily report, VIX/VIX3M regime context, market calendar, playbooks',
  'Methodology, Catalyst Lab research, blog, FAQ, and disclosures',
];

const catalystResearchProof = [
  {
    label: 'Intraday Execution Fills',
    value: '50.1%',
    headline: '5-minute fast fill rate at the open, vs 30.3% baseline',
    detail:
      'Enforcing resting Open Interest >= 500 lifts 5-minute fast execution fills from 30.3% to 50.1% (and 56.5% at OI >= 1,000), audited across BigQuery enriched_option_outcomes.',
  },
  {
    label: 'Convexity & Volatility Filter',
    value: '35.4%',
    headline: '3-day MFE >= +40%, vs 27.6% baseline',
    detail:
      'Screening for the gamma/theta sweet spot (Delta 0.22–0.48, DTE 10–45) and Realized-vs-Implied Volatility (rv_iv_ratio >= 0.85) across N = 5,575 enriched contracts (66 scan dates).',
  },
  {
    label: 'Combo A Contract Floors',
    value: '$1.00+ / 500+ OI',
    headline: 'Hard minimum mid price and resting open interest gates',
    detail:
      'Eliminates sub-dollar $0.05 tick-size friction and thin order books across the top 100 most liquid optionable US stocks before your AI agent ever evaluates a candidate.',
  },
];

const unlocks = [
  {
    title: 'Full daily curated pool (40–50 Combo A contracts)',
    body: 'Every trading night, the top 100 most liquid US option chains are filtered to bullish calls passing Mid >= $1.00, OI >= 500, Delta 0.22–0.48, and DTE 10–45—delivered with point-in-time rv_iv_ratio, technicals, flow context, and grounded news catalysts.',
  },
  {
    title: 'Live 10-minute intraday liquidity snapshots',
    body: 'Overnight scan numbers freeze at the close. From 09:02 to 16:52 ET, Pro MCP streams 10-minute intraday contract snapshots so your AI verifies morning open interest, active session volume, and earnings dates before planning an entry.',
  },
  {
    title: 'Historical 3-day MFE/MAE outcome surfaces & replay',
    body: 'Query BigQuery enriched_option_outcomes across historical pool cohorts to inspect unclipped 3-day Maximum Favorable and Adverse Excursions, touch probabilities, and minute-by-minute contract price replay.',
  },
  {
    title: 'Built for your AI agent and open-source harness',
    body: 'Connect Claude, ChatGPT, Cursor, Codex, or the open-source gammarips-harness via OAuth 2.1 (/pro) or a bearer API key. Your AI synthesizes the dataset and builds a structured plan for your risk budget; you decide.',
  },
];

const steps = [
  {
    title: `Start your ${TRIAL_DAYS}-day trial`,
    body: `Full Pro MCP access from minute one. No charge if you cancel before day ${TRIAL_DAYS}.`,
  },
  {
    title: 'Connect your AI client',
    body: 'Sign in with OAuth 2.1 from Claude, ChatGPT, Cursor, or Codex, or paste your gr_live_ API key.',
  },
  {
    title: 'Query the dataset & build your plan',
    body: 'Your AI reads the full Combo A pool, verifies 10-minute morning liquidity and earnings, checks 3-day excursion history, and lays out your trade plan.',
  },
];

const PENDING_CHECKOUT_KEY = 'gammarips_pending_checkout';

export function PricingClient(_props: { receipts?: Receipts }) {
  const { user, isPro } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const autoCheckoutTriggered = useRef(false);

  const runStripeCheckout = useCallback(async (interval: 'month' | 'year' = 'month') => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
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
        description: "We couldn't start your checkout. Please try again or contact evan@gammarips.com.",
        variant: 'destructive',
      });
      setLoading(false);
    }
  }, [user, toast]);

  // Automatically continue into Stripe Checkout right after Google/email auth
  // completes on /pricing (or when arriving via ?checkout=month|year).
  useEffect(() => {
    if (!user || autoCheckoutTriggered.current) return;
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const urlCheckout = params.get('checkout');
    const storedCheckout = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    const pending = storedCheckout || urlCheckout;

    if (pending === 'month' || pending === 'year') {
      autoCheckoutTriggered.current = true;
      sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
      void runStripeCheckout(pending);
    }
  }, [user, runStripeCheckout]);

  async function handleCheckout(interval: 'month' | 'year' = 'month') {
    const displayPrice = interval === 'year' ? PRICE_ANNUAL : PRICE_MONTHLY;
    trackEvent('begin_checkout', {
      currency: 'USD',
      value: Number(displayPrice.replace(/[^0-9.]/g, '')) || 0,
      plan: 'pro',
      interval,
      authenticated: !!user,
    });
    if (!user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(PENDING_CHECKOUT_KEY, interval);
      }
      autoCheckoutTriggered.current = false;
      openAuthModal('signUp', 'trial');
      return;
    }
    await runStripeCheckout(interval);
  }

  return (
    <section className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <header className="text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Pricing
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
          Unlock the full nightly options dataset.
          <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Streamed directly into your AI agent over MCP.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Pro opens all {TOOL_COUNT} GammaRips MCP tools in Claude, ChatGPT,
          Cursor, or Codex: the full daily Combo A pool (40–50 liquid calls),
          10-minute intraday liquidity snapshots, and 3-day MFE/MAE outcome
          surfaces. {PRICE_MONTHLY}/month founding price, {TRIAL_DAYS}-day free
          trial, cancel anytime.
        </p>
      </header>

      {/* Catalyst Lab Research Metrics */}
      <section aria-label="Catalyst Lab research metrics" className="mb-16 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {catalystResearchProof.map((p) => (
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
          Walk-forward Catalyst Lab research (N = 5,575 enriched contracts across 66 scan dates). Educational only, not investment advice.{' '}
          <Link href="/how-it-works" className="text-primary hover:underline">
            Read the research &rarr;
          </Link>
        </p>
      </section>

      <h2 className="text-center text-xl sm:text-2xl font-bold font-headline mb-8">
        Free 3-contract preview. Full dataset on Pro MCP.
      </h2>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free card */}
        <Card className="bg-card/50">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-2xl font-bold font-headline">Free Preview</CardTitle>
            <div className="mt-2">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground ml-2">forever</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Daily 3-contract pool preview on web and MCP, daily macro reports,
              and methodology playbooks. No card, no account required.
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
              <Link href="/signals">View 3-contract preview &rarr;</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Agent Access card */}
        <Card className="bg-card/50 border-primary/50 ring-1 ring-primary/20 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Pro MCP Dataset
          </div>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-2xl font-bold font-headline">Agent Access (Pro)</CardTitle>
            <div className="mt-2">
              <span className="text-4xl font-bold">{PRICE_MONTHLY}</span>
              <span className="text-muted-foreground ml-2">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              The full daily Combo A dataset (40–50 contracts), 10-minute
              intraday liquidity snapshots, and 3-day excursion outcome surfaces
              in Claude, ChatGPT, Cursor, Codex, or any MCP client. {TRIAL_DAYS}-day free trial.
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
            {isPro ? (
              <Button asChild size="lg" className="w-full">
                <Link href="/account">
                  Pro Subscription Active ✓ · Connect Your AI &rarr;
                </Link>
              </Button>
            ) : (
              <>
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
              </>
            )}
            <p className="text-xs text-muted-foreground text-center mt-3">
              No charge during the trial. After checkout, sign in via OAuth at
              /pro from your AI client, or mint an API key on your account page.
              Cancel anytime.
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
      </section>

      {/* How it works */}
      <section className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold font-headline text-center mb-8">
          Three steps to your first trade plan
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
              Card on file, no charge for {TRIAL_DAYS} days, full Pro MCP access
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
              Shared picks crowd everyone into the same contract at the open.
              Furthermore, our Catalyst Lab walk-forward audit showed that
              black-box composite scores fail out-of-sample, whereas transparent
              microstructure and volatility primitives (Combo A) hold up. Your
              AI uses the dataset and historical 3-day excursion surfaces to
              build a plan tailored to your risk budget.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              How are the Combo A filters validated?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every filter gate on this page comes from walk-forward Catalyst
              Lab audits across N = 5,575 enriched option contracts (66 scan
              dates) joined to BigQuery{' '}
              <code className="text-xs text-foreground">enriched_option_outcomes</code>. Read the full walkthrough on{' '}
              <Link href="/how-it-works" className="text-primary hover:underline">
                Learn
              </Link>{' '}
              and{' '}
              <Link href="/methodology" className="text-primary hover:underline">
                Methodology
              </Link>
              .
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              What happens if I cancel?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pro MCP access stops at the end of your billing cycle. The
              3-contract preview on the web and on the anonymous MCP endpoint
              stays free forever.
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
              {PRICE_STANDARD}/mo.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-16 text-xs text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
        Educational market data and historical research only. Not investment
        advice. You trade your own account. GammaRips does not manage your money
        or place trades for you. Past performance is not a guarantee of future
        results.
      </p>
    </section>
  );
}
