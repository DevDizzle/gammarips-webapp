import Link from 'next/link';
import { Button } from '@/components/ui/button';

// The unflattering numbers, first and in plain sight. This is the conversion
// argument for a technical, scam-weary buyer, and it is why there is no pick
// endpoint. Never soften it, and never pair it with a selected-positive
// number.
export function Honesty() {
  return (
    <section
      id="honesty"
      className="scroll-mt-24 text-center space-y-4 max-w-3xl mx-auto"
    >
      <h2 className="text-3xl font-bold font-headline">
        Read this before you pay us
      </h2>
      <p className="text-muted-foreground">
        If you bought every contract in the pool every morning and closed on one
        fixed same-day rule (in at the 10:00 ET mark, out at +40% or −30%, flat
        by 15:45 ET), you would lose money. We know because we tested it, and we{' '}
        <Link href="/scorecard" className="text-primary hover:underline">
          publish the record
        </Link>
        . That is exactly why there is no pick endpoint. The winners sit inside
        the pool, and the outcome data shows how far each contract ran and how
        far it fell. Which ones, and how they get traded, is analysis. That is
        your agent&apos;s job. Anyone who sells you a shortcut past that step is
        selling you a story.
      </p>
      <p className="text-muted-foreground">
        We also tested whether the pool beats random. Over 87 trading days,
        against liquidity-matched and random optionable controls, we could not
        show that it does. The test can see a difference of about 5 percentage
        points per trade, so read that as no large edge rather than no edge. We
        sell the data layer and the outcome history. We do not sell a ranked
        list.
      </p>
      <p className="text-sm text-muted-foreground">
        I trade my own tool every morning. That is my own process, not a signal
        to follow. The public receipts are paper-traded and educational only.
        See the{' '}
        <Link href="/disclosures" className="text-primary hover:underline">
          disclosures
        </Link>
        .
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Button asChild size="lg">
          <Link href="#start">Connect your agent &rarr;</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/lab">Read the experiments</Link>
        </Button>
      </div>
    </section>
  );
}
