
'use client';

import { useEffect, useState } from 'react';
import { getMarketIndices } from '@/app/landing-page-actions';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarketIndex } from '@/lib/fmp';

export function IndicesTicker() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await getMarketIndices();
      setIndices(data);
    } catch (error) {
      console.error("Failed to fetch indices", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getDisplayName = (symbol: string) => {
    switch (symbol) {
      case '^VIX': return 'VIX';
      case '^TNX': return 'US10Y';
      case 'CLUSD': return 'Crude Oil';
      case 'PCR': return 'Put/Call Ratio';
      default: return symbol.replace('^', '');
    }
  };

  const formatValue = (index: MarketIndex) => {
    const { symbol, price } = index;
    if (price === null || price === undefined) return 'N/A';
    
    if (symbol === '^TNX') return `${price.toFixed(2)}%`;
    if (symbol === 'PCR') return price.toFixed(2);
    if (symbol === '^VIX') return price.toFixed(2);
    // Default to currency
    return `$${price.toFixed(2)}`;
  };
  
  const getPcrSentiment = (pcrValue: number | null): { text: string; className: string } => {
    if (pcrValue === null) return { text: 'N/A', className: 'text-muted-foreground' };
    if (pcrValue > 1.0) {
      return { text: 'Bearish', className: 'text-red-500' };
    }
    if (pcrValue < 0.7) {
      return { text: 'Bullish', className: 'text-green-500' };
    }
    return { text: 'Neutral', className: 'text-muted-foreground' };
  };

  if (loading && indices.length === 0) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-5">
         {[1, 2, 3, 4, 5].map((i) => (
             <Card key={i} className="min-w-[140px] p-3 flex flex-col gap-2 animate-pulse">
                <div className="h-4 w-12 bg-muted rounded" />
                <div className="h-5 w-20 bg-muted rounded" />
             </Card>
         ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:pb-0 w-full justify-stretch">
        {indices.map((index) => {
           const isPositive = index.changesPercentage > 0;
           const isNegative = index.changesPercentage < 0;
           
           const colorClass = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-muted-foreground';
           
           if (index.symbol === 'PCR') {
             const pcrSentiment = getPcrSentiment(index.price);
             return (
               <Card key={index.symbol} className="min-w-[140px] p-3 flex flex-col justify-between hover:bg-muted/50 transition-colors cursor-default border-muted">
                 <div className="flex justify-between items-start">
                   <span className="font-bold text-sm text-muted-foreground">{getDisplayName(index.symbol)}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-lg font-bold tracking-tight">{formatValue(index)}</span>
                   <span className={cn("text-xs font-medium", pcrSentiment.className)}>
                     {pcrSentiment.text}
                   </span>
                 </div>
               </Card>
             );
           }

           return (
            <Card key={index.symbol} className="min-w-[140px] p-3 flex flex-col justify-between hover:bg-muted/50 transition-colors cursor-default border-muted">
                <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-muted-foreground">{getDisplayName(index.symbol)}</span>
                    {index.symbol !== 'PCR' && (
                        isPositive ? <ArrowUp className="h-4 w-4 text-green-500" /> : 
                        isNegative ? <ArrowDown className="h-4 w-4 text-red-500" /> : 
                        <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight">{formatValue(index)}</span>
                    {index.symbol !== 'PCR' && (
                        <span className={cn("text-xs font-medium", colorClass)}>
                            {isPositive ? '+' : ''}{index.changesPercentage?.toFixed(2)}%
                        </span>
                    )}
                </div>
            </Card>
           );
        })}
      </div>
    </div>
  );
}
