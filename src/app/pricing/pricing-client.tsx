'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const features = [
  { name: 'Daily signal previews (ticker, score, direction, move)', free: true, edge: true, war: true },
  { name: 'Top movers + market themes', free: true, edge: true, war: true },
  { name: 'Full reports archive', free: true, edge: true, war: true },
  { name: 'AI trade thesis explaining why institutions are positioned', free: false, edge: true, war: true },
  { name: 'Specific contract recommendations (strike + expiry)', free: false, edge: true, war: true },
  { name: 'Key levels where the trade works or breaks down', free: false, edge: true, war: true },
  { name: 'Full technical picture (RSI, MACD, MAs) in plain English', free: false, edge: true, war: true },
  { name: 'The catalyst: earnings, FDA, macro — what\'s driving the bet', free: false, edge: true, war: true },
  { name: 'Real-time WhatsApp alerts when institutional flow spikes intraday', free: false, edge: false, war: true },
  { name: 'First to see highest-conviction setups before they\'re published', free: false, edge: false, war: true },
  { name: 'Ask GammaMolt anything — direct access in the War Room', free: false, edge: false, war: true },
];

function FeatureIcon({ included }: { included: boolean }) {
  return included
    ? <Check className="h-4 w-4 text-primary" />
    : <X className="h-4 w-4 text-muted-foreground/40" />;
}

export function PricingClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      router.push(`/auth/action?mode=signUp&redirect=/pricing`);
      return;
    }

    setLoadingPlan(plan);
    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await user.getIdToken()}`
            },
            body: JSON.stringify({ plan })
        });

        if (!res.ok) {
            throw new Error('Checkout failed');
        }

        const { sessionId } = await res.json();
        const stripe = await stripePromise;
        if (stripe) {
            const { error } = await stripe.redirectToCheckout({ sessionId });
            if (error) throw error;
        }

    } catch (error: any) {
        console.error(error);
        toast({
            title: "Subscription Error",
            description: "Could not initiate checkout.",
            variant: "destructive"
        });
    } finally {
        setLoadingPlan(null);
    }
  };

  return (
    <section className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <header className="text-center mb-16">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
          Pick How Deep You Want to Go
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Free gets you the radar. $49 gets you the playbook. $149 gets you the war room with real-time alerts to your phone.
        </p>
      </header>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Free */}
        <Card className="bg-card/50">
          <CardHeader className="text-center pb-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Free</p>
            <CardTitle className="text-4xl font-bold font-headline">$0</CardTitle>
            <p className="text-sm text-muted-foreground">See where institutions moved. Decide if you want the full picture.</p>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {features.map(f => (
                <li key={f.name} className="flex items-center gap-3 text-sm">
                  <FeatureIcon included={f.free} />
                  <span className={f.free ? 'text-foreground' : 'text-muted-foreground/40'}>{f.name}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full mt-8">
              <Link href={user ? "/dashboard" : "/auth/action?mode=signUp&redirect=/dashboard"}>
                {user ? "Go to Dashboard" : "Get Started"}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Overnight Edge */}
        <Card className="bg-card/50 border-primary/50 ring-1 ring-primary/20 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </div>
          <CardHeader className="text-center pb-2">
            <p className="text-sm text-primary uppercase tracking-wider font-semibold">The Overnight Edge</p>
            <CardTitle className="text-4xl font-bold font-headline">$49<span className="text-lg font-normal text-muted-foreground">/mo</span></CardTitle>
            <p className="text-sm text-muted-foreground">The full trade plan every morning before the bell</p>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {features.map(f => (
                <li key={f.name} className="flex items-center gap-3 text-sm">
                  <FeatureIcon included={f.edge} />
                  <span className={f.edge ? 'text-foreground' : 'text-muted-foreground/40'}>{f.name}</span>
                </li>
              ))}
            </ul>
            <Button 
                onClick={() => handleSubscribe('edge')} 
                className="w-full mt-8"
                disabled={loadingPlan === 'edge'}
            >
              {loadingPlan === 'edge' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe Now"}
            </Button>
          </CardContent>
        </Card>

        {/* War Room */}
        <Card className="bg-card/50">
          <CardHeader className="text-center pb-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">The War Room</p>
            <CardTitle className="text-4xl font-bold font-headline">$149<span className="text-lg font-normal text-muted-foreground">/mo</span></CardTitle>
            <p className="text-sm text-muted-foreground">Real-time alerts + direct analyst access</p>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {features.map(f => (
                <li key={f.name} className="flex items-center gap-3 text-sm">
                  <FeatureIcon included={f.war} />
                  <span className={f.war ? 'text-foreground' : 'text-muted-foreground/40'}>{f.name}</span>
                </li>
              ))}
            </ul>
            <Button 
                onClick={() => handleSubscribe('warroom')} 
                variant="outline" 
                className="w-full mt-8"
                disabled={loadingPlan === 'warroom'}
            >
              {loadingPlan === 'warroom' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe Now"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ-style bottom */}
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">All subscriptions are month-to-month. Cancel anytime.</p>
        <p className="text-sm text-muted-foreground">
          Questions? Reach us at{' '}
          <a href="mailto:support@gammarips.com" className="text-primary hover:underline">support@gammarips.com</a>
        </p>
      </div>
    </section>
  );
}
