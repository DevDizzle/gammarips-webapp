import {
  CONTRACT_QUALITY,
  LIVE_RECORD,
  POOL_HIT_RATES,
  RECEIPTS_DISCLAIMER,
  int,
  pct,
  usd,
} from '@/lib/receipts';
import { InstallCta } from '@/components/landing/install-cta';

// The first screen sells the product: the value in one headline and one
// subline, the three owner-approved headline numbers (each with its N and
// window), then the one path: install in your AI, then start the trial. Every
// number comes from src/lib/receipts.ts. This section shows performance
// numbers, so the disclaimer sits here too (forbidden claim 5).

// Derived from the constants, never typed: "about 1 in 3" and "5x".
const HIT50_ONE_IN = Math.round(1 / POOL_HIT_RATES.hit50);
const OI_MULTIPLE = Math.round(
  CONTRACT_QUALITY.medianOi.after / CONTRACT_QUALITY.medianOi.before,
);

const STATS = [
  {
    value: `${LIVE_RECORD.wins} of ${LIVE_RECORD.trades}`,
    label: `real-money trades closed at a profit, ${usd(LIVE_RECORD.netUsd)} net`,
    meta: `Claude Code trading the GammaRips pool. Every trade, entries ${LIVE_RECORD.windowLabel}.`,
  },
  {
    value: pct(POOL_HIT_RATES.hit50, 1),
    label: `of pool contracts hit +50% within ${POOL_HIT_RATES.horizon}, about 1 in ${HIT50_ONE_IN}`,
    meta: `N=${int(POOL_HIT_RATES.n)}, ${POOL_HIT_RATES.windowLabel}.`,
  },
  {
    value: `${OI_MULTIPLE}x`,
    label: `the open interest: median ${int(CONTRACT_QUALITY.medianOi.after)} per contract vs ${int(CONTRACT_QUALITY.medianOi.before)} before the liquidity rule`,
    meta: `N=${int(CONTRACT_QUALITY.nAfter)} ${CONTRACT_QUALITY.afterLabel} vs N=${int(CONTRACT_QUALITY.nBefore)} over ${CONTRACT_QUALITY.beforeLabel}.`,
  },
];

export function Hero() {
  return (
    <section className="pt-2 pb-6 md:pt-4 md:pb-8 text-center">
      <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-primary mb-3">
        Options data for your AI agent
      </p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline tracking-tight text-balance mb-4">
        Better option contracts.
        <span className="block mt-1 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          A real trade plan, in the AI you already use.
        </span>
      </h1>
      <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-6 text-balance">
        Every trading night, your AI gets fresh calls with deep books from the
        100 most liquid US stocks, and the history to set the target and the
        stop. It builds the plan with you. You decide.
      </p>

      <div className="grid gap-3 sm:grid-cols-3 max-w-4xl mx-auto mb-6 text-left">
        {STATS.map((s) => (
          <div key={s.value} className="rounded-xl border bg-card/60 p-4">
            <p className="text-3xl md:text-4xl font-bold font-headline text-primary">
              {s.value}
            </p>
            <p className="text-sm text-foreground mt-1 leading-snug">{s.label}</p>
            <p className="text-[11px] text-muted-foreground mt-2 leading-snug">
              {s.meta}
            </p>
          </div>
        ))}
      </div>

      <InstallCta />

      <p className="text-[11px] text-muted-foreground mt-4 max-w-2xl mx-auto">
        {RECEIPTS_DISCLAIMER}
      </p>
    </section>
  );
}
