import Link from 'next/link';
import { Button } from '@/components/ui/button';

// How the pool is built, stated in one breath. Liquidity decides membership,
// not unusual activity (liquid-universe funnel, live 2026-08-24). The pool is
// not earnings-screened, and copy must never say it is: the AI checks each
// candidate. The contract-quality numbers live in the proof section.

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
        Built for contracts you can actually trade
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-8">
        The engine runs this rule every trading night, at 23:00 ET.
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
            Liquidity decides membership. The engine ranks the most liquid
            names, keeps the bullish ones, and chooses one call in each on
            contract liquidity: deep open interest and real session volume. Your
            AI plans trades it can enter and exit near the quote. If we ranked
            the most liquid contracts instead, you would get SPY and QQQ every
            day.
          </p>
          <p>
            Each contract arrives with its flow data, technicals, catalyst, and
            news context, all point-in-time. Earnings dates are not screened out
            of the pool, so your AI checks each candidate&apos;s earnings date
            before it plans a trade.
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
