import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { POOL_HIT_RATES, RECEIPTS_DISCLAIMER, int, pct, signedPct } from '@/lib/receipts';

// Pool hit rates: how often pool contracts hit a profit level within the
// 3-trading-day window. A TOUCH, never profit kept (forbidden claim 1).
// stopTouch30 is exit-lab context, framed as the reason the exit plan matters.

function HitStat({ level, value, featured = false }: { level: string; value: string; featured?: boolean }) {
  return (
    <Card className={featured ? 'bg-primary/5 border-primary/40 text-center' : 'bg-card/50 text-center'}>
      <CardContent className="p-5">
        <div className="text-3xl md:text-4xl font-bold font-headline text-primary tabular-nums">{value}</div>
        <p className="text-sm text-muted-foreground mt-2 leading-snug">
          hit <strong className="text-foreground">{level}</strong> within {POOL_HIT_RATES.horizon}
        </p>
      </CardContent>
    </Card>
  );
}

export function PoolHitRates() {
  const h = POOL_HIT_RATES;
  return (
    <section className="space-y-6" aria-labelledby="pool-hit-rates-heading">
      <div className="text-center space-y-3">
        <h2 id="pool-hit-rates-heading" className="text-2xl md:text-3xl font-bold font-headline">
          The pool moves. Here is how often, and how far.
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Every pool contract with a closed {h.horizon} window, measured from the
          10:00 ET entry. This is the history your AI sets its targets from.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <HitStat level="+25%" value={pct(h.hit25, 1)} />
        <HitStat level="+50%" value={pct(h.hit50, 1)} featured />
        <HitStat level="+100%" value={pct(h.hit100, 1)} />
      </div>

      <p className="text-xs font-mono text-muted-foreground text-center">
        N = {int(h.n)} pool contracts · {h.windowLabel} · {h.scanDays} scan days ·
        median peak {signedPct(h.medianPeak, 1)}
      </p>

      <div className="max-w-2xl mx-auto rounded-lg border bg-card/50 p-5 space-y-3">
        <h3 className="font-bold font-headline text-lg">Why the exit plan matters</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {pct(h.stopTouch30, 1)} of the same {int(h.n)} contracts also touched
          −30% inside the same window. Most contracts move both ways, so the
          exit plan your AI sets decides the result. That is what the exit lab
          is for: your AI reads these touch rates for any target and any stop,
          scores the bracket on past pool contracts, and sets both before entry.{' '}
          <Link href="/developers" className="text-primary hover:underline">
            Connect your AI
          </Link>
          .
        </p>
        <p className="text-xs text-muted-foreground">
          A hit is a touch: the option premium traded at that level at some point
          in the window. It is a measure of how far contracts moved, not profit
          kept by any account.
        </p>
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        {RECEIPTS_DISCLAIMER} Pool figures are tracked on a paper basis.
      </p>
    </section>
  );
}
