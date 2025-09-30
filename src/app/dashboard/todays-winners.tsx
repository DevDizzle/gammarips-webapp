
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getWinnersDashboard } from '../actions';
import type { Winner } from '@/lib/firebase-admin';
import { ArrowDown, ArrowUp, ChevronRight, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Markdown } from '@/components/markdown';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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
  const [allWinners, setAllWinners] = useState<Winner[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const winnersData = await getWinnersDashboard();
        setAllWinners(winnersData);
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
  
  const { bullishWinners, bearishWinners, lastUpdated } = useMemo(() => {
    const bullish = allWinners
      .filter(w => w.outlook_signal.toLowerCase().includes('bullish'))
      .sort((a, b) => (b.weighted_score ?? -Infinity) - (a.weighted_score ?? -Infinity));

    const bearish = allWinners
      .filter(w => w.outlook_signal.toLowerCase().includes('bearish'))
      .sort((a, b) => (a.weighted_score ?? Infinity) - (b.weighted_score ?? Infinity));
    
    let updatedDate: string | null = null;
    if (allWinners.length > 0) {
      try {
        updatedDate = new Date(allWinners[0].run_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC' // Important for consistency
        });
      } catch (e) {
          console.error("Failed to parse run_date:", allWinners[0].run_date);
      }
    }
      
    return { bullishWinners: bullish, bearishWinners: bearish, lastUpdated: updatedDate };
  }, [allWinners]);

  const handleRowClick = (ticker: string) => {
    router.push(`/dashboard/${ticker.toUpperCase()}`);
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
  
  const renderWinnersList = (winners: Winner[]) => {
    if (winners.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-4">No signals found for this category today.</p>;
    }
    
    return (
      <>
        {/* Desktop Table */}
        <Table className="hidden md:table">
            <TableHeader>
            <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Ticker</TableHead>
                <TableHead>Last Close</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>AI Outlook</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {winners.map(winner => {
                const imageUrl = winner.image_uri 
                    ? convertGcsUriToUrl(winner.image_uri) 
                    : `https://placehold.co/24x24/1e293b/a855f7?text=${winner.ticker[0]}`;
                const signalMeta = getSignalMeta(winner.outlook_signal);
                
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
                        <TableCell>{winner.industry}</TableCell>
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

        {/* Mobile Cards */}
        <div className="space-y-3 md:hidden">
            {winners.map(winner => {
                const imageUrl = winner.image_uri 
                    ? convertGcsUriToUrl(winner.image_uri) 
                    : `https://placehold.co/40x40/1e293b/a855f7?text=${winner.ticker[0]}`;
                const signalMeta = getSignalMeta(winner.outlook_signal);

                return (
                    <Card key={winner.id} onClick={() => handleRowClick(winner.ticker)} className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Image 
                                        src={imageUrl} 
                                        alt={`${winner.company_name} logo`}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold truncate">{winner.company_name}</p>
                                        <p className="text-sm text-muted-foreground">{winner.ticker}</p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Last Close</p>
                                    <p className="font-semibold">${winner.last_close.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">AI Outlook</p>
                                    <div className={cn("flex items-center gap-1 font-semibold", signalMeta.color)}>
                                        {signalMeta.icon}
                                        <span>{winner.outlook_signal}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
      </>
    );
  }

  const renderSkeleton = () => (
    <div className="space-y-4">
        <div className="hidden md:block">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-36" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <div className="space-y-3 md:hidden">
             {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-16 mt-1" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-5" />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <Skeleton className="h-4 w-20 mb-1" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                            <div>
                                <Skeleton className="h-4 w-20 mb-1" />
                                <Skeleton className="h-5 w-28" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );

  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Today's Top Opportunities</CardTitle>
          <CardDescription>
            <Markdown content="The strongest bullish and bearish signals from across the market. **Click any stock to see the top options setup and our analysis.**" />
            {lastUpdated && !isLoading && (
              <p className="text-xs text-muted-foreground mt-2">Last Updated: {lastUpdated}</p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bullish" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bullish">Top Call Setups</TabsTrigger>
              <TabsTrigger value="bearish">Top Put Setups</TabsTrigger>
            </TabsList>
            <TabsContent value="bullish" className="mt-4">
              {isLoading ? renderSkeleton() : renderWinnersList(bullishWinners)}
            </TabsContent>
            <TabsContent value="bearish" className="mt-4">
              {isLoading ? renderSkeleton() : renderWinnersList(bearishWinners)}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex-col items-center gap-4 border-t bg-card/50 px-6 py-4">
            <div className="text-center">
                <h3 className="font-bold flex items-center gap-2 justify-center"><Trophy className="text-yellow-500" /> Real Traders, Real Wins.</h3>
                <p className="text-sm text-muted-foreground">Check out the latest winning screenshots. Nailed a great trade? Share your success and inspire the community!</p>
            </div>
            <Button asChild>
                <Link href="/winners-circle">Share Your Win</Link>
            </Button>
        </CardFooter>
      </Card>
    </>
  );
}

export default TodaysWinners;
