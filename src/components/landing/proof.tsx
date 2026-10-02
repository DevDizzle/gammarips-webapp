import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CONTRACT_QUALITY,
  LIVE_RECORD,
  LIVE_TRADES,
  POOL_HIT_RATES,
  RECEIPTS_DISCLAIMER,
  int,
  pct,
  signedPct,
  usd,
} from '@/lib/receipts';

// The receipts: the live record, the pool hit rates, and contract quality.
// Every number comes from src/lib/receipts.ts and carries its N and window.
// The live record is a complete cohort (forbidden claim 4): every trade in the
// window renders, wins and losses. A hit rate is a touch of the level, never
// profit kept (claim 1). This section shows performance numbers, so it carries
// the disclaimer (claim 5).

const HIT_LEVELS = [
  { level: '+25%', rate: POOL_HIT_RATES.hit25 },
  { level: '+50%', rate: POOL_HIT_RATES.hit50 },
  { level: '+100%', rate: POOL_HIT_RATES.hit100 },
];

const QUALITY_ROWS = [
  {
    label: 'Median open interest',
    now: int(CONTRACT_QUALITY.medianOi.after),
    before: int(CONTRACT_QUALITY.medianOi.before),
  },
  {
    label: 'Median session volume',
    now: int(CONTRACT_QUALITY.medianVolume.after),
    before: int(CONTRACT_QUALITY.medianVolume.before),
  },
  {
    label: 'Open interest, thinnest 10%',
    now: int(CONTRACT_QUALITY.p10Oi.after),
    before: int(CONTRACT_QUALITY.p10Oi.before),
  },
  {
    label: 'No fill at 10:00 ET (study)',
    now: pct(CONTRACT_QUALITY.noFill.after, 1),
    before: pct(CONTRACT_QUALITY.noFill.before, 1),
  },
];

function ProofCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card/60 p-5 md:p-6 text-left">{children}</div>
  );
}

export function Proof() {
  return (
    <section id="proof" className="scroll-mt-24">
      <h2 className="text-2xl md:text-3xl font-bold font-headline text-center text-balance mb-3">
        Look at the record.
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-8">
        Real-money trades, the history of every pool contract, and the
        contracts themselves. Each number shows its sample size and its window.
      </p>

      <div className="max-w-5xl mx-auto space-y-4">
        {/* Live record: Claude Code trading the pool with real money. */}
        <ProofCard>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            Live record
          </p>
          <h3 className="text-lg font-bold font-headline mb-4">
            Claude Code, trading the GammaRips pool with real money
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div>
              <p className="text-2xl md:text-3xl font-bold font-headline text-primary">
                {LIVE_RECORD.wins} of {LIVE_RECORD.trades}
              </p>
              <p className="text-xs text-muted-foreground">trades closed at a profit</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold font-headline text-primary">
                {usd(LIVE_RECORD.netUsd)}
              </p>
              <p className="text-xs text-muted-foreground">net realized</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold font-headline text-primary">
                {LIVE_RECORD.atTarget} of {LIVE_RECORD.trades}
              </p>
              <p className="text-xs text-muted-foreground">
                closed at the agent&apos;s pre-set target
              </p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold font-headline text-primary">
                {signedPct(LIVE_RECORD.medianPct, 1)}
              </p>
              <p className="text-xs text-muted-foreground">median trade, on premium</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {LIVE_TRADES.map((t) => (
              <span
                key={`${t.entryDay}-${t.contract}`}
                title={`${t.contract}, entry ${t.entryDay}, exit ${t.exitDay} (${t.exitReason})`}
                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                  t.pnlUsd > 0
                    ? 'border-green-500/30 bg-green-500/10 text-green-500'
                    : 'border-red-500/30 bg-red-500/10 text-red-500'
                }`}
              >
                {t.ticker} {signedPct(t.pnlPct)}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Every trade, wins and losses: N={LIVE_RECORD.trades}, entries{' '}
            {LIVE_RECORD.windowLabel}. Realized fills from the broker.
          </p>
        </ProofCard>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Pool hit rates: the exit lab history. */}
          <ProofCard>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              The exit lab
            </p>
            <h3 className="text-lg font-bold font-headline mb-4">
              How far pool contracts ran within {POOL_HIT_RATES.horizon}
            </h3>
            <div className="space-y-3 mb-4">
              {HIT_LEVELS.map((h) => (
                <div key={h.level}>
                  <div className="flex items-baseline justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Hit {h.level}</span>
                    <span className="font-bold font-headline text-foreground">
                      {pct(h.rate, 1)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: pct(h.rate, 1) }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Median peak: {signedPct(POOL_HIT_RATES.medianPeak, 1)}. Contracts
              swing both ways in that window ({pct(POOL_HIT_RATES.stopTouch30, 1)}{' '}
              also touched −30%), so the exit plan decides the result. Your AI
              sets the target and the stop from this history.
            </p>
            <p className="text-[11px] text-muted-foreground">
              N={int(POOL_HIT_RATES.n)} pool contracts, {POOL_HIT_RATES.windowLabel},
              closed {POOL_HIT_RATES.horizon} windows. A hit is a touch of the
              level, not profit kept.
            </p>
          </ProofCard>

          {/* Contract quality: the liquidity rule, before and after. */}
          <ProofCard>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              Better contracts
            </p>
            <h3 className="text-lg font-bold font-headline mb-4">
              Deeper books since the liquidity rule
            </h3>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-left font-normal pb-2" />
                  <th className="text-right font-normal pb-2">Now</th>
                  <th className="text-right font-normal pb-2">Before</th>
                </tr>
              </thead>
              <tbody>
                {QUALITY_ROWS.map((r) => (
                  <tr key={r.label} className="border-t border-border/60">
                    <td className="py-2 text-muted-foreground">{r.label}</td>
                    <td className="py-2 text-right font-bold font-headline text-primary">
                      {r.now}
                    </td>
                    <td className="py-2 text-right text-muted-foreground">{r.before}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-muted-foreground">
              Now: N={int(CONTRACT_QUALITY.nAfter)} {CONTRACT_QUALITY.afterLabel}.
              Before: N={int(CONTRACT_QUALITY.nBefore)} over{' '}
              {CONTRACT_QUALITY.beforeLabel}. No-fill figures come from a{' '}
              {CONTRACT_QUALITY.noFill.label}.
            </p>
          </ProofCard>
        </div>

        <div className="text-center space-y-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/scorecard">
              See every trade on the scorecard <ArrowRight />
            </Link>
          </Button>
          <p className="text-[11px] text-muted-foreground">{RECEIPTS_DISCLAIMER}</p>
        </div>
      </div>
    </section>
  );
}
