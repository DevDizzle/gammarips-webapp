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

const proFeatures = [
  "Today's V5.3 pick pushed to WhatsApp at 09:00 ET",
  'Exit reminder at 15:50 ET on day-3',
  'Private WhatsApp group access',
  'AI chat agent — @mention it to ask about today\'s pick, open position, or the 30-day ledger',
  'Live open-position tracker via chat',
  'Historical ledger queries (any direction, any ticker)',
  '7-day free trial · cancel anytime',
];

const freeFeatures = [
  "Today's V5.3 pick on the home page at 09:00 ET",
  'Full signals list across 5,230+ tickers',
  'Daily market report with AI-authored thesis',
  'Per-ticker deep dive + recommended contract',
  'Public scorecard (paper-trading ledger)',
  'Methodology, FAQ, and all disclaimers',
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
        description: 'We couldn\'t start your checkout. Please try again or contact ceo@gammarips.com.',
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
          One trade a day.
          <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Pushed to your phone for $39 a month.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          The webapp is always free. Pay for the WhatsApp push at 09:00 ET and
          the AI chat agent inside the private group. 7-day free trial on Pro.
          Cancel anytime.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free card */}
        <Card className="bg-card/50">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-2xl font-bold font-headline">Free</CardTitle>
            <div className="mt-2">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground ml-2">forever</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              See the pick at 09:00 ET. Browse every signal. Read the full report.
              Everything on gammarips.com, no card required.
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
              <Link href="/signals">See Today&apos;s Pick</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pro card */}
        <Card className="bg-card/50 border-primary/50 ring-1 ring-primary/20 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Launch Tier
          </div>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-2xl font-bold font-headline">Pro</CardTitle>
            <div className="mt-2">
              <span className="text-4xl font-bold">$39</span>
              <span className="text-muted-foreground ml-2">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Everything in Free, plus the WhatsApp push and the AI chat agent
              inside the private group. 7-day free trial.
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3 mb-6">
              {proFeatures.map((f) => (
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
                'Start 7-Day Free Trial'
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              No charge during trial. Cancel anytime from your account.
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
              Not a timing advantage.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Free users and Pro subscribers see the exact same pick at the same
              second. No paid-first tier. Ever.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Not a signal firehose.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              One pick per day or none. When the engine skips, the push says so
              and you do nothing.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Not personalized advice.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              GammaRips is educational content about a mechanical engine&apos;s
              output. Every push and page carries the paper-trading disclaimer.
              You trade your own account.
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
              Card on file, no charge for seven days. If you cancel before day-7
              you pay nothing. After day-7 your card is charged $39 and you&apos;re
              billed monthly until you cancel.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              What happens if I cancel?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You keep Pro access through the end of your billing cycle, then
              lose the WhatsApp push and chat agent. The webapp stays free
              forever. No retention tricks, no downgraded experience.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              What&apos;s the refund policy?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We don&apos;t offer pro-rated refunds mid-cycle, but the 7-day
              trial gives you a full week to evaluate without paying anything.
              If something breaks, email ceo@gammarips.com and we&apos;ll make it
              right.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Will the price go up?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              $39/mo is the public launch price and applies to everyone who
              subscribes today. If we ever raise prices, existing subscribers
              are grandfathered at the rate they signed up on.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              What if the WhatsApp group isn&apos;t live yet?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We&apos;ll email you the group invite the moment you subscribe. If
              you subscribe before the push channel is fully live in your
              region, your trial clock doesn&apos;t start until access is
              provisioned.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-16 text-xs text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
        Paper-trading performance, educational content only. Not investment
        advice. You trade your own account; GammaRips does not manage your
        money. Past performance is not a guarantee of future results.
      </p>
    </section>
  );
}
