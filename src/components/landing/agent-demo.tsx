import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TOOL_COUNT } from '@/lib/constants';

// Static, clearly-labeled illustrative MCP session. No live data, no buy
// instruction: the agent ends in analysis, per the forbidden-claims list.
const turns = [
  {
    role: 'you',
    text: 'Anything worth a look in the GammaRips pool this morning?',
  },
  {
    role: 'agent',
    tools: ['get_regime_context()', 'get_pool(view="enriched")'],
    text: 'Regime rail passes (VIX below VIX3M). The curated pool has 42 bullish names today. Filtering to mid-delta contracts with clean flow, three stand out. Pulling their history…',
  },
  {
    role: 'agent',
    tools: ['query_outcomes(view="surface")', 'query_outcomes(view="summary")'],
    text: 'Setups like candidate #2 (delta 0.31, momentum-positive, $2.1M directional flow) have historically shown a wide range of outcomes: strong peaks on the winners, but roughly two-thirds fade without an exit plan. Here are all three with their outcome distributions and the caveats. Which risk profile do you want me to dig into?',
  },
];

export function AgentDemo() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {turns.map((t, i) =>
          t.role === 'you' ? (
            <div key={i} className="flex justify-end">
              <div className="bg-primary/15 border border-primary/30 rounded-lg px-4 py-2.5 max-w-[85%] text-sm">
                {t.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="bg-muted/60 border rounded-lg px-4 py-2.5 max-w-[85%] space-y-2">
                {t.tools && (
                  <div className="flex flex-wrap gap-1.5">
                    {t.tools.map((tool) => (
                      <code
                        key={tool}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background/80 border text-primary"
                      >
                        {tool}
                      </code>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
              </div>
            </div>
          )
        )}
      </div>
      <p className="text-[11px] text-muted-foreground text-center leading-tight">
        Illustrative session. Not live data, not a recommendation. Your agent
        reasons over the real pool and reaches its own conclusions.
      </p>
      <div className="flex justify-center">
        <Button asChild size="sm" variant="outline">
          <Link href="/developers">See all {TOOL_COUNT} MCP tools &rarr;</Link>
        </Button>
      </div>
    </div>
  );
}

export function AgentDemoCard() {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-6">
        <AgentDemo />
      </CardContent>
    </Card>
  );
}
