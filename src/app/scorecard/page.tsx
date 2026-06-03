import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, Target, TrendingUp, DollarSign } from 'lucide-react';
import { getCohortStats } from '@/lib/firebase-admin';

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

// Formal-evaluation threshold (mirrors the operator's N>=15 discipline).
const EVAL_THRESHOLD = 15;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Format an ISO date string ("2026-05-13") without timezone rollback.
function formatCohortStart(iso?: string): string {
  if (!iso) return 'May 13, 2026';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export default async function ScorecardPage() {
  // V5.4-only cohort — the same source the home-page panel uses. NOT the
  // all-signals / underlying-peak-return win-tracker data (that's a different,
  // hindsight-favorable methodology that would contradict this page's promise).
  const stats = await getCohortStats();
  const hasData = !!stats && stats.trades_closed > 0;

  const roi = hasData ? stats!.roi_pct * 100 : null;
  const pl = hasData ? stats!.total_pl_usd : null;
  const cohortStart = formatCohortStart(stats?.cohort_start);

  const winRateText = hasData ? `${Math.round(stats!.win_rate * 100)}%` : '—';
  const tradesText = hasData ? `${stats!.trades_closed}` : '—';
  const roiText = roi === null ? '—' : `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`;
  const plText = pl === null
    ? '—'
    : `${pl >= 0 ? '+' : '-'}$${Math.abs(Math.round(pl)).toLocaleString()}`;

  const roiColor = roi === null ? '' : roi >= 0 ? 'text-emerald-500' : 'text-red-500';
  const plColor = pl === null ? '' : pl >= 0 ? 'text-emerald-500' : 'text-red-500';

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

      {/* Live V5.4 cohort stats — cohort_stats/current */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 text-center">
          <CardContent className="p-6">
            <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-3xl font-bold font-headline">{winRateText}</p>
            <p className="text-sm text-muted-foreground">Overall Win Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="p-6">
            <Target className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-3xl font-bold font-headline">{tradesText}</p>
            <p className="text-sm text-muted-foreground">Signals Tracked</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="p-6">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className={`text-3xl font-bold font-headline ${roiColor}`}>{roiText}</p>
            <p className="text-sm text-muted-foreground">ROI</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="p-6">
            <DollarSign className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className={`text-3xl font-bold font-headline ${plColor}`}>{plText}</p>
            <p className="text-sm text-muted-foreground">Net P&amp;L</p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-12 sm:my-16" />

      {hasData ? (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold font-headline">
              Live V5.4 paper-trading ledger — since {cohortStart}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every V5.4 pick is timestamped at publish and marked to its realized option P&amp;L on a 3-day +80% / &minus;60% bracket &mdash; winners and losers counted the same way. We can&apos;t edit history.
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Preliminary: {stats!.trades_closed} of {EVAL_THRESHOLD} trades closed. Treat this as an early, small sample &mdash; not a verified edge &mdash; until the cohort reaches {EVAL_THRESHOLD} resolved trades.
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
      ) : (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold font-headline">Win Tracking Begins {cohortStart}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The V5.4 cohort started {cohortStart}. As trades resolve, the numbers show up here automatically. Every signal is timestamped when published &mdash; we can&apos;t edit history.
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
      )}
    </section>
  );
}
