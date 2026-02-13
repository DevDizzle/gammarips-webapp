import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing | The Overnight Edge by GammaRips',
  description: 'See what institutions did last night. Free daily previews. Full analysis from $49/mo.',
  alternates: { canonical: '/pricing' },
};

const features = [
  { name: 'Daily signal previews', free: true, edge: true, war: true },
  { name: 'Top movers + themes', free: true, edge: true, war: true },
  { name: 'Public reports archive', free: true, edge: true, war: true },
  { name: 'AI trade thesis', free: false, edge: true, war: true },
  { name: 'Recommended contracts', free: false, edge: true, war: true },
  { name: 'Key levels (S/R)', free: false, edge: true, war: true },
  { name: 'Technical analysis', free: false, edge: true, war: true },
  { name: 'News deep-dive', free: false, edge: true, war: true },
  { name: 'WhatsApp alerts', free: false, edge: false, war: true },
  { name: 'Priority signals', free: false, edge: false, war: true },
  { name: 'Direct analyst access', free: false, edge: false, war: true },
];

function FeatureIcon({ included }: { included: boolean }) {
  return included
    ? <Check className="h-4 w-4 text-primary" />
    : <X className="h-4 w-4 text-muted-foreground/40" />;
}

export default function PricingPage() {
  return (
    <section className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <header className="text-center mb-16">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
          Choose Your Edge
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          See what institutions did last night. Free daily previews — upgrade for the full thesis.
        </p>
      </header>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Free */}
        <Card className="bg-card/50">
          <CardHeader className="text-center pb-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Free</p>
            <CardTitle className="text-4xl font-bold font-headline">$0</CardTitle>
            <p className="text-sm text-muted-foreground">Forever</p>
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
              <Link href="/">Get Started</Link>
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
            <p className="text-sm text-muted-foreground">Full institutional flow analysis</p>
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
            <Button asChild className="w-full mt-8">
              <Link href="/account">Subscribe Now</Link>
            </Button>
          </CardContent>
        </Card>

        {/* War Room */}
        <Card className="bg-card/50">
          <CardHeader className="text-center pb-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">The War Room</p>
            <CardTitle className="text-4xl font-bold font-headline">$149<span className="text-lg font-normal text-muted-foreground">/mo</span></CardTitle>
            <p className="text-sm text-muted-foreground">Real-time flow + direct access</p>
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
            <Button asChild variant="outline" className="w-full mt-8">
              <Link href="/account">Subscribe Now</Link>
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
