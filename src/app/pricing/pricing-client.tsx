'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Disclosure } from '@/components/ui/disclosure';
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
  BUILD_STANDARD_PRICE,
  AGENT_CARE_PRICE,
  AGENT_CARE_MCP_PRICE,
  BUILD_TURNAROUND_DAYS,
} from '@/lib/constants';
import { type Receipts } from '@/lib/receipts';

// Next inlines a NEXT_PUBLIC_ var at build time only where the full
// process.env.NAME expression is written out, so keep this literal.
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

const freeFeatures = [
  'Daily 3-setup preview on the web and over free MCP',
  'Morning market & options-flow briefings',
  'Market volatility regime (VIX vs. VIX3M) & NYSE calendar',
  'Full methodology, Research Lab & plain-English guides',
];

const proFeatures = [
  'Full nightly pool (40–50 liquid setups) mapped to stocks, 2x/inverse ETFs & options',
  'Live 10-minute morning liquidity checks & earnings date alerts',
  '3-day historical move data & minute-by-minute price replay',
  `All ${TOOL_COUNT} MCP tools in Claude, ChatGPT, Cursor, Codex, or Gemini CLI`,
  `One-click browser sign-in (OAuth) or API key · ${TRIAL_DAYS}-day free trial`,
];

const buildFeatures = [
  'Your written entry, sizing, stop & exit rules coded in Python 3.12',
  'Trade US stocks, 2x/inverse single-stock ETFs, or single-leg options',
  'Safety-hardened: limit-only orders, fill-based stops & duplicate-order guards',
  'Connects to Alpaca, Robinhood MCP, Tradier, or Interactive Brokers',
  `Paper-first handoff to your private GitHub repo in ${BUILD_TURNAROUND_DAYS} business days`,
];

const researchProof = [
  {
    label: 'Faster Morning Fills',
    value: '50.1% vs 30.3%',
    headline: '5-minute open fill rate with deep resting liquidity',
    detail:
      'Filtering out thin books (requiring Open Interest >= 500) raised 5-minute opening fill rates from 30.3% to 50.1% across audited historical sessions.',
  },
  {
    label: 'Cleaner Upside Moves',
    value: '35.4% vs 27.6%',
    headline: '3-day +40% upside touch rate inside our pricing band',
    detail:
      'Cutting far-out-of-the-money lottery tickets and short decay traps raised 3-day +40% touch rates across 5,575 historical contracts (66 scan dates).',
  },
  {
    label: 'No Penny-Option Friction',
    value: '$1.00+ / 500+ OI',
    headline: 'Hard minimum price & open-interest floors every night',
    detail:
      'Eliminates sub-dollar $0.05 tick-size drag across the 100 most liquid US names before your AI ever reviews a setup.',
  },
];

const steps = [
  {
    title: `Start your ${TRIAL_DAYS}-day free trial`,
    body: `Unlock full Pro MCP access immediately. Cancel anytime from your account page before day ${TRIAL_DAYS} at $0.`,
  },
  {
    title: 'Connect in 1 minute',
    body: 'Sign in with your browser inside Claude or ChatGPT, or copy one prompt so Claude Code, Cursor, or Codex connects itself.',
  },
  {
    title: 'Build your risk-sized plan',
    body: 'Your AI checks morning liquidity, skips surprise earnings, compares stock, 2x ETF, and option choices, and lays out entries, targets, and stops.',
  },
];

const PENDING_CHECKOUT_KEY = 'gammarips_pending_checkout';

export function PricingClient(_props: { receipts?: Receipts }) {
  const { user, isPro } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'year' | 'month'>(
    ANNUAL_PRICE_ID ? 'year' : 'month'
  );
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
    <section className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <header className="text-center mb-10 max-w-3xl mx-auto">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Pricing
        </p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-bold font-headline tracking-tight">
          Simple pricing for DIY AI agents
          <span className="block mt-1.5 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            &amp; custom trading bots.
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Start free with 3 daily setups, plug the full nightly feed for stocks, 2x ETFs, and
          options into your AI, or have us engineer a turnkey Python bot around your own rules.
        </p>
      </header>

      {/* 3-Column Pricing Table IMMEDIATELY Above the Fold */}
      <div className="grid lg:grid-cols-3 gap-6 items-stretch">
        {/* Tier 1: Free Preview */}
        <Card className="bg-card/50 flex flex-col">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-xl font-bold font-headline">Free Preview</CardTitle>
            <div className="mt-2">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground ml-2">forever</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Test the workflow before subscribing. No card and no account required.
            </p>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-6">
            <ul className="space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-foreground/90 leading-snug">{f}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/signals">View 3-Setup Preview &rarr;</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Tier 2: Pro MCP Access (Primary Recommended) */}
        <Card className="bg-card/70 border-primary/60 ring-1 ring-primary/25 relative flex flex-col">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
            Most Popular · DIY AI Data
          </div>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-xl font-bold font-headline">Pro MCP Access</CardTitle>
            {ANNUAL_PRICE_ID ? (
              <div
                role="group"
                aria-label="Billing interval"
                className="mt-3 inline-flex items-center rounded-lg border border-border bg-background/60 p-1 w-full"
              >
                <button
                  type="button"
                  onClick={() => setBillingInterval('year')}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    billingInterval === 'year'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Annual · Save $49/yr
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval('month')}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    billingInterval === 'month'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
              </div>
            ) : null}
            <div className="mt-3">
              {billingInterval === 'year' && ANNUAL_PRICE_ID ? (
                <>
                  <span className="text-4xl font-bold">{PRICE_ANNUAL}</span>
                  <span className="text-muted-foreground ml-1.5">/year</span>
                  <p className="text-xs text-primary font-medium mt-1">
                    $24.92/mo effective · Save $49 vs. monthly
                  </p>
                </>
              ) : (
                <>
                  <span className="text-4xl font-bold">{PRICE_MONTHLY}</span>
                  <span className="text-muted-foreground ml-1.5">/month</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Founding price locked for the first {FOUNDING_CAP} subscribers ({PRICE_STANDARD}/mo after). {TRIAL_DAYS}-day free trial.
            </p>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-6">
            <ul className="space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground leading-snug">{f}</span>
                </li>
              ))}
            </ul>
            <div>
              {isPro ? (
                <Button asChild size="lg" className="w-full">
                  <Link href="/account">
                    Pro Active ✓ · Connect Your AI &rarr;
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="w-full font-semibold"
                    onClick={() => handleCheckout(billingInterval)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting checkout…
                      </>
                    ) : billingInterval === 'year' && ANNUAL_PRICE_ID ? (
                      `Start ${TRIAL_DAYS}-Day Free Trial (${PRICE_ANNUAL}/yr)`
                    ) : (
                      `Start ${TRIAL_DAYS}-Day Free Trial (${PRICE_MONTHLY}/mo)`
                    )}
                  </Button>
                  {ANNUAL_PRICE_ID ? (
                    <p className="text-xs text-center mt-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleCheckout(billingInterval === 'year' ? 'month' : 'year')
                        }
                        disabled={loading}
                        className="text-muted-foreground underline underline-offset-4 hover:text-foreground disabled:opacity-50"
                      >
                        {billingInterval === 'year'
                          ? `or start monthly at ${PRICE_MONTHLY}/mo`
                          : `or save $49/yr with annual (${PRICE_ANNUAL}/yr)`}
                      </button>
                    </p>
                  ) : null}
                </>
              )}
              <p className="text-[11px] text-muted-foreground text-center mt-2.5">
                $0 charged during trial · Cancel in 1 click on your account page.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tier 3: Done-For-You Custom Agent Build */}
        <Card className="bg-card/50 border-border flex flex-col">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-xl font-bold font-headline">Custom Agent Build</CardTitle>
            <div className="mt-2">
              <span className="text-4xl font-bold">{BUILD_STANDARD_PRICE}</span>
              <span className="text-muted-foreground ml-2">one-time</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Done-for-you Python trading bot engineered around your written rules in{' '}
              {BUILD_TURNAROUND_DAYS} business days.
            </p>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-6">
            <ul className="space-y-3">
              {buildFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/90 leading-snug">{f}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2.5">
              <Button asChild variant="outline" size="lg" className="w-full font-semibold">
                <Link href="/build">Submit Rules / Free 24h Scope Check &rarr;</Link>
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">
                Optional {AGENT_CARE_PRICE}/mo maintenance ({AGENT_CARE_MCP_PRICE}/mo with Pro MCP) after delivery.{' '}
                <Link href="/xtrader" className="text-primary hover:underline">
                  See live bot &rarr;
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3-Step Workflow Strip */}
      <section className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold font-headline text-center mb-8">
          How Pro MCP works in three steps
        </h2>
        <ol className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-xl border bg-card/40 p-5 space-y-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {i + 1}
              </span>
              <h3 className="font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-center text-sm">
          <Link href="/developers#connect" className="text-primary hover:underline">
            See setup instructions for Claude, ChatGPT, Cursor &amp; Codex &rarr;
          </Link>
        </p>
      </section>

      {/* Walk-Forward Research Proof (Moved Below Pricing for Clean Hierarchy) */}
      <section aria-label="Walk-forward filter research" className="mt-16 max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-headline">
            Why our nightly filter beats raw scanners
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Audited across 5,575 historical contracts (66 scan dates) so your AI starts from clean, tradable setups.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {researchProof.map((p) => (
            <Card key={p.label} className="bg-card/50">
              <CardContent className="p-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {p.label}
                </p>
                <div className="text-2xl sm:text-3xl font-bold">{p.value}</div>
                <p className="text-sm text-foreground font-medium leading-snug">{p.headline}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-4 max-w-3xl mx-auto">
          <Disclosure
            label="See exact technical filter specifications"
            hint="Combo A liquidity floors, volatility value enrichment & methodology"
          >
            <p className="leading-relaxed">
              Every trading night at 23:00 ET, the scanner screens ~3,500 optionable US stocks to the top 100 most liquid names (3M+ session shares, 25+ strikes) and keeps bullish call setups passing <code className="text-foreground">Mid &gt;= $1.00</code>, <code className="text-foreground">OI &gt;= 500</code>, <code className="text-foreground">Delta 0.22–0.48</code>, and <code className="text-foreground">DTE 10–45</code>. At 05:30 ET each setup is enriched with Realized-vs-Implied Volatility (<code className="text-foreground">rv_iv_ratio</code>), mapped stock &amp; 2x/inverse ETF vehicles, and grounded news catalysts.{' '}
              <Link href="/methodology" className="text-primary hover:underline font-medium">
                Read the full methodology &rarr;
              </Link>
            </p>
          </Disclosure>
        </div>
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Walk-forward historical research on paper-tracked cohorts (N = 5,575 across 66 scan dates). Educational only, not investment advice.
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
              How does the {TRIAL_DAYS}-day free trial work?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Card on file, zero charge for {TRIAL_DAYS} days, and full Pro MCP access from minute
              one. Cancel in one click on your account page before day {TRIAL_DAYS} and you pay
              nothing. After day {TRIAL_DAYS}, your plan renews at{' '}
              {ANNUAL_PRICE_ID
                ? `${PRICE_ANNUAL}/year (or ${PRICE_MONTHLY}/month on monthly billing)`
                : `${PRICE_MONTHLY}/month`}{' '}
              until you cancel.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Do I have to trade options to use GammaRips?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No. Every setup in the nightly pool maps directly to the underlying US stock (1x),
              2x long or inverse single-stock ETFs, and a liquid call option. You can use
              institutional options flow to research ideas and execute in stocks or 2x ETFs with
              zero option expiration risk.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              How does the {BUILD_STANDARD_PRICE} Custom Agent Build work?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Submit your written trading rules for stocks, 2x/inverse ETFs, or options on{' '}
              <Link href="/build" className="text-primary hover:underline">
                /build
              </Link>
              . We code and safety-harden your bot (limit-only orders, fill-based stops, duplicate
              order protection) and deliver 100% of the code to your private GitHub repo in{' '}
              {BUILD_TURNAROUND_DAYS} business days in Paper Mode. Optional maintenance is{' '}
              {AGENT_CARE_PRICE}/mo ({AGENT_CARE_MCP_PRICE}/mo with Pro MCP) after handoff.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Why don&apos;t you just tell me one trade to buy?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Shared daily picks crowd every subscriber into the same strike at the open, hurting
              fills. Our walk-forward audits also proved black-box composite pick scores fail
              out-of-sample, whereas clean liquidity and volatility data holds up. Your AI builds a
              plan tailored to your own risk rules.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              What happens if I cancel?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pro MCP access stays active until the end of your billing cycle, then switches back
              to the free 3-setup preview automatically. No lock-in, no cancellation hoops.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Will the founding price go up?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {PRICE_MONTHLY}/mo (or {PRICE_ANNUAL}/yr) is our founding rate for the first{' '}
              {FOUNDING_CAP} subscribers. You keep that price for as long as you remain subscribed.
              After the first {FOUNDING_CAP} spots fill, the standard price is {PRICE_STANDARD}/mo.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-16 text-xs text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
        Educational market data, historical research, and work-for-hire software engineering only.
        Not investment advice. You trade your own account. GammaRips does not manage your money or
        place trades for you. Past performance is not a guarantee of future results.
      </p>
    </section>
  );
}
