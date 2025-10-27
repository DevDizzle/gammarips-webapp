
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getWinnersDashboard, getPerformanceSignals } from '../actions';
import type { Winner, PerformanceSignal } from '@/lib/firebase-admin';
import { ArrowDown, ArrowUp, ChevronRight, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ViewType = 'bullish' | 'bearish' | 'gainers' | 'losers';


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
  const [activeView, setActiveView] = useState<ViewType>('bullish');
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
          getPerformanceSignals('desc', 10),
          getPerformanceSignals('asc', 10)
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
  
  const getTopUniqueTickers = (winners: Winner[], count: number): Winner[] => {
    // 1. De-duplicate winners by ticker, keeping only the one with the highest score
    const uniqueWinnersMap = new Map<string, Winner>();
    winners.forEach(winner => {
        const existing = uniqueWinnersMap.get(winner.ticker);
        if (!existing || (winner.weighted_score ?? -1) > (existing.weighted_score ?? -1)) {
            uniqueWinnersMap.set(winner.ticker, winner);
        }
    });
    const uniqueWinners = Array.from(uniqueWinnersMap.values());

    // 2. Sort the unique winners by score and return the top N
    return uniqueWinners
        .sort((a, b) => (b.weighted_score ?? -1) - (a.weighted_score ?? -1))
        .slice(0, count);
  };

  const { bullishWinners, bearishWinners, lastUpdated } = useMemo(() => {
    const bullish = allWinners.filter(w => w.outlook_signal.toLowerCase().includes('bullish'));
    const bearish = allWinners.filter(w => w.outlook_signal.toLowerCase().includes('bearish'));

    const top10Bullish = getTopUniqueTickers(bullish, 10);
    const top10Bearish = getTopUniqueTickers(bearish, 10);
    
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
      
    return { bullishWinners: top10Bullish, bearishWinners: top10Bearish, lastUpdated: updatedDate };
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
      <>
        {/* Desktop Table */}
        <Table className="hidden md:table">
            <TableHeader>
                <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Contract</TableHead>
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
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-semibold">${signal.strike_price.toFixed(2)} {signal.option_type?.toUpperCase()}</span>
                                    <span className="text-xs text-muted-foreground font-mono">{signal.contract_symbol}</span>
                                </div>
                            </TableCell>
                            <TableCell className={cn("text-right font-semibold", isGainer ? "text-green-500" : "text-red-500")}>
                                {isGainer ? '+' : ''}{signal.percent_gain.toFixed(2)}%
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>

        {/* Mobile Cards - Vertical Stack */}
        <div className="md:hidden space-y-3">
             {signals.map(signal => {
                const isGainer = signal.percent_gain >= 0;
                const imageUrl = signal.image_uri 
                    ? convertGcsUriToUrl(signal.image_uri) 
                    : `https://placehold.co/40x40/1e293b/a855f7?text=${signal.ticker[0]}`;

                return (
                    <Card key={signal.id} onClick={() => handleRowClick(signal.ticker)} className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Image 
                                        src={imageUrl} 
                                        alt={`${signal.company_name} logo`}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold truncate">{signal.company_name}</p>
                                        <p className="text-sm text-muted-foreground">{signal.ticker}</p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    <p className={cn("font-semibold", isGainer ? "text-green-500" : "text-red-500")}>
                                        {isGainer ? '+' : ''}{signal.percent_gain.toFixed(2)}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">Gain</p>
                                </div>
                            </div>
                            <div className="mt-4 border-t pt-3">
                                <p className="text-xs text-muted-foreground">Contract</p>
                                <p className="font-mono text-sm">{signal.contract_symbol}</p>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
      </>
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
                <TableHead>Industry</TableHead>
                <TableHead>Contract</TableHead>
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
                                <div>
                                    <span className="font-semibold">{winner.ticker}</span>
                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{winner.company_name}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>{winner.industry}</TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                                <span className="font-semibold">${winner.strike_price.toFixed(2)} {winner.option_type.toUpperCase()}</span>
                                <span className="text-xs text-muted-foreground">Expires: {new Date(winner.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
                            </div>
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

        {/* Mobile Cards - Vertical Stack */}
        <div className="md:hidden space-y-3">
            {winners.map(winner => {
                const imageUrl = winner.image_uri 
                    ? convertGcsUriToUrl(winner.image_uri) 
                    : `https://placehold.co/40x40/1e293b/a855f7?text=${winner.ticker[0]}`;
                const signalMeta = getSignalMeta(winner.outlook_signal);

                return (
                    <Card key={winner.id} onClick={() => handleRowClick(winner.ticker)} className="cursor-pointer transition-colors hover:bg-muted/50 h-full">
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
                                    <p className="text-muted-foreground">Contract</p>
                                    <p className="font-semibold">${winner.strike_price.toFixed(2)} {winner.option_type.toUpperCase()}</p>
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
                               <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                               <TableHead className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableHead>
                           </>
                       ) : (
                           <>
                                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
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
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                </>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <div className="md:hidden space-y-3">
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

  const renderActiveView = () => {
    if (isLoading) return renderSkeleton(activeView === 'gainers' || activeView === 'losers');

    switch (activeView) {
        case 'bullish':
            return renderWinnersList(bullishWinners);
        case 'bearish':
            return renderWinnersList(bearishWinners);
        case 'gainers':
            return renderPerformanceList(topGainers);
        case 'losers':
            return renderPerformanceList(topLosers);
        default:
            return null;
    }
  }

  const buttons: { label: string; view: ViewType }[] = [
    { label: 'Top Call Setups', view: 'bullish' },
    { label: 'Top Put Setups', view: 'bearish' },
    { label: 'Top Gainers', view: 'gainers' },
    { label: 'Top Losers', view: 'losers' },
  ];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Market Hub</CardTitle>
        <CardDescription>
          Explore today's top Call/Put setups, or review our model's historical performance with top gainers and losers. Rankings are signals for research, not investment advice.
          {lastUpdated && !isLoading && (
            <span className="block text-xs text-muted-foreground mt-2">Signal Data Last Updated: {lastUpdated}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {buttons.map(({label, view}) => (
                    <Button 
                        key={view}
                        variant={activeView === view ? 'default' : 'outline'}
                        onClick={() => setActiveView(view)}
                        className="text-xs sm:text-sm"
                    >
                        {label}
                    </Button>
                ))}
            </div>
        </div>
        
        <div className="mt-4">
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">
                <strong>Click any stock to see the full analysis.</strong>
            </p>
          </div>
          {renderActiveView()}
        </div>
      </CardContent>
    </Card>
  );
}

export default TodaysWinners;
