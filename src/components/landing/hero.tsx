import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PRICE_MONTHLY, TRIAL_DAYS } from '@/lib/constants';

// The fold does one job: say what this is, and send the visitor into the
// four-step path below (#start). Everything that used to live here (the
// three product cards, the agent transcript, the founder line) moved to the
// step or the section where it earns its place.
export function Hero() {
  return (
    <section className="py-12 md:py-20 text-center container px-4">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
        Options-flow data for AI agents
      </p>
      <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 tracking-tight">
        Stop asking AI for stock picks.
        <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Start giving it real data.
        </span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
        Every night we rank the US options market by liquidity. Your agent gets
        a small pool of contracts it can actually trade, plus the history of
        what setups like them did. Your agent analyzes. You decide.
      </p>
      <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-8">
        about 3,500 optionable US stocks ranked nightly · a bullish pool of
        roughly 40 to 50 calls · no hindsight data · outcomes published, wins
        and losses
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg">
          <Link href="#start">Connect your agent &rarr;</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/signals">Browse the pool free</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        The whole website is free. The free MCP tier needs no card and no key.
        Agent Access is {PRICE_MONTHLY}/mo with a {TRIAL_DAYS}-day trial.
      </p>
    </section>
  );
}
