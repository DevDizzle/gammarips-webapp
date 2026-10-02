import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, Layers, Target, MessageSquareText } from 'lucide-react';
import { OG_IMAGE, TRIAL_DAYS } from '@/lib/constants';
import {
  CONTRACT_QUALITY,
  INSTALL_LINKS,
  LIVE_RECORD,
  POOL_HIT_RATES,
  RECEIPTS_DISCLAIMER,
  int,
  pct,
  usd,
} from '@/lib/receipts';

const DESCRIPTION =
  'How GammaRips works: every night it ranks about 3,500 optionable US stocks, keeps the 100 most liquid, and selects one bullish call per name on contract liquidity. Your AI gets the pool and the exit lab over MCP and builds the trade plan with you.';

export const metadata: Metadata = {
  title: 'How GammaRips Works | Overnight Options Scan, Step by Step',
  description: DESCRIPTION,
  alternates: { canonical: 'https://gammarips.com/how-it-works' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'How GammaRips Works | Overnight Options Scan',
    description:
      'Better-quality option contracts every night, the history to plan the exit, and your AI builds the trade plan with you. The pipeline, step by step.',
    url: 'https://gammarips.com/how-it-works',
  }
};

const pillars = [
  {
    icon: Layers,
    title: 'Better-quality contracts every night',
    body: 'The 100 most liquid optionable names, bullish only, one call per name chosen on contract liquidity. Deep books you can enter and exit near the quote.',
  },
  {
    icon: Target,
    title: 'The exit lab',
    body: 'How often past pool contracts hit +25%, +50%, and +100% within 3 trading days, and how often they touched a stop. Your AI sets the target and the stop from that history.',
  },
  {
    icon: MessageSquareText,
    title: 'Your AI builds the trade plan',
    body: 'In Claude, ChatGPT, Cursor, or Codex. Candidates, entry, target, stop, and size, built for your account and your risk. You decide.',
  },
];

const qualityRows = [
  {
    label: 'Median open interest',
    before: int(CONTRACT_QUALITY.medianOi.before),
    after: int(CONTRACT_QUALITY.medianOi.after),
  },
  {
    label: 'Median session volume',
    before: int(CONTRACT_QUALITY.medianVolume.before),
    after: int(CONTRACT_QUALITY.medianVolume.after),
  },
  {
    label: 'Open interest of the thinnest 10%',
    before: int(CONTRACT_QUALITY.p10Oi.before),
    after: int(CONTRACT_QUALITY.p10Oi.after),
  },
];

const planSteps = [
  {
    title: 'Checks the session and the pool.',
    body: 'Is the market open, and is tonight’s pool fresh? If the market is closed, your AI plans for the next session.',
  },
  {
    title: 'Checks the regime.',
    body: 'The regime rail passes when VIX is at or below VIX3M. Your AI reads it before it plans a trade.',
  },
  {
    title: 'Reads the pool and shortlists 1 to 3 names.',
    body: 'Each name comes with its thesis, technicals, catalyst, and selected contract. Your AI filters on your own criteria.',
  },
  {
    title: 'Checks each candidate.',
    body: 'Earnings before expiration, and fresh open interest and volume on the exact contract. A name that fails drops out.',
  },
  {
    title: 'Plans the exit from history.',
    body: 'The exit lab gives the touch rates for any target and stop, the typical favorable and adverse moves, and a score for the bracket.',
  },
  {
    title: 'Gives you the plan.',
    body: 'The contract, why it passed, entry near 10:00 ET with a limit order near the mid, target, stop, maximum loss, and a size that keeps that loss inside your risk budget. Or a reasoned no-trade, with the check that failed.',
  },
];

export default function HowItWorksPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How GammaRips Works | Overnight Options Scan, Step by Step",
    "description": DESCRIPTION,
    "image": "https://gammarips.com/og-image.png?v=3",
    "author": { "@type": "Organization", "name": "GammaRips", "url": "https://gammarips.com" },
    "publisher": { "@type": "Organization", "name": "GammaRips", "logo": { "@type": "ImageObject", "url": "https://gammarips.com/og-image.png?v=3" } }
  };

  return (
    <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">How GammaRips works</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
          Better contracts every night. A real trade plan in the AI you already use.
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Every night GammaRips ranks the US options market by liquidity and builds a pool of roughly 40 to 50 calls with deep books. Your AI reads the pool and the exit history over MCP and builds the trade plan with you: candidates, entry, target, stop, and size. You decide.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title} className="bg-card/50">
              <CardContent className="p-5">
                <Icon className="h-6 w-6 text-primary" />
                <h2 className="mt-3 font-bold font-headline text-lg">{p.title}</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{p.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The pipeline, step by step</h2>
        <p className="text-muted-foreground leading-relaxed">
          One rule, run once a night, in this order. Liquidity decides membership. Options flow rides along as context.
        </p>
        <ol className="space-y-3 text-muted-foreground list-decimal list-outside ml-6 leading-relaxed">
          <li><strong className="text-foreground">About 3,500 optionable US stocks.</strong> The starting universe, refreshed weekly and scanned every night.</li>
          <li><strong className="text-foreground">Liquid names only.</strong> The stock traded 3M+ shares that session and its chain carries 25+ listed strikes.</li>
          <li><strong className="text-foreground">The top 100 by combined liquidity rank.</strong> The z-score of chain dollar volume plus the z-score of share volume.</li>
          <li><strong className="text-foreground">Bullish names only.</strong> Calls only.</li>
          <li><strong className="text-foreground">One out-of-the-money call per name, chosen on contract liquidity.</strong> The engine ranks the most liquid names, then selects the most tradeable contract inside each one.</li>
          <li><strong className="text-foreground">A published rank cuts to 50 most days.</strong> Most nights more than 50 bullish names qualify. A deterministic point-in-time rank (delta band, 60-day momentum, a liquidity demotion) keeps 50. It uses no outcome data and no learned weights.</li>
        </ol>
        <p className="text-muted-foreground leading-relaxed">
          The result is a pool of roughly 40 to 50 contracts, live by the open on <Link href="/signals" className="text-primary hover:underline">/signals</Link> (free, no account) and in structured form on the MCP for your AI. This funnel has run since 2026-08-24.
        </p>
        <div className="mt-6 rounded-lg border bg-card/50 p-5 space-y-3">
          <h3 className="font-bold font-headline text-lg">Earnings: your AI checks each candidate</h3>
          <p className="text-sm text-muted-foreground">
            The published pool is not earnings-screened, so a name can report before its contract expires. The trade-plan playbook checks earnings before expiration for every candidate your AI shortlists, and drops the ones that fail.
          </p>
        </div>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">Better-quality contracts, in numbers</h2>
        <p className="text-muted-foreground leading-relaxed">
          Liquid contracts are the ones you can enter and exit near the quote. A thin contract costs you on the way in and again on the way out. Since the liquidity rule went live, the pool contract carries a much deeper book:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-headline font-bold">Pool contract</th>
                <th className="text-right py-2 px-4 font-headline font-bold">Before the rule</th>
                <th className="text-right py-2 pl-4 font-headline font-bold">Since Aug 24, 2026</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {qualityRows.map((r) => (
                <tr key={r.label} className="border-b">
                  <td className="py-2 pr-4">{r.label}</td>
                  <td className="text-right py-2 px-4 tabular-nums">{r.before}</td>
                  <td className="text-right py-2 pl-4 tabular-nums font-semibold text-foreground">{r.after}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 pr-4">No print at the 10:00 ET entry (study)</td>
                <td className="text-right py-2 px-4 tabular-nums">{pct(CONTRACT_QUALITY.noFill.before, 1)}</td>
                <td className="text-right py-2 pl-4 tabular-nums font-semibold text-foreground">{pct(CONTRACT_QUALITY.noFill.after, 1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Since the rule: N = {int(CONTRACT_QUALITY.nAfter)}, {CONTRACT_QUALITY.afterLabel}. Before: N = {int(CONTRACT_QUALITY.nBefore)}, {CONTRACT_QUALITY.beforeLabel} ({CONTRACT_QUALITY.beforeWindow}). The no-print row is a {CONTRACT_QUALITY.noFill.label} (N = {int(CONTRACT_QUALITY.noFill.nBefore)} vs {int(CONTRACT_QUALITY.noFill.nAfter)} contracts), not a live rate, counting a real print inside the 09:55 to 10:15 ET window. Quality here means execution: liquidity, open interest, volume, and fills.
        </p>
        <p className="text-[11px] text-muted-foreground">{RECEIPTS_DISCLAIMER}</p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The exit lab</h2>
        <p className="text-muted-foreground leading-relaxed">
          Pool contracts move a lot, in both directions. Of {int(POOL_HIT_RATES.n)} pool contracts ({POOL_HIT_RATES.windowLabel}), <strong className="text-foreground">{pct(POOL_HIT_RATES.hit50, 1)} hit +50% within {POOL_HIT_RATES.horizon}</strong>, and {pct(POOL_HIT_RATES.stopTouch30, 1)} also touched −30% in the same window. Most contracts move both ways, so the exit plan your AI sets decides the result. The exit lab gives your AI the history to set the target and the stop on purpose, instead of a guess.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Touch rates</h3>
              <p className="text-sm text-muted-foreground mt-1">How often past pool contracts hit each profit level and each stop, with your own filters.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">The opportunity surface</h3>
              <p className="text-sm text-muted-foreground mt-1">For every past pool contract, how far the premium moved in its favor and against it over the 3 trading days after the 10:00 ET entry, with no exit applied.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Bracket scoring</h3>
              <p className="text-sm text-muted-foreground mt-1">Your AI proposes a target, a stop, and a hold. The lab scores that bracket on past pool contracts.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-5">
              <h3 className="font-bold font-headline text-lg">Contract replay</h3>
              <p className="text-sm text-muted-foreground mt-1">The minute or daily price tape of any past pool contract, so your AI can see how a move actually unfolded.</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          A hit is a touch: the premium traded at that level inside the window. The full hit rates are on the <Link href="/scorecard" className="text-primary hover:underline">Track Record</Link>, next to the live agent record ({LIVE_RECORD.wins} of {LIVE_RECORD.trades} real-money trades closed at a profit, {usd(LIVE_RECORD.netUsd)} net, {LIVE_RECORD.windowLabel}).
        </p>
        <p className="text-[11px] text-muted-foreground">{RECEIPTS_DISCLAIMER} Pool figures are tracked on a paper basis.</p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">Your AI builds the trade plan</h2>
        <p className="text-muted-foreground leading-relaxed">
          Ask your AI for a trade. With GammaRips connected, it follows the start-here playbook on the MCP:
        </p>
        <ol className="space-y-3 text-muted-foreground list-decimal list-outside ml-6 leading-relaxed">
          {planSteps.map((s) => (
            <li key={s.title}><strong className="text-foreground">{s.title}</strong> {s.body}</li>
          ))}
        </ol>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Why not one shared trade for everyone?</strong> Shared trades get crowded. A plan your AI builds from the data, for your account and your risk, does not. That is why the MCP serves the pool and the history, and your AI does the planning.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">The nightly clock</h2>
        <div className="p-6 rounded-lg border bg-primary/5 border-primary/20 text-muted-foreground space-y-4 leading-relaxed">
          <p>
            <strong className="text-foreground">23:00 ET:</strong> the scanner walks the universe, prices full option chains across the liquid names, and ranks them. <strong className="text-foreground">Overnight:</strong> the pool is enriched with news context, technical levels, flow dollars, and one contract per name. <strong className="text-foreground">By the open:</strong> the pool is live on <Link href="/signals" className="text-primary hover:underline">/signals</Link> and on the MCP.
          </p>
          <p>
            <strong className="text-foreground">Around 10:00 ET:</strong> the reference entry time. The exit lab measures every past contract from this mark, and your AI can check fresh open interest and volume on any contract before it enters.
          </p>
        </div>
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
          <strong className="text-foreground">How GammaRips uses it.</strong> Since 2026-08-24, membership in the pool is liquidity-based. Flow does not decide who gets in. We still measure it and publish it, because it is useful context for an AI reading a name. It is a column in the data, not a gate in the funnel.
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
            <strong className="text-foreground">Reading it:</strong> the score counts evidence of positioning. It is context for your AI, not a forecast, and it does not rank the pool or decide membership. Its floor of 1 is cosmetic: nearly every liquid name clears it.
          </p>
        </div>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold font-headline">What is agentic trading, and how do you try it?</h2>
        <p className="text-muted-foreground leading-relaxed">
          Agentic trading means your AI (Claude, ChatGPT, Cursor, Codex, or one you build) works as your own options analyst. You give it real data. It reads tonight&apos;s pool, checks how similar contracts moved, sets an exit from that history, and lays out a plan. The decision, the sizing, and the trade stay yours.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          A chatbot without data improvises. Its knowledge froze months ago, and no options-flow data exists in any training set. The fix is a connected model, not a smarter one.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Here is the on-ramp. <strong className="text-foreground">Free, no account:</strong> browse <Link href="/signals" className="text-primary hover:underline">tonight&apos;s pool</Link> and the <Link href="/scorecard" className="text-primary hover:underline">Track Record</Link>. <strong className="text-foreground">Free, no card:</strong> connect any MCP client to the free tier for the pool preview, the daily report, and the playbooks. <strong className="text-foreground">Agent Access:</strong> the full pool, liquidity checks, and the exit lab, so your AI can build the whole trade plan. Setup takes minutes on the <Link href="/developers" className="text-primary hover:underline">For Your Agent</Link> page.
        </p>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section>
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold font-headline text-lg">Your analysis, your account</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  GammaRips publishes options-flow data, a real-money agent record, and educational content. The pool is the output of a mechanical engine, not personalized advice, and anything your AI concludes from the data is your analysis. You trade your own account. GammaRips does not manage your money. Past results do not promise future results. Educational only. Not investment advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12 sm:my-16" />

      <div className="text-center space-y-5">
        <h2 className="text-2xl font-bold font-headline">Put your AI on tomorrow&apos;s pool</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Install GammaRips in the AI you already use, then ask it for a trade plan.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {INSTALL_LINKS.map((l) => (
            <Button key={l.id} asChild variant="outline">
              <Link href={l.href}>Add to {l.label}</Link>
            </Button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/pricing">Start your {TRIAL_DAYS}-day free trial <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/signals">Browse the pool free</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
