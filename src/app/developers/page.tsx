import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TOOL_COUNT, PRICE_MONTHLY } from "@/lib/constants";

const MCP_ENDPOINT = "https://gammarips-mcp-406581297632.us-central1.run.app/mcp";

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

const toolGroups: { group: string; blurb: string; tools: { name: string; description: string }[] }[] = [
  {
    group: "Live pool",
    blurb: "Today's curated candidates, structured for machine reasoning.",
    tools: [
      { name: "get_enriched_signals", description: "The curated pool for a scan date: thesis, technicals, flow, and recommended contract per name. Served from the leakage-safe enriched view." },
      { name: "get_signal_detail", description: "Deep dive on one ticker: full narrative enrichment (news, thesis, catalyst) plus point-in-time features and the recommended contract." },
      { name: "get_overnight_signals", description: "The raw overnight scan across 5,230+ tickers, before curation. Filter by direction, score, or ticker." },
      { name: "get_freemium_preview", description: "A minimal public teaser of the top pool names: ticker, direction, score, headline. The taste, not the meal." },
    ],
  },
  {
    group: "Research substrate",
    blurb: "The deep data a human never browses. This is what you're paying for.",
    tools: [
      { name: "get_pool_features", description: "Point-in-time feature vectors for the labeled candidate pool: every field knowable at selection time, nothing after." },
      { name: "get_opportunity_surface", description: "Realized excursion surfaces per historical setup: how far each contract actually ran (peak) and drew down (trough), so your agent learns what was possible." },
      { name: "query_outcomes", description: "Query the labeled outcome database across horizons, dates, tickers, and feature filters: the raw material for your agent's own research." },
      { name: "get_outcome_summary", description: "Cohort-shaped aggregate outcomes (grouped by delta bucket, momentum, horizon…) with sample sizes attached." },
      { name: "estimate_exit_rule", description: "Simulate a target/stop/horizon exit rule against the historical pool. Test YOUR exit idea before your money meets it." },
      { name: "get_regime_context", description: "Point-in-time volatility regime for a scan date: VIX vs VIX3M, SPY trend, and the engine's regime rail evaluated on those values." },
    ],
  },
  {
    group: "Methodology",
    blurb: "How the engine thinks, as playbooks your agent can execute.",
    tools: [
      { name: "list_playbooks", description: "List the published methodology playbooks." },
      { name: "get_playbook", description: "Fetch one playbook in markdown, including the bracket-tournament selection pattern your agent can run against your own objective." },
    ],
  },
  {
    group: "Performance & receipts",
    blurb: "The track record, queryable, including the unflattering parts.",
    tools: [
      { name: "get_signal_performance", description: "Forward outcome tracking per enriched signal: signal-level results across the whole pool, not a curated highlight reel." },
      { name: "get_win_rate_summary", description: "Aggregate underlying-direction statistics for the broad pool over a lookback window, with the caveats attached." },
      { name: "get_position_history", description: "Closed trades from the paper-trading validation cohort's ledger." },
      { name: "get_historical_performance", description: "Ledger aggregates by window, direction, and policy version." },
    ],
  },
  {
    group: "Reports & metadata",
    blurb: "Context and contracts.",
    tools: [
      { name: "get_daily_report", description: "The full daily intelligence report (markdown): the editorial synthesis of the scan." },
      { name: "get_report_list", description: "List available daily reports." },
      { name: "get_available_dates", description: "Which scan dates have data." },
      { name: "get_enriched_signal_schema", description: "The machine-readable data contract: every substrate column with its leakage classification and as-of boundary." },
    ],
  },
  {
    group: "Reference & external",
    blurb: "Utilities that kill hallucination classes.",
    tools: [
      { name: "get_market_calendar_status", description: "Is the US market open today? Deterministic NYSE calendar. Holidays and early closes included." },
      { name: "get_signal_explainer", description: "Plain-English definition of any GammaRips signal field." },
      { name: "web_search", description: "Google web search for real-time fact verification and grounding." },
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
                with a 7-day free trial. Your API key arrives by email shortly
                after you subscribe.
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
                <span className="text-primary">get_enriched_signals · get_opportunity_surface · get_playbook</span>
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
    pool = await client.call_tool("get_enriched_signals", {})
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
