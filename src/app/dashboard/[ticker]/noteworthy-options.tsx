'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getNoteworthyOptions } from '../../actions';
import type { OptionsSignal } from '@/lib/firebase-admin';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface NoteworthyOptionsProps {
    ticker: string;
}

const getSignalBadgeVariant = (signal?: string) => {
    if (!signal) return 'secondary';
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('strong')) return 'default';
    if (lowerSignal.includes('fair')) return 'secondary';
    return 'outline';
};

function NoteworthyOptions({ ticker }: NoteworthyOptionsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [signals, setSignals] = useState<OptionsSignal[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const signalsData = await getNoteworthyOptions(ticker);
        setSignals(signalsData);
      } catch (error) {
        console.error(`Failed to fetch noteworthy options for ${ticker}:`, error);
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

  const renderDesktopTable = () => (
      <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Strike</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Setup Quality</TableHead>
              <TableHead className="w-[50%]">AI Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signals.map((signal) => {
              const isCall = signal.option_type === 'call';
              return (
                <TableRow key={signal.contract_symbol}>
                  <TableCell>
                    <Badge variant="outline" className={cn(isCall ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50', "flex items-center gap-1 w-fit")}>
                      {isCall ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {signal.option_type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>${signal.strike_price.toFixed(2)}</TableCell>
                  <TableCell>{new Date(signal.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</TableCell>
                   <TableCell>
                        <Badge variant={getSignalBadgeVariant(signal.setup_quality_signal)}>
                            {signal.setup_quality_signal}
                        </Badge>
                    </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{signal.summary}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
  );

  const renderMobileCards = () => (
      <div className="space-y-3 md:hidden">
          {signals.map((signal) => {
              const isCall = signal.option_type === 'call';
              return (
                  <Card key={signal.contract_symbol}>
                      <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className={cn(isCall ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50', "flex items-center gap-1")}>
                                      {isCall ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                      {signal.option_type.toUpperCase()}
                                    </Badge>
                                    <span className="font-bold text-lg">${signal.strike_price.toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Exp: {new Date(signal.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</p>
                            </div>
                            <Badge variant={getSignalBadgeVariant(signal.setup_quality_signal)}>
                                {signal.setup_quality_signal}
                            </Badge>
                          </div>
                          <div className="mt-3 border-t pt-3">
                              <p className="text-xs text-muted-foreground">{signal.summary}</p>
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
        return <p className="text-sm text-muted-foreground">No noteworthy option contracts with a "Strong" or "Fair" setup were found for {ticker} at this time.</p>
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
        <CardTitle>Noteworthy Options for {ticker}</CardTitle>
        <CardDescription>
            A filtered list of scorable contracts where our AI has identified a "Strong" or "Fair" setup quality with "Cheap" volatility.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

export default NoteworthyOptions;
