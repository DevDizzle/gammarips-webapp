
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BlurGate } from '@/components/ui/blur-gate';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LandingPageData } from '@/app/landing-page-actions';
import type { Winner } from '@/lib/firebase-admin';
import { useAuth } from '@/hooks/use-auth';
import { getWinnersDashboard } from '@/app/actions';
import { WatchlistButton } from '@/components/dashboard/watchlist-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { IndicesTicker } from '@/components/dashboard/indices-ticker';

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

const TRUNCATE_LIMIT = 5;

export function MarketHub({ data }: { data: LandingPageData }) {
  const router = useRouter();
  const { user } = useAuth();

  const [fullWinners, setFullWinners] = useState<Winner[] | null>(null);
  const [loadingFullData, setLoadingFullData] = useState(false);
  const [expandedTabs, setExpandedTabs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchFullData() {
        if (!user) return;
        setLoadingFullData(true);
        try {
            const winners = await getWinnersDashboard();
            setFullWinners(winners);
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
     router.push(`/${ticker.toUpperCase()}`);
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

  const ExpandToggle = ({ listKey, count }: { listKey: string, count: number }) => {
    if (count <= TRUNCATE_LIMIT) return null;
    const isExpanded = !!expandedTabs[listKey];

    return (
        <div className="text-center pt-2">
            <Button variant="link" onClick={() => setExpandedTabs(prev => ({...prev, [listKey]: !isExpanded}))}>
                {isExpanded ? "Show Less" : "Show All"}
            </Button>
        </div>
    );
  };
  
  const renderWinnersList = (tabKey: string, publicWinners: Winner[], total: number, filterType: 'call' | 'put') => {
    const isExpanded = !!expandedTabs[tabKey];
    let winnersToShow: Winner[];

    if (user && fullWinners) {
        const filtered = fullWinners.filter(w => w.option_type.toLowerCase().includes(filterType));
        filtered.sort((a,b) => (b.weighted_score ?? 0) - (a.weighted_score ?? 0));
        winnersToShow = isExpanded ? filtered : filtered.slice(0, TRUNCATE_LIMIT);
    } else {
        winnersToShow = publicWinners.slice(0, TRUNCATE_LIMIT);
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
            {winnersToShow.map(winner => {
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
                                    className="rounded-full object-cover"
                                    style={{ width: '24px', height: '24px' }}
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
                    {Array.from({ length: Math.min(3, total - winnersToShow.length) }).map((_, i) => (
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
        {user && <ExpandToggle listKey={tabKey} count={total} />}
      </div>
    );
  };

  const renderContent = () => {
    if (loadingFullData && user) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <Tabs defaultValue="bullish">
            <TabsList className="grid w-full grid-cols-2 h-auto mb-4">
                <TabsTrigger value="bullish">Top Calls ({data.bullish.total})</TabsTrigger>
                <TabsTrigger value="bearish">Top Puts ({data.bearish.total})</TabsTrigger>
            </TabsList>
            <TabsContent value="bullish">
                {renderWinnersList('bullish', data.bullish.items, data.bullish.total, 'call')}
            </TabsContent>
            <TabsContent value="bearish">
                {renderWinnersList('bearish', data.bearish.items, data.bearish.total, 'put')}
            </TabsContent>
        </Tabs>
    );
  }

  return (
    <div className="space-y-6">
        <section>
            <IndicesTicker />
        </section>
        
        <Card className="h-full">
        <CardHeader>
            <CardTitle>Market Hub</CardTitle>
            <CardDescription>
            Daily high-conviction setups.
            {data.lastUpdated && (
                <span className="block text-xs text-muted-foreground mt-2">Data Last Updated: {data.lastUpdated}</span>
            )}
            </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
            {renderContent()}
        </CardContent>
        </Card>
    </div>
  );
}
