import Link from 'next/link';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  HARNESS_REPO,
  MCP_ENDPOINT,
  MCP_PRO_ENDPOINT,
  PRICE_MONTHLY,
  TRIAL_DAYS,
} from '@/lib/constants';

// The spine of the homepage: nothing to trading, in four steps, in the order
// a real person does them. Every command here is verified against the
// gammarips-harness README and .mcp.json. Keep them in lockstep. There is no
// plugin step: the plugin is not shipped.

function Code({ children }: { children: string }) {
  return (
    <pre className="p-3 bg-muted rounded text-xs md:text-sm text-left overflow-x-auto whitespace-pre-wrap break-words font-mono text-primary">
      <code>{children}</code>
    </pre>
  );
}

function Step({
  n,
  title,
  badge,
  children,
}: {
  n: number;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card/60 p-5 md:p-6">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="h-7 w-7 shrink-0 rounded-full bg-primary/15 text-primary text-sm font-bold flex items-center justify-center">
          {n}
        </span>
        <h3 className="text-xl font-bold font-headline">{title}</h3>
        {badge && (
          <Badge variant="outline" className="text-[10px]">
            {badge}
          </Badge>
        )}
      </div>
      <div className="space-y-3 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export function StartHere() {
  return (
    <section id="start" className="scroll-mt-24">
      <h2 className="text-2xl md:text-3xl font-bold font-headline text-center text-balance mb-3">
        From nothing to trading, in four steps.
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-8">
        Step one costs nothing and takes about ten seconds. Do that first, and
        decide whether the data is worth anything to you.
      </p>

      <div className="max-w-3xl mx-auto space-y-4">
        <Step n={1} title="Try the data free" badge="no key, no card">
          <p>
            Point any MCP client at the free endpoint. In Claude Code that is
            one command.
          </p>
          <Code>{`claude mcp add --transport http gammarips ${MCP_ENDPOINT}`}</Code>
          <p>Then ask your agent for this morning&apos;s brief.</p>
          <p>
            Free tools: pool preview, daily report, regime context, market
            calendar, and the methodology playbooks.
          </p>

          {/* What the answer looks like. Free-tier tools only, and it ends in
              a question, never a buy instruction. */}
          <div className="w-full overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-card to-background text-left">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2">
              <span
                className="h-2.5 w-2.5 rounded-full bg-green-500/80"
                aria-hidden="true"
              />
              <span className="text-xs font-mono text-muted-foreground">
                your agent + gammarips
              </span>
            </div>
            <div className="p-4 font-mono text-xs md:text-sm space-y-2.5 leading-relaxed">
              <p className="text-foreground">
                <span className="text-primary font-semibold">you</span>
                <span className="text-muted-foreground"> ▸ </span>
                give me this morning&apos;s brief.
              </p>
              <div className="flex flex-wrap gap-1.5 py-1">
                {[
                  'get_market_calendar_status()',
                  'get_regime_context()',
                  'get_daily_report()',
                  'get_pool()',
                ].map((tool) => (
                  <code
                    key={tool}
                    className="text-[10px] md:text-xs px-1.5 py-0.5 rounded bg-background/80 border text-primary"
                  >
                    {tool}
                  </code>
                ))}
              </div>
              <p>
                <span className="text-primary font-semibold">agent</span>
                <span> ▸ </span>
                The market opens on a normal schedule. The VIX term rail
                passes. Last night&apos;s pool holds 44 bullish names, one
                out-of-the-money call each. Here is the overnight context and
                the pool preview. Do you want me to work through the names by
                sector, or by how far out of the money the calls sit?
              </p>
            </div>
          </div>
          <p className="text-[11px]">
            Illustrative agent session. Not live data, not a recommendation.
          </p>

          <p>
            Using Cursor, Codex, Gemini CLI, ChatGPT, Claude or Grok instead?{' '}
            <Link href="#connect" className="text-primary hover:underline">
              Exact steps for every client
            </Link>
            .
          </p>
        </Step>

        <Step n={2} title="Clone the harness" badge="open source, free">
          <p>
            The harness is the daily loop: a screen, a journal, and an
            after-the-close review. Clone it, then open it in Claude Code or
            any MCP client that reads{' '}
            <code className="text-primary">.mcp.json</code>.
          </p>
          <Code>{`git clone ${HARNESS_REPO}.git\ncd gammarips-harness`}</Code>
          <p>
            It is a workflow, not a signal service. The harness is free. The
            data is what costs money.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href={HARNESS_REPO} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" /> See it on GitHub
            </Link>
          </Button>
        </Step>

        <Step
          n={3}
          title="Subscribe for the pro tools"
          badge={`${PRICE_MONTHLY}/mo, ${TRIAL_DAYS}-day trial`}
        >
          <p>
            Start the trial on the{' '}
            <Link href="/pricing" className="text-primary hover:underline">
              pricing page
            </Link>
            . Create your key on the{' '}
            <Link href="/account" className="text-primary hover:underline">
              account page
            </Link>
            . It is shown once, so copy it then.
          </p>
          <Code>{`export GAMMARIPS_MCP_KEY="<your key>"`}</Code>
          <p>
            The harness reads that variable from your shell. Never hardcode the
            key.
          </p>
          <p>
            Pro tools: liquidity grading, per-name signal detail, outcomes
            history, contract replay, and the full pool. The harness screens
            tradeability before it considers a story, so the loop needs them.
          </p>
          <p>
            A chat client that cannot send a header adds{' '}
            <code className="text-primary break-all">{MCP_PRO_ENDPOINT}</code>{' '}
            instead and signs in.
          </p>
          <Button asChild size="sm">
            <Link href="/pricing">Start your {TRIAL_DAYS}-day trial</Link>
          </Button>
        </Step>

        <Step n={4} title="Trade with your agent">
          <p>Three commands, run in the harness.</p>
          <Code>{`/trade    morning: screen the pool, rank a short list or call no-trade
/review   after the close: score every pool name, not only yours
/coach    on demand: your own record, read back to you`}</Code>
          <p>
            Your agent reaches its own contract and its own exit, sized to your
            risk. There is no pick endpoint, on purpose. Two agents on the same
            pool should reach different answers.
          </p>
          <p>Paper-traded by default. Educational only, not investment advice.</p>
        </Step>
      </div>
    </section>
  );
}
