import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { PoolOutcomes, LifeBucket } from '@/lib/firebase-admin';
import { RECEIPTS_DISCLAIMER } from '@/lib/receipts';

// The Track Record, told simply (owner call 2026-07-08: "simple simple simple").
// Three plain-English story blocks with big "X out of 10" numbers and ONE
// simple picture; every chart, quantile, and table lives behind a
// "see the full data" fold. All numbers render live from
// pool_outcomes/current.life — nothing hardcoded, so the story stays true as
// contracts expire. No average ROI, no win rate, anywhere.

const pct = (f: number | null | undefined, signed = true) =>
  f == null ? '—' : `${signed && f > 0 ? '+' : ''}${Math.round(f * 100)}%`;

const share = (n: number | undefined, total: number | undefined) =>
  !n || !total ? 0 : n / total;

/** "6 out of 10" phrasing for a 0-1 share. Extremes say so instead of
 *  rounding a performance-adjacent number toward the flattering side. */
const outOf10 = (s: number) => {
  const n = Math.round(s * 10);
  if (n < 1) return 'fewer than 1 out of 10';
  if (n > 9) return 'more than 9 out of 10';
  return `${n} out of 10`;
};

/** "1 out of 6" phrasing for a small 0-1 share. */
const oneOutOf = (s: number) => (s > 0 ? `1 out of ${Math.max(Math.round(1 / s), 2)}` : '—');

function BigStat({ value, caption }: { value: string; caption: string }) {
  return (
    <Card className="bg-card/50 text-center">
      <CardContent className="p-5">
        <div className="text-3xl md:text-4xl font-bold font-headline text-primary">{value}</div>
        <p className="text-sm text-muted-foreground mt-2 leading-snug">{caption}</p>
      </CardContent>
    </Card>
  );
}

function TimingBar({ label, s }: { label: string; s: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-44 sm:w-52 text-sm text-right shrink-0">{label}</span>
      <div className="flex-1 h-6 rounded bg-primary/10">
        <div
          className="h-full rounded bg-primary/85"
          style={{ width: `${Math.max(s * 100, 2)}%` }}
          role="img"
          aria-label={`${label}: ${Math.round(s * 100)}%`}
        />
      </div>
      <span className="w-12 font-mono text-sm tabular-nums">{Math.round(s * 100)}%</span>
    </div>
  );
}

function Histogram({
  buckets,
  total,
  negativeCount = 0,
}: {
  buckets: LifeBucket[];
  total: number;
  negativeCount?: number;
}) {
  const maxShare = Math.max(...buckets.map((b) => share(b.n, total)), 0.01);
  return (
    <div>
      <div className="flex items-end gap-2 sm:gap-3 h-44 relative">
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

  if (!life || !(life.n_peak ?? 0)) {
    return (
      <Card className="bg-card/50">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          The record is filling in. Every contract joins it the evening after
          its option expires. Check back shortly.
        </CardContent>
      </Card>
    );
  }

  // Null-safe reads: a partially-written doc must degrade, never 500.
  const nPeak = life.n_peak ?? 0;
  const nExpiry = life.n_expiry ?? 0;
  const processed = life.processed ?? 0;
  const noEntry = life.no_entry_excluded ?? 0;
  const peakBuckets = life.peak_buckets ?? [];
  const expiryBuckets = life.expiry_buckets ?? [];
  const lossBucketCount = expiryBuckets.filter((b) => /^[<≤]?−/.test(b.label)).length;

  const touched40 = share(life.peak_ge_40, nPeak);
  const touched100 = share(life.peak_ge_100, nPeak);
  // Held-to-the-end wipeouts: the writer's first expiry bucket is "<−90%".
  const wipedOut = share(expiryBuckets[0]?.n, nExpiry);

  // Peak timing (trading day the contract hit its best price; day 1 = the
  // morning we surfaced it).
  const nPeakDay = life.n_peak_day ?? 0;
  const early = share(life.peak_day_1_3, nPeakDay);
  const middle = share(life.peak_day_4_12, nPeakDay);
  const late = share(life.peak_day_13_plus, nPeakDay);

  const notYetExpired = Math.max((outcomes?.contracts_total ?? 0) - processed, 0);
  const otherExcluded = Math.max(processed - noEntry - nPeak, 0);

  return (
    <div className="space-y-16">
      {/* ---- Story 1: most contracts had a moment ---- */}
      <section className="space-y-5">
        <h2 className="text-2xl md:text-3xl font-bold font-headline text-center">
          Most pool contracts had a moment before expiration.
        </h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto">
          We follow every contract we surface, from the 10:00 ET fill on the
          morning we surfaced it through to expiration, with no exit rule
          applied. Nothing gets edited out.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <BigStat value={outOf10(touched40)} caption="were up +40% or better at some point" />
          <BigStat value={`1 in 2`} caption={`were up ${pct(life.peak_median)} or more at their best moment`} />
          <BigStat value={outOf10(touched100)} caption="doubled at some point" />
        </div>
        <p className="text-xs font-mono text-muted-foreground text-center">
          full-life window, no exit rule · all {nPeak.toLocaleString()} contracts
          that have expired so far, {life.first_scan_date ?? 'n/a'} to{' '}
          {life.last_scan_date ?? 'n/a'} · updated daily · includes contracts
          from the funnel before 2026-08-24
        </p>
      </section>

      {/* ---- Story 2: when the wins show up ---- */}
      {nPeakDay > 0 && (
        <section className="space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-center">
            The best moment usually comes early.
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto">
            When did each contract hit its best price, counting from the morning
            we surfaced it? Day 1 is that morning.
          </p>
          <div className="max-w-2xl mx-auto space-y-3">
            <TimingBar label="In the first 3 days" s={early} />
            <TimingBar label="Within the next two weeks" s={middle} />
            <TimingBar label="Later than that" s={late} />
          </div>
          <p className="text-muted-foreground text-center max-w-xl mx-auto">
            Most best moments come early. Even so, about {oneOutOf(late)}{' '}
            contracts does not hit its best price until more than two weeks in.
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
            This chart is the full-life window, from the morning we surfaced
            each contract to expiration. The hit rates above use a 3-trading-day
            window. Match the window to the hold your AI plans.
          </p>
        </section>
      )}

      {/* ---- Story 3: the exit plan makes the result ---- */}
      <section className="space-y-4 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold font-headline">
          The exit plan is where the result gets made.
        </h2>
        <p className="text-muted-foreground">
          The moves are real, and they are temporary. The typical
          contract&apos;s worst moment along the way was{' '}
          {pct(life.trough_median)} from the fill, even when it also had a big
          up moment. Held all the way to expiration with no exit, about{' '}
          <strong className="text-foreground">{outOf10(wipedOut).replace(' out of 10', ' out of every 10')}</strong>{' '}
          finished down 90% or more.
        </p>
        <p className="text-muted-foreground">
          A target and a stop set before entry decide how much of a move a
          trade keeps. Your AI sets both from the exit lab. The live agent at
          the top of this page sets both before every entry.
        </p>
        <p className="text-foreground font-semibold">
          Building a pool you can actually trade is our job. The trade plan is
          yours and your AI&apos;s.
        </p>
      </section>

      {/* ---- The full data, folded away ---- */}
      <details className="max-w-3xl mx-auto border rounded-lg bg-card/30 px-5 py-4">
        <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground">
          See the full data: charts and tables for people and agents who want the detail
        </summary>
        <div className="space-y-8 pt-6">
          <p className="text-xs text-muted-foreground">
            Every figure below sits in the full-life window: the 10:00 ET
            surfacing fill through to expiration, with no exit rule applied. It
            is a different window from the 3-trading-day hit rates above and
            from the 3-day opportunity surface served over MCP. Compare numbers
            inside one window.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <BigStat value={pct(life.peak_median)} caption="median best moment (peak premium return)" />
            <BigStat value={pct(life.peak_p90)} caption="the top 10% of contracts peaked here or higher" />
            <BigStat value={pct(life.trough_median)} caption="median worst moment along the way" />
            <BigStat value={pct(life.expiry_median)} caption="median value if held to expiration" />
          </div>

          <div>
            <h3 className="font-bold font-headline mb-1">Best moment before expiration</h3>
            <p className="text-xs text-muted-foreground mb-6">
              Each contract&apos;s best price after surfacing, against the 10:00
              ET surfacing price. Share of all {nPeak.toLocaleString()} tracked contracts per bucket.
            </p>
            <Histogram buckets={peakBuckets} total={nPeak} />
          </div>

          {nExpiry > 0 && (
            <div>
              <h3 className="font-bold font-headline mb-1">Value if held to expiration</h3>
              <p className="text-xs text-muted-foreground mb-6">
                The same pool, never sold. Settlement value against the
                surfacing price. Blue = loss side, gold = gain side. N ={' '}
                {nExpiry.toLocaleString()}.
              </p>
              <Histogram buckets={expiryBuckets} total={nExpiry} negativeCount={lossBucketCount} />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <BucketTable title="Best moment before expiration" buckets={peakBuckets} total={nPeak} />
            <BucketTable title="Held to expiration" buckets={expiryBuckets} total={nExpiry} />
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Peak figures are realized per-contract extremes. They are profit
            potential, not a return anyone earned. Nobody sells at the exact
            top. Distributions cover {life.first_scan_date ?? '—'} to{' '}
            {life.last_scan_date ?? '—'} and exclude {noEntry.toLocaleString()}{' '}
            contracts too illiquid to price cleanly at entry,{' '}
            {notYetExpired.toLocaleString()} not yet expired or awaiting the
            nightly labeler
            {otherExcluded > 0 ? `, and ${otherExcluded.toLocaleString()} whose labeling failed` : ''}.
            All counted, none hidden. Cohort break: contracts surfaced before
            the morning of 2026-08-25 (scan dates before 2026-08-24) came from
            the earlier unusual-activity funnel, which the liquid-universe
            funnel replaced. The two are not one population, and
            this record is still mostly the older pool, because a contract
            only joins it after it expires. The research record behind the
            pool, with every study, is on{' '}
            <Link href="/methodology" className="underline underline-offset-2 hover:text-foreground">
              Methodology
            </Link>
            .
          </p>
        </div>
      </details>

      <p className="text-[11px] text-muted-foreground text-center">
        {RECEIPTS_DISCLAIMER} Pool figures are tracked on a paper basis.
      </p>
    </div>
  );
}
