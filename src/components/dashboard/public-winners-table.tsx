
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BlurGate } from '@/components/ui/blur-gate';
import { ArrowUp, ArrowDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublicDashboardData } from '@/app/dashboard/actions';
import type { Winner, PerformanceSignal } from '@/lib/firebase-admin';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import { useAuth } from '@/hooks/use-auth';
import { getWinnersDashboard, getPerformanceSignals } from '@/app/actions';
import { WatchlistButton } from '@/components/dashboard/watchlist-button';

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

interface PublicWinnersTableProps {
  data: PublicDashboardData;
}

export function PublicWinnersTable({ data }: PublicWinnersTableProps) {
  const [activeView, setActiveView] = useState<ViewType>('bullish');
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const { user } = useAuth();

  const [fullWinners, setFullWinners] = useState<Winner[] | null>(null);
  const [fullGainers, setFullGainers] = useState<PerformanceSignal[] | null>(null);
  const [fullLosers, setFullLosers] = useState<PerformanceSignal[] | null>(null);
  const [loadingFullData, setLoadingFullData] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Reset showAll when view changes
  useEffect(() => {
    setShowAll(false);
  }, [activeView]);

  useEffect(() => {
    async function fetchFullData() {
        if (!user) return;
        setLoadingFullData(true);
        try {
            const [winners, gainers, losers] = await Promise.all([
                getWinnersDashboard(),
                getPerformanceSignals('desc', 50),
                getPerformanceSignals('asc', 50)
            ]);
            setFullWinners(winners);
            setFullGainers(gainers);
            setFullLosers(losers);
        } catch (error) {
            console.error("Failed to fetch full dashboard data", error);
        } finally {
            setLoadingFullData(false);
        }
    }

    if (user && !fullWinners) {
        fetchFullData();
    }
  }, [user, fullWinners]);


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

  const renderPerformanceList = (publicSignals: PerformanceSignal[], total: number, fullList: PerformanceSignal[] | null) => {
    // If logged in and data fetched, use full list. Otherwise use public list.
    const allSignals = user && fullList ? fullList : publicSignals;
    // Determine how many to show
    const displaySignals = showAll ? allSignals : allSignals.slice(0, 10);

    // Lock only if NOT logged in
    const isLocked = !user;
    const lockedCount = isLocked ? Math.max(0, total - publicSignals.length) : 0;

    return (
      <div className="relative">
        {/* Desktop Table */}
        <Table className="hidden md:table">
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead className="text-right">Entry</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {displaySignals.map(signal => {
                    const isGainer = signal.percent_gain >= 0;
                    const imageUrl = signal.image_uri 
                    ? convertGcsUriToUrl(signal.image_uri) 
                    : `https://placehold.co/24x24/1e293b/a855f7?text=${signal.ticker[0]}`;
                
                    return (
                        <TableRow key={signal.id} onClick={() => handleRowClick(signal.ticker)} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="px-1">
                                <WatchlistButton 
                                    ticker={signal.ticker} 
                                    contractSymbol={signal.contract_symbol}
                                    type="option"
                                    price={signal.current_price}
                                    companyName={signal.company_name ?? undefined}
                                />
                            </TableCell>
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
                                    <span className="text-xs text-muted-foreground">Expires: {new Date(signal.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                                ${signal.initial_price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                                ${signal.current_price.toFixed(2)}
                            </TableCell>
                            <TableCell className={cn("text-right font-semibold", isGainer ? "text-green-500" : "text-red-500")}>
                                {isGainer ? '+' : ''}{signal.percent_gain.toFixed(2)}%
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
             {displaySignals.map(signal => {
                const isGainer = signal.percent_gain >= 0;
                const imageUrl = signal.image_uri 
                    ? convertGcsUriToUrl(signal.image_uri) 
                    : `https://placehold.co/40x40/1e293b/a855f7?text=${signal.ticker[0]}`;

                return (
                    <Card key={signal.id} onClick={() => handleRowClick(signal.ticker)} className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <WatchlistButton 
                                        ticker={signal.ticker} 
                                        contractSymbol={signal.contract_symbol}
                                        type="option"
                                        price={signal.current_price}
                                        companyName={signal.company_name ?? undefined}
                                    />
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
                                    <div className="text-[10px] text-muted-foreground flex flex-col">
                                        <span>E: ${signal.initial_price.toFixed(2)}</span>
                                        <span>C: ${signal.current_price.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>

        {/* The Gate */}
        <BlurGate isLocked={isLocked} message={`Join to see all ${total} movers`}>
            {isLocked && (
                <div className="mt-4 space-y-2 opacity-50 grayscale">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted" />
                                <div className="space-y-1">
                                    <div className="h-4 w-24 bg-muted rounded" />
                                    <div className="h-3 w-16 bg-muted rounded" />
                                </div>
                            </div>
                            <div className="h-6 w-12 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            )}
        </BlurGate>

        {user && allSignals.length > 10 && (
            <div className="text-center">
                 <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Show Less' : `Show All (${allSignals.length})`}
                 </Button>
            </div>
        )}
      </div>
    );
  };
  
  const renderWinnersList = (publicWinners: Winner[], total: number, filterType: 'call' | 'put') => {
    // If logged in and data fetched, filter the full list.
    let allWinners = publicWinners;
    if (user && fullWinners) {
        allWinners = fullWinners.filter(w => w.option_type.toLowerCase().includes(filterType));
    }

    const displayWinners = showAll ? allWinners : allWinners.slice(0, 10);
    const isLocked = !user;
    
    return (
      <div className="relative">
        <Table className="hidden md:table">
            <TableHeader>
            <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>AI Outlook</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {displayWinners.map(winner => {
                const imageUrl = winner.image_uri 
                    ? convertGcsUriToUrl(winner.image_uri) 
                    : `https://placehold.co/24x24/1e293b/a855f7?text=${winner.ticker[0]}`;
                const signalMeta = getSignalMeta(winner.outlook_signal);
                
                return (
                    <TableRow key={winner.id} onClick={() => handleRowClick(winner.ticker)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="px-1">
                             <WatchlistButton 
                                ticker={winner.ticker} 
                                contractSymbol={winner.contract_symbol}
                                type="option"
                                // Winner object doesn't have current option price usually, so undefined
                                companyName={winner.company_name}
                            />
                        </TableCell>
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

        <div className="md:hidden space-y-3">
            {displayWinners.map(winner => {
                const imageUrl = winner.image_uri 
                    ? convertGcsUriToUrl(winner.image_uri) 
                    : `https://placehold.co/40x40/1e293b/a855f7?text=${winner.ticker[0]}`;
                const signalMeta = getSignalMeta(winner.outlook_signal);

                return (
                    <Card key={winner.id} onClick={() => handleRowClick(winner.ticker)} className="cursor-pointer transition-colors hover:bg-muted/50 h-full">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <WatchlistButton 
                                        ticker={winner.ticker} 
                                        contractSymbol={winner.contract_symbol}
                                        type="option"
                                        companyName={winner.company_name}
                                    />
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

        <BlurGate isLocked={isLocked} message="Unlock full daily winners list">
            {isLocked && (
                <div className="mt-4 space-y-2 opacity-50 grayscale">
                    {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted" />
                                <div className="space-y-1">
                                    <div className="h-4 w-24 bg-muted rounded" />
                                    <div className="h-3 w-16 bg-muted rounded" />
                                </div>
                            </div>
                            <div className="h-6 w-12 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            )}
        </BlurGate>

         {user && allWinners.length > 10 && (
            <div className="text-center">
                 <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Show Less' : `Show All (${allWinners.length})`}
                 </Button>
            </div>
        )}
      </div>
    );
  }

  const renderActiveView = () => {
    if (loadingFullData && user) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    switch (activeView) {
        case 'bullish':
            return renderWinnersList(data.bullish.items, data.bullish.total, 'call');
        case 'bearish':
            return renderWinnersList(data.bearish.items, data.bearish.total, 'put');
        case 'gainers':
            return renderPerformanceList(data.gainers.items, data.gainers.total, fullGainers);
        case 'losers':
            return renderPerformanceList(data.losers.items, data.losers.total, fullLosers);
        default:
            return null;
    }
  }

  const buttons: { label: string; view: ViewType }[] = [
    { label: 'Top Calls', view: 'bullish' },
    { label: 'Top Puts', view: 'bearish' },
    { label: 'Top Gainers', view: 'gainers' },
    { label: 'Top Losers', view: 'losers' },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Market Hub</CardTitle>
        <CardDescription>
          Daily high-conviction setups and top-performing contracts. Rankings are for research, not investment advice.
          {data.lastUpdated && (
            <span className="block text-xs text-muted-foreground mt-2">Data Last Updated: {data.lastUpdated}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
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
        
        {renderActiveView()}
      </CardContent>
    </Card>
  );
}
