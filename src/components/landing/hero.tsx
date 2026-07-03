import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
        curates it down to a small, high-signal pool — served to Claude,
        ChatGPT, or your own agent over MCP. Your agent analyzes. You decide.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        5,230 tickers scanned nightly · curated bullish pool · every number leakage-checked · public paper-traded receipts
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg">
          <Link href="/developers">Connect Your Agent &rarr;</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/signals">Browse Today&apos;s Pool — Free</Link>
        </Button>
      </div>
    </section>
  );
}
