

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getTickerEvents } from '../../actions';
import type { TickerEvent } from '@/lib/firebase-admin';
import { CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UpcomingEarningsProps {
    ticker: string;
}

function UpcomingEarnings({ ticker }: UpcomingEarningsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<TickerEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const eventsData = await getTickerEvents(ticker);
        setEvents(eventsData);
      } catch (error) {
        console.error(`Failed to fetch events for ${ticker}:`, error);
        toast({
          title: 'Error Fetching Events',
          description: 'Could not load upcoming events. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [ticker, toast]);

  const renderSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="grid grid-cols-3 gap-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      ))}
    </div>
  );
  
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays /> Upcoming Earnings</CardTitle>
                 <CardDescription>Loading key dates...</CardDescription>
            </CardHeader>
            <CardContent>
                {renderSkeleton()}
            </CardContent>
        </Card>
    );
  }

  if (events.length === 0) {
    return null; // Don't render the card if there are no events
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CalendarDays /> Upcoming Earnings</CardTitle>
        <CardDescription>
            Key earnings dates that could impact market volatility and stock price.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {events.map(event => (
                    <TableRow key={event.id}>
                        <TableCell className="font-medium">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}</TableCell>
                        <TableCell>{event.event_name}</TableCell>
                        <TableCell>
                             <Badge variant={event.ticker ? 'default' : 'secondary'}>
                                {event.ticker ? `${event.ticker}-Specific` : 'Economic'}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default UpcomingEarnings;
