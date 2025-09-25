
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getOptionsCandidates } from '../actions';
import type { OptionCandidate } from '@/lib/firebase-admin';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

function OptionsCandidatesTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState<OptionCandidate[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const candidatesData = await getOptionsCandidates();
        setCandidates(candidatesData);
      } catch (error) {
        console.error('Failed to fetch options candidates:', error);
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
  }, [toast]);

  const handleRowClick = (ticker: string) => {
    router.push(`/dashboard/${ticker.toUpperCase()}`);
  };

  const renderSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Noteworthy Options Chains</CardTitle>
        <CardDescription>
          At-the-money or other interesting options contracts that have high potential but didn't make the top cut.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? renderSkeleton() : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Strike</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Last Price</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Implied Volatility</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map(c => {
                const isCall = c.option_type === 'call';
                return (
                  <TableRow key={c.id} onClick={() => handleRowClick(c.ticker)} className="cursor-pointer">
                    <TableCell className="font-medium">{c.ticker}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(isCall ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50')}>
                        {c.option_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>${c.strike.toFixed(2)}</TableCell>
                    <TableCell>{new Date(c.expiration_date).toLocaleDateString()}</TableCell>
                    <TableCell>${c.last_price?.toFixed(2) ?? 'N/A'}</TableCell>
                    <TableCell>{c.volume?.toLocaleString() ?? 'N/A'}</TableCell>
                    <TableCell>{c.implied_volatility ? `${(c.implied_volatility * 100).toFixed(1)}%` : 'N/A'}</TableCell>
                    <TableCell className="text-right">{c.options_score.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default OptionsCandidatesTable;
