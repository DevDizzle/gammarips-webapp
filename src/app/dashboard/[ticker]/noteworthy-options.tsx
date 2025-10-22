

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getPerformanceSignalsByTicker } from '../../actions';
import type { PerformanceSignal } from '@/lib/firebase-admin';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SignalTrackerProps {
    ticker: string;
}

const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'secondary';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'active') return 'default';
    if (lowerStatus === 'expired') return 'outline';
    return 'secondary';
};

function SignalTracker({ ticker }: SignalTrackerProps) {
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

  const renderTable = () => (
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Strike</TableHead>
              <TableHead>Initial Price</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Gain (%)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signals.map((signal) => {
              const isCall = signal.option_type === 'call';
              const isGain = signal.percent_gain >= 0;
              return (
                <TableRow key={signal.id}>
                  <TableCell className="font-mono text-xs">{signal.contract_symbol}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(isCall ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50', "flex items-center gap-1 w-fit")}>
                      {isCall ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {signal.option_type?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>${signal.initial_price.toFixed(2)}</TableCell>
                   <TableCell>${signal.initial_price.toFixed(2)}</TableCell>
                   <TableCell>${signal.current_price.toFixed(2)}</TableCell>
                   <TableCell className={cn("font-semibold", isGain ? 'text-green-500' : 'text-red-500')}>
                        {isGain ? '+' : ''}{signal.percent_gain.toFixed(2)}%
                    </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(signal.status)}>
                        {signal.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
  );
  
  const renderSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="grid grid-cols-7 gap-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
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
        return <p className="text-sm text-muted-foreground">No option signals are currently being tracked for {ticker}.</p>
    }

    return renderTable();
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

export default SignalTracker;
