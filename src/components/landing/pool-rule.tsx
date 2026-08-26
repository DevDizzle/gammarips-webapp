import Link from 'next/link';
import { Button } from '@/components/ui/button';

// The selection rule, stated in one breath. Liquidity decides membership, not
// unusual activity (liquid-universe funnel, live 2026-08-24). The fill numbers
// are STUDY numbers on a stated window, never a live property of the pool.

const CHAIN = [
  'about 3,500 optionable US stocks',
  'traded 3M+ shares that session',
  'chain carries 25+ listed strikes',
  'top 100 by combined liquidity rank',
  'bullish names only',
  'one out-of-the-money call each',
  'a pool of roughly 40 to 50',
];

export function PoolRule() {
  return (
    <section id="how" className="scroll-mt-24">
      <h2 className="text-2xl md:text-3xl font-bold font-headline text-center text-balance mb-3">
        You can restate the whole rule in one breath.
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-8">
        This runs every trading night, at 23:00 ET.
      </p>

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {CHAIN.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="rounded-full border bg-card/60 px-3 py-1.5 text-xs md:text-sm">
                {step}
              </span>
              {i < CHAIN.length - 1 && (
                <span className="text-primary" aria-hidden="true">
                  &rarr;
                </span>
              )}
            </span>
          ))}
        </div>

        <div className="space-y-3 text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            Two safety rails guard the paper cohort&apos;s entry, not this
            list. The cohort drops any name with earnings in its hold window
            and stands down when the VIX sits above VIX3M. The pool you browse
            is not earnings-screened, so check each candidate yourself.
          </p>
          <p>
            Liquidity decides membership. Not unusual activity. Flow gives your
            agent context, and it does not choose the pool. We rank the most
            liquid names and then choose one contract inside each. If we ranked
            the most liquid contracts instead, you would get SPY and QQQ every
            day.
          </p>
          <p>
            We moved the scan to liquidity first because the old funnel picked
            contracts that were harder to trade. On the 60 trading days ending
            2026-08-14, the share of candidates with no fill at 10:00 ET
            measured 40.5% under the old funnel and 6.1% under this one. Those
            are study numbers on that window. They are not a property of
            today&apos;s pool, and they are not a claim about returns.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button asChild variant="outline">
            <Link href="/methodology">Read the full methodology</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/how-it-works">See how the engine works</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
