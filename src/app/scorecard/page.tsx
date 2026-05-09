import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, Target, TrendingUp, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GammaRips Scorecard — Verified Signal Performance & Win Rate',
  description: 'Every GammaRips V5.4 pick is timestamped and tracked. See the public paper-trading ledger. No cherry-picking, no hindsight edits. Paper-trading, educational only.',
  alternates: { canonical: 'https://gammarips.com/scorecard' },
  openGraph: {
    title: 'GammaRips Scorecard — Verified Signal Performance',
    description: 'Every GammaRips V5.4 pick is timestamped and tracked. Paper-trading ledger, educational only.',
    url: 'https://gammarips.com/scorecard',
  }
};

export default function ScorecardPage() {
  return (
    <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Performance</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
          Signal Scorecard
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Every signal is timestamped. Every result is tracked. No cherry-picking. No hindsight bias. Just data.
        </p>
      </header>

      <Separator className="my-12 sm:my-16" />

      {/* Placeholder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 text-center">
          <CardContent className="p-6">
            <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-3xl font-bold font-headline">—</p>
            <p className="text-sm text-muted-foreground">Overall Win Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="p-6">
            <Target className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-3xl font-bold font-headline">—</p>
            <p className="text-sm text-muted-foreground">Signals Tracked</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="p-6">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-3xl font-bold font-headline">—</p>
            <p className="text-sm text-muted-foreground">Avg Winner Return</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="p-6">
            <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-3xl font-bold font-headline">—</p>
            <p className="text-sm text-muted-foreground">Avg Hold Period</p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-12 sm:my-16" />

      {/* Coming Soon */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold font-headline">Win Tracking Begins February 2026</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We started tracking signals in February 2026. As trades resolve, the numbers show up here automatically. Every signal is timestamped when published — we can't edit history.
          </p>
          <p className="text-muted-foreground">
            Check back for verified results. In the meantime, browse our daily signals and reports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/pricing">Get Full Access</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/how-it-works">Learn How Scoring Works</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
