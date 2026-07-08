import { Fragment } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

// The four cuts between the close and the open. Counts and thresholds here
// must stay in lockstep with /how-it-works — everything shown is already
// public there. Flavor, not recipe: the exact delta band and edge-rank
// weights stay on the MCP. The funnel ends at the POOL, never the pick.
// The score key below (plain-English checklist, no exact sub-thresholds)
// mirrors the "conviction score, in plain English" section on /how-it-works.
const stages = [
  {
    num: '5,230+',
    unit: 'tickers',
    bar: 100,
    title: 'The whole market goes in',
    desc: 'Every night at 11 PM ET we scan every U.S. stock that trades options. The day’s options activity gets scored while you sleep: how much traded, how big the bets were, and which side the money took.',
  },
  {
    num: '~300',
    unit: 'unusual',
    bar: 44,
    title: 'Big money showed up, or it’s out',
    desc: 'A stock survives this cut only with a conviction score of 4+ and over $500K bet in one direction. That means several independent signs of big money taking a position, not one weird trade.',
    scoreKey: true,
  },
  {
    num: '~50',
    unit: 'strongest',
    bar: 16,
    title: 'Bullish only, then the strongest 50',
    desc: 'A ranking, not another filter. We keep the bullish names and sort them by the one trait that separated winners from losers across 1,375 measured trades: a contract in the middle ground, not a cheap lottery ticket and not an expensive sure thing. Stocks already moving up get a boost. The top 50 make the pool. Hard cap.',
  },
  {
    num: 'The pool',
    unit: 'by the open',
    bar: 16,
    title: 'Live by the open, then the safety checks',
    desc: 'Those ~50 survivors ARE the pool: free to browse, structured for agents. Just before trading starts we check every name for same-day earnings, a stressed market (short-term fear running above long-term fear), and thin live trading. Our own paper-trading validation skips any name that fails. Some days the right move is no trade.',
    final: true,
  },
];

// Static, clearly-labeled example row. Field names are real (they match the
// public /signals/[ticker] pages); the values are illustrative only.
const recordGroups: { group: string; rows: [string, string, string][] }[] = [
  {
    group: 'The flow',
    rows: [
      ['overnight_score', '7', '← the bar is 4; scoring explained in How It Works'],
      ['call_dollar_volume', '$6.8M', '← call dollars traded overnight'],
      ['flow_intent', 'opening_sweep', '← fresh position, not a hedge unwind'],
    ],
  },
  {
    group: 'The contract the flow points at',
    rows: [
      ['recommended_contract', 'AVGO 08/21 $310C', ''],
      ['recommended_delta', '0.34', '← in the middle ground the research favors'],
      ['risk_reward_ratio', '1.18', ''],
    ],
  },
  {
    group: 'The tape & the context',
    rows: [
      ['rsi_14 / sma_50', '58.2 / above', ''],
      ['support / resistance', '291.40 / 316.75', ''],
      ['catalyst_type', 'AI capex cycle', '← plus headline, news summary, thesis…'],
    ],
  },
];

export function CurationFunnel() {
  return (
    <section id="curation">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary text-center mb-3">
        The Curation
      </p>
      <h2 className="text-2xl md:text-3xl font-bold font-headline text-center text-balance mb-3">
        &ldquo;Curated&rdquo; is doing a lot of work in that sentence.
        <br className="hidden sm:block" /> Here&apos;s exactly what it means.
      </h2>
      <p className="text-sm md:text-base text-muted-foreground text-center max-w-2xl mx-auto mb-10">
        Four cuts between the close and the open. Every cut is mechanical and
        the thresholds are public. No discretion, no black box.
      </p>

      {/* The funnel */}
      <div className="max-w-3xl mx-auto">
        {stages.map((stage) => (
          <div key={stage.title} className="grid grid-cols-[92px_1fr] sm:grid-cols-[120px_1fr] gap-3 sm:gap-5">
            <div className={`text-right pt-2 font-mono font-bold tabular-nums text-lg sm:text-xl leading-tight ${stage.final ? 'text-primary' : ''}`}>
              {stage.num}
              <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">
                {stage.unit}
              </span>
            </div>
            <div className={`relative border-l-2 border-primary/35 pl-5 pt-2 ${stage.final ? 'pb-2' : 'pb-7'}`}>
              <span
                className={`absolute -left-[6px] top-[15px] h-2.5 w-2.5 rounded-full border-2 border-primary ${stage.final ? 'bg-primary' : 'bg-background'}`}
              />
              <div className="h-1.5 rounded-full bg-primary/15 mb-2">
                <div className="h-full rounded-full bg-primary/85" style={{ width: `${stage.bar}%` }} />
              </div>
              <h3 className={`font-bold font-headline text-base ${stage.final ? 'text-primary' : ''}`}>
                {stage.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">{stage.desc}</p>
              {stage.scoreKey && (
                <p className="text-sm mt-2">
                  <Link
                    href="/how-it-works#conviction-score"
                    className="font-semibold text-primary hover:underline"
                  >
                    What&apos;s a conviction score? The 30-second version &rarr;
                  </Link>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schema teaser — what one survivor carries */}
      <Card className="max-w-3xl mx-auto mt-10 bg-card/50 overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2 px-5 py-3 border-b bg-muted/40">
          <span className="flex items-center gap-2.5">
            <span className="font-mono font-bold text-sm">AVGO</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/20 text-green-500">
              📈 BULL
            </span>
          </span>
          <span className="text-[10px] font-semibold tracking-widest px-2 py-0.5 rounded bg-muted text-muted-foreground">
            EXAMPLE RECORD
          </span>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] font-mono text-xs tabular-nums">
              <tbody>
                {recordGroups.map((g) => (
                  <Fragment key={g.group}>
                    <tr>
                      <td colSpan={3} className="px-5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                        {g.group}
                      </td>
                    </tr>
                    {g.rows.map(([k, v, note]) => (
                      <tr key={k}>
                        <td className="px-5 py-1 text-muted-foreground whitespace-nowrap w-[210px]">{k}</td>
                        <td className="py-1 whitespace-nowrap">{v}</td>
                        <td className="px-5 py-1 text-primary/70 text-[11px] whitespace-nowrap">{note}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center px-5 py-3 mt-2 border-t">
            Illustrative values, not a live signal and not a recommendation.
            Every name in the pool carries 30+ fields like these, all checked
            so nothing includes hindsight data.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Button asChild size="lg">
          <Link href="/signals">
            Browse Today&apos;s Pool, Free <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/how-it-works">Full methodology</Link>
        </Button>
      </div>
    </section>
  );
}
