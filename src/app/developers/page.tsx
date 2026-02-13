import { PublicHeader } from "@/components/layout/public-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Check, X } from "lucide-react";

export const metadata = {
  title: "Developers | The Overnight Edge",
  description: "Connect your AI agent, trading bot, or application to institutional overnight options flow.",
};

export default function DevelopersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-16">
        {/* Hero Section */}
        <section className="text-center py-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Build with Overnight Edge Data</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect your AI agent, trading bot, or application to institutional overnight options flow.
            </p>
            <div className="flex justify-center gap-4 pt-4">
                <Button asChild size="lg">
                    <Link href="mailto:ceo@gammarips.com?subject=Request%20Free%20API%20Key">Get API Key</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                    <Link href="#docs">Read Docs</Link>
                </Button>
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
                        <span className="text-foreground">X-API-Key header</span>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border/50">
                    <div className="text-muted-foreground mb-2"># Quick test</div>
                    <div className="text-primary">
                        curl -H "X-API-Key: YOUR_KEY" \<br/>
                        &nbsp;&nbsp;"https://gammarips-mcp-406581297632.us-central1.run.app/api/tools/getTopMovers"
                    </div>
                </div>
            </div>
        </section>

        {/* Available Tools */}
        <section className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Available Tools</h2>
            <div className="grid gap-4">
                <ToolCard 
                    name="getOvernightSignals"
                    description="Get today's overnight institutional flow signals. Filter by direction (BULLISH/BEARISH), minimum score, and limit."
                    params={{
                        direction: "ALL | BULLISH | BEARISH",
                        minScore: "integer 0-10 (default 5)",
                        limit: "integer (default 20)",
                        date: "YYYY-MM-DD (default: latest)"
                    }}
                />
                <ToolCard 
                    name="getSignalDetail"
                    description="Deep dive on a single ticker. Returns full flow data, technicals, news analysis, and recommended contract."
                    params={{
                        ticker: "string (required)",
                        date: "YYYY-MM-DD (default: latest)"
                    }}
                    badge="Paid Only"
                />
                <ToolCard 
                    name="getTopMovers"
                    description="Quick summary of highest conviction signals. Returns top N bullish and bearish with scores and price changes."
                    params={{
                        count: "integer (default 5)"
                    }}
                />
                <ToolCard 
                    name="getMarketThemes"
                    description="AI-detected sector rotation themes from tonight's overnight flow."
                    params={{
                        date: "YYYY-MM-DD (default: latest)"
                    }}
                />
                 <ToolCard 
                    name="chat"
                    description="Natural language Q&A about overnight signals and market flow."
                    params={{
                        message: "string (required)"
                    }}
                />
            </div>
        </section>

        {/* Pricing Table */}
        <section className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">API Pricing</h2>
            <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 bg-muted/50 p-4 font-bold text-sm text-center">
                    <div className="text-left">Feature</div>
                    <div>Free</div>
                    <div>Edge ($49/mo)</div>
                    <div>War Room ($149/mo)</div>
                </div>
                <div className="divide-y">
                    <PricingRow feature="Signals" free="Score 7+ only" edge="All signals" warroom="All signals" />
                    <PricingRow feature="Results limit" free="10" edge="Unlimited" warroom="Unlimited" />
                    <PricingRow feature="Contract recs" free={false} edge={true} warroom={true} />
                    <PricingRow feature="Technicals" free={false} edge={true} warroom={true} />
                    <PricingRow feature="News analysis" free={false} edge={true} warroom={true} />
                    <PricingRow feature="Signal detail" free={false} edge={true} warroom={true} />
                    <PricingRow feature="Market themes" free="Names only" edge="Full" warroom="Full" />
                    <PricingRow feature="Chat queries" free="3/day" edge="Unlimited" warroom="Unlimited" />
                    <PricingRow feature="Rate limit" free="100/day" edge="1,000/day" warroom="Unlimited" />
                </div>
            </div>
        </section>

        {/* API Key Registration */}
        <section className="py-12 bg-muted/10 rounded-xl text-center space-y-6 border">
            <h2 className="text-2xl font-bold font-headline">Get Your API Key</h2>
            <p className="text-muted-foreground">
                We are currently in beta. Email us to get a free developer key instantly.
            </p>
            <Button size="lg" asChild>
                <Link href="mailto:ceo@gammarips.com?subject=Request%20Free%20API%20Key">Email ceo@gammarips.com</Link>
            </Button>
        </section>

        {/* Code Examples */}
        <section className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Code Examples</h2>
            
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-bold mb-3">Python (MCP Client)</h3>
                    <pre className="bg-muted/30 p-4 rounded-lg border text-xs overflow-x-auto text-foreground">
{`import requests

API_KEY = "your_api_key"
BASE = "https://gammarips-mcp-406581297632.us-central1.run.app"

# Get today's top movers
resp = requests.post(f"{BASE}/api/tools/getTopMovers",
    headers={"X-API-Key": API_KEY},
    json={"count": 5})
print(resp.json())

# Get bullish signals score 7+
resp = requests.post(f"{BASE}/api/tools/getOvernightSignals",
    headers={"X-API-Key": API_KEY},
    json={"direction": "BULLISH", "minScore": 7})
print(resp.json())`}
                    </pre>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-3">JavaScript</h3>
                    <pre className="bg-muted/30 p-4 rounded-lg border text-xs overflow-x-auto text-foreground">
{`const API_KEY = 'your_api_key';
const BASE = 'https://gammarips-mcp-406581297632.us-central1.run.app';

const res = await fetch(BASE + '/api/tools/getTopMovers', {
  method: 'POST',
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ count: 5 })
});
const data = await res.json();`}
                    </pre>
                </div>

                <div>
                    <h3 className="text-lg font-bold mb-3">MCP Config (for AI Agents)</h3>
                    <pre className="bg-muted/30 p-4 rounded-lg border text-xs overflow-x-auto text-foreground">
{`{
  "mcpServers": {
    "gammarips": {
      "url": "https://gammarips-mcp-406581297632.us-central1.run.app/sse",
      "transport": "sse",
      "headers": {
        "X-API-Key": "your_api_key"
      }
    }
  }
}`}
                    </pre>
                </div>
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

function PricingRow({ feature, free, edge, warroom }: { feature: string, free: string | boolean, edge: string | boolean, warroom: string | boolean }) {
    const renderCell = (val: string | boolean) => {
        if (val === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />;
        if (val === false) return <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />;
        return <span className="text-sm">{val}</span>;
    };

    return (
        <div className="grid grid-cols-4 p-4 items-center text-center hover:bg-muted/20 transition-colors">
            <div className="text-left font-medium text-sm text-muted-foreground">{feature}</div>
            <div>{renderCell(free)}</div>
            <div>{renderCell(edge)}</div>
            <div>{renderCell(warroom)}</div>
        </div>
    );
}
