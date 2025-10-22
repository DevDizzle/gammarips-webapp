

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
import Image from 'next/image';

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

  const renderDesktopTable = () => (
      <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Strike</TableHead>
              <TableHead>Exp. Date</TableHead>
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
                  <TableCell>${signal.strike_price.toFixed(2)}</TableCell>
                  <TableCell>{new Date(signal.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</TableCell>
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
  
  const renderMobileCards = () => (
    <div className="md:hidden space-y-4">
        {signals.map((signal) => {
            const isCall = signal.option_type === 'call';
            const isGain = signal.percent_gain >= 0;

            return (
                <Card key={signal.id} className="w-full overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge variant={getStatusBadgeVariant(signal.status)}>
                                    {signal.status}
                                </Badge>
                                <p className="font-mono text-xs text-muted-foreground mt-2">{signal.contract_symbol}</p>
                            </div>
                             <div className={cn("text-right font-semibold text-lg", isGain ? 'text-green-500' : 'text-red-500')}>
                                {isGain ? '+' : ''}{signal.percent_gain.toFixed(2)}%
                                <p className="text-xs font-normal text-muted-foreground">Gain</p>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t pt-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Type</p>
                                <Badge variant="outline" className={cn('mt-1', isCall ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50')}>
                                    {signal.option_type?.toUpperCase()}
                                </Badge>
                            </div>
                             <div>
                                <p className="text-xs text-muted-foreground">Strike</p>
                                <p className="font-semibold">${signal.strike_price.toFixed(2)}</p>
                            </div>
                             <div>
                                <p className="text-xs text-muted-foreground">Exp. Date</p>
                                <p className="font-semibold">{new Date(signal.expiration_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit', timeZone: 'UTC' })}</p>
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
        <div key={i} className="grid grid-cols-8 gap-4">
          <Skeleton className="h-5 w-full" />
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

    