'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { OptionsSignal } from '@/lib/firebase-admin';
import { cn } from '@/lib/utils';
import { ThumbsUp } from 'lucide-react';

const getSentimentClasses = (signal: string) => {
    if (!signal) return 'text-muted-foreground border-border bg-card';
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('bullish') || lowerSignal.includes('strong') || lowerSignal.includes('positive') || lowerSignal.includes('strengthening')) {
        return 'text-green-500 border-green-500/20 bg-green-500/10';
    }
    if (lowerSignal.includes('bearish') || lowerSignal.includes('weak') || lowerSignal.includes('negative') || lowerSignal.includes('weakening') || lowerSignal.includes('underperforming')) {
        return 'text-red-500 border-red-500/20 bg-red-500/10';
    }
    if (lowerSignal.includes('low') || lowerSignal.includes('cheap')) {
        return 'text-green-500 border-green-500/20 bg-green-500/10';
    }
     if (lowerSignal.includes('high') || lowerSignal.includes('expensive')) {
        return 'text-red-500 border-red-500/20 bg-red-500/10';
    }
    return 'text-muted-foreground border-border bg-card';
}


export const FairOptionsDisplay = ({ options }: { options: OptionsSignal[] }) => {
    if (!options || options.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <ThumbsUp className="text-muted-foreground" />
                    Noteworthy Setups
                </CardTitle>
                <CardDescription>
                    These options have a "Fair" setup quality. They might offer interesting opportunities but have some trade-offs compared to our top-rated signal.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Contract</TableHead>
                                <TableHead>Trend Signal</TableHead>
                                <TableHead>Volatility</TableHead>
                                <TableHead>AI Summary</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {options.map((option) => (
                                <TableRow key={option.contract_symbol}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">${option.strike_price.toFixed(2)} {option.option_type.toUpperCase()}</span>
                                            <span className="text-xs text-muted-foreground">
                                                Expires: {new Date(option.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("text-xs", getSentimentClasses(option.stock_price_trend_signal || ''))}>
                                            {option.stock_price_trend_signal}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("text-xs", getSentimentClasses(option.volatility_comparison_signal || ''))}>
                                            {option.volatility_comparison_signal}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-xs">
                                        {option.summary}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {options.map((option) => (
                        <Card key={option.contract_symbol} className="bg-background/50">
                            <CardContent className="p-4 space-y-3">
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="col-span-1">
                                        <p className="text-muted-foreground">Contract</p>
                                        <p className="font-semibold">{option.option_type.toUpperCase()}</p>
                                    </div>
                                    <div className="col-span-1">
                                        <p className="text-muted-foreground">Strike</p>
                                        <p className="font-semibold">${option.strike_price.toFixed(2)}</p>
                                    </div>
                                     <div className="col-span-1">
                                        <p className="text-muted-foreground">Expires</p>
                                        <p className="font-semibold">{new Date(option.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <p className="text-muted-foreground">Stock Trend</p>
                                        <Badge variant="outline" className={cn("text-xs", getSentimentClasses(option.stock_price_trend_signal || ''))}>
                                            {option.stock_price_trend_signal}
                                        </Badge>
                                    </div>
                                     <div className="flex justify-between items-center text-sm">
                                        <p className="text-muted-foreground">Volatility</p>
                                        <Badge variant="outline" className={cn("text-xs", getSentimentClasses(option.volatility_comparison_signal || ''))}>
                                            {option.volatility_comparison_signal}
                                        </Badge>
                                    </div>
                                </div>
                                 <div>
                                     <p className="text-xs text-muted-foreground">{option.summary}</p>
                                 </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};