import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
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
        GammaRips scans 5,000+ tickers overnight for unusual options flow and
        curates it down to a small, high-signal pool, served to Claude,
        ChatGPT, or your own agent over MCP. Your agent analyzes. You decide.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        5,230 tickers scanned nightly · curated bullish pool · no hindsight data · public paper-traded receipts
      </p>

      {/*
        Video slot. Poster placeholder until the YouTube asset is recorded.
        When the video is ready, replace the placeholder div below with the
        YouTube iframe (no CSP in this repo blocks the embed; do NOT self-host
        the bytes, apphosting runs maxInstances: 1):

        <iframe
          className="absolute inset-0 h-full w-full"
          src="https://www.youtube.com/embed/VIDEO_ID"
          title="A morning with GammaRips"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-card to-background">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <PlayCircle className="h-14 w-14 text-primary/80" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              A morning with GammaRips
            </p>
            <p className="text-xs text-muted-foreground max-w-md">
              Watch the routine: the engine curates the pool, my agent picks a
              contract at run time, and I place the trade on my own account.
              Video coming soon.
            </p>
          </div>
        </div>
      </div>

      <p className="text-base md:text-lg text-foreground max-w-2xl mx-auto mb-2">
        I trade my own tool every morning. {PRICE_MONTHLY}/mo gets your agent the same data.
      </p>
      <p className="text-xs text-muted-foreground max-w-2xl mx-auto mb-8">
        That is my own process, not a signal to follow. Your agent reasons over
        the same data and reaches its own conclusion. Paper-trading data,
        educational only.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg">
          <Link href="/developers">Connect Your Agent &rarr;</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/signals">Browse Today&apos;s Pool, Free</Link>
        </Button>
      </div>
    </section>
  );
}
