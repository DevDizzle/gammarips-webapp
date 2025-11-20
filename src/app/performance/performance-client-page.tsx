
'use client';

import React, { useState, useMemo } from 'react';
import type { PerformanceSignal } from '@/lib/firebase-admin';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';

type SortType = 'recent' | 'gainers' | 'losers';

const INITIAL_VISIBLE_COUNT = 25;

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

export default function PerformanceClientPage({ signals }: { signals: PerformanceSignal[] }) {
    const [sortType, setSortType] = useState<SortType>('recent');
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    const sortedSignals = useMemo(() => {
        const signalsCopy = [...signals];
        switch (sortType) {
            case 'gainers':
                return signalsCopy.sort((a, b) => b.percent_gain - a.percent_gain);
            case 'losers':
                return signalsCopy.sort((a, b) => a.percent_gain - b.percent_gain);
            case 'recent':
            default:
                return signalsCopy.sort((a, b) => {
                    const dateDiff = new Date(b.run_date).getTime() - new Date(a.run_date).getTime();
                    if (dateDiff !== 0) return dateDiff;
                    return a.ticker.localeCompare(b.ticker);
                });
        }
    }, [signals, sortType]);

    const visibleSignals = useMemo(() => {
        return sortedSignals.slice(0, visibleCount);
    }, [sortedSignals, visibleCount]);

    const buttons: { label: string; view: SortType }[] = [
        { label: 'Most Recent', view: 'recent' },
        { label: 'Top Gainers', view: 'gainers' },
        { label: 'Top Losers', view: 'losers' },
    ];

    const showAll = () => {
        setVisibleCount(sortedSignals.length);
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {buttons.map(({ label, view }) => (
                            <Button
                                key={view}
                                variant={sortType === view ? 'default' : 'outline'}
                                onClick={() => setSortType(view)}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company</TableHead>
                                <TableHead>Contract</TableHead>
                                <TableHead>Signal Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Initial Price</TableHead>
                                <TableHead>Current Price</TableHead>
                                <TableHead className="text-right">Gain</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visibleSignals.map((signal) => {
                                const isGainer = signal.percent_gain >= 0;
                                const imageUrl = signal.image_uri
                                    ? convertGcsUriToUrl(signal.image_uri)
                                    : `https://placehold.co/24x24/1e293b/a855f7?text=${signal.ticker[0]}`;
                                
                                return (
                                    <TableRow key={signal.id}>
                                      <TableCell>
                                        <Link href={`/dashboard/${signal.ticker}`} className="flex items-center gap-3 group">
                                            <Image src={imageUrl} alt={`${signal.company_name} logo`} width={24} height={24} className="rounded-full" />
                                            <div>
                                                <span className="font-bold group-hover:underline">{signal.ticker}</span>
                                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{signal.company_name}</p>
                                            </div>
                                        </Link>
                                      </TableCell>
                                      <TableCell>
                                          <span className="font-semibold">${signal.strike_price.toFixed(2)} {signal.option_type?.toUpperCase()}</span>
                                          <p className="text-xs text-muted-foreground">Expires: {new Date(signal.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</p>
                                      </TableCell>
                                      <TableCell>{new Date(signal.run_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</TableCell>
                                      <TableCell>{signal.status}</TableCell>
                                      <TableCell>${signal.initial_price.toFixed(2)}</TableCell>
                                      <TableCell>${signal.current_price.toFixed(2)}</TableCell>
                                      <TableCell className={cn("text-right font-semibold", isGainer ? "text-green-500" : "text-red-500")}>
                                          <span className="flex items-center justify-end gap-1">
                                              {isGainer ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                              {signal.percent_gain.toFixed(2)}%
                                          </span>
                                      </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {visibleSignals.map((signal) => {
                        const isGainer = signal.percent_gain >= 0;
                        const imageUrl = signal.image_uri
                            ? convertGcsUriToUrl(signal.image_uri)
                            : `https://placehold.co/40x40/1e293b/a855f7?text=${signal.ticker[0]}`;
                        
                        return (
                            <Card key={signal.id}>
                                <Link href={`/dashboard/${signal.ticker}`} className="block">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Image src={imageUrl} alt={`${signal.company_name} logo`} width={40} height={40} className="rounded-full" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold truncate">{signal.company_name}</p>
                                                    <p className="text-sm text-muted-foreground">{signal.ticker}</p>
                                                </div>
                                            </div>
                                            <div className={cn("text-right font-semibold text-lg", isGainer ? "text-green-500" : "text-red-500")}>
                                                <div className="flex items-center gap-1">
                                                    {isGainer ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                                    {signal.percent_gain.toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 border-t pt-3 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Contract</p>
                                                <p className="font-semibold">${signal.strike_price.toFixed(2)} {signal.option_type?.toUpperCase()}</p>
                                            </div>
                                             <div>
                                                <p className="text-xs text-muted-foreground">Signal Date</p>
                                                <p className="font-semibold">{new Date(signal.run_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        )
                    })}
                </div>
                
                {visibleCount < sortedSignals.length && (
                    <div className="mt-6 text-center">
                        <Button variant="secondary" onClick={showAll}>
                            Show All {sortedSignals.length} Signals
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
