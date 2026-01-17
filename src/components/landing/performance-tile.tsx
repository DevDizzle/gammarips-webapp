
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BlurGate } from '@/components/ui/blur-gate';
import { cn } from '@/lib/utils';
import type { LandingPageData } from '@/app/landing-page-actions';
import type { PerformanceSignal } from '@/lib/firebase-admin';
import { useAuth } from '@/hooks/use-auth';
import { getPerformanceSignals } from '@/app/actions';
import { WatchlistButton } from '@/components/dashboard/watchlist-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

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

const StatCard = ({ title, value, subtext }: { title: string; value: string; subtext?: string }) => {
    const isPositive = value.startsWith('+');
    const isNegative = value.startsWith('-');
    const valueColor = isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-primary";

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold", valueColor)}>{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
    )
};

export function PerformanceTile({ data }: { data: LandingPageData }) {
  const router = useRouter();
  const { user } = useAuth();
  const { performanceStats: stats } = data;

  const [fullGainers, setFullGainers] = useState<PerformanceSignal[] | null>(null);
  const [fullLosers, setFullLosers] = useState<PerformanceSignal[] | null>(null);
  const [expandedTabs, setExpandedTabs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchFullData() {
        if (!user) return;
        try {
            const [gainers, losers] = await Promise.all([
                getPerformanceSignals('desc', 50),
                getPerformanceSignals('asc', 50)
            ]);
            setFullGainers(gainers);
            setFullLosers(losers);
        } catch (error) {
            console.error("Failed to fetch full performance data", error);
        }
    }

    if (user && !fullGainers) {
        fetchFullData();
    }
  }, [user, fullGainers]);

  const handleRowClick = (ticker: string) => {
     router.push(`/${ticker.toUpperCase()}`);
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
  
  const renderPerformanceList = (tabKey: string, publicSignals: PerformanceSignal[], total: number, fullList: PerformanceSignal[] | null) => {
    const isExpanded = !!expandedTabs[tabKey];
    let signalsToShow: PerformanceSignal[];

    if (user && fullList) {
        signalsToShow = isExpanded ? fullList : fullList.slice(0, TRUNCATE_LIMIT);
    } else {
        signalsToShow = publicSignals.slice(0, TRUNCATE_LIMIT);
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
                    <TableHead className="text-right">ROI</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {signalsToShow.map(signal => {
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
                                        className="rounded-full object-cover"
                                        style={{ width: '24px', height: '24px' }}
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
                    {Array.from({ length: Math.min(3, total - signalsToShow.length) }).map((_, i) => (
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Performance Tracker</CardTitle>
        <CardDescription>
            Historical performance of all AI-generated signals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
                title="Total ROI" 
                value={`${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(2)}%`}
                subtext={stats.signalCount > 0 ? `Across ${stats.signalCount} Setups` : ''}
            />
            <StatCard 
                title="Win Rate" 
                value={`${stats.winRate.toFixed(1)}%`}
                subtext="Setups with positive gain"
            />
            <StatCard 
                title="Winner ROI" 
                value={`${stats.winnerRoi >= 0 ? '+' : ''}${stats.winnerRoi.toFixed(2)}%`}
                subtext="Avg. ROI on winners"
            />
            <StatCard 
                title="Loser ROI" 
                value={`${stats.loserRoi.toFixed(2)}%`}
                subtext="Avg. ROI on losers"
            />
        </div>

        {/* List */}
        <Tabs defaultValue="gainers">
            <TabsList className="grid w-full grid-cols-2 h-auto mb-4">
                <TabsTrigger value="gainers">Top Gainers ({data.gainers.total})</TabsTrigger>
                <TabsTrigger value="losers">Top Losers ({data.losers.total})</TabsTrigger>
            </TabsList>
            <TabsContent value="gainers">
                {renderPerformanceList('gainers', data.gainers.items, data.gainers.total, fullGainers)}
            </TabsContent>
            <TabsContent value="losers">
                {renderPerformanceList('losers', data.losers.items, data.losers.total, fullLosers)}
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
