

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

// Helper to convert GCS URI to a public URL
const convertGcsUriToUrl = (gcsUri: string) => {
  if (!gcsUri?.startsWith('gs://')) return '';
  const withoutScheme = gcsUri.slice('gs://'.length);
  const slash = withoutScheme.indexOf('/');
  const bucket = slash === -1 ? withoutScheme : withoutScheme.slice(0, slash);
  const object = slash === -1 ? '' : withoutScheme.slice(slash + 1);
  const encodedObject = object.split('/').map(encodeURIComponent).join('/');
  return `https://storage.googleapis.com/${bucket}/${encodedObject}`;
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract</TableHead>
              <TableHead>Status</TableHead>
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
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-semibold">${signal.strike_price.toFixed(2)} {signal.option_type?.toUpperCase()}</span>
                        <span className="text-xs text-muted-foreground">Expires: {new Date(signal.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
                        <span className="text-xs text-muted-foreground font-mono">{signal.contract_symbol}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(signal.status)}>
                        {signal.status}
                    </Badge>
                  </TableCell>
                   <TableCell>${signal.initial_price.toFixed(2)}</TableCell>
                   <TableCell>${signal.current_price.toFixed(2)}</TableCell>
                   <TableCell className={cn("text-right font-semibold", isGain ? 'text-green-500' : 'text-red-500')}>
                        {isGain ? '+' : ''}{signal.percent_gain.toFixed(2)}%
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
