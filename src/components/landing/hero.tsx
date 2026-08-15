import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PRICE_MONTHLY, TOOL_COUNT } from '@/lib/constants';

const LAYERS = [
  {
    eyebrow: 'The data, over MCP',
    title: `${PRICE_MONTHLY}/mo, 7-day trial`,
    desc: `All ${TOOL_COUNT} tools, 4 of them pro: the curated overnight pool, per-contract liquidity, the outcome history of past setups, and exit-rule replay. It answers three questions. Can I get in? Can I get out? What did this setup do before?`,
  },
  {
    eyebrow: 'The harness, open source',
    title: 'Free. Clone it.',
    desc: 'Three Claude Code commands. /trade screens the pool and ranks candidates or says no-trade. /review scores every pool name after the close. /coach reads your own record back to you. The exit plan exists before the entry.',
  },
  {
    eyebrow: 'Your agent',
    title: 'Claude Code, Codex, Cursor, Gemini CLI, Claude, ChatGPT, Grok',
    desc: 'It reasons over the data to its own contract, sized to your risk. There is no pick endpoint, on purpose. A thousand users, a thousand different conclusions. All seven clients read the free tier today. The paid tools run where the client can send a key.',
  },
];

export function Hero() {
  return (
    <section className="py-12 md:py-20 text-center container px-4">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
        Options-flow data for AI agents
      </p>
      <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 tracking-tight">
        MCP + harness
        <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          = agentic trading.
        </span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
        Stop asking AI for stock picks. Give your agent real options-flow data
        over MCP, and a free open-source loop that makes the exit plan exist
        before the entry. Your agent analyzes. You decide.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        3,500+ optionable US stocks scanned nightly · curated bullish pool · no hindsight data · public paper-traded receipts
      </p>

      {/* The three layers of the product statement. Data is paid, the loop is
          free, the agent is yours. Kept to one line each on purpose. */}
      <div className="max-w-3xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
        {LAYERS.map((layer) => (
          <div key={layer.title} className="rounded-xl border bg-card/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              {layer.eyebrow}
            </p>
            <p className="font-bold font-headline text-base mb-1">{layer.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{layer.desc}</p>
          </div>
        ))}
      </div>

      {/*
        Static agent-session visual for launch. When the YouTube walkthrough is
        recorded, swap this whole block for the iframe (no CSP in this repo blocks
        the embed; do NOT self-host the bytes, apphosting runs maxInstances: 1):

        <div className="max-w-3xl mx-auto mb-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-primary/30">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
              loading="lazy"
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
          <Link href="#connect">Connect your agent &rarr;</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/signals">Browse Today&apos;s Pool, Free</Link>
        </Button>
      </div>
    </section>
  );
}
