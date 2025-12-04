'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getPerformanceSignalsByTicker } from '@/app/actions';
import type { PerformanceSignal } from '@/lib/firebase-admin';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface ActiveSignalTrackerProps {
    ticker: string;
}

function ActiveSignalTracker({ ticker }: ActiveSignalTrackerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [signals, setSignals] = useState<PerformanceSignal[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const signalsData = await getPerformanceSignalsByTicker(ticker);
        setSignals(signalsData);
      } catch (error) {
        console.error(`Failed to fetch tracked signals for ${ticker}:`, error);
        toast({
          title: 'Error Fetching Data',
          description: 'Could not load tracked signals. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [ticker, toast]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (signals.length === 0) {
        return <p className="text-sm text-muted-foreground">No option signals are currently being tracked for {ticker}.</p>
    }
    
    return (
      <>
        {/* Desktop Table */}
        <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead>Contract Symbol</TableHead>
              <TableHead>Signal Date</TableHead>
              <TableHead>Initial Price</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead className="text-right">Gain (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signals.map((signal) => {
              const isGain = signal.percent_gain >= 0;
              return (
                <TableRow key={signal.id}>
                  <TableCell className="font-mono text-xs">{signal.contract_symbol}</TableCell>
                  <TableCell>{new Date(signal.run_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</TableCell>
                  <TableCell>${signal.initial_price.toFixed(2)}</TableCell>
                  <TableCell>${signal.current_price.toFixed(2)}</TableCell>
                  <TableCell className={cn("text-right font-semibold", isGain ? 'text-green-500' : 'text-red-500')}>
                     <span className="flex items-center justify-end gap-1">
                        {isGain ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        {signal.percent_gain.toFixed(2)}%
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {signals.map((signal) => {
            const isGain = signal.percent_gain >= 0;
            return (
              <Card key={signal.id} className="bg-background/50">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Contract</p>
                    <p className="font-mono text-xs">{signal.contract_symbol}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Initial</p>
                      <p className="font-medium">${signal.initial_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="font-medium">${signal.current_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gain</p>
                      <p className={cn("font-semibold flex items-center justify-center gap-1", isGain ? 'text-green-500' : 'text-red-500')}>
                         {isGain ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                         {isGain ? '+' : ''}{signal.percent_gain.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Signal Tracker for {ticker}</CardTitle>
        <CardDescription>
          Performance of all option signals we are actively tracking for this stock, from signal date through expiration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

export default ActiveSignalTracker;
