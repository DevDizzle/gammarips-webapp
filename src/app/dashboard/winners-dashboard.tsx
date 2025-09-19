
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getEconomicEvents, getTopStocks, getTopOptions } from '../actions';
import type { Stock, EconomicEvent, OptionCandidate } from '@/lib/firebase-admin';

function WinnersDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [topBuyStocks, setTopBuyStocks] = useState<Stock[]>([]);
  const [topSellStocks, setTopSellStocks] = useState<Stock[]>([]);
  const [topCallOptions, setTopCallOptions] = useState<OptionCandidate[]>([]);
  const [topPutOptions, setTopPutOptions] = useState<OptionCandidate[]>([]);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [events, buyStocks, sellStocks, callOptions, putOptions] = await Promise.all([
          getEconomicEvents(),
          getTopStocks('BUY', 5),
          getTopStocks('SELL', 5),
          getTopOptions('CALL', 5),
          getTopOptions('PUT', 5),
        ]);
        setEconomicEvents(events);
        setTopBuyStocks(buyStocks);
        setTopSellStocks(sellStocks);
        setTopCallOptions(callOptions);
        setTopPutOptions(putOptions);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: 'Error Fetching Data',
          description: 'Could not load dashboard data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleRowClick = (ticker: string) => {
    router.push(`/dashboard/${ticker}`);
  };

  const renderSkeletonTable = (rows = 5, cols = 3) => (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`grid ${'grid-cols-' + cols} gap-4`}>
          {Array.from({length: cols}).map((_, j) => (
             <Skeleton key={j} className="h-5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Economic Events */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="text-primary" />
                    Upcoming Economic Events
                </CardTitle>
                <CardDescription>
                    Key economic events happening in the next 30 days.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoading ? renderSkeletonTable(5, 3) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead className="text-right">Impact</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {economicEvents.slice(0, 5).map(event => (
                                <TableRow key={event.id}>
                                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{event.ticker ? `(${event.ticker}) ` : ''}{event.event_name}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={event.impact?.toLowerCase() === 'high' ? 'destructive' : 'secondary'}>
                                            {event.impact || 'N/A'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 )}
            </CardContent>
        </Card>

        {/* Top 5 BUY Stocks */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                    <TrendingUp />
                    Top 5 BUY Stocks
                </CardTitle>
                <CardDescription>Stocks with the highest AI-powered buy ratings.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? renderSkeletonTable(5, 2) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ticker</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topBuyStocks.map(stock => (
                                <TableRow key={stock.id} onClick={() => handleRowClick(stock.id)} className="cursor-pointer">
                                    <TableCell className="font-medium">{stock.id}</TableCell>
                                    <TableCell className="text-right">{stock.weighted_score?.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>

        {/* Top 5 SELL Stocks */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                    <TrendingDown />
                    Top 5 SELL Stocks
                </CardTitle>
                <CardDescription>Stocks with the most bearish AI-powered ratings.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? renderSkeletonTable(5, 2) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ticker</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topSellStocks.map(stock => (
                                <TableRow key={stock.id} onClick={() => handleRowClick(stock.id)} className="cursor-pointer">
                                    <TableCell className="font-medium">{stock.id}</TableCell>
                                    <TableCell className="text-right">{stock.weighted_score?.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>

        {/* Top 5 CALL Options */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                    <ArrowUpRight />
                    Top 5 CALL Options
                </CardTitle>
                <CardDescription>Option contracts with the highest bullish signal score.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? renderSkeletonTable(5, 3) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Strike</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topCallOptions.map(option => (
                                <TableRow key={option.id} onClick={() => handleRowClick(option.symbol)} className="cursor-pointer">
                                    <TableCell className="font-medium">{option.symbol}</TableCell>
                                    <TableCell>{option.strike_price}</TableCell>
                                    <TableCell className="text-right">{option.options_score.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
        
        {/* Top 5 PUT Options */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                    <ArrowDownRight />
                    Top 5 PUT Options
                </CardTitle>
                <CardDescription>Option contracts with the highest bearish signal score.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? renderSkeletonTable(5, 3) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Strike</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topPutOptions.map(option => (
                                <TableRow key={option.id} onClick={() => handleRowClick(option.symbol)} className="cursor-pointer">
                                    <TableCell className="font-medium">{option.symbol}</TableCell>
                                    <TableCell>{option.strike_price}</TableCell>
                                    <TableCell className="text-right">{option.options_score.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

export default WinnersDashboard;
