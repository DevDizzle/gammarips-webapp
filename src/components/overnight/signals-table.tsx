'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, TrendingUp, TrendingDown, Lock } from "lucide-react";
import { type OvernightSignal } from '@/lib/firebase-admin';

interface SignalsTableProps {
  signals: OvernightSignal[];
  title: string;
  isSubscribed?: boolean;
}

export function SignalsTable({ signals, title, isSubscribed = false }: SignalsTableProps) {
  const formatMoney = (amount: number) => {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    return `$${(amount / 1_000).toFixed(0)}K`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-green-500 hover:bg-green-600";
    if (score >= 7) return "bg-amber-500 hover:bg-amber-600";
    return "bg-slate-500 hover:bg-slate-600";
  };

  return (
    <div className="rounded-md border bg-card">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-right">Move</TableHead>
            <TableHead className="text-right">Positioning</TableHead>
            <TableHead className="hidden md:table-cell">Thesis</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No signals found for this category.
              </TableCell>
            </TableRow>
          ) : (
            signals.map((signal) => (
              <TableRow key={signal.id} className="cursor-pointer hover:bg-muted/50 transition-colors group">
                <TableCell className="font-bold font-mono text-base">
                  <Link href={`/signals/${signal.ticker}`} className="hover:underline underline-offset-4">
                    {signal.ticker}
                  </Link>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={`${getScoreColor(signal.signal_score)} text-white border-0`}>
                    {signal.signal_score}
                  </Badge>
                </TableCell>
                <TableCell className={`text-right font-medium ${signal.move_pct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                   <div className="flex items-center justify-end gap-1">
                      {signal.move_pct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(signal.move_pct).toFixed(1)}%
                   </div>
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {formatMoney(signal.new_positioning_usd)}
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-[300px] text-sm text-muted-foreground">
                    {isSubscribed ? (
                        <span className="line-clamp-1">{signal.ai_thesis || "No thesis available."}</span>
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground/60">
                             <Lock className="w-3 h-3" /> <span className="blur-sm select-none">Subscribe to see thesis</span>
                        </div>
                    )}
                </TableCell>
                <TableCell>
                  <Link href={`/signals/${signal.ticker}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
