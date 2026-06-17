import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, Target, TrendingUp, DollarSign } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { getCohortStats, getLedgerTrades, type LedgerTrade } from '@/lib/firebase-admin';

export const metadata: Metadata = {
  title: 'GammaRips Scorecard — Verified Signal Performance & Win Rate',
  description: 'Every GammaRips V6 pick is timestamped and tracked. See the public paper-trading ledger. No cherry-picking, no hindsight edits. Paper-trading, educational only.',
  alternates: { canonical: 'https://gammarips.com/scorecard' },
  openGraph: {
    title: 'GammaRips Scorecard — Verified Signal Performance',
    description: 'Every GammaRips V6 pick is timestamped and tracked. Paper-trading ledger, educational only.',
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

// Short date for the ledger table ("May 29").
function formatShort(iso?: string): string {
  if (!iso) return '—';
  const [, m, d] = iso.split('-').map(Number);
  if (!m || !d) return iso;
  return `${MONTHS[m - 1].slice(0, 3)} ${d}`;
}

// Whole-dollar money with thousands separators, e.g. "$1,913". Signed variant
// for the Profit column ("+$483" / "-$314").
function usd(v: number, signed = false): string {
  const sign = signed ? (v >= 0 ? '+' : '-') : v < 0 ? '-' : '';
  return `${sign}$${Math.abs(Math.round(v)).toLocaleString()}`;
}

// "$525 PUT" when parsed; otherwise the raw OCC symbol.
function contractLabel(t: LedgerTrade): string {
  if (t.strike != null && t.option_type) {
    const strike = Number.isInteger(t.strike) ? `${t.strike}` : t.strike.toFixed(2);
    return `$${strike} ${t.option_type}`;
  }
  return t.recommended_contract;
}

export default async function ScorecardPage() {
  // V6-only cohort — the same source the home-page panel uses. NOT the
  // all-signals / underlying-peak-return win-tracker data (that's a different,
  // hindsight-favorable methodology that would contradict this page's promise).
  const [stats, trades] = await Promise.all([getCohortStats(), getLedgerTrades()]);
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

  // The ledger is, literally, a tracked dataset of closed paper trades. Describe
  // it as schema.org/Dataset and surface the aggregate metrics as
  // variableMeasured when we actually have closed trades.
  const scorecardSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "GammaRips V6 Paper-Trading Ledger",
    "description": "Public, timestamped record of every GammaRips V6 signal and its realized option P&L on a 3-day +80% / -60% bracket. No cherry-picking, no hindsight edits. Paper-trading, educational only.",
    "url": "https://gammarips.com/scorecard",
    "creator": { "@type": "Organization", "name": "GammaRips", "url": "https://gammarips.com" },
    "license": "https://gammarips.com/disclosures",
    "isAccessibleForFree": true,
    ...(hasData
      ? {
          "temporalCoverage": `${stats!.cohort_start}/..`,
          "variableMeasured": [
            { "@type": "PropertyValue", "name": "Win Rate", "value": `${Math.round(stats!.win_rate * 100)}%` },
            { "@type": "PropertyValue", "name": "ROI", "value": `${roi!.toFixed(1)}%` },
            { "@type": "PropertyValue", "name": "Net P&L (USD)", "value": Math.round(pl!) },
            { "@type": "PropertyValue", "name": "Trades Closed", "value": stats!.trades_closed },
          ],
        }
      : {}),
  };

  return (
    <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(scorecardSchema) }} />
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

      {/* Live V6 cohort stats — cohort_stats/current */}
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

      {trades.length > 0 && (
        <div className="mt-12 sm:mt-16">
          <h2 className="text-2xl font-bold font-headline text-center">The Ledger</h2>
          <p className="text-sm text-muted-foreground text-center mt-2 mb-8 max-w-2xl mx-auto">
            Every closed V6 trade, most recent first &mdash; realized option P&amp;L on the 3-day +80% / &minus;60% bracket. Winners and losers, counted the same way.
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">#</TableHead>
                  <TableHead className="text-right">Invested</TableHead>
                  <TableHead className="text-right">Exit Value</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((t) => {
                  const ret = t.return_pct * 100;
                  const retColor = ret >= 0 ? 'text-emerald-500' : 'text-red-500';
                  // Defensive fallbacks for docs synced before the n_contracts /
                  // exit_value_usd fields were added (exit value = invested + P&L).
                  const contracts = t.n_contracts ?? Math.max(1, Math.round(t.capital_usd / (t.entry_price * 100)));
                  const exitValue = t.exit_value_usd ?? t.capital_usd + t.pl_usd;
                  return (
                    <TableRow key={`${t.scan_date}_${t.ticker}`}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{formatShort(t.entry_date)}</TableCell>
                      <TableCell className="font-semibold">{t.ticker}</TableCell>
                      <TableCell className="text-muted-foreground">{t.direction === 'BULLISH' ? 'Bullish' : 'Bearish'}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractLabel(t)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">${t.entry_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{contracts}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{usd(t.capital_usd)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{usd(exitValue)}</TableCell>
                      <TableCell className={`text-right whitespace-nowrap font-semibold ${t.pl_usd >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {usd(t.pl_usd, true)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${retColor}`}>
                        <div>{ret >= 0 ? '+' : ''}{ret.toFixed(1)}%</div>
                        <div className="text-xs font-normal capitalize text-muted-foreground">{t.exit_reason.toLowerCase()}</div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Separator className="my-12 sm:my-16" />

      {hasData ? (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold font-headline">
              Live V6 paper-trading ledger — since {cohortStart}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every V6 pick is timestamped at publish and marked to its realized option P&amp;L on a 3-day +80% / &minus;60% bracket &mdash; winners and losers counted the same way. We can&apos;t edit history.
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
              The V6 cohort started {cohortStart}. As trades resolve, the numbers show up here automatically. Every signal is timestamped when published &mdash; we can&apos;t edit history.
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
