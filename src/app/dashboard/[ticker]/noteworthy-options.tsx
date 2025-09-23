'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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

  const renderSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-4">
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
        return <p className="text-sm text-muted-foreground">No noteworthy option candidates found for {ticker} at this time.</p>
    }

    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Strike</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Last Price</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Implied Vol.</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map(c => {
                const isCall = c.type === 'CALL';
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Badge variant="outline" className={cn(isCall ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50')}>
                        {c.type}
                      </Badge>
                    </TableCell>
                    <TableCell>${c.strike_price.toFixed(2)}</TableCell>
                    <TableCell>{new Date(c.expiry_date).toLocaleDateString()}</TableCell>
                    <TableCell>${c.premium.toFixed(2)}</TableCell>
                    <TableCell>{c.volume?.toLocaleString() ?? 'N/A'}</TableCell>
                    <TableCell>{c.implied_volatility ? `${(c.implied_volatility * 100).toFixed(1)}%` : 'N/A'}</TableCell>
                    <TableCell className="text-right">{c.options_score.toFixed(2)}</TableCell>
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
        <CardTitle>Noteworthy Options</CardTitle>
         <CardDescription>
            Interesting option contracts for {ticker} that have high potential but didn't make the top cut.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
                <AccordionTrigger>View Noteworthy Options</AccordionTrigger>
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
