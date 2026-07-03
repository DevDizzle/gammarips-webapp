'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

const agentFeatures = [
  'All 23 MCP tools for Claude, ChatGPT, or any MCP client',
  "Today's curated pool in structured, agent-readable form",
  'Opportunity surfaces — realized peak/drawdown excursions per historical setup',
  'Queryable outcome database + exit-rule simulation',
  'Regime context (volatility term structure rail)',
  'Methodology playbooks — including the tournament selection pattern, run against YOUR objective',
  '7-day free trial · cancel anytime',
];

const freeFeatures = [
  "Today's curated pool, browsable across 5,230+ scanned tickers",
  'Daily market report with AI-authored thesis',
  'Per-ticker deep dives',
  'Public scorecard (paper-trading ledger)',
  'The Lab — published experiments, including the failed ones',
  'Methodology, blog, FAQ, and all disclosures',
];

export function PricingClient() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!user) {
      window.location.href = '/auth/action?mode=signUp&redirect=/pricing';
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: 'pro' }),
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
          Humans browse free.
          <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Agents subscribe.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Everything human-readable &mdash; the pool, the reports, the
          scorecard, the Lab &mdash; is free, forever. $39/month buys the
          machine connection: full MCP access for the AI agent of your choice.
          7-day free trial. Cancel anytime.
        </p>
      </header>

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
              The whole website. Browse the pool, read the reports, audit the
              methodology. No card, no account required.
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
              <Link href="/signals">Browse Today&apos;s Pool &rarr;</Link>
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
              <span className="text-4xl font-bold">$39</span>
              <span className="text-muted-foreground ml-2">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Full MCP access for Claude, ChatGPT, or your own agent — the
              curated pool, the deep data a human never browses, and the
              methodology tools. 7-day free trial.
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
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting checkout…
                </>
              ) : (
                'Connect Your Agent — Free for 7 Days'
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              No charge during trial. Your API key arrives by email shortly
              after checkout; cancel anytime from your account.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* What you're actually paying for */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold font-headline text-center mb-8">
          What you&apos;re actually paying for
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Not predictions.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              There is no pick endpoint, and no promised return. You&apos;re
              paying for curation — hundreds of unusual-flow names cut to a
              reasoning-sized pool — and for history nobody else keeps.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Not a signal firehose.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A small curated pool with context attached, not ten thousand
              alerts. Your agent reasons over all of it in one call.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Not personalized advice.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              GammaRips sells data on a paper-trading basis. What your agent
              concludes from it is your analysis. You trade your own account.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold font-headline text-center mb-8">
          Pricing FAQ
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              How does the 7-day trial work?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Card on file, no charge for seven days, full MCP access from
              minute one. If you cancel before day 7 you pay nothing. After
              day 7 your card is charged $39 and you&apos;re billed monthly
              until you cancel.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              How do I know the methodology is real?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Read the Lab. We publish our experiments — hypothesis, method,
              sample size, verdict — including the ones that killed our own
              ideas. The paper-traded scorecard runs in public, and we tell
              you plainly that the pool bought blindly under a fixed exit is
              negative. If we were selling hype, that would be a strange thing
              to publish.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              What happens if I cancel?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your agent&apos;s API key stops working at the end of your
              billing cycle. The website stays free forever. No retention
              tricks, no downgraded experience.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              What&apos;s the refund policy?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We don&apos;t offer pro-rated refunds mid-cycle, but the 7-day
              trial gives you a full week to evaluate without paying anything.
              If something breaks, email evan@gammarips.com and we&apos;ll make
              it right.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Will the price go up?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              $39/mo is the launch price. If we raise it, existing subscribers
              are grandfathered at the rate they signed up on.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              I subscribed to the old WhatsApp pick push. What now?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              That product is retired — a single shared pick concentrates
              everyone into one contract, and our research kept showing the
              edge lives in how a setup is traded, not the name itself. Email
              evan@gammarips.com with any billing question and we&apos;ll make
              it right.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-16 text-xs text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
        Paper-trading data, educational content only. Not investment advice.
        You trade your own account; GammaRips does not manage your money. Past
        performance is not a guarantee of future results.
      </p>
    </section>
  );
}
