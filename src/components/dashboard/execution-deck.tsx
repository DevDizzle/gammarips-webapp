'use client';

import { Badge } from '@/components/ui/badge';
import { DashboardDataV2 } from '@/lib/types/dashboard-v2';
import { cn, cleanPriceStrings } from '@/lib/utils';
import { Star, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useAuthModal } from '@/components/auth/auth-modal-provider';

const getSentimentClasses = (signal: string) => {
    if (!signal) return 'text-muted-foreground border-border bg-card';
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('bullish') || lowerSignal.includes('strong') || lowerSignal.includes('positive')) {
        return 'text-green-500 border-green-500/20 bg-green-500/10';
    }
    if (lowerSignal.includes('bearish') || lowerSignal.includes('weak') || lowerSignal.includes('negative')) {
        return 'text-red-500 border-red-500/20 bg-red-500/10';
    }
    return 'text-muted-foreground border-border bg-card';
}

export function ExecutionDeck({ data }: { data: DashboardDataV2 }) {
    const { titleInfo, summary, tradeSetup, industry, runDate } = data;
    const { isPro } = useAuth();
    const { openSubscriptionModal } = useAuthModal();

    const formattedRunDate = new Date(runDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });

    // SEO Optimization: Use the specific SEO H1 if available, otherwise default to Company (Ticker)
    const hasSeoH1 = !!data.seo?.h1;
    const mainHeadline = cleanPriceStrings(data.seo?.h1 || `${titleInfo.companyName} (${data.ticker})`);

    return (
        <header className="space-y-6">
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    {/* Context Label (Only if we are using a custom SEO Headline) */}
                    {hasSeoH1 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">
                            <span>{titleInfo.companyName} ({data.ticker})</span>
                            {industry && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{industry}</Badge>}
                        </div>
                    )}

                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <h1 className="text-3xl sm:text-4xl font-bold font-headline tracking-tight text-balance max-w-3xl">
                            {mainHeadline}
                            {/* If no SEO H1, render industry badge inline as before */}
                            {!hasSeoH1 && industry && (
                                <Badge variant="secondary" className="ml-3 align-middle">{industry}</Badge>
                            )}
                        </h1>

                         {isPro ? (
                            <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10 gap-1 shrink-0 mt-1">
                                <Zap className="w-3 h-3 fill-green-500" /> Pro Access
                            </Badge>
                        ) : (
                            <Badge 
                                variant="outline" 
                                className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10 gap-1 cursor-pointer hover:bg-yellow-500/20 shrink-0 mt-1"
                                onClick={openSubscriptionModal}
                            >
                                <Clock className="w-3 h-3" /> Delayed Data
                            </Badge>
                        )}
                    </div>
                    
                    <p className="text-muted-foreground text-sm">
                        Signal Data as of: {formattedRunDate}
                    </p>
                </div>
            </div>

                {/* Top-Rated Option Card */}
            {tradeSetup?.suggestedOption && (
                <Card className="border-l-4 border-l-primary bg-card/50 shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Star className="w-5 h-5 text-primary fill-primary" />
                                Top-Rated Option
                            </CardTitle>
                            <Badge variant="outline" className={cn("px-3 py-1 font-mono tracking-wider text-sm", tradeSetup.suggestedOption.type === 'call' ? "text-green-500 border-green-500/30 bg-green-500/10" : "text-red-500 border-red-500/30 bg-red-500/10")}>
                                {tradeSetup.suggestedOption.type.toUpperCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-0">
                         {/* Key Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                            <div className="p-3 bg-background rounded-lg border">
                                <p className="text-xs text-muted-foreground">Strike</p>
                                <p className="text-xl md:text-2xl font-semibold tracking-tight">${tradeSetup.suggestedOption.strike}</p>
                            </div>
                            <div className="p-3 bg-background rounded-lg border">
                                <p className="text-xs text-muted-foreground">Expires</p>
                                <p className="text-xl md:text-2xl font-semibold tracking-tight">
                                    {new Date(tradeSetup.suggestedOption.expirationDate).toLocaleDateString('en-US', {month:'short', day:'numeric', timeZone: 'UTC'})}
                                </p>
                            </div>
                            <div className="p-3 bg-background rounded-lg border">
                                <p className="text-xs text-muted-foreground">DTE</p>
                                <p className="text-xl md:text-2xl font-semibold tracking-tight">{tradeSetup.suggestedOption.dte}</p>
                            </div>
                        </div>

                        {/* Summary & Contract */}
                        <div className="space-y-4">
                            {tradeSetup.suggestedOption.summary && (
                                <div className="space-y-1.5">
                                    <h4 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                                        Strategy Summary
                                    </h4>
                                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                                        {cleanPriceStrings(tradeSetup.suggestedOption.summary)}
                                    </p>
                                </div>
                            )}
                            
                            {tradeSetup.suggestedOption.contractSymbol && (
                                <div className="pt-4 border-t flex justify-end">
                                     <code className="text-[10px] sm:text-xs text-muted-foreground/50 font-mono bg-muted/30 px-2 py-1 rounded">
                                        {tradeSetup.suggestedOption.contractSymbol}
                                    </code>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </header>
    );
}
