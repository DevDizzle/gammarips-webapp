'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BlurGate } from '@/components/ui/blur-gate';
import { ArrowUp, ArrowDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublicDashboardData } from '@/app/dashboard/actions';
import type { Winner, PerformanceSignal } from '@/lib/firebase-admin';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import { useAuth } from '@/hooks/use-auth';
import { getWinnersDashboard, getPerformanceSignals } from '@/app/actions';
import { WatchlistButton } from '@/components/dashboard/watchlist-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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
  const router = useRouter();
  const { openAuthModal } = useAuthModal();
  const { user } = useAuth();

  const [fullWinners, setFullWinners] = useState<Winner[] | null>(null);
  const [fullGainers, setFullGainers] = useState<PerformanceSignal[] | null>(null);
  const [fullLosers, setFullLosers] = useState<PerformanceSignal[] | null>(null);
  const [loadingFullData, setLoadingFullData] = useState(false);

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
    const allSignals = user && fullList ? fullList : publicSignals.slice(0, 3);
    const isLocked = !user;

    return (
      <div className="relative">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {allSignals.map(signal => {
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
                                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">{signal.company_name}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-semibold">${signal.strike_price.toFixed(2)} {signal.option_type?.toUpperCase()}</span>
                                    <span className="text-xs text-muted-foreground">Expires: {new Date(signal.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
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

        <BlurGate isLocked={isLocked} message={`Join to see all ${total} movers`}>
            {isLocked && (
                <div className="mt-4 space-y-2 opacity-50 grayscale">
                    {Array.from({ length: Math.min(3, total - allSignals.length) }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded-lg h-[57px]">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-muted" />
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
      </div>
    );
  };
  
  const renderWinnersList = (publicWinners: Winner[], total: number, filterType: 'call' | 'put') => {
    let allWinners = publicWinners;
    if (user && fullWinners) {
        allWinners = fullWinners.filter(w => w.option_type.toLowerCase().includes(filterType));
    } else {
        allWinners = allWinners.slice(0, 3);
    }
    const isLocked = !user;
    
    return (
      <div className="relative">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>AI Outlook</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {allWinners.map(winner => {
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
                        <TableCell>
                           <div className="flex flex-col">
                                <span className="font-semibold">${winner.strike_price.toFixed(2)} {winner.option_type.toUpperCase()}</span>
                                <span className="text-xs text-muted-foreground">Expires: {new Date(winner.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
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

        <BlurGate isLocked={isLocked} message="Unlock full daily winners list">
            {isLocked && (
                <div className="mt-4 space-y-2 opacity-50 grayscale">
                    {Array.from({ length: Math.min(3, total - allWinners.length) }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-2 border rounded-lg h-[57px]">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-muted" />
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
      </div>
    );
  }

  const renderContent = () => {
    if (loadingFullData && user) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const items = [
        { type: 'bullish', title: `Top Call Setups (${data.bullish.total})`, data: data.bullish, filter: 'call' as const },
        { type: 'bearish', title: `Top Put Setups (${data.bearish.total})`, data: data.bearish, filter: 'put' as const },
        { type: 'gainers', title: `Top Gainers (${data.gainers.total})`, data: data.gainers, fullList: fullGainers },
        { type: 'losers', title: `Top Losers (${data.losers.total})`, data: data.losers, fullList: fullLosers },
    ];
    
    return (
        <Accordion type="single" collapsible className="w-full" defaultValue="bullish">
            {items.map(item => (
                <AccordionItem value={item.type} key={item.type}>
                    <AccordionTrigger className="text-base font-semibold hover:no-underline">
                        {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                       {(item.type === 'bullish' || item.type === 'bearish') 
                            ? renderWinnersList(item.data.items as Winner[], item.data.total, item.filter)
                            : renderPerformanceList(item.data.items as PerformanceSignal[], item.data.total, item.fullList as PerformanceSignal[] | null)
                        }
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
  }

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
      <CardContent className="p-4 sm:p-6 pt-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
