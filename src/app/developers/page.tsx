import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata = {
  title: "GammaRips MCP API — 15 Tools for AI Agents",
  description:
    "Connect any AI agent, research notebook, or trading bot to the V5.3 paper-trading engine. 15 MCP tools, SSE transport, no auth, no key.",
  alternates: { canonical: "https://gammarips.com/developers" },
  openGraph: {
    title: "GammaRips MCP API — 15 Tools for AI Agents",
    description:
      "Connect any AI agent, research notebook, or trading bot to the V5.3 paper-trading engine. 15 MCP tools, no auth.",
    url: "https://gammarips.com/developers",
  },
};

const webApiSchema = {
  "@context": "https://schema.org",
  "@type": "WebAPI",
  name: "GammaRips MCP API",
  description:
    "Model Context Protocol (MCP) API for the V5.3 paper-trading options engine. 15 tools covering today's pick, enriched signals, win-rate summaries, live open position, daily reports, and historical ledger queries.",
  url: "https://gammarips-mcp-406581297632.us-central1.run.app/sse",
  documentation: "https://gammarips.com/developers",
  provider: {
    "@type": "Organization",
    name: "GammaRips",
    url: "https://gammarips.com",
  },
};

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
            Build on the V5.3 Engine
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            One pick a day, 15 MCP tools, no auth. Point your AI agent, research notebook,
            or trading bot at the endpoint and go.
          </p>
          <div
            className="p-8 rounded-lg border-2 border-primary bg-card max-w-2xl mx-auto mt-8"
            id="connect"
          >
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold font-headline">Connect Your Agent</h2>
              <p className="text-muted-foreground">
                The MCP API is free. No API key, no sign-up. Just connect and query.
              </p>
              <code className="block p-3 bg-muted rounded text-sm break-all">
                https://gammarips-mcp-406581297632.us-central1.run.app/sse
              </code>
              <p className="text-sm text-muted-foreground">
                Want the pick pushed to WhatsApp and an AI agent in the group?{" "}
                <Link href="/pricing" className="text-primary hover:underline">
                  Pro is $39/mo with a 7-day free trial →
                </Link>
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
                <span className="text-foreground">
                  https://gammarips-mcp-406581297632.us-central1.run.app/sse
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Transport:</span>
                <span className="text-foreground">SSE (Server-Sent Events)</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Auth:</span>
                <span className="text-foreground">None required</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Primary tool:</span>
                <span className="text-primary">get_todays_pick</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="text-muted-foreground mb-2"># Python (using fastmcp)</div>
              <pre className="text-primary overflow-x-auto whitespace-pre-wrap break-all">
{`from fastmcp import Client

async with Client("https://gammarips-mcp-406581297632.us-central1.run.app/sse") as client:
    pick = await client.call_tool("get_todays_pick", {})
    print(pick)`}
              </pre>
            </div>
          </div>
        </section>

        {/* Available Tools */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">15 Available Tools</h2>
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-mono">get_todays_pick</span> is the primary entry point —
            it returns the single V5.3 pick for today (or <code>null</code> if the engine skipped).
            Everything else is supporting context.
          </p>

          <div className="grid gap-4">
            {/* Primary */}
            <ToolCard
              name="get_todays_pick"
              description="The single V5.3 pick for today's scan date. Returns ticker, direction, contract, entry/stop/target/exit, and the gate-pass evidence. Null when the engine skipped (no signal cleared the gates, or VIX backwardation)."
              params={{ "": "No params required" }}
              badge="PRIMARY"
            />
            <ToolCard
              name="list_todays_picks"
              description="Historical list of daily picks written by the notifier — one row per scan date."
              params={{ limit: "integer (default 30)" }}
            />
            <ToolCard
              name="get_freemium_preview"
              description="Redacted preview of today's pick for unauthenticated surfaces (ticker masked until 09:00 ET)."
              params={{ "": "No params required" }}
            />
            <ToolCard
              name="get_open_position"
              description="Composite payload about the engine's current state: pending pick, awaiting simulation, and most-recent closed trade. The batch simulator is not live; no fabricated unrealized P&L."
              params={{ "": "No params required" }}
            />
            <ToolCard
              name="get_position_history"
              description="Closed trades from the forward-paper-trader ledger. Filters: date range, direction, outcome."
              params={{
                start_date: "YYYY-MM-DD (optional)",
                end_date: "YYYY-MM-DD (optional)",
                direction: "bullish | bearish (optional)",
                limit: "integer (default 30)",
              }}
            />
            <ToolCard
              name="get_overnight_signals"
              description="Raw overnight scanner rows across 5,230+ tickers."
              params={{
                date: "YYYY-MM-DD (optional)",
                direction: "bull | bear (optional)",
                min_score: "integer 1-10 (optional)",
                ticker: "string (optional)",
                limit: "integer (optional)",
              }}
            />
            <ToolCard
              name="get_enriched_signals"
              description="Signals after the V5.3 enrichment filter (score ≥ 1, spread ≤ 10%, directional UOA > $500K). Includes thesis, technicals, recommended contract."
              params={{
                date: "YYYY-MM-DD (optional)",
                direction: "bull | bear (optional)",
                ticker: "string (optional)",
                limit: "integer (optional)",
              }}
            />
            <ToolCard
              name="get_signal_detail"
              description="Deep dive on a single ticker: full enriched payload including contract, thesis, technicals, news."
              params={{
                ticker: "string (required)",
                scan_date: "YYYY-MM-DD (optional)",
              }}
            />
            <ToolCard
              name="get_enriched_signal_schema"
              description="Returns the schema (column names + descriptions) of the enriched-signals table. Useful when an agent needs to know what fields to select."
              params={{ "": "No params required" }}
            />
            <ToolCard
              name="get_signal_performance"
              description="Three-day forward returns per enriched signal. Separate universe from the paper-trader ledger — this is signal-level outcome tracking, not bracket trades."
              params={{
                date: "YYYY-MM-DD (optional)",
                ticker: "string (optional)",
                direction: "bull | bear (optional)",
                outcome: "win | loss (optional)",
                limit: "integer (optional)",
              }}
            />
            <ToolCard
              name="get_win_rate_summary"
              description="Aggregate signal-level win rate across a rolling window. Note: this is the signal universe (~30/day), not the V5.3 paper-trader universe (1/day)."
              params={{ days: "integer (default 30)" }}
            />
            <ToolCard
              name="get_daily_report"
              description="Full daily market report (AI-authored editorial synthesis) in markdown."
              params={{ date: "YYYY-MM-DD (defaults to latest)" }}
            />
            <ToolCard
              name="get_report_list"
              description="Paginated list of available daily reports."
              params={{ limit: "integer (default 10)" }}
            />
            <ToolCard
              name="get_available_dates"
              description="Returns which scan dates have data."
              params={{ "": "No params required" }}
            />
            <ToolCard
              name="web_search"
              description="Web search for real-time fact verification. Requires GOOGLE_CSE_ID at deploy time."
              params={{
                query: "string (required)",
                num_results: "integer (optional)",
              }}
            />
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Pricing for Developers</h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg border-2 border-primary bg-card relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
                FREE
              </div>
              <div className="text-sm text-primary mb-2">MCP API</div>
              <div className="text-3xl font-bold mb-4">$0</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ All 15 tools unlocked</li>
                <li>✓ No auth, no API key</li>
                <li>✓ SSE transport</li>
                <li>✓ Rate-limited fairly; reach out for heavy use</li>
                <li>✓ Same data as the webapp, same second</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-foreground text-background text-xs font-bold rounded">
                PRO
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                WhatsApp + Chat Agent
              </div>
              <div className="text-3xl font-bold mb-4">
                $39<span className="text-base text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Everything in Free</li>
                <li>✓ WhatsApp push at 09:00 ET</li>
                <li>✓ Exit reminder at 15:50 ET day-3</li>
                <li>✓ AI chat agent in private group</li>
                <li>✓ 7-day free trial</li>
              </ul>
              <Link href="/pricing" className="block mt-4">
                <Button variant="outline" className="w-full">
                  See full pricing →
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-bold font-headline">Ready to Build?</h2>
          <p className="text-muted-foreground">
            Point your agent at the endpoint and start querying. That's it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/pricing">
              <Button size="lg">Start Free Trial →</Button>
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
              href="mailto:ceo@gammarips.com"
              className="underline hover:text-foreground"
            >
              ceo@gammarips.com
            </a>
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Paper-trading performance, educational only. Not investment advice. Past
            performance is not a guarantee of future results.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ToolCard({
  name,
  description,
  params,
  badge,
}: {
  name: string;
  description: string;
  params: Record<string, string>;
  badge?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="font-mono text-lg text-primary">{name}</CardTitle>
          {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-xs font-mono bg-muted/50 p-3 rounded space-y-1">
          <div className="text-muted-foreground uppercase tracking-wider text-[10px] mb-2">
            Parameters
          </div>
          {Object.entries(params).map(([key, val]) => (
            <div key={key} className="flex gap-2">
              <span className="text-foreground min-w-[80px]">{key}:</span>
              <span className="text-muted-foreground">{String(val)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
