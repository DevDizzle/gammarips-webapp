import Link from 'next/link';
import { BUILD_STANDARD_PRICE, BUILD_TURNAROUND_DAYS } from '@/lib/constants';
import { InstallCta } from '@/components/landing/install-cta';

// Layer-1 Hero: plain-English problem & outcome above the fold, primary CTA
// immediately visible, clean secondary path to Done-For-You custom builds, and
// three scannable human-readable value pillars underneath.

export function Hero() {
  return (
    <section className="pt-2 pb-4 md:pt-6 md:pb-6 text-center">
      <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-primary mb-3">
        Nightly Market Intelligence for AI Trading Agents
      </p>
      <h1 className="text-3xl sm:text-5xl font-bold font-headline tracking-tight mb-4 max-w-4xl mx-auto">
        Give your AI real market data.
        <span className="block mt-1.5 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Trade stocks, 2x ETFs, or options.
        </span>
      </h1>
      <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-7 leading-relaxed">
        Standard AI chats guess from stale headlines. Every night, GammaRips screens 3,500+ US
        stocks for institutional flow, real liquidity, and volatility value — ready inside Claude,
        ChatGPT, or Cursor in 2 minutes.
      </p>

      <InstallCta />

      <p className="text-xs sm:text-sm text-muted-foreground mt-4">
        Want a turnkey automated bot instead?{' '}
        <Link href="/build" className="text-primary hover:underline font-medium">
          We engineer your custom trading agent in {BUILD_TURNAROUND_DAYS} days ({BUILD_STANDARD_PRICE}) &rarr;
        </Link>
      </p>

      <div className="grid gap-3 sm:grid-cols-3 max-w-4xl mx-auto mt-9 text-left">
        <div className="rounded-xl border bg-card/60 p-4 sm:p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
            Multi-Instrument
          </p>
          <h2 className="text-base font-bold font-headline text-foreground">
            Trade Your Way
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-snug">
            You don&apos;t have to trade options. Every setup maps directly to the underlying stock,
            2x/inverse single-stock ETFs, and a liquid option contract.
          </p>
        </div>

        <div className="rounded-xl border bg-card/60 p-4 sm:p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
            Pre-Filtered Nightly
          </p>
          <h2 className="text-base font-bold font-headline text-foreground">
            Built for Real Order Fills
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-snug">
            Thin order books, wide bid-ask spreads, and short-term lottery tickets are cut before
            your AI ever sees a single setup.
          </p>
        </div>

        <div className="rounded-xl border bg-card/60 p-4 sm:p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
            Risk-First Planning
          </p>
          <h2 className="text-base font-bold font-headline text-foreground">
            Live Liquidity &amp; Move History
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-snug">
            10-minute morning liquidity updates, earnings checks, and 3-day historical move data let
            your AI size entries, targets, and stops around your budget.
          </p>
        </div>
      </div>
    </section>
  );
}
