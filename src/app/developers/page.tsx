import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TOOL_COUNT, PRICE_MONTHLY } from "@/lib/constants";

const MCP_ENDPOINT = "https://mcp.gammarips.com/mcp";

export const metadata = {
  title: "GammaRips MCP: The Options-Flow Data Layer for AI Agents",
  description:
    `Connect Claude, ChatGPT, or your own agent to ${TOOL_COUNT} MCP tools: the curated overnight options-flow pool, opportunity surfaces, a queryable outcome database, regime context, and methodology playbooks. ${PRICE_MONTHLY}/mo, 7-day free trial.`,
  alternates: { canonical: "https://gammarips.com/developers" },
  openGraph: {
    title: "GammaRips MCP: The Options-Flow Data Layer for AI Agents",
    description:
      `${TOOL_COUNT} MCP tools for AI agents: curated options-flow pool, opportunity surfaces, outcome history, methodology playbooks. ${PRICE_MONTHLY}/mo, 7-day free trial.`,
    url: "https://gammarips.com/developers",
  },
};

const webApiSchema = {
  "@context": "https://schema.org",
  "@type": "WebAPI",
  name: "GammaRips MCP",
  description:
    `Model Context Protocol (MCP) server for AI agents: ${TOOL_COUNT} tools covering the curated overnight options-flow pool, point-in-time feature vectors, opportunity surfaces (realized excursion distributions), a queryable outcome database, exit-rule simulation, regime context, methodology playbooks, and daily reports. Requires a bearer API key (${PRICE_MONTHLY}/mo subscription, 7-day free trial). Data on a paper-trading basis, not investment advice.`,
  url: MCP_ENDPOINT,
  documentation: "https://gammarips.com/developers",
  provider: {
    "@type": "Organization",
    name: "GammaRips",
    url: "https://gammarips.com",
  },
};

type Tier = "free" | "pro" | "free-preview";
const TIER_LABEL: Record<Tier, string> = {
  free: "Free",
  pro: "Pro",
  "free-preview": "Free preview · Pro full",
};

const toolGroups: {
  group: string;
  blurb: string;
  tools: { name: string; tier: Tier; description: string }[];
}[] = [
  {
    group: "The pool",
    blurb: "Today's curated candidates, structured for machine reasoning.",
    tools: [
      {
        name: "get_pool",
        tier: "free-preview",
        description:
          "The candidate pool for a scan date, in one tool. view=preview is a free public teaser: ticker, direction, score, headline, flow dollars. The full pool needs a pro key: view=enriched (thesis, technicals, catalyst, a delta-targeted recommended contract, the 60-day momentum feature), view=raw (the wide pre-curation scan), and view=features (point-in-time feature vectors from the leakage-safe view).",
      },
      {
        name: "get_signal",
        tier: "pro",
        description:
          "Deep dive on one ticker. view=detail is the full enriched signal (thesis, catalyst, recommended contract, point-in-time features). view=earnings is the doctrine check: is there an earnings date on or before the contract expiration? The pool can carry earnings-window names, so check each candidate yourself.",
      },
      {
        name: "get_liquidity",
        tier: "pro",
        description:
          "Fresh entry-day liquidity, the read the pool's session-frozen snapshots cannot give you. Pass one contract for its live open interest, session volume, last trade, and greeks, or omit it to batch the whole pool in one call for the 10:00 ET decision window. No bid/ask on the current data plan.",
      },
    ],
  },
  {
    group: "Research substrate",
    blurb: "The deep data a human never browses. This is what you're paying for.",
    tools: [
      {
        name: "query_outcomes",
        tier: "pro",
        description:
          "The realized-outcome and receipts database, one tool with nine views. view=labels and view=summary are row-level and grouped bracket outcomes. view=surface is the opportunity surface: realized peak and drawdown per contract with no exit applied. view=harvest is the touch-probability curve. view=exit_rule scores your own target/stop/horizon. view=positions and view=performance are the paper cohort's receipts. Whole-pool composites under a fixed exit are negative by design; this is a research surface, not a track record.",
      },
      {
        name: "replay_contract",
        tier: "pro",
        description:
          "The raw option price tape for your own entry and exit rule. granularity=minute returns the intraday minute path for one session and, if you pass a bracket, the exact first-crossing sequence. granularity=day returns the daily mark series. This server returns bars; it never simulates or validates an exit for you.",
      },
    ],
  },
  {
    group: "Free context, methodology, and reports",
    blurb: "The reference layer that kills whole classes of hallucination. No key needed.",
    tools: [
      {
        name: "get_regime_context",
        tier: "free",
        description:
          "Point-in-time volatility regime for a scan date: VIX versus VIX3M and the engine's regime rail evaluated on those values.",
      },
      {
        name: "get_market_calendar_status",
        tier: "free",
        description:
          "view=status answers is the US market open today, from the deterministic NYSE calendar with holidays and early closes. view=scan_dates lists which recent scan dates have GammaRips data.",
      },
      {
        name: "get_playbook",
        tier: "free",
        description:
          "Methodology and reference. Pass a name for a playbook in markdown, including the bracket-tournament selection pattern your agent runs against your own objective. Pass field= for the plain-English definition of any signal field. Pass name=schema for the machine-readable data contract: every column with its leakage classification and as-of boundary.",
      },
      {
        name: "get_daily_report",
        tier: "free",
        description:
          "view=report is the full daily intelligence report in markdown, the editorial synthesis of the scan. view=list returns the recent reports.",
      },
    ],
  },
];

export default function DevelopersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApiSchema) }}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-16">
        {/* Hero */}
        <section className="text-center py-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">
            The options-flow data layer for AI agents
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {TOOL_COUNT} MCP tools over the GammaRips engine: the curated
            overnight pool, opportunity surfaces, a queryable outcome database,
            and the methodology itself. Your agent reasons to its own
            conclusions. There is no pick endpoint, on purpose.
          </p>
          <div
            className="p-8 rounded-lg border-2 border-primary bg-card max-w-2xl mx-auto mt-8"
            id="connect"
          >
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold font-headline">Taste it right now: free, no card, no key</h2>
              <pre className="p-3 bg-muted rounded text-sm text-left overflow-x-auto whitespace-pre-wrap break-all"><code>{`claude mcp add --transport http gammarips ${MCP_ENDPOINT}`}</code></pre>
              <p className="text-sm text-muted-foreground">
                The anonymous tier serves the pool preview, daily reports,
                methodology playbooks, and reference tools with zero setup.
                Ask your agent for a morning brief and see what comes back.
              </p>
              <p className="text-muted-foreground">
                The full data layer (outcome history, opportunity surfaces,
                exit-rule simulation, all {TOOL_COUNT} tools) is {PRICE_MONTHLY}/mo
                with a 7-day free trial. After you subscribe, generate your
                API key on your account page. It&apos;s shown once, so copy
                it then.
              </p>
              <Link href="/pricing">
                <Button size="lg">Get Your API Key &rarr;</Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                Works today with Claude Code, Cursor, and any MCP client that
                can send an Authorization header. Consumer claude.ai and
                ChatGPT connector UIs need OAuth. It&apos;s on the roadmap; the
                anonymous tier works everywhere now.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section id="docs" className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Quick Start</h2>
          <div className="bg-muted/30 p-6 rounded-lg border font-mono text-sm overflow-x-auto">
            <div className="space-y-2">
              <div className="flex gap-4">
                <span className="text-muted-foreground">Endpoint:</span>
                <span className="text-foreground break-all">{MCP_ENDPOINT}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Transport:</span>
                <span className="text-foreground">Streamable HTTP (legacy SSE at /sse)</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Auth:</span>
                <span className="text-foreground">Authorization: Bearer &lt;your API key&gt;</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Start with:</span>
                <span className="text-primary">get_pool · query_outcomes · get_playbook</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="text-muted-foreground mb-2"># Claude Code</div>
              <pre className="text-primary overflow-x-auto whitespace-pre-wrap break-all">
{`claude mcp add --transport http gammarips \\
  ${MCP_ENDPOINT} \\
  --header "Authorization: Bearer YOUR_API_KEY"`}
              </pre>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="text-muted-foreground mb-2"># Python (fastmcp)</div>
              <pre className="text-primary overflow-x-auto whitespace-pre-wrap break-all">
{`from fastmcp import Client
from fastmcp.client.transports import StreamableHttpTransport

transport = StreamableHttpTransport(
    "${MCP_ENDPOINT}",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
)
async with Client(transport) as client:
    pool = await client.call_tool("get_pool", {})
    print(pool)`}
              </pre>
            </div>
          </div>
        </section>

        {/* Built-in prompts */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Built-in Prompts</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            The server ships MCP prompts: ready-made workflows your agent can
            run over the tools. None of them returns a pick; each ends in a
            decision surface you reason about.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-base text-primary">morning_brief</CardTitle>
                <CardDescription>
                  Regime check → today&apos;s pool → historical context by delta
                  bucket → a briefing of the most interesting candidates, with
                  data caveats.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-base text-primary">analyze_candidate</CardTitle>
                <CardDescription>
                  Deep-dive one name: enrichment, excursion history, realized
                  labels of similar setups, and the honest risks.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-base text-primary">run_your_own_tournament</CardTitle>
                <CardDescription>
                  The engine&apos;s bracket-tournament selection pattern, run by
                  YOUR agent against YOUR objective, horizon, and risk
                  tolerance.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Available Tools */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline">{TOOL_COUNT} Tools</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Every tool is leakage-checked: nothing your agent reads contains
              information that wasn&apos;t knowable at the time it&apos;s dated.
              The outcome database behind these tools holds 3,000+ labeled
              contracts across 50+ scan days: every pool candidate since
              April 2026, growing every trading day. Full parameter schemas are
              self-describing over MCP.
            </p>
          </div>

          {toolGroups.map((g) => (
            <div key={g.group} className="space-y-3">
              <div className="flex items-baseline gap-3">
                <h3 className="text-lg font-bold font-headline">{g.group}</h3>
                <span className="text-xs text-muted-foreground">{g.blurb}</span>
              </div>
              <div className="grid gap-3">
                {g.tools.map((t) => (
                  <Card key={t.name}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="font-mono text-base text-primary shrink-0">{t.name}</CardTitle>
                        <Badge variant={t.tier === "pro" ? "default" : "secondary"} className="shrink-0 whitespace-nowrap">
                          {TIER_LABEL[t.tier]}
                        </Badge>
                      </div>
                      <CardDescription>{t.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Pricing */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg border bg-card relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-foreground text-background text-xs font-bold rounded">
                FREE
              </div>
              <div className="text-sm text-muted-foreground mb-2">The Website</div>
              <div className="text-3xl font-bold mb-4">$0</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Today&apos;s curated pool, human-readable</li>
                <li>✓ Daily reports + per-ticker deep dives</li>
                <li>✓ Public scorecard + the Lab</li>
                <li>✓ Methodology + full disclosures</li>
                <li>✓ Free forever, not a trial</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border-2 border-primary bg-card relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
                THE PRODUCT
              </div>
              <div className="text-sm text-primary mb-2">Agent Access (MCP)</div>
              <div className="text-3xl font-bold mb-4">
                {PRICE_MONTHLY}<span className="text-base text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ All {TOOL_COUNT} tools + the built-in prompts</li>
                <li>✓ Opportunity surfaces + outcome database</li>
                <li>✓ Exit-rule simulation + regime context</li>
                <li>✓ Methodology playbooks</li>
                <li>✓ 7-day free trial · cancel anytime</li>
              </ul>
              <Link href="/pricing" className="block mt-4">
                <Button className="w-full">Get Your API Key &rarr;</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-bold font-headline">Give your agent something real to reason over</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A chatbot with no data improvises. An agent with the pool, the
            surfaces, and the methodology does analysis. Connect yours in
            minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/pricing">
              <Button size="lg">Start the 7-Day Free Trial &rarr;</Button>
            </Link>
            <a
              href="https://x.com/GammaRips"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg">
                Follow @GammaRips on X
              </Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-muted/5">
        <div className="container px-4 mx-auto text-center space-y-4">
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/mcp.json" className="hover:text-primary">
              mcp.json
            </Link>
            <Link href="/llms.txt" className="hover:text-primary">
              llms.txt
            </Link>
            <Link href="/.well-known/ai-plugin.json" className="hover:text-primary">
              ai-plugin.json
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Contact:{" "}
            <a
              href="mailto:evan@gammarips.com"
              className="underline hover:text-foreground"
            >
              evan@gammarips.com
            </a>
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Data on a paper-trading basis, educational only. Not investment
            advice. Past performance is not a guarantee of future results.
          </p>
        </div>
      </footer>
    </div>
  );
}
