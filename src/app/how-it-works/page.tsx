import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { OG_IMAGE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'How GammaRips Works | Overnight Options Scan, Step by Step',
  description:
    'The whole funnel, step by step: about 3,500 optionable US names cut to the 100 most liquid, bullish names only, one out-of-the-money call each. Liquidity decides membership, not unusual activity.',
  alternates: { canonical: 'https://gammarips.com/how-it-works' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'How GammaRips Works | Overnight Options Scan',
    description: 'From about 3,500 optionable US names to a bullish pool of roughly 40 to 50 calls, ranked on liquidity. The rule, the rails, and the things we do not claim.',
    url: 'https://gammarips.com/how-it-works',
  }
};

export default function HowItWorksPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How GammaRips Works | Overnight Options Scan, Step by Step",
    "description": "From about 3,500 optionable US names to a bullish pool of roughly 40 to 50 calls, ranked on liquidity. The rule, the rails, and the things we do not claim.",
    "image": "https://gammarips.com/og-image.png?v=3",
    "author": { "@type": "Organization", "name": "GammaRips", "url": "https://gammarips.com" },
    "publisher": { "@type": "Organization", "name": "GammaRips", "logo": { "@type": "ImageObject", "url": "https://gammarips.com/og-image.png?v=3" } }
  };

  return (
    <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Learn</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
          How GammaRips Works
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Every night the engine ranks the most liquid optionable US names and hands your agent a small bullish pool of calls it can actually trade. Membership is decided by liquidity, not by unusual activity. Here is the whole rule, end to end, plus the parts we do not claim.
        </p>
      </header>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The rule, in one breath</h2>
        <p className="text-muted-foreground leading-relaxed">
          You should be able to restate the whole selection rule from memory. That is the point. Six steps, run once a night, in this order:
        </p>
        <ol className="space-y-3 text-muted-foreground list-decimal list-outside ml-6 leading-relaxed">
          <li><strong className="text-foreground">About 3,500 optionable US names.</strong> The starting universe. It is refreshed weekly.</li>
          <li><strong className="text-foreground">Traded 3M+ shares that session.</strong> Thin names come off first. A stock nobody traded does not have an option market either.</li>
          <li><strong className="text-foreground">Chain carries 25+ listed strikes.</strong> A shallow chain is not a market you can work an order in.</li>
          <li><strong className="text-foreground">Top 100 by combined liquidity rank.</strong> The rank is the z-score of chain dollar volume plus the z-score of share volume. Nothing else goes into it.</li>
          <li><strong className="text-foreground">Bullish names only.</strong> A hard gate since 2026-06-11. Calls only.</li>
          <li><strong className="text-foreground">One out-of-the-money call per name.</strong> The contract inside each name is chosen on contract liquidity, not on how unusual the print was.</li>
        </ol>
        <p className="text-muted-foreground leading-relaxed">
          What comes out is a pool of roughly 40 to 50 contracts, published every morning on <Link href="/signals" className="text-primary hover:underline">/signals</Link> and, in structured form, on the MCP for connected agents. This funnel went live 2026-08-24.
        </p>
        <div className="mt-6 rounded-lg border bg-card/50 p-5 space-y-3">
          <h3 className="font-bold font-headline text-lg">Two things worth saying out loud</h3>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">The cap of 50 does not bind.</strong> There is a ceiling of 50 in the code, and on current pool sizes it never gets reached. So the pool is simply every bullish name in the top-100 liquid universe. No hidden ranking decides who makes it.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">We rank the most liquid names, then choose a contract inside each.</strong> We do not rank the most liquid contracts in the market. That list would be SPY and QQQ every single day.
          </p>
        </div>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The two safety rails</h2>
        <p className="text-muted-foreground leading-relaxed">
          Two rails run over the pool in the morning. They remove risk, they do not hunt for winners:
        </p>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4 leading-relaxed">
          <li><strong className="text-foreground">Earnings exclusion.</strong> Any ticker reporting earnings during the hold is dropped. Holding options through an earnings report is a documented way to lose money.</li>
          <li><strong className="text-foreground">VIX &le; VIX3M.</strong> Short-term fear must sit at or below long-term fear. If VIX runs above VIX3M, the rail fails closed and the engine stands down for the day.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Some days the rails clear the board, or the pool comes up empty. The engine stands down. No forced trade, no fallback. Skipping is correct behavior.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">What we publish</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">The pool</h3>
              <p className="text-sm text-muted-foreground mt-1">Every contract that cleared the funnel, with its flow context, technicals, and news attached. Free to read on <Link href="/signals" className="text-primary hover:underline">/signals</Link>, no account.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">The opportunity surface</h3>
              <p className="text-sm text-muted-foreground mt-1">For each contract, what was actually reachable: the realized maximum favorable and maximum adverse excursion over the 3 trading days after entry. The exit stays a free variable, because it is your agent&apos;s decision.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">The outcome history</h3>
              <p className="text-sm text-muted-foreground mt-1">Every pool contract tracked to its real result, losers counted the same way as winners, on the public <Link href="/scorecard" className="text-primary hover:underline">Track Record</Link>.</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          The product is the data layer: the pool, the surfaces, and the methodology. There is no pick.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The daily clock</h2>
        <div className="p-6 rounded-lg border bg-primary/5 border-primary/20 text-muted-foreground space-y-4 leading-relaxed">
          <p>
            <strong className="text-foreground">23:00 ET:</strong> the scanner walks the universe, prices full option chains across the liquid names, and ranks them. <strong className="text-foreground">Overnight:</strong> the survivors are enriched with news context, technical levels, flow dollars, and one contract per name. <strong className="text-foreground">By the open:</strong> the pool is live on <Link href="/signals" className="text-primary hover:underline">/signals</Link> and on the MCP.
          </p>
          <p>
            <strong className="text-foreground">Around 09:50 ET:</strong> the two rails run, plus a live liquidity re-check that drops any contract too thinly traded to enter and exit. A dropped candidate does not come back. Then the engine&apos;s private paper cohort takes one name and trades it under fixed mechanical rules, so the method is measured against real tape every market day.
          </p>
        </div>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">Executability is the only measured improvement</h2>
        <p className="text-muted-foreground leading-relaxed">
          The funnel used to select on unusual activity. It turned out to select contracts that were <em>harder</em> to trade than ordinary liquid ones, because unusual volume in a thin name is one large print, not a market you can exit. We measured the old funnel against the liquid universe on the same tape:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-headline font-bold">Measured on the same tape</th>
                <th className="text-right py-2 px-4 font-headline font-bold">Old funnel</th>
                <th className="text-right py-2 pl-4 font-headline font-bold">Liquid universe</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4">No fill at 10:00 ET</td>
                <td className="text-right py-2 px-4 tabular-nums">40.5%</td>
                <td className="text-right py-2 pl-4 tabular-nums">6.1%</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Tradeable by 10:00 ET</td>
                <td className="text-right py-2 px-4 tabular-nums">17.9%</td>
                <td className="text-right py-2 pl-4 tabular-nums">63.1%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">The conditions travel with the numbers.</strong> 60 trading days ending 2026-08-14, on minute-path tape, counting a real print inside the 09:55 to 10:15 ET window. Those are study rates measured on that window. The funnel went live 2026-08-24 and has not been forward-validated yet, so this is not a live fill rate and we will not present it as one.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Better fills are not better returns. What changed is that your agent can get in and out at the price it sees. That is worth paying for on its own, and it is the only improvement we measured.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">What we do not claim</h2>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">No selection edge.</strong> Two pre-registered studies on 2026-08-22 tested the pool against matched random optionable contracts on the same tape. The pool measured indistinguishable from random. So this is not a list of better contracts, and we will not call it one.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Buying the whole pool under a fixed exit loses money.</strong> The whole-pool composite is negative, we measured it, and we publish it on the <Link href="/scorecard" className="text-primary hover:underline">Track Record</Link>. That single fact is why there is no pick endpoint anywhere in this product. A pool average is not a strategy. The winners are in the pool, the excursion data shows they were reachable, and finding them is analysis. That work belongs to your agent and to you.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">So what is the value?</strong> Two things. Your agent can actually fill the contracts it reasons about. And it gets the historical surface, wins and losses, to reason with.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">What is unusual options activity?</h2>
        <p className="text-muted-foreground leading-relaxed">
          Unusual options activity (UOA) is options volume that runs far above normal levels for a particular stock. It can mean institutional traders, such as hedge funds, pension funds, or large trading desks, are building new positions.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The usual indicators are the <strong className="text-foreground">volume-to-open-interest ratio</strong> (fresh activity against positions already on the books), <strong className="text-foreground">dollar flow</strong> (how much capital moved), and <strong className="text-foreground">directional imbalance</strong> (calls against puts).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Here is how GammaRips uses it, plainly.</strong> Since 2026-08-24, membership in the pool is liquidity-based. Flow does not decide who gets in. We still measure it and we still publish it, because it is useful context for an agent reading a name. It is a column in the data, not a gate in the funnel.
        </p>
        <div id="conviction-score" className="mt-6 rounded-lg border bg-card/50 p-5 space-y-3 scroll-mt-24">
          <h3 className="font-bold font-headline text-lg">The flow score, in plain English</h3>
          <p className="text-sm text-muted-foreground">
            Each name in the pool carries a 0 to 10 flow score. It is a checklist, not a model. The scanner asks a few plain questions about where option money went:
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-outside ml-4">
            <li><strong className="text-foreground">One-sided money.</strong> Option dollars piled onto one side, calls well over puts.</li>
            <li><strong className="text-foreground">New money.</strong> The day&apos;s trading against the positions already on the books. Fresh bets, not old ones adjusting.</li>
            <li><strong className="text-foreground">Built like an institution.</strong> Buying spread across several strikes, not one lottery ticket.</li>
            <li><strong className="text-foreground">Size of the new positioning.</strong> How many dollars landed on that side.</li>
            <li><strong className="text-foreground">The stock moved too.</strong> Whether the price confirmed with a real move on the day.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Small bonuses when the money bets against the tape, such as heavy call buying on a red day, or when a whole industry lights up the same direction at once.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Reading it:</strong> the score counts evidence of positioning. It is not a prediction, higher is not automatically better, and it does not rank the pool or decide membership. There is a floor of 1 and it is cosmetic. Nearly every liquid name clears it. We publish the score as context, and that is all it is.
          </p>
        </div>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The private paper cohort</h2>
        <p className="text-muted-foreground leading-relaxed">
          One name a day gets paper-traded as a measurement instrument. It is the operator&apos;s private signal and it is not published. There is no public pick, no pick card, and no pick endpoint on the MCP. What is public is the <em>whole pool&apos;s</em> outcome record on the <Link href="/scorecard" className="text-primary hover:underline">Track Record</Link>.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The cohort picks its one name with a <strong className="text-foreground">randomized bracket tournament</strong>. Three independent brackets each shuffle the pool into a fresh random order and reduce it in batches of 10 or fewer. A language model advances the top 2 from each batch, round after round, until one name is left. The three bracket winners are then compared: 3 of 3 agree is high confidence, 2 of 3 is medium, 1 of 3 is low. No memory, no rubric, no weights. Every candidate is checked for hindsight data before the model sees it, and any error fails closed.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The tournament runs one deliberately rigid exit bracket, so the method is measured under fixed, unfudgeable rules:
        </p>
        <ul className="space-y-2 text-muted-foreground list-disc list-inside ml-4 leading-relaxed">
          <li><strong className="text-foreground">Entry:</strong> 10:00 ET at market.</li>
          <li><strong className="text-foreground">Stop:</strong> &minus;30% option price.</li>
          <li><strong className="text-foreground">Target:</strong> +40% option price.</li>
          <li><strong className="text-foreground">Hold:</strong> the same trading day. Nothing carries overnight.</li>
          <li><strong className="text-foreground">Exit:</strong> 15:45 ET at market if stop and target both go untouched.</li>
          <li><strong className="text-foreground">Conservative tiebreak:</strong> if one bar touches both stop and target, the stop wins.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          One honest caveat, straight from <Link href="/lab" className="text-primary hover:underline">the Lab</Link>: a fixed bracket like this is a measurement instrument, not a strategy. Our own research shows the same contracts produce very different outcomes under different exits. That is exactly why the MCP ships an exit-rule simulator instead of a rule to copy.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The tournament pattern itself is published as a <strong className="text-foreground">methodology playbook on the MCP</strong> (<code className="text-primary text-sm">run_your_own_tournament</code>), so a connected agent can run it against <em>your</em> objective, horizon, and risk tolerance instead of the engine&apos;s fixed one.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">What is agentic trading, and how do you try it?</h2>
        <p className="text-muted-foreground leading-relaxed">
          Agentic trading means using an AI agent (Claude, ChatGPT, or one you build)
          as your own market analyst instead of following someone else&apos;s calls. You don&apos;t ask
          it for a pick. You give it real data. It reasons over the whole surface: today&apos;s
          pool, how similar contracts actually resolved, and how stressed the market is.
          Then it lays out the picture. The judgment, the sizing, and the trade stay yours.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The catch most people discover the hard way: a chatbot without data will happily improvise.
          Ask a raw model about a ticker&apos;s options flow and you get confident fiction. Its
          knowledge froze months ago, and no options-flow data exists in any training set. The fix is
          not a smarter model. It is a connected one.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Here&apos;s the on-ramp, cheapest step first. <strong className="text-foreground">Step 1 (free,
          no account):</strong> browse <Link href="/signals" className="text-primary hover:underline">today&apos;s
          pool</Link> and the <Link href="/scorecard" className="text-primary hover:underline">Track
          Record</Link> yourself. That is the same data your agent would reason over.{' '}
          <strong className="text-foreground">Step 2 (free, no card):</strong> point any MCP-capable
          agent at our server&apos;s anonymous tier and let it taste the pool preview, daily reports, and
          methodology playbooks. <strong className="text-foreground">Step 3 (the full data
          layer):</strong> with <Link href="/developers" className="text-primary hover:underline">Agent
          Access</Link>, your agent queries the complete outcome history, opportunity surfaces, and
          exit-rule simulator, and can even run our bracket-tournament selection pattern against
          your own objective. Setup for all three takes minutes, and the{' '}
          <Link href="/developers" className="text-primary hover:underline">For Your Agent</Link> page
          walks you through it.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section>
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold font-headline text-lg">Signals vs. trade recommendations</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  GammaRips publishes options-flow data, paper-trading performance, and educational content. Every signal and ledger row is the output of a mechanical engine, not personalized advice, and anything your AI agent concludes from the data is your analysis. You trade your own account; GammaRips does not manage your money. Past performance does not guarantee future results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12 sm:my-16" />

      <div className="text-center">
        <h2 className="text-2xl font-bold font-headline mb-4">Put an agent on tomorrow&apos;s pool</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/developers">Connect your agent <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/scorecard">See the Track Record</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
