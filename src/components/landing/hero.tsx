import Link from 'next/link';
import { HARNESS_REPO, MCP_PRO_ENDPOINT } from '@/lib/constants';
import { InstallCta } from '@/components/landing/install-cta';

// The first screen sells the Nightly Filtered Options Dataset via MCP:
// one clear headline, a concise subline, three factual capability pillars
// describing what the Catalyst Lab filter enforces on every contract in the
// dataset, and the primary subscription CTA ("Get Pro MCP Access").

export function Hero() {
  return (
    <section className="pt-2 pb-6 md:pt-4 md:pb-8 text-center">
      <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-primary mb-3">
        Options-Flow &amp; Volatility Intelligence for AI Agents ({MCP_PRO_ENDPOINT.replace('https://', '')})
      </p>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline tracking-tight text-balance mb-4">
        Institutional options intelligence.
        <span className="block mt-1 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Execute via stocks, 2x ETFs, or options in your AI.
        </span>
      </h1>
      <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-6 text-balance">
        Every trading night, GammaRips screens ~3,500 US option chains through strict
        liquidity, convexity, and <code className="text-sm text-foreground">RV/IV</code>{' '}
        gates—streaming candidate stocks, mapped 2x/inverse ETFs, and Combo A option
        contracts to your AI over MCP, or{' '}
        <Link href="/build" className="text-primary hover:underline font-medium">
          custom-engineering your autonomous trading agent in 5 days
        </Link>
        .
      </p>

      <div className="grid gap-3 sm:grid-cols-3 max-w-4xl mx-auto mb-6 text-left">
        <div className="rounded-xl border bg-card/60 p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
            Stage 1 · Execution Quality
          </p>
          <h2 className="text-base md:text-lg font-bold font-headline text-foreground">
            Hard Liquidity &amp; Spread Gates
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-snug">
            <code className="text-xs text-foreground">Mid &gt;= $1.00</code>,{' '}
            <code className="text-xs text-foreground">OI &gt;= 500+</code>, and
            Penny-Program tick-normalized spreads from the most liquid US option
            chains.
          </p>
        </div>

        <div className="rounded-xl border bg-card/60 p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
            Stage 1 · Structure &amp; Vol
          </p>
          <h2 className="text-base md:text-lg font-bold font-headline text-foreground">
            Convexity &amp; Volatility Filter
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-snug">
            <code className="text-xs text-foreground">Delta 0.22–0.48</code>,{' '}
            <code className="text-xs text-foreground">DTE 10–45</code>, and
            Realized-vs-Implied Volatility (
            <code className="text-xs text-foreground">RV/IV &gt;= 0.85</code>)
            screening so your agent only reasons over tradable setups.
          </p>
        </div>

        <div className="rounded-xl border bg-card/60 p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
            Stage 2 · Agentic Workflow
          </p>
          <h2 className="text-base md:text-lg font-bold font-headline text-foreground">
            Built for Your AI Agent &amp; Harness
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-snug">
            Stream the dataset into Claude, ChatGPT, Grok, Cursor, or the
            open-source{' '}
            <Link
              href={HARNESS_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-mono text-xs"
            >
              gammarips-harness
            </Link>{' '}
            to layer on live X/web research and build your trade plan.
          </p>
        </div>
      </div>

      <InstallCta />
    </section>
  );
}
