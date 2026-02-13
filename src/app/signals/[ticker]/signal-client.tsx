'use client';

import { useAuth } from "@/hooks/use-auth";
import { type OvernightSignal } from "@/lib/firebase-admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Markdown } from "@/components/markdown";
import { PublicHeader } from "@/components/layout/public-header";
import { EmailCapture } from "@/components/email-capture";

export default function SignalClientPage({ signal }: { signal: OvernightSignal }) {
  const { user, loading } = useAuth();
  const isSubscribed = !!user?.isSubscribed;
  const isBullish = signal.direction === 'bull';
  
  const formatMoney = (amount: number) => {
    if (Math.abs(amount) >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    return `$${(amount / 1_000).toFixed(0)}K`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-8">
          <div>
             <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold font-headline tracking-tight">{signal.ticker}</h1>
                <Badge variant={isBullish ? "default" : "destructive"} className={isBullish ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                    {signal.direction.toUpperCase()}
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
                <div className={`text-2xl font-bold font-code ${signal.signal_score >= 7 ? (isBullish ? 'text-green-500' : 'text-red-500') : 'text-foreground'}`}>
                    {signal.signal_score}/10
                </div>
             </div>
             <div className="p-3 bg-card rounded-lg border">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Move</div>
                <div className={`text-2xl font-bold font-code flex items-center justify-center gap-1 ${signal.move_pct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {signal.move_pct >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(signal.move_pct).toFixed(1)}%
                </div>
             </div>
             <div className="p-3 bg-card rounded-lg border">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Positioning</div>
                <div className="text-2xl font-bold font-code text-primary">
                    {formatMoney(signal.new_positioning_usd)}
                </div>
             </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6">
            
           {/* Thesis & Analysis */}
           <Card>
              <CardHeader>
                  <CardTitle>AI Trade Thesis</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="prose prose-invert max-w-none">
                     {/* Always show truncated thesis or full if subscribed */}
                     <Markdown content={signal.ai_thesis || "No thesis generated."} />
                  </div>
              </CardContent>
           </Card>

           {/* Locked Details Section */}
           <div className="grid md:grid-cols-2 gap-6">
                {/* Contract Setup */}
                <Card className={`relative overflow-hidden ${!isSubscribed && 'border-primary/20'}`}>
                    {!isSubscribed && !loading && (
                        <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                            <Lock className="w-8 h-8 text-primary mb-4" />
                            <h3 className="text-lg font-bold mb-2">Subscribe to Unlock</h3>
                            <p className="text-sm text-muted-foreground mb-4">Get the exact contract, strike price, and risk/reward analysis.</p>
                            <Button asChild>
                                <Link href="/#pricing">Upgrade to Edge</Link>
                            </Button>
                        </div>
                    )}
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
                            <span className="font-mono">{signal.risk_reward || "—"}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Levels */}
                <Card className="relative overflow-hidden">
                    {!isSubscribed && !loading && (
                        <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                            <Lock className="w-8 h-8 text-primary mb-4" />
                            <h3 className="text-lg font-bold mb-2">Unlock Technicals</h3>
                            <p className="text-sm text-muted-foreground mb-4">See key support & resistance levels derived from volatility.</p>
                             <Button asChild>
                                <Link href="/#pricing">Upgrade to Edge</Link>
                            </Button>
                        </div>
                    )}
                    <CardHeader>
                        <CardTitle>Key Levels</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div>
                            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Resistance</span>
                            <div className="font-mono text-lg mt-1">
                                {signal.key_levels?.resistance?.join(', ') || "—"}
                            </div>
                         </div>
                         <div className="h-px bg-border my-2" />
                         <div>
                            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Support</span>
                            <div className="font-mono text-lg mt-1">
                                {signal.key_levels?.support?.join(', ') || "—"}
                            </div>
                         </div>
                    </CardContent>
                </Card>
           </div>
           
           {/* Extended Analysis */}
           <Card className="relative overflow-hidden">
                {!isSubscribed && !loading && (
                     <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                        <Button variant="outline" asChild>
                            <Link href="/#pricing">Unlock Full Analysis</Link>
                        </Button>
                    </div>
                )}
               <CardHeader>
                   <CardTitle>Technical & News Analysis</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2">Technical Structure</h4>
                        <div className="text-sm text-muted-foreground leading-relaxed">
                            <Markdown content={signal.technical_analysis || ""} />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">News & Catalysts</h4>
                         <div className="text-sm text-muted-foreground leading-relaxed">
                            <Markdown content={signal.news_summary || ""} />
                        </div>
                    </div>
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
