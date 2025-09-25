
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getOptionsSignals } from '../../actions';
import type { OptionsSignal } from '@/lib/firebase-admin';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
            // Combine calls and puts, then sort them. For example, by setup quality.
            const combinedSignals = [...signalsData.calls, ...signalsData.puts];
            
            const qualityScore = (signal: string) => {
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

    const getSignalBadgeVariant = (signal: string | undefined) => {
        if (!signal) return 'secondary';
        const lowerSignal = signal.toLowerCase();
        if (lowerSignal.includes('strong')) return 'default';
        if (lowerSignal.includes('weak')) return 'destructive';
        return 'secondary';
    }


    return (
        <Table>
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
              {signals.map(s => {
                const isCall = s.option_type === 'call';
                return (
                  <TableRow key={s.contract_symbol}>
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
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top-Scored Options for {ticker}</CardTitle>
         <CardDescription>
            These options are selected through our proprietary filtering and scoring model. We analyze thousands of contracts for key metrics like high liquidity, strategic strike price, time decay (Theta), and price sensitivity (Delta) to identify the most actionable setups.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
                <AccordionTrigger>View Top-Scored Options</AccordionTrigger>
                <AccordionContent>
                    {renderContent()}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default NoteworthyOptions;
