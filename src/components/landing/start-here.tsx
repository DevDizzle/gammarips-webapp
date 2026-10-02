import Link from 'next/link';
import { TRIAL_DAYS } from '@/lib/constants';

// How it works, in three steps, in the order a buyer walks them: install,
// ask for a trade plan, decide. The tool calls in the session below match the
// MCP start-here playbook (gammarips-mcp content/playbooks/start-here.md).
// Keep them in step. Per-client install detail lives in the connect block
// (#connect).

const STEPS = [
  {
    title: 'Install GammaRips in your AI',
    body: `Add it to Claude, ChatGPT, Cursor, or Codex in about a minute. Start the ${TRIAL_DAYS}-day free trial, then sign in or paste your key, and every pro tool turns on.`,
  },
  {
    title: 'Ask for a trade plan',
    body: 'Your AI reads last night\'s pool, checks fresh liquidity and the earnings date for each candidate, and sets the target and the stop from the exit lab: how often past pool contracts hit each level.',
  },
  {
    title: 'You decide, and place it',
    body: 'You get 1 to 3 candidates, each with entry, target, stop, maximum loss, and a size that fits your risk. Or a reasoned no-trade. You place the order in your own brokerage.',
  },
];

const TOOLS = [
  'get_market_calendar_status()',
  'get_regime_context()',
  'get_pool(view="enriched")',
  'get_signal(view="earnings")',
  'get_liquidity()',
  'query_outcomes(view="harvest")',
];

export function StartHere() {
  return (
    <section id="start" className="scroll-mt-24">
      <h2 className="text-2xl md:text-3xl font-bold font-headline text-center text-balance mb-3">
        How it works
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-8">
        Three steps from install to a trade plan you can act on.
      </p>

      <ol className="grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-xl border bg-card/60 p-5 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-7 w-7 shrink-0 rounded-full bg-primary/15 text-primary text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <h3 className="text-lg font-bold font-headline">{s.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>

      {/* Step 2 in practice. Illustrative only: no live data, no real ticker,
          and it ends in a plan the user decides on, never a buy instruction. */}
      <div className="max-w-3xl mx-auto mt-6">
        <div className="w-full overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-card to-background text-left">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2">
            <span
              className="h-2.5 w-2.5 rounded-full bg-green-500/80"
              aria-hidden="true"
            />
            <span className="text-xs font-mono text-muted-foreground">
              your AI + gammarips
            </span>
          </div>
          <div className="p-4 font-mono text-xs md:text-sm space-y-2.5 leading-relaxed">
            <p className="text-foreground">
              <span className="text-primary font-semibold">you</span>
              <span className="text-muted-foreground"> ▸ </span>
              build me a trade plan for today. Max risk $300.
            </p>
            <div className="flex flex-wrap gap-1.5 py-1">
              {TOOLS.map((tool) => (
                <code
                  key={tool}
                  className="text-[10px] md:text-xs px-1.5 py-0.5 rounded bg-background/80 border text-primary"
                >
                  {tool}
                </code>
              ))}
            </div>
            <p>
              <span className="text-primary font-semibold">AI</span>
              <span> ▸ </span>
              The market is open and the regime rail passes. Two names in last
              night&apos;s pool clear the liquidity and earnings checks. Plan for
              candidate A: limit near the $4.50 mid at about 10:00 ET. Target
              +50% ($6.75), set from the exit lab history. Stop −30% ($3.15).
              Size: 2 contracts, maximum loss $270, inside your $300 budget.
              Want the plan for candidate B too, or will you place this one?
            </p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Illustrative session. Not live data, not a recommendation.
        </p>
        <p className="text-sm text-muted-foreground mt-3">
          Using Gemini CLI, Grok, or another MCP client?{' '}
          <Link href="#connect" className="text-primary hover:underline">
            Install steps for every client
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
