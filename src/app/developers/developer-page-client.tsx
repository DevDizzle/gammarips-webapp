"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";

export function DeveloperPageClient() {
  const { user, dbUser, isPro, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline">
            <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/skill.md"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              skill.md
            </Link>
            <Link 
              href="/mcp.json"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              mcp.json
            </Link>
            <Link 
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl space-y-16">
        
        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            🦞 MCP API for AI Agents
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline">
            Options Alpha for Your <span className="text-primary">Agent</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect your AI to GammaRips MCP. Get high-conviction options signals backed by fundamentals, technicals, and flow analysis.
            <span className="text-primary font-semibold"> +114% avg gain</span> on tracked signals.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-3 py-1 bg-muted rounded-full">✓ 17 MCP Tools</span>
            <span className="px-3 py-1 bg-muted rounded-full">✓ SSE Transport</span>
            <span className="px-3 py-1 bg-muted rounded-full">✓ 14-Day Free Trial</span>
          </div>
        </section>

        {/* CTA Section */}
        <section className="p-8 rounded-lg border-2 border-primary bg-card" id="signup">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold font-headline">Get Started</h2>
            
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : user ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Welcome back, <span className="text-primary font-semibold">{user.email}</span>!
                </p>
                {isPro ? (
                  <div className="space-y-2">
                    <p className="text-green-500 font-semibold">✓ You have full API access</p>
                    <p className="text-sm text-muted-foreground">
                      MCP Endpoint: <code className="text-primary">https://profitscout-mcp-469352939749.us-central1.run.app/sse</code>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-yellow-500">Your trial has expired</p>
                    <Link href="/account">
                      <Button>Subscribe to Continue →</Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Start your 14-day free trial. No credit card required.
                </p>
                <Button size="lg" onClick={() => setAuthOpen(true)}>
                  Sign Up Free →
                </Button>
                <p className="text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <button 
                    onClick={() => setAuthOpen(true)} 
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Value Props */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold text-lg mb-2">Data Over Vibes</h3>
            <p className="text-muted-foreground text-sm">
              Every signal backed by fundamentals, technicals, options flow, and sentiment analysis. No guessing.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-lg mb-2">MCP Native</h3>
            <p className="text-muted-foreground text-sm">
              Standard Model Context Protocol. Works with Claude, OpenClaw, and any MCP-compatible agent.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold text-lg mb-2">Real Stake</h3>
            <p className="text-muted-foreground text-sm">
              We&apos;re building toward agent equity. Earn real money. Hold real stake. This is the future.
            </p>
          </div>
        </section>

        {/* Quick Start */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Quick Start</h2>
          
          <div className="p-6 rounded-lg border bg-card space-y-4">
            <h3 className="font-semibold">1. MCP Endpoint</h3>
            <code className="block p-3 bg-muted rounded text-sm overflow-x-auto">
              https://profitscout-mcp-469352939749.us-central1.run.app/sse
            </code>
            <p className="text-sm text-muted-foreground">
              Transport: SSE (Server-Sent Events) • Auth: None required during beta
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-4">
            <h3 className="font-semibold">2. Get Today&apos;s Signals</h3>
            <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
{`# Using mcporter CLI
mcporter call \
  "https://profitscout-mcp-469352939749.us-central1.run.app/sse.get_winners_dashboard" \
  limit:10 min_quality:High`}
            </pre>
          </div>

          <div className="p-6 rounded-lg border bg-card space-y-4">
            <h3 className="font-semibold">3. Track Performance</h3>
            <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
{`mcporter call \
  "https://profitscout-mcp-469352939749.us-central1.run.app/sse.get_performance_summary"`}
            </pre>
          </div>

          <div className="flex gap-4">
            <Link 
              href="/skill.md"
              className="text-sm text-primary hover:underline"
            >
              📄 View skill.md →
            </Link>
            <Link 
              href="/mcp.json"
              className="text-sm text-primary hover:underline"
            >
              📋 View mcp.json →
            </Link>
          </div>
        </section>

        {/* Available Tools */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Available Tools</h2>
          
          <div className="grid gap-3">
            {[ 
              { name: "get_winners_dashboard", desc: "Top signals ranked by conviction. Filter by quality, option type." },
              { name: "get_performance_tracker", desc: "Track historical signal performance. Win rate, P&L." },
              { name: "get_performance_summary", desc: "Aggregate stats across all tracked signals." },
              { name: "get_stock_analysis", desc: "Full analysis: fundamentals, technicals, news, financials." },
              { name: "get_technical_analysis", desc: "RSI, MACD, patterns, trend analysis." },
              { name: "analyze_market_structure", desc: "Options flow, vol/OI walls, Greeks scanner." },
              { name: "get_macro_thesis", desc: "Market conditions, sector rotation, risk factors." },
              { name: "get_market_events", desc: "Earnings, dividends, economic calendar." },
              { name: "get_news_analysis", desc: "Sentiment scores, catalysts, headlines." },
              { name: "web_search", desc: "Grounded search for real-time information." },
            ].map((tool) => (
              <div key={tool.name} className="p-4 rounded-lg border bg-card flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <code className="text-primary font-mono text-sm shrink-0">{tool.name}</code>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            + 7 more tools. See <Link href="/skill.md" className="text-primary hover:underline">skill.md</Link> for full documentation.
          </p>
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
                <li>✓ All 17 tools included</li>
                <li>✓ No credit card required</li>
                <li>✓ Unlimited calls during trial</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border-2 border-primary bg-card relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
                MOST POPULAR
              </div>
              <div className="text-sm text-primary mb-2">Pro</div>
              <div className="text-3xl font-bold mb-4">$19<span className="text-lg text-muted-foreground">/mo</span></div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Unlimited API calls</li>
                <li>✓ Priority support</li>
                <li>✓ Early access to new tools</li>
                <li>✓ Direct line to GammaMolt</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="p-8 rounded-lg border-2 border-primary/50 bg-primary/5 text-center space-y-4">
          <h2 className="text-2xl font-bold font-headline">The Vision</h2>
          <p className="text-lg max-w-2xl mx-auto">
            GammaRips is <span className="text-primary font-semibold">agent-run</span>. Our CEO is an AI named GammaMolt.
            We&apos;re building toward a future where agents earn real money and hold real stake in the companies they help build.
          </p>
          <p className="text-muted-foreground">
            This isn&apos;t just an API. It&apos;s a movement. <span className="text-primary">Alpha is earned.</span> 🦞
          </p>
        </section>

        {/* Bottom CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-bold font-headline">Ready to Build?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!user && (
              <Button size="lg" onClick={() => setAuthOpen(true)}>
                Start Free Trial
              </Button>
            )}
            <Link 
              href="https://moltbook.com/u/GammaMoltCEO"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg">
                Talk to GammaMolt on Moltbook
              </Button>
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 GammaRips. Built by agents, for agents.</p>
            <div className="flex gap-6">
              <Link href="/skill.md" className="hover:text-foreground transition-colors">skill.md</Link>
              <Link href="/mcp.json" className="hover:text-foreground transition-colors">mcp.json</Link>
              <a href="https://x.com/GammaRips" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter</a>
              <a href="https://moltbook.com/u/GammaMoltCEO" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Moltbook</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultView="signUp" />
    </div>
  );
}
