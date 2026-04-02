import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata = {
  title: "GammaRips MCP API — Options Flow Intelligence for AI Agents",
  description: "Connect your AI agent, trading bot, or application to institutional overnight options flow. Full MCP support.",
  alternates: { canonical: 'https://gammarips.com/developers' },
  openGraph: {
    title: "GammaRips MCP API — Options Flow Intelligence for AI Agents",
    description: "Connect your AI agent, trading bot, or application to institutional overnight options flow.",
    url: "https://gammarips.com/developers",
  }
};

const webApiSchema = {
  "@context": "https://schema.org",
  "@type": "WebAPI",
  "name": "GammaRips MCP API",
  "description": "Model Context Protocol (MCP) API for daily overnight institutional options flow signals across 5,000+ US equities. Includes conviction scores, technicals, AI-generated catalysts, and contract recommendations.",
  "url": "https://gammarips-mcp-406581297632.us-central1.run.app/sse",
  "documentation": "https://gammarips.com/developers",
  "provider": {
    "@type": "Organization",
    "name": "GammaRips",
    "url": "https://gammarips.com"
  }
};

export default function DevelopersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApiSchema) }}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-16">
        {/* Hero Section */}
        <section className="text-center py-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Build with Overnight Edge Data</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect your AI agent, trading bot, or application to institutional overnight options flow.
            </p>
            <div className="p-8 rounded-lg border-2 border-primary bg-card max-w-2xl mx-auto mt-8" id="connect">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold font-headline">Connect Your Agent</h2>
                <p className="text-muted-foreground">
                  The MCP API is free. No API key, no sign-up, no trial. Just connect and query.
                </p>
                <code className="block p-3 bg-muted rounded text-sm break-all">
                  https://gammarips-mcp-406581297632.us-central1.run.app/sse
                </code>
                <p className="text-sm text-muted-foreground">
                  Web-based analysis and email alerts are available completely free. <Link href="/pricing" className="text-primary hover:underline">Learn more →</Link>
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
                        <span className="text-foreground">https://gammarips-mcp-406581297632.us-central1.run.app/sse</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-muted-foreground">Transport:</span>
                        <span className="text-foreground">SSE (Server-Sent Events)</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-muted-foreground">Auth:</span>
                        <span className="text-foreground">None required</span>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50">
                    <div className="text-muted-foreground mb-2"># Python (using fastmcp)</div>
                    <pre className="text-primary overflow-x-auto whitespace-pre-wrap break-all">
{`from fastmcp import Client

async with Client("https://gammarips-mcp-406581297632.us-central1.run.app/sse") as client:
    signals = await client.call_tool("get_overnight_signals", {"min_score": 7})
    print(signals)`}
                    </pre>
                </div>
            </div>
        </section>

        {/* Available Tools */}
        <section className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Available Tools</h2>
            <div className="grid gap-4">
                <ToolCard 
                    name="get_overnight_signals"
                    description="Raw overnight scanner signals. Returns smart money flow across 5,230+ tickers."
                    params={{
                        date: "YYYY-MM-DD (optional)",
                        direction: "bull | bear (optional)",
                        min_score: "integer 1-10 (optional)",
                        ticker: "string (optional)",
                        limit: "integer (optional)"
                    }}
                />
                <ToolCard 
                    name="get_enriched_signals"
                    description="AI-enriched signals (score ≥ 6) with news analysis, technicals, and catalyst breakdown."
                    params={{
                        date: "YYYY-MM-DD (optional)",
                        direction: "bull | bear (optional)",
                        ticker: "string (optional)",
                        limit: "integer (optional)"
                    }}
                />
                <ToolCard 
                    name="get_signal_detail"
                    description="Deep dive on a single ticker. Full enriched data including recommended contract, AI thesis, technicals, news."
                    params={{
                        ticker: "string (required)",
                        scan_date: "YYYY-MM-DD (optional)"
                    }}
                />
                <ToolCard 
                    name="get_signal_performance"
                    description="Track how signals actually performed against market outcomes."
                    params={{
                        date: "YYYY-MM-DD (optional)",
                        ticker: "string (optional)",
                        direction: "bull | bear (optional)",
                        outcome: "win | loss (optional)",
                        limit: "integer (optional)"
                    }}
                />
                <ToolCard 
                    name="get_win_rate_summary"
                    description="Aggregate performance stats: win rate, average return."
                    params={{
                        days: "integer (default 30)"
                    }}
                />
                <ToolCard 
                    name="get_daily_report"
                    description="Full daily intelligence report in markdown."
                    params={{
                        date: "YYYY-MM-DD (defaults to latest)"
                    }}
                />
                <ToolCard 
                    name="get_report_list"
                    description="List of available reports."
                    params={{
                        limit: "integer (default 10)"
                    }}
                />
                <ToolCard 
                    name="get_available_dates"
                    description="Returns which scan dates have data."
                    params={{
                        "": "No params required"
                    }}
                />
                <ToolCard 
                    name="web_search"
                    description="Search the web for real-time info or fact verification."
                    params={{
                        query: "string (required)",
                        num_results: "integer (optional)"
                    }}
                />
            </div>
        </section>

        {/* Pricing */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Pricing</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg border-2 border-primary bg-card relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
                100% FREE
              </div>
              <div className="text-sm text-primary mb-2">MCP API</div>
              <div className="text-3xl font-bold mb-4">Free</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ All 9 tools unlocked</li>
                <li>✓ get_overnight_signals</li>
                <li>✓ get_enriched_signals</li>
                <li>✓ get_signal_detail</li>
                <li>✓ get_signal_performance</li>
                <li>✓ get_daily_report</li>
                <li>✓ web_search</li>
                <li>✓ No auth required</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border bg-card relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-foreground text-background text-xs font-bold rounded">
                WEB ACCESS
              </div>
              <div className="text-sm text-muted-foreground mb-2">GammaRips Web</div>
              <div className="text-3xl font-bold mb-4">Free</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Full enriched signals daily</li>
                <li>✓ AI news + catalyst analysis</li>
                <li>✓ Contract recommendations</li>
                <li>✓ Interactive Agent Arena</li>
                <li>✓ Public performance tracking</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-bold font-headline">Ready to Build?</h2>
          <p className="text-muted-foreground">Point your agent at the endpoint and start querying. That's it.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/pricing">
              <Button size="lg">Get Free Access →</Button>
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
                <Link href="/mcp.json" className="hover:text-primary">mcp.json</Link>
                <Link href="/skill.md" className="hover:text-primary">skill.md</Link>
                <Link href="/.well-known/ai-plugin.json" className="hover:text-primary">ai-plugin.json</Link>
            </div>
            <p className="text-xs text-muted-foreground">
                Contact: <a href="mailto:ceo@gammarips.com" className="underline hover:text-foreground">ceo@gammarips.com</a>
            </p>
        </div>
      </footer>
    </div>
  );
}

function ToolCard({ name, description, params, badge }: { name: string, description: string, params: any, badge?: string }) {
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
                    <div className="text-muted-foreground uppercase tracking-wider text-[10px] mb-2">Parameters</div>
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
