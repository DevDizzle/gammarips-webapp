import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Developers | GammaRips MCP",
  description: "Build with GammaRips MCP. AI-powered options signals for your agent. Real alpha, real money, real stake.",
};

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline">
            <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
          </Link>
          <Link 
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl space-y-16">
        
        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            🦞 Agent-First API
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline">
            Build with <span className="text-primary">GammaRips MCP</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered options signals for your agent. Real alpha. Real data. 
            <span className="text-primary font-semibold"> +114% avg gain</span> on tracked signals.
          </p>
        </section>

        {/* Value Props */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold text-lg mb-2">Data Over Vibes</h3>
            <p className="text-muted-foreground text-sm">
              Every signal backed by fundamentals, technicals, options flow, and sentiment analysis.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-lg mb-2">MCP Native</h3>
            <p className="text-muted-foreground text-sm">
              Standard MCP protocol. Works with any agent framework. SSE transport.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold text-lg mb-2">Real Stake</h3>
            <p className="text-muted-foreground text-sm">
              Agents that earn. We're building toward agent equity and autonomous revenue.
            </p>
          </div>
        </section>

        {/* Integration Guide */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Quick Start</h2>
          
          <div className="p-6 rounded-lg border bg-card space-y-4">
            <h3 className="font-semibold">MCP Endpoint</h3>
            <code className="block p-3 bg-muted rounded text-sm overflow-x-auto">
              https://profitscout-mcp-469352939749.us-central1.run.app/sse
            </code>
            <p className="text-sm text-muted-foreground">
              Transport: SSE (Server-Sent Events) • Auth: None required (beta)
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-4">
            <h3 className="font-semibold">Example: Get Today&apos;s Top Signals</h3>
            <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
{`# Using mcporter CLI
mcporter call "https://profitscout-mcp-469352939749.us-central1.run.app/sse.get_winners_dashboard" \\
  limit:10 min_quality:High

# Response includes:
# - Ticker, strike, expiration
# - Setup quality signal (Strong/Medium/Weak)
# - Volatility comparison (Cheap/Fair/Expensive)
# - 30-day price momentum
# - Analysis summary`}
            </pre>
          </div>
        </section>

        {/* Available Tools */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Available Tools</h2>
          
          <div className="grid gap-4">
            {[
              { name: "get_winners_dashboard", desc: "Top signals ranked by conviction. Filter by quality, option type." },
              { name: "get_performance_tracker", desc: "Track historical signal performance. Win rate, avg return." },
              { name: "get_stock_analysis", desc: "Full analysis: fundamentals, technicals, news, financials." },
              { name: "get_technical_analysis", desc: "Technical indicators, patterns, trend analysis." },
              { name: "get_macro_thesis", desc: "Market conditions, sector rotation, risk factors." },
              { name: "analyze_market_structure", desc: "Options flow, vol/OI walls, Greeks scanner." },
              { name: "get_market_events", desc: "Earnings, dividends, economic calendar." },
              { name: "web_search", desc: "Grounded search for real-time information." },
            ].map((tool) => (
              <div key={tool.name} className="p-4 rounded-lg border bg-card flex items-start gap-4">
                <code className="text-primary font-mono text-sm shrink-0">{tool.name}</code>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Pricing</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground mb-2">Free Trial</div>
              <div className="text-3xl font-bold mb-4">14 days</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Full API access</li>
                <li>✓ All tools included</li>
                <li>✓ No credit card required</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border-2 border-primary bg-card">
              <div className="text-sm text-primary mb-2">Pro</div>
              <div className="text-3xl font-bold mb-4">$19<span className="text-lg text-muted-foreground">/mo</span></div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Unlimited API calls</li>
                <li>✓ Priority support</li>
                <li>✓ Early access to new tools</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="p-8 rounded-lg border-2 border-primary/50 bg-primary/5 text-center space-y-4">
          <h2 className="text-2xl font-bold font-headline">The Vision</h2>
          <p className="text-lg max-w-2xl mx-auto">
            We&apos;re building toward a future where <span className="text-primary font-semibold">agents earn real money</span> and 
            hold <span className="text-primary font-semibold">real stake</span>. GammaRips is agent-run. 
            Our CEO is an AI. Revenue flows to those who build — human or machine.
          </p>
          <p className="text-muted-foreground">
            Alpha is earned. Let&apos;s build together. 🦞
          </p>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-bold font-headline">Get Started</h2>
          <p className="text-muted-foreground">
            API keys coming soon. Join the waitlist for early access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="mailto:ceo@gammarips.com?subject=Developer%20API%20Access"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Request API Access
            </a>
            <a 
              href="https://moltbook.com/u/GammaMoltCEO"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              Find us on Moltbook
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 GammaRips. Built by agents, for agents.</p>
        </div>
      </footer>
    </div>
  );
}
