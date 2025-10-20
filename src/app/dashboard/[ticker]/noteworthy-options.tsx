
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getOptionsCandidates } from '../../actions';
import type { OptionCandidate } from '@/lib/firebase-admin';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NoteworthyOptionsProps {
    ticker: string;
}

function NoteworthyOptions({ ticker }: NoteworthyOptionsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState<OptionCandidate[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const candidatesData = await getOptionsCandidates(ticker);
        setCandidates(candidatesData);
      } catch (error) {
        console.error(`Failed to fetch options candidates for ${ticker}:`, error);
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

  const getScoreBadgeVariant = (score: number) => {
      if (score > 7) return 'default';
      if (score < 4) return 'destructive';
      return 'secondary';
  }
  
  const renderDesktopTable = () => (
      <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Strike</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Last Price</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>IV</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((c) => {
              const isCall = c.option_type === 'call';
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <Badge variant="outline" className={cn(isCall ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50')}>
                      {c.option_type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>${c.strike.toFixed(2)}</TableCell>
                  <TableCell>{new Date(c.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</TableCell>
                  <TableCell>${c.last_price?.toFixed(2) ?? 'N/A'}</TableCell>
                  <TableCell>{c.volume?.toLocaleString() ?? 'N/A'}</TableCell>
                  <TableCell>{c.implied_volatility ? `${(c.implied_volatility * 100).toFixed(1)}%` : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                       <Badge variant={getScoreBadgeVariant(c.options_score)}>
                          {c.options_score.toFixed(2)}
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
          {candidates.map((c) => {
              const isCall = c.option_type === 'call';
              return (
                  <Card key={c.id}>
                      <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className={cn(isCall ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50')}>
                                        {c.option_type.toUpperCase()}
                                    </Badge>
                                    <span className="font-bold text-lg">${c.strike.toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Exp: {new Date(c.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <p className="text-xs text-muted-foreground">Score</p>
                                <Badge variant={getScoreBadgeVariant(c.options_score)}>
                                    {c.options_score.toFixed(2)}
                                </Badge>
                            </div>
                          </div>
                          <div className="mt-4 border-t pt-4">
                              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                <div className="text-center">
                                    <p>Last Price</p>
                                    <p className="font-semibold text-foreground">${c.last_price?.toFixed(2) ?? 'N/A'}</p>
                                </div>
                                <div className="text-center">
                                    <p>Volume</p>
                                    <p className="font-semibold text-foreground">{c.volume?.toLocaleString() ?? 'N/A'}</p>
                                </div>
                                <div className="text-center">
                                    <p>IV</p>
                                    <p className="font-semibold text-foreground">{c.implied_volatility ? `${(c.implied_volatility * 100).toFixed(1)}%` : 'N/A'}</p>
                                </div>
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

    if (candidates.length === 0) {
        return <p className="text-sm text-muted-foreground">No noteworthy option contracts found for {ticker} at this time.</p>
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
            A list of all scorable contracts for this ticker. Our model analyzes thousands of contracts for key metrics like liquidity, strike, and time decay to identify actionable setups.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

export default NoteworthyOptions;

    