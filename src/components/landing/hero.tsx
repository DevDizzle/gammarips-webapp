import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PRICE_MONTHLY } from '@/lib/constants';

export function Hero() {
  return (
    <section className="py-12 md:py-20 text-center container px-4">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
        Agentic Trading
      </p>
      <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 tracking-tight">
        Stop asking AI for stock picks.
        <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Start giving it real data.
        </span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
        GammaRips scans 5,230+ tickers overnight for unusual options flow and
        curates it down to a small, high-signal pool, served to Claude,
        ChatGPT, or your own agent over MCP. Your agent analyzes. You decide.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        5,230+ tickers scanned nightly · curated bullish pool · no hindsight data · public paper-traded receipts
      </p>

      {/*
        Static agent-session visual for launch. When the YouTube walkthrough is
        recorded, swap this whole block for the iframe (no CSP in this repo blocks
        the embed; do NOT self-host the bytes, apphosting runs maxInstances: 1):

        <div className="max-w-3xl mx-auto mb-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-primary/30">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/VIDEO_ID"
              title="A morning with GammaRips"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      */}
      <div className="max-w-3xl mx-auto mb-3">
        <div className="w-full overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-card to-background text-left">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" aria-hidden="true" />
            <span className="text-xs font-mono text-muted-foreground">
              your agent + gammarips-mcp
            </span>
          </div>
          <div className="p-4 md:p-6 font-mono text-xs md:text-sm space-y-2.5 leading-relaxed">
            <p>
              <span className="text-primary font-semibold">you</span>
              <span className="text-muted-foreground"> ▸ </span>
              anything worth a look in the pool today?
            </p>
            <div className="flex flex-wrap gap-1.5 py-1">
              {['get_regime_context()', 'get_pool(view="enriched")', 'query_outcomes()'].map(
                (tool) => (
                  <code
                    key={tool}
                    className="text-[10px] md:text-xs px-1.5 py-0.5 rounded bg-background/80 border text-primary"
                  >
                    {tool}
                  </code>
                )
              )}
            </div>
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">agent</span>
              <span> ▸ </span>
              Regime rail passes. 42 bullish names in the pool. Three
              mid-delta setups have the cleanest flow. Their outcomes range
              widely: strong peaks on the winners, most fade without an exit
              plan. Which risk profile do you want to dig into?
            </p>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mb-6">
        Illustrative agent session. Not live data, not a recommendation.
      </p>

      <p className="text-base md:text-lg text-foreground max-w-2xl mx-auto mb-2">
        I trade my own tool every morning. {PRICE_MONTHLY}/mo gets your agent the same data.
      </p>
      <p className="text-xs text-muted-foreground max-w-2xl mx-auto mb-8">
        That is my own process, not a signal to follow. Your agent reasons over
        the same data and reaches its own conclusion. The public receipts are
        paper-traded and educational only.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg">
          <Link href="/pricing">Start Your 7-Day Free Trial &rarr;</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/signals">Browse Today&apos;s Pool, Free</Link>
        </Button>
      </div>
    </section>
  );
}
