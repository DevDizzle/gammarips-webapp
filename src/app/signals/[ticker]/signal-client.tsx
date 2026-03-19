'use client';

import { useAuth } from "@/hooks/use-auth";
import { type OvernightSignal } from "@/lib/firebase-admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowLeft, Flame, Zap } from "lucide-react";
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { EmailCapture } from "@/components/email-capture";

export default function SignalClientPage({ signal }: { signal: OvernightSignal }) {
  const { dbUser, loading } = useAuth();
  const isBullish = signal.direction === 'BULLISH';
  const movePct = signal.price_change_pct || 0;

  const formatMoney = (amount: number) => {
    if (!amount || amount === 0) return '—';
    if (Math.abs(amount) >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const totalFlow = (signal.call_dollar_volume || 0) + (signal.put_dollar_volume || 0);

  const renderPremiumBadge = () => {
    if (!signal.is_premium_signal) return null;
    
    const score = signal.premium_score || 1;
    
    if (score >= 3) {
      return (
        <Badge className="ml-2 bg-amber-500 hover:bg-amber-600 text-black border-0 gap-1 shadow-[0_0_10px_rgba(245,158,11,0.5)] text-sm px-3 py-1">
          <Flame className="w-4 h-4" /> Premium ×{score}
        </Badge>
      );
    }
    
    if (score === 2) {
      return (
        <Badge variant="outline" className="ml-2 border-amber-500 text-amber-500 bg-amber-500/10 gap-1 text-sm px-3 py-1">
          <Zap className="w-4 h-4" /> Premium ×2
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="ml-2 border-amber-500/50 text-amber-600 bg-amber-500/5 text-sm px-3 py-1">
        Premium
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/signals" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Signals
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-4xl font-bold font-headline tracking-tight">{signal.ticker}</h1>
              {renderPremiumBadge()}
              <Badge variant={isBullish ? "default" : "destructive"} className={isBullish ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                {isBullish ? 'BULL' : 'BEAR'}
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                {signal.scan_date}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">Overnight Institutional Flow Signal</p>
          </div>

          <div className="flex gap-4 text-center">
            <div className="p-3 bg-card rounded-lg border">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score</div>
              <div className={`text-2xl font-bold font-code ${signal.overnight_score >= 7 ? (isBullish ? 'text-green-500' : 'text-red-500') : 'text-foreground'}`}>
                {signal.overnight_score}/10
              </div>
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Move</div>
              <div className={`text-2xl font-bold font-code flex items-center justify-center gap-1 ${movePct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {movePct >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(movePct).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 bg-card rounded-lg border">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Flow</div>
              <div className="text-2xl font-bold font-code text-primary">
                {formatMoney(totalFlow)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6">

          {/* Premium Reason Section */}
          {signal.is_premium_signal && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-500 flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  Why This is a Premium Signal
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({signal.premium_score || 1}/5 patterns matched)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {signal.premium_hedge && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🛡️</span>
                      <div>
                        <span className="font-semibold block">Institutional Hedging</span>
                        <span className="text-muted-foreground">When big money hedges, the underlying moves</span>
                      </div>
                    </div>
                  )}
                  {signal.premium_high_rr && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📐</span>
                      <div>
                        <span className="font-semibold block">High Risk/Reward</span>
                        <span className="text-muted-foreground">Clean setup with room to run</span>
                      </div>
                    </div>
                  )}
                  {signal.premium_bull_flow && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📈</span>
                      <div>
                        <span className="font-semibold block">Strong Call Flow</span>
                        <span className="text-muted-foreground">Aggressive bullish accumulation</span>
                      </div>
                    </div>
                  )}
                  {signal.premium_high_atr && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⚡</span>
                      <div>
                        <span className="font-semibold block">Explosive Move</span>
                        <span className="text-muted-foreground">2x+ normal range on unusual flow</span>
                      </div>
                    </div>
                  )}
                  {signal.premium_bear_flow && (
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📉</span>
                      <div>
                        <span className="font-semibold block">Strong Put Flow</span>
                        <span className="text-muted-foreground">Heavy bearish conviction</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Trade Thesis */}
          <Card>
            <CardHeader>
              <CardTitle>AI Trade Thesis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <Markdown content={signal.thesis || "No thesis generated for this signal."} />
              </div>
            </CardContent>
          </Card>

          {/* Flow Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Flow Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Call Volume</div>
                  <div className="font-mono font-bold text-green-500">{formatMoney(signal.call_dollar_volume || 0)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Put Volume</div>
                  <div className="font-mono font-bold text-red-500">{formatMoney(signal.put_dollar_volume || 0)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Flow Intent</div>
                  <div className="font-mono font-bold">{signal.flow_intent || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">Catalyst</div>
                  <div className="font-mono font-bold">{signal.catalyst_type || '—'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contract Setup */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardTitle>Recommended Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Contract</span>
                  <span className="font-mono font-bold">{signal.recommended_contract || "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Contract Score</span>
                  <span className="font-mono">{signal.contract_score ? `${signal.contract_score}/10` : "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Risk/Reward</span>
                  <span className="font-mono">{signal.risk_reward_ratio ? `${signal.risk_reward_ratio.toFixed(1)}:1` : "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Delta</span>
                  <span className="font-mono">{signal.recommended_delta ? signal.recommended_delta.toFixed(2) : "—"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Key Levels */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <CardTitle>Key Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Resistance</span>
                  <span className="font-mono text-lg">{signal.resistance ? `$${signal.resistance.toFixed(2)}` : "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Support</span>
                  <span className="font-mono text-lg">{signal.support ? `$${signal.support.toFixed(2)}` : "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-mono">{signal.underlying_price ? `$${signal.underlying_price.toFixed(2)}` : "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">SMA 50 / 200</span>
                  <span className="font-mono">
                    {signal.sma_50 ? `$${signal.sma_50.toFixed(0)}` : "—"} / {signal.sma_200 ? `$${signal.sma_200.toFixed(0)}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">52W Range</span>
                  <span className="font-mono">
                    {signal.low_52w ? `$${signal.low_52w.toFixed(0)}` : "—"} — {signal.high_52w ? `$${signal.high_52w.toFixed(0)}` : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Extended Analysis */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>News & Catalyst Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {signal.key_headline && (
                <div>
                  <h4 className="font-semibold mb-2">Key Headline</h4>
                  <p className="text-sm text-muted-foreground">{signal.key_headline}</p>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">News Summary</h4>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <Markdown content={signal.news_summary || "No news analysis available."} />
                </div>
              </div>
              {signal.flow_intent_reasoning && (
                <div>
                  <h4 className="font-semibold mb-2">Flow Intent Analysis</h4>
                  <p className="text-sm text-muted-foreground">{signal.flow_intent_reasoning}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 max-w-xl mx-auto w-full">
            <EmailCapture />
          </div>
        </div>
      </main>
    </div>
  );
}