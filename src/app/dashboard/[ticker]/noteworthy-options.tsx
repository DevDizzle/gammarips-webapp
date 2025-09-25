
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getOptionsSignals } from '../../actions';
import type { OptionsSignal } from '@/lib/firebase-admin';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface NoteworthyOptionsProps {
    ticker: string;
}

function NoteworthyOptions({ ticker }: NoteworthyOptionsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [signals, setSignals] = useState<OptionsSignal[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const signalsData = await getOptionsSignals(ticker);
        if (signalsData) {
            // Combine calls and puts, then sort them by setup quality.
            const combinedSignals = [...signalsData.calls, ...signalsData.puts];
            
            const qualityScore = (signal: string) => {
                if (!signal) return 0;
                const s = signal.toLowerCase();
                if (s.includes('strong')) return 3;
                if (s.includes('moderate')) return 2;
                if (s.includes('weak')) return 1;
                return 0;
            };

            combinedSignals.sort((a, b) => qualityScore(b.setup_quality_signal) - qualityScore(a.setup_quality_signal));
            setSignals(combinedSignals);
        }
      } catch (error) {
        console.error(`Failed to fetch options signals for ${ticker}:`, error);
        toast({
          title: 'Error Fetching Data',
          description: 'Could not load noteworthy options. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [ticker, toast]);

  const getSignalBadgeVariant = (signal: string | undefined) => {
      if (!signal) return 'secondary';
      const lowerSignal = signal.toLowerCase();
      if (lowerSignal.includes('strong')) return 'default';
      if (lowerSignal.includes('weak')) return 'destructive';
      return 'secondary';
  }

  const renderDesktopTable = () => (
      <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Strike</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Implied Volatility</TableHead>
              <TableHead className="text-right">Setup Quality</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signals.map((s, index) => {
              const isCall = s.option_type === 'call';
              const isTopSignal = index === 0;

              return (
                <TableRow key={s.contract_symbol} className={cn(isTopSignal && (isCall ? 'bg-green-500/10 hover:bg-green-500/20' : 'bg-red-500/10 hover:bg-red-500/20'))}>
                  <TableCell>
                    <Badge variant="outline" className={cn(isCall ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50')}>
                      {s.option_type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>${s.strike_price.toFixed(2)}</TableCell>
                  <TableCell>{new Date(s.expiration_date).toLocaleDateString()}</TableCell>
                  <TableCell>{`${(s.implied_volatility * 100).toFixed(1)}%`}</TableCell>
                  <TableCell className="text-right">
                      <Badge variant={getSignalBadgeVariant(s.setup_quality_signal)}>
                          {s.setup_quality_signal}
                      </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
  );

  const renderMobileCards = () => (
      <div className="space-y-3 md:hidden">
          {signals.map((s, index) => {
              const isCall = s.option_type === 'call';
              const isTopSignal = index === 0;

              return (
                  <Card key={s.contract_symbol} className={cn('cursor-pointer transition-colors hover:bg-muted/50', isTopSignal && (isCall ? 'bg-green-500/10 hover:bg-green-500/20 border-green-500/50' : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/50'))}>
                      <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className={cn(isCall ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50')}>
                                        {s.option_type.toUpperCase()}
                                    </Badge>
                                    <span className="font-bold text-lg">${s.strike_price.toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Exp: {new Date(s.expiration_date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <Badge variant={getSignalBadgeVariant(s.setup_quality_signal)}>
                                    {s.setup_quality_signal}
                                </Badge>
                            </div>
                          </div>
                          <div className="mt-4 border-t pt-4">
                              <div className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">Implied Volatility</span>
                                  <span className="font-semibold">{`${(s.implied_volatility * 100).toFixed(1)}%`}</span>
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              )
          })}
      </div>
  );
  
  const renderSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      ))}
    </div>
  );
  
  const renderContent = () => {
    if (isLoading) {
        return renderSkeleton();
    }

    if (signals.length === 0) {
        return <p className="text-sm text-muted-foreground">No top-scored option signals found for {ticker} at this time.</p>
    }

    return (
        <>
            {renderDesktopTable()}
            {renderMobileCards()}
        </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top-Scored Options for {ticker}</CardTitle>
         <CardDescription>
            These options are selected through our proprietary filtering and scoring model. We analyze thousands of contracts for key metrics like high liquidity, strategic strike price, time decay (Theta), and price sensitivity (Delta) to identify the most actionable setups. The top-ranked signal is highlighted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

export default NoteworthyOptions;
