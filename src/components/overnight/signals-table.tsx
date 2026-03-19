'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, TrendingUp, TrendingDown, Flame, Zap } from "lucide-react";
import { type OvernightSignal } from '@/lib/firebase-admin';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SignalsTableProps {
  signals: OvernightSignal[];
  title: string;
}

export function SignalsTable({ signals, title }: SignalsTableProps) {
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const filteredSignals = showPremiumOnly 
    ? signals.filter(s => s.is_premium_signal)
    : signals;

  const formatMoney = (amount: number) => {
    if (!amount || amount === 0) return '—';
    if (Math.abs(amount) >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "bg-green-500 hover:bg-green-600";
    if (score >= 7) return "bg-amber-500 hover:bg-amber-600";
    return "bg-slate-500 hover:bg-slate-600";
  };

  const renderPremiumBadge = (signal: OvernightSignal) => {
    if (!signal.is_premium_signal) return null;
    
    const score = signal.premium_score || 1;
    
    if (score >= 3) {
      return (
        <Badge className="ml-2 bg-amber-500 hover:bg-amber-600 text-black border-0 gap-1 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
          <Flame className="w-3 h-3" /> Premium ×{score}
        </Badge>
      );
    }
    
    if (score === 2) {
      return (
        <Badge variant="outline" className="ml-2 border-amber-500 text-amber-500 bg-amber-500/10 gap-1">
          <Zap className="w-3 h-3" /> Premium ×2
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="ml-2 border-amber-500/50 text-amber-600 bg-amber-500/5">
        Premium
      </Badge>
    );
  };

  // Calculate total dollar volume as positioning
  const getPositioning = (signal: OvernightSignal) => {
    const callVol = signal.call_dollar_volume || 0;
    const putVol = signal.put_dollar_volume || 0;
    return callVol + putVol;
  };

  return (
    <div className="rounded-md border bg-card">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-lg">{title}</h3>
        <div className="flex items-center space-x-2">
          <Switch 
            id={`premium-mode-${title}`} 
            checked={showPremiumOnly} 
            onCheckedChange={setShowPremiumOnly} 
          />
          <Label htmlFor={`premium-mode-${title}`} className="text-sm font-medium text-amber-500 cursor-pointer">
            Premium Only
          </Label>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-right">Move</TableHead>
            <TableHead className="text-right">Flow</TableHead>
            <TableHead className="hidden md:table-cell">Thesis</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSignals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                {showPremiumOnly ? "No premium signals found for this category." : "No signals found for this category."}
              </TableCell>
            </TableRow>
          ) : (
            filteredSignals.map((signal) => {
              const movePct = signal.price_change_pct || 0;
              return (
                <TableRow key={signal.id} className="cursor-pointer hover:bg-muted/50 transition-colors group">
                  <TableCell className="font-bold font-mono text-base">
                    <div className="flex items-center">
                      <Link href={`/signals/${signal.ticker}`} className="hover:underline underline-offset-4">
                        {signal.ticker}
                      </Link>
                      {renderPremiumBadge(signal)}
                    </div>
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
                    <span className="line-clamp-1">{signal.thesis || "Thesis available on detail page"}</span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/signals/${signal.ticker}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
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
  );
}
