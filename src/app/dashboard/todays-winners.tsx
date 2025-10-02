
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getWinnersDashboard, getPerformanceSignals } from '../actions';
import type { Winner, PerformanceSignal } from '@/lib/firebase-admin';
import { ArrowDown, ArrowUp, ChevronRight, Trophy, TrendingDown, TrendingUp } from 'lucide-react';
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
  const [topGainers, setTopGainers] = useState<PerformanceSignal[]>([]);
  const [topLosers, setTopLosers] = useState<PerformanceSignal[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [winnersData, gainersData, losersData] = await Promise.all([
          getWinnersDashboard(),
          getPerformanceSignals('desc', 5),
          getPerformanceSignals('asc', 5)
        ]);
        setAllWinners(winnersData);
        setTopGainers(gainersData);
        setTopLosers(losersData);
      } catch (error) {
        console.error('Failed to fetch market hub data:', error);
        toast({
          title: 'Error Fetching Data',
          description: 'Could not load market data. Please try again later.',
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

  const renderPerformanceList = (signals: PerformanceSignal[]) => {
    if (signals.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">No performance signals available at this time.</p>;
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Initial Price</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead className="text-right">Percent Gain</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {signals.map(signal => {
                    const isGainer = signal.percent_gain >= 0;
                     const imageUrl = signal.image_uri 
                    ? convertGcsUriToUrl(signal.image_uri) 
                    : `https://placehold.co/24x24/1e293b/a855f7?text=${signal.ticker[0]}`;
                
                    return (
                        <TableRow key={signal.id} onClick={() => handleRowClick(signal.ticker)} className="cursor-pointer">
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Image 
                                        src={imageUrl} 
                                        alt={`${signal.company_name} logo`}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                    />
                                    <div>
                                      <span className="font-bold">{signal.ticker}</span>
                                      <p className="text-xs text-muted-foreground">{signal.company_name}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{signal.industry}</TableCell>
                            <TableCell>${signal.initial_price.toFixed(2)}</TableCell>
                            <TableCell>${signal.current_price.toFixed(2)}</TableCell>
                            <TableCell className={cn("text-right font-semibold", isGainer ? "text-green-500" : "text-red-500")}>
                                {isGainer ? '+' : ''}{signal.percent_gain.toFixed(2)}%
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
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

  const renderSkeleton = (isPerformance: boolean = false) => (
    <div className="space-y-4">
        <div className="hidden md:block">
            <Table>
                <TableHeader>
                    <TableRow>
                       {isPerformance ? (
                           <>
                               <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                               <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                               <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                               <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                               <TableHead className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableHead>
                           </>
                       ) : (
                           <>
                                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-36" /></TableHead>
                           </>
                       )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            {isPerformance ? (
                                <>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                </>
                            )}
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
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Market Hub</CardTitle>
        <CardDescription>
          <p>Explore today's top Call/Put setups, or review our model's historical performance with top gainers and losers. {lastUpdated && !isLoading && (
            <span className="text-xs text-muted-foreground mt-2">Signal Data Last Updated: {lastUpdated}</span>
          )}</p>
          <p><strong>Click any stock to see the full analysis.</strong></p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bullish" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="bullish"><TrendingUp className="mr-2 h-4 w-4" /> Top Call Setups</TabsTrigger>
            <TabsTrigger value="bearish"><TrendingDown className="mr-2 h-4 w-4"/> Top Put Setups</TabsTrigger>
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
          </TabsList>
          <TabsContent value="bullish" className="mt-4">
            {isLoading ? renderSkeleton() : renderWinnersList(bullishWinners)}
          </TabsContent>
          <TabsContent value="bearish" className="mt-4">
            {isLoading ? renderSkeleton() : renderWinnersList(bearishWinners)}
          </TabsContent>
          <TabsContent value="gainers" className="mt-4">
            {isLoading ? renderSkeleton(true) : renderPerformanceList(topGainers)}
          </TabsContent>
          <TabsContent value="losers" className="mt-4">
            {isLoading ? renderSkeleton(true) : renderPerformanceList(topLosers)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default TodaysWinners;
