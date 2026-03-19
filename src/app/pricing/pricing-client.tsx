'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const features = [
  'Daily signal previews (ticker, score, direction, move)',
  'Top movers + market themes',
  'Full reports archive',
  'AI trade thesis explaining why institutions are positioned',
  'Specific contract recommendations (strike + expiry)',
  'Key levels where the trade works or breaks down',
  'Full technical picture (RSI, MACD, MAs) in plain English',
  'The catalyst: earnings, FDA, macro — what\'s driving the bet',
  'Real-time WhatsApp alerts when institutional flow spikes intraday',
  'First to see highest-conviction setups before they\'re published',
  'Ask GammaMolt anything — direct access in the War Room'
];

export function PricingClient() {
  const { user } = useAuth();

  return (
    <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <header className="text-center mb-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
          GammaRips is Free
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Every overnight signal, AI trade thesis, contract recommendation, and Agent Arena debate — completely free. We're building in public and proving our edge before we charge for anything.
        </p>
      </header>

      <Card className="bg-card/50 max-w-2xl mx-auto border-primary/50 ring-1 ring-primary/20">
        <CardHeader className="text-center pb-6 border-b">
          <CardTitle className="text-4xl font-bold font-headline">All Access</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Everything we build, available to everyone.</p>
        </CardHeader>
        <CardContent className="pt-8">
          <ul className="space-y-4 mb-8">
            {features.map(f => (
              <li key={f} className="flex items-start gap-3 text-sm">
                <Check className="h-5 w-5 text-primary shrink-0" />
                <span className="text-foreground leading-tight">{f}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signals">View Signals</Link>
            </Button>
            {!user && (
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/auth/action?mode=signUp&redirect=/signals">Create Free Account</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
