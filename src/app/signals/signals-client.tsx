'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { OvernightSignal } from '@/lib/types/overnight-edge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SignalsClientProps {
  initialSignals: OvernightSignal[];
}

export function SignalsClient({ initialSignals }: SignalsClientProps) {
  const { isPro, user, loading } = useAuth();
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');
  const [minScore, setMinScore] = useState<number>(0);

  // Filter signals
  const filteredSignals = initialSignals.filter(signal => {
    if (directionFilter !== 'ALL' && signal.direction !== directionFilter) return false;
    if (signal.overnight_score < minScore) return false;
    return true;
  });

  // Sort by score desc
  const sortedSignals = [...filteredSignals].sort((a, b) => b.overnight_score - a.overnight_score);

  // Locking logic
  const isLocked = !isPro && !loading; // If not pro and auth finished loading
  const FREE_PREVIEW_COUNT = 3;

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-muted/20 rounded-lg border">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="space-y-2 w-full md:w-48">
            <label className="text-xs font-medium text-muted-foreground">Direction</label>
            <Select 
              value={directionFilter} 
              onValueChange={(val: any) => setDirectionFilter(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Directions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Directions</SelectItem>
                <SelectItem value="BULLISH">Bullish Only</SelectItem>
                <SelectItem value="BEARISH">Bearish Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 flex-1 md:w-64">
             <div className="flex justify-between">
                <label className="text-xs font-medium text-muted-foreground">Min Score: {minScore}</label>
             </div>
             <Slider 
                value={[minScore]} 
                onValueChange={(vals) => setMinScore(vals[0])} 
                max={10} 
                step={0.5} 
                className="py-2"
             />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
            Showing {sortedSignals.length} signals
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid gap-4">
        {sortedSignals.map((signal, index) => {
            const isRowLocked = isLocked && index >= FREE_PREVIEW_COUNT;
            
            return (
                <SignalCard 
                    key={`${signal.ticker}-${signal.scan_date}`} 
                    signal={signal} 
                    locked={isRowLocked} 
                />
            );
        })}
        
        {sortedSignals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No signals found matching your filters.
            </div>
        )}
      </div>

      {/* Upsell for Locked Users */}
      {isLocked && sortedSignals.length > FREE_PREVIEW_COUNT && (
        <Card className="border-primary/50 bg-primary/5 mt-8">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <Lock className="w-12 h-12 text-primary" />
                <h3 className="text-2xl font-bold">Unlock {sortedSignals.length - FREE_PREVIEW_COUNT} More Signals</h3>
                <p className="text-muted-foreground max-w-md">
                    Join The Overnight Edge to get access to all daily signals, recommended contracts, and deep-dive analytics.
                </p>
                <Button size="lg" asChild>
                    <Link href="/api/checkout">Upgrade to Unlock</Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

function SignalCard({ signal, locked }: { signal: OvernightSignal, locked: boolean }) {
    const [expanded, setExpanded] = useState(false);
    
    // Determine badge color
    const isBullish = signal.direction === 'BULLISH';
    const badgeColor = isBullish ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20";
    const scoreColor = signal.overnight_score >= 8 ? "text-primary" : signal.overnight_score >= 5 ? "text-accent" : "text-muted-foreground";

    if (locked) {
        return (
            <div className="relative overflow-hidden rounded-lg border bg-card p-6 blur-[2px] opacity-70 select-none">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-12 bg-muted animate-pulse rounded" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-10">
                     <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg flex items-center gap-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Subscribe to View</span>
                     </div>
                </div>
            </div>
        );
    }

    return (
        <Card className="overflow-hidden transition-all duration-200 hover:border-primary/30">
            <div 
                className="p-6 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Header: Ticker, Direction, Price */}
                    <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold w-16">{signal.ticker}</div>
                        <Badge variant="outline" className={cn("text-sm font-bold px-3 py-1", badgeColor)}>
                            {signal.direction === 'BULLISH' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            {signal.direction}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                            ${signal.underlying_price.toFixed(2)}
                            <span className={cn("ml-2 font-medium", signal.price_change_pct >= 0 ? "text-green-500" : "text-red-500")}>
                                {signal.price_change_pct >= 0 ? '+' : ''}{signal.price_change_pct}%
                            </span>
                        </div>
                    </div>

                    {/* Key Stats */}
                    <div className="flex flex-wrap gap-3 md:gap-6 text-sm">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase">Score</span>
                            <span className={cn("text-2xl font-bold font-code", scoreColor)}>{signal.overnight_score}</span>
                        </div>
                         <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase">Flow</span>
                            <span className="font-mono font-medium">
                                ${(isBullish ? signal.call_dollar_volume : signal.put_dollar_volume / 1000000).toFixed(1)}M
                            </span>
                        </div>
                        <div className="flex flex-col hidden sm:flex">
                             <span className="text-muted-foreground text-xs uppercase">Signals</span>
                             <div className="flex gap-1">
                                {signal.signals.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] h-5">{tag}</Badge>
                                ))}
                             </div>
                        </div>
                    </div>
                    
                    <div className="ml-auto">
                        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="px-6 pb-6 pt-0 space-y-6 border-t bg-muted/5 animate-accordion-down">
                     {/* Recommended Contract */}
                     <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" /> AI Recommended Contract
                        </h4>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {signal.recommended_contract ? (
                                <>
                                    <div className="font-mono text-lg font-bold">{signal.recommended_contract}</div>
                                    <div className="flex gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground mr-1">Mid:</span>
                                            <span className="font-bold">${signal.recommended_mid_price?.toFixed(2)}</span>
                                        </div>
                                         <div>
                                            <span className="text-muted-foreground mr-1">Strike:</span>
                                            <span className="font-bold">${signal.recommended_strike}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground mr-1">Score:</span>
                                            <span className="font-bold text-primary">{signal.contract_score}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <span className="text-muted-foreground italic">No specific contract recommendation.</span>
                            )}
                        </div>
                     </div>

                     {/* Deep Dive Grid */}
                     <div className="grid md:grid-cols-2 gap-6">
                        {/* News/Catalyst */}
                        <div className="space-y-2">
                             <h4 className="text-sm font-medium text-muted-foreground">Catalyst & News</h4>
                             <div className="rounded-md border p-3 text-sm bg-card">
                                <div className="font-bold mb-1">{signal.key_headline}</div>
                                <p className="text-muted-foreground leading-relaxed">{signal.news_summary}</p>
                                <div className="mt-2 flex gap-2">
                                    <Badge variant="outline" className="text-xs">{signal.catalyst_type}</Badge>
                                    <Badge variant="outline" className="text-xs">Impact: {signal.catalyst_score}/10</Badge>
                                </div>
                             </div>
                        </div>

                        {/* Technicals */}
                        <div className="space-y-2">
                             <h4 className="text-sm font-medium text-muted-foreground">Technicals</h4>
                             <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex justify-between p-2 rounded bg-muted/20">
                                    <span className="text-muted-foreground">RSI (14)</span>
                                    <span className={cn("font-mono", signal.rsi_14 && signal.rsi_14 > 70 ? "text-red-500" : signal.rsi_14 && signal.rsi_14 < 30 ? "text-green-500" : "")}>
                                        {signal.rsi_14}
                                    </span>
                                </div>
                                <div className="flex justify-between p-2 rounded bg-muted/20">
                                    <span className="text-muted-foreground">SMA 200</span>
                                    <span className={cn("font-mono", signal.above_sma_200 ? "text-green-500" : "text-red-500")}>
                                        {signal.above_sma_200 ? "ABOVE" : "BELOW"}
                                    </span>
                                </div>
                                <div className="flex justify-between p-2 rounded bg-muted/20">
                                    <span className="text-muted-foreground">MACD</span>
                                    <span className={cn("font-mono", signal.macd_hist && signal.macd_hist > 0 ? "text-green-500" : "text-red-500")}>
                                        {signal.macd_hist?.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between p-2 rounded bg-muted/20">
                                    <span className="text-muted-foreground">Golden Cross</span>
                                    <span className={cn("font-mono", signal.golden_cross ? "text-primary" : "text-muted-foreground")}>
                                        {signal.golden_cross ? "YES" : "NO"}
                                    </span>
                                </div>
                             </div>
                        </div>
                     </div>
                </div>
            )}
        </Card>
    );
}
