import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="py-12 md:py-20 text-center container px-4">
      <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 tracking-tight">
        One options trade a day.
        <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Scored overnight. Pushed to your phone at 9:50 ET — right before the 10:00 entry.
        </span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
        GammaRips watches institutional options flow overnight and mechanically
        picks one contract each morning — stop, target, and exit all pre-set.
        You place the trade at 10:00 ET and go back to your day.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        GammaRips engine · 5,230 tickers scanned nightly · One pick or none · Paper-trading, educational only
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg">
          <Link href="/signals">Today&apos;s Top Signals &rarr;</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/pricing">Start 7-Day Free Trial</Link>
        </Button>
      </div>
    </section>
  );
}
