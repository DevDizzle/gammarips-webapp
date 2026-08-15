import Link from 'next/link';
import { Github, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRICE_MONTHLY } from '@/lib/constants';

// The open-source harness is the clone-me GTM artifact for agentic options
// trading. Commands below mirror the real Quickstart in the gammarips-harness
// README (repo: DevDizzle/gammarips-harness); keep them in lockstep. A
// workflow, not a signal service: the harness is free, the MCP data is paid,
// and there is deliberately no pick endpoint.
const HARNESS_REPO = 'https://github.com/DevDizzle/gammarips-harness';

const CLONE = `# 1. Clone the open-source harness
git clone https://github.com/DevDizzle/gammarips-harness.git
cd gammarips-harness

# 2. Subscribe at gammarips.com/pricing, then mint your MCP key at gammarips.com/account
export GAMMARIPS_MCP_KEY="<your key>"

# 3. Open in Claude Code (or any MCP client that reads .mcp.json), then run the loop:
#    /trade    morning: screen the pool, rank 2-3 candidates or no-trade; you decide
#    /review   after the close: score every pool name
#    /coach    on demand: behavioral feedback from your own record`;

export function HarnessCta() {
  return (
    <section id="harness">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary text-center mb-3">
        Open Source
      </p>
      <h2 className="text-2xl md:text-3xl font-bold font-headline text-center text-balance mb-3">
        Clone the exact morning workflow.
      </h2>
      <p className="text-sm md:text-base text-muted-foreground text-center max-w-2xl mx-auto mb-10">
        The harness is the open-source agentic trading loop. Your agent reads the
        curated pool, reasons to one contract candidate a day (or none), designs
        its own exit, and journals every decision. The harness is free. The data
        is the {PRICE_MONTHLY}/mo MCP key. A workflow, not a signal service.
      </p>

      {/* terminal-style clone block */}
      <div className="max-w-2xl mx-auto">
        <div className="w-full overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-card to-background text-left">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" aria-hidden="true" />
            <span className="text-xs font-mono text-muted-foreground">
              gammarips-harness
            </span>
          </div>
          <pre className="p-4 md:p-6 font-mono text-[11px] md:text-sm leading-relaxed overflow-x-auto">
            <code>{CLONE}</code>
          </pre>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Button asChild size="lg">
          <Link href="/pricing">
            Start Your Trial, Get Your Key <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={HARNESS_REPO} target="_blank" rel="noopener noreferrer">
            <Github className="mr-2 h-5 w-5" /> Get the Harness on GitHub
          </Link>
        </Button>
      </div>
    </section>
  );
}
