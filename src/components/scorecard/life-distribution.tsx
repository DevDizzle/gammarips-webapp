import { Card, CardContent } from '@/components/ui/card';
import type { PoolOutcomes, LifeBucket } from '@/lib/firebase-admin';

// The Track Record centerpiece (owner-approved mock, 2026-07-08): the
// distribution of what every surfaced contract's premium did from the morning
// it surfaced to the day it expired. Two mirrored histograms — the ceiling
// (peak before expiration) and the floor (held to settlement, no exit) — with
// NO ROI headline and NO win rate anywhere. Data is pool-level aggregates from
// pool_outcomes/current.life; bucket labels are rendered verbatim from the doc.

const pct = (f: number | null | undefined, signed = true) =>
  f == null ? '—' : `${signed && f > 0 ? '+' : ''}${Math.round(f * 100)}%`;

const share = (n: number | undefined, total: number | undefined) =>
  !n || !total ? 0 : n / total;

function Histogram({
  buckets,
  total,
  negativeCount = 0,
}: {
  buckets: LifeBucket[];
  total: number;
  /** how many leading buckets are loss-side (rendered in the adverse color) */
  negativeCount?: number;
}) {
  const maxShare = Math.max(...buckets.map((b) => share(b.n, total)), 0.01);
  return (
    <div>
      <div className="flex items-end gap-2 sm:gap-3 h-44 relative">
        {/* recessive gridlines */}
        <div className="absolute inset-x-0 bottom-1/3 h-px bg-border/60" />
        <div className="absolute inset-x-0 bottom-2/3 h-px bg-border/60" />
        {buckets.map((b, i) => {
          const s = share(b.n, total);
          return (
            <div key={b.label} className="flex-1 flex flex-col justify-end items-center h-full group relative">
              <span className="text-[10px] font-mono text-muted-foreground mb-1 tabular-nums">
                {total ? `${Math.round(s * 1000) / 10}%` : '—'}
              </span>
              <div
                className={`w-full max-w-14 rounded-t ${i < negativeCount ? 'bg-blue-400/85' : 'bg-primary/85'}`}
                style={{ height: `${Math.max((s / maxShare) * 100, 1.5)}%` }}
                role="img"
                aria-label={`${b.label}: ${b.n} contracts`}
              />
              <span className="absolute -bottom-6 text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                {b.label}
              </span>
              {/* hover tooltip (no JS) */}
              <span className="pointer-events-none absolute bottom-full mb-6 hidden group-hover:block bg-popover border rounded-md px-2.5 py-1 text-[11px] font-mono whitespace-nowrap z-10">
                {b.n} contracts · {total ? `${Math.round(s * 1000) / 10}%` : '—'}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-7" />
    </div>
  );
}

function BucketTable({ title, buckets, total }: { title: string; buckets: LifeBucket[]; total: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto font-mono text-xs tabular-nums border-collapse">
        <caption className="text-[11px] text-muted-foreground mb-1">{title}</caption>
        <thead>
          <tr>
            <th className="border px-3 py-1 text-muted-foreground font-semibold">bucket</th>
            <th className="border px-3 py-1 text-muted-foreground font-semibold">contracts</th>
            <th className="border px-3 py-1 text-muted-foreground font-semibold">share</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((b) => (
            <tr key={b.label}>
              <td className="border px-3 py-1">{b.label}</td>
              <td className="border px-3 py-1 text-right">{b.n}</td>
              <td className="border px-3 py-1 text-right">
                {total ? `${Math.round(share(b.n, total) * 1000) / 10}%` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LifeDistribution({ outcomes }: { outcomes: PoolOutcomes | null }) {
  const life = outcomes?.life;

  if (!life || !life.n_peak) {
    return (
      <Card className="bg-card/50">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          The full-life distributions are accruing — every pool contract enters
          this record the evening after its option expires. Check back shortly.
        </CardContent>
      </Card>
    );
  }

  // Null-safe reads: this page is the target of the landing page's "publish
  // the ledger" link — a partially-written doc must degrade, never 500.
  const nPeak = life.n_peak ?? 0;
  const nExpiry = life.n_expiry ?? 0;
  const processed = life.processed ?? 0;
  const noEntry = life.no_entry_excluded ?? 0;
  const peakBuckets = life.peak_buckets ?? [];
  const expiryBuckets = life.expiry_buckets ?? [];
  // Loss-side coloring derived from the writer-authored labels (not a
  // hardcoded count) so an engine-side bucket-edge change can't miscolor.
  const lossBucketCount = expiryBuckets.filter((b) => /^[<≤]?−/.test(b.label)).length;

  const touched40 = share(life.peak_ge_40, nPeak);
  const touched100 = share(life.peak_ge_100, nPeak);
  // The remainder is not only unexpired contracts — it also holds any
  // expired-but-unlabeled backlog if the nightly labeler is behind.
  const notYetExpired = Math.max((outcomes?.contracts_total ?? 0) - processed, 0);
  // Expired rows examined but in neither distribution (labeling failed /
  // no post-entry prints) — counted so "excluded" accounting is complete.
  const otherExcluded = Math.max(processed - noEntry - nPeak, 0);

  return (
    <div className="space-y-6">
      {/* Distribution stat tiles — deliberately NO avg ROI, NO win rate. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/50 text-center">
          <CardContent className="p-4">
            <div className="text-2xl md:text-3xl font-bold font-mono text-primary tabular-nums">
              {pct(life.peak_median)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">median peak premium return</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="p-4">
            <div className="text-2xl md:text-3xl font-bold font-mono text-primary tabular-nums">
              {Math.round(touched40 * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">of contracts touched +40% or better</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="p-4">
            <div className="text-2xl md:text-3xl font-bold font-mono text-primary tabular-nums">
              {Math.round(touched100 * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">of contracts touched +100% or better</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="p-4">
            <div className="text-2xl md:text-3xl font-bold font-mono text-blue-400 tabular-nums">
              {pct(life.trough_median)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">median drawdown along the way</p>
          </CardContent>
        </Card>
      </div>
      <p className="text-[11px] font-mono text-muted-foreground text-center">
        N = {nPeak.toLocaleString()} expired contracts
        {life.first_scan_date && life.last_scan_date
          ? ` · surfaced ${life.first_scan_date} – ${life.last_scan_date}`
          : ''}{' '}
        · updated daily as contracts expire
      </p>

      {/* Chart A — the ceiling */}
      <Card className="bg-card/50">
        <CardContent className="p-5 md:p-6">
          <h3 className="font-bold font-headline">The ceiling — peak return before expiration</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-6">
            Each contract&apos;s best premium print after surfacing, over its whole
            life. Share of all tracked contracts per bucket.
          </p>
          <Histogram buckets={peakBuckets} total={nPeak} />
          <p className="text-[10px] font-mono text-muted-foreground text-right mt-1">
            N = {nPeak.toLocaleString()} · peak premium return vs the 10:00 ET surfacing fill · y = share of contracts
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-sm max-w-xl mx-auto py-2">
        Everything we sell lives between these two charts. The ceiling was{' '}
        <em className="text-primary not-italic font-semibold">really there</em> — and
        the floor is what happens if you never choose an exit. Which contracts, and
        when to leave: that&apos;s analysis.{' '}
        <em className="text-primary not-italic font-semibold">That&apos;s your agent&apos;s job.</em>
      </p>

      {/* Chart B — the floor */}
      <Card className="bg-card/50">
        <CardContent className="p-5 md:p-6">
          <h3 className="font-bold font-headline">The floor — if you never exit at all</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-6">
            The same pool held all the way to settlement, no exit rule. Most
            options die; a right tail doesn&apos;t.
          </p>
          {nExpiry > 0 ? (
            <>
              <Histogram buckets={expiryBuckets} total={nExpiry} negativeCount={lossBucketCount} />
              <p className="text-[10px] font-mono text-muted-foreground text-right mt-1">
                N = {nExpiry.toLocaleString()} · premium return held to expiration (settlement intrinsic) · blue = loss side, gold = gain side
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Settlement marks are accruing — this chart fills as expired
              contracts are marked against their underlying&apos;s closing price.
            </p>
          )}
        </CardContent>
      </Card>

      {/* accessibility / receipts: the same data as tables */}
      <details className="max-w-2xl mx-auto">
        <summary className="cursor-pointer text-center text-[11px] font-mono text-muted-foreground">
          view these distributions as tables
        </summary>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <BucketTable title="Peak before expiration" buckets={peakBuckets} total={nPeak} />
          <BucketTable title="Held to expiration" buckets={expiryBuckets} total={nExpiry} />
        </div>
      </details>

      <p className="text-[11px] text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
        Peak figures are realized per-contract extremes — profit{' '}
        <strong className="text-foreground">potential</strong>, not a return anyone
        earned; nobody exits at the top. Distributions exclude{' '}
        {noEntry.toLocaleString()} contracts too illiquid to price cleanly at entry,{' '}
        {notYetExpired.toLocaleString()} not yet expired or awaiting the nightly
        labeler{otherExcluded > 0
          ? `, and ${otherExcluded.toLocaleString()} whose labeling failed`
          : ''}{' '}
        — all counted, none hidden. Paper-trading data, educational only. Not
        investment advice.
      </p>
    </div>
  );
}
