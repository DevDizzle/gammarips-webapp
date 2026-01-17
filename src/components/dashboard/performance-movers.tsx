'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PerformanceSignal } from '@/lib/firebase-admin';
import { WatchlistButton } from '@/components/dashboard/watchlist-button';

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

interface PerformanceMoversProps {
  gainers: PerformanceSignal[];
  losers: PerformanceSignal[];
}

export function PerformanceMovers({ gainers, losers }: PerformanceMoversProps) {
  
  const renderTable = (signals: PerformanceSignal[], title: string, isGainers: boolean) => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {isGainers ? <ArrowUp className="text-green-500 h-5 w-5" /> : <ArrowDown className="text-red-500 h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {/* Desktop Table */}
        <div className="hidden sm:block">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead className="text-right">% Change</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {signals.map((signal) => {
                const imageUrl = signal.image_uri
                    ? convertGcsUriToUrl(signal.image_uri)
                    : `https://placehold.co/32x32/1e293b/a855f7?text=${signal.ticker[0]}`;

                return (
                    <TableRow key={signal.id} className="hover:bg-muted/50">
                    <TableCell className="px-1">
                        <WatchlistButton 
                            ticker={signal.ticker} 
                            contractSymbol={signal.contract_symbol}
                            type="option"
                            price={signal.current_price}
                            companyName={signal.company_name ?? undefined}
                        />
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <Image
                            src={imageUrl}
                            alt={`${signal.company_name} logo`}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                        <div>
                            <Link href={`/${signal.ticker}`} className="font-semibold hover:underline">
                            {signal.ticker}
                            </Link>
                            <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {signal.company_name}
                            </div>
                        </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col text-sm">
                        <span className="font-medium">
                            ${signal.strike_price} {signal.option_type?.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Exp: {new Date(signal.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        </div>
                    </TableCell>
                    <TableCell className={cn("text-right font-bold", isGainers ? "text-green-500" : "text-red-500")}>
                        {isGainers ? '+' : ''}{signal.percent_gain.toFixed(2)}%
                    </TableCell>
                    </TableRow>
                );
                })}
            </TableBody>
            </Table>
        </div>

        {/* Mobile List */}
        <div className="sm:hidden divide-y">
             {signals.map((signal) => {
                const imageUrl = signal.image_uri
                    ? convertGcsUriToUrl(signal.image_uri)
                    : `https://placehold.co/40x40/1e293b/a855f7?text=${signal.ticker[0]}`;

                return (
                    <div key={signal.id} className="p-4 flex items-center justify-between gap-4">
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
                                <Link href={`/${signal.ticker}`} className="font-bold hover:underline block truncate">
                                    {signal.company_name}
                                </Link>
                                <div className="text-xs text-muted-foreground">
                                    {signal.ticker} • ${signal.strike_price} {signal.option_type?.toUpperCase()}
                                </div>
                            </div>
                        </div>
                        <div className={cn("font-bold text-sm", isGainers ? "text-green-500" : "text-red-500")}>
                             {isGainers ? '+' : ''}{signal.percent_gain.toFixed(2)}%
                        </div>
                    </div>
                )
             })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {renderTable(gainers, 'Top Gainers', true)}
      {renderTable(losers, 'Top Losers', false)}
    </div>
  );
}
