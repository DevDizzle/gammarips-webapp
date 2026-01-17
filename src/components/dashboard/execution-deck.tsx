import { Badge } from '@/components/ui/badge';
import { DashboardDataV2 } from '@/lib/types/dashboard-v2';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    const { titleInfo, analysis, industry, runDate } = data;
    const { summary, tradeSetup } = analysis;

    const formattedRunDate = new Date(runDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });

    return (
        <header className="space-y-6">
            <div className="space-y-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold font-headline tracking-tight flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="truncate">{titleInfo.companyName} ({data.ticker})</span>
                        {industry && <Badge variant="secondary">{industry}</Badge>}
                    </h1>
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
                                <p className="text-2xl font-bold tracking-tight">${tradeSetup.suggestedOption.strike}</p>
                            </div>
                            <div className="p-3 bg-background rounded-lg border">
                                <p className="text-xs text-muted-foreground">Expires</p>
                                <p className="text-2xl font-bold tracking-tight truncate">
                                    {new Date(tradeSetup.suggestedOption.expirationDate).toLocaleDateString('en-US', {month:'short', day:'numeric', timeZone: 'UTC'})}
                                </p>
                            </div>
                            <div className="p-3 bg-background rounded-lg border">
                                <p className="text-xs text-muted-foreground">DTE</p>
                                <p className="text-2xl font-bold tracking-tight">{tradeSetup.suggestedOption.dte}</p>
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
                                        {tradeSetup.suggestedOption.summary}
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
