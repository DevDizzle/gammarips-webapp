import Link from 'next/link';
import { Button } from '@/components/ui/button';

// How the dataset is filtered every trading night: Stage 1 deterministic
// liquidity, spread, convexity, and volatility gates. No performance promises,
// no daily pick—just clean, tradable option contracts served over MCP.

const CHAIN = [
  'most liquid US option chains',
  'Mid >= $1.00 & OI >= 500+',
  'Penny-Program tick-normalized spreads',
  'Delta 0.22–0.48 & DTE 10–45',
  'Realized vs Implied Vol (RV/IV >= 0.85)',
  'nightly MCP dataset',
];

export function PoolRule() {
  return (
    <section id="how" className="scroll-mt-24">
      <h2 className="text-2xl md:text-3xl font-bold font-headline text-center text-balance mb-3">
        Stage 1: Deterministic Liquidity, Convexity &amp; Volatility Gates
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-8">
        The Catalyst Lab filter runs every trading night so your AI agent only
        reasons over liquid, tradable option contracts.
      </p>

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {CHAIN.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="rounded-full border bg-card/60 px-3 py-1.5 text-xs md:text-sm font-mono">
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
            Stage 1 enforces hard execution gates before an agent ever sees a
            candidate: <code className="text-xs text-foreground">Mid &gt;= $1.00</code>,{' '}
            <code className="text-xs text-foreground">OI &gt;= 500+</code>, and
            Penny-Program tick-normalized spreads across the most liquid US
            option chains. Thin books and wide bid-ask quotes are dropped
            upfront.
          </p>
          <p>
            Every surviving contract is screened for convexity and volatility
            value—requiring <code className="text-xs text-foreground">Delta 0.22–0.48</code>,{' '}
            <code className="text-xs text-foreground">DTE 10–45</code>, and
            Realized-vs-Implied Volatility (
            <code className="text-xs text-foreground">RV/IV &gt;= 0.85</code>)—and
            delivered with point-in-time technicals, flow context, and
            underlying data. Earnings dates are not screened out of the pool, so
            your AI checks each candidate&apos;s earnings date and live catalysts
            before building your trade plan.
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
