
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getWinnersDashboard } from '../actions';
import type { Winner } from '@/lib/firebase-admin';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

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

function TodaysWinners() {
  const [isLoading, setIsLoading] = useState(true);
  const [winners, setWinners] = useState<Winner[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const winnersData = await getWinnersDashboard();
        setWinners(winnersData);
      } catch (error) {
        console.error('Failed to fetch winners dashboard data:', error);
        toast({
          title: 'Error Fetching Data',
          description: 'Could not load today\'s winners. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleRowClick = (ticker: string) => {
    router.push(`/dashboard/${ticker}`);
  };

  const getSignalMeta = (signal: string) => {
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('bullish')) {
      return { color: 'text-green-500', icon: <ArrowUp className="h-4 w-4" /> };
    }
    if (lowerSignal.includes('bearish')) {
      return { color: 'text-red-500', icon: <ArrowDown className="h-4 w-4" /> };
    }
    return { color: 'text-muted-foreground', icon: null };
  };

  const renderSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Today's Top Signals</CardTitle>
        <CardDescription>
          The strongest bullish and bearish signals from across the market, updated daily.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? renderSkeleton() : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Last Close</TableHead>
                <TableHead>30-Day Change</TableHead>
                <TableHead>AI Outlook</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map(winner => {
                  const imageUrl = winner.image_uri 
                      ? convertGcsUriToUrl(winner.image_uri) 
                      : `https://placehold.co/24x24/1e293b/a855f7?text=${winner.ticker[0]}`;
                  const signalMeta = getSignalMeta(winner.outlook_signal);
                  const isPositiveChange = winner.thirty_day_change_pct > 0;

                  return (
                    <TableRow key={winner.id} onClick={() => handleRowClick(winner.ticker)} className="cursor-pointer">
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                                <Image 
                                    src={imageUrl} 
                                    alt={`${winner.company_name} logo`}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                />
                                <span className="truncate">{winner.company_name}</span>
                            </div>
                        </TableCell>
                        <TableCell>{winner.ticker}</TableCell>
                        <TableCell>${winner.last_close.toFixed(2)}</TableCell>
                        <TableCell className={cn(isPositiveChange ? 'text-green-500' : 'text-red-500')}>
                            {isPositiveChange ? '+' : ''}{winner.thirty_day_change_pct.toFixed(2)}%
                        </TableCell>
                        <TableCell>
                            <div className={cn("flex items-center gap-1", signalMeta.color)}>
                                {signalMeta.icon}
                                <span>{winner.outlook_signal}</span>
                            </div>
                        </TableCell>
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

export default TodaysWinners;
