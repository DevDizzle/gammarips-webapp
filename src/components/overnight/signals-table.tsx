'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { type OvernightSignal } from '@/lib/firebase-admin';

interface SignalsTableProps {
  signals: OvernightSignal[];
  title: string;
}

export function SignalsTable({ signals, title }: SignalsTableProps) {
  const formatMoney = (amount: number) => {
    if (!amount || amount === 0) return '—';
    if (Math.abs(amount) >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  // One neutral color on purpose: the score is descriptive context, and a
  // green/amber tier would render it as the quality grade the copy says it
  // is not.
  const getScoreColor = (_score: number) => "bg-slate-500 hover:bg-slate-600";

  // Calculate total dollar volume as positioning
  const getPositioning = (signal: OvernightSignal) => {
    const callVol = signal.call_dollar_volume || 0;
    const putVol = signal.put_dollar_volume || 0;
    return callVol + putVol;
  };

  return (
    <div className="rounded-md border bg-card">
      <div className="p-4 border-b">
        <h2 id="signals-table-heading" className="font-semibold text-lg">{title}</h2>
      </div>
      <div
        tabIndex={0}
        role="region"
        aria-labelledby="signals-table-heading"
        className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Ticker</TableHead>
              <TableHead scope="col" className="text-center">Flow Score</TableHead>
              <TableHead scope="col" className="text-right">1D Move</TableHead>
              <TableHead scope="col" className="text-right">Options Flow</TableHead>
              <TableHead scope="col" className="hidden md:table-cell">Summary</TableHead>
              <TableHead scope="col" className="w-[50px]"><span className="sr-only">Detail</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No setups in the pool for this date.
                </TableCell>
              </TableRow>
            ) : (
              signals.map((signal) => {
                const movePct = signal.price_change_pct || 0;
                return (
                  <TableRow key={signal.id} className="cursor-pointer hover:bg-muted/50 transition-colors group">
                    <TableCell className="font-bold font-mono text-base">
                      <Link href={`/signals/${signal.ticker}`} className="hover:underline underline-offset-4">
                        {signal.ticker}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${getScoreColor(signal.overnight_score)} text-white border-0`}>
                        {signal.overnight_score}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${movePct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {movePct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(movePct).toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatMoney(getPositioning(signal))}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px] text-sm text-muted-foreground">
                      <span className="line-clamp-1">{signal.thesis || ""}</span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/signals/${signal.ticker}`} className="opacity-60 group-hover:opacity-100 transition-opacity" aria-label={`View ${signal.ticker} stock and options flow detail`}>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
