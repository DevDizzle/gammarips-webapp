
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getEconomicEvents } from '../actions';
import type { TickerEvent } from '@/lib/firebase-admin';
import { CalendarDays, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EconomicEventsWidget() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<TickerEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const eventsData = await getEconomicEvents();
        // Get events for the next 30 days
        const upcomingEvents = eventsData.filter(event => {
            const eventDate = new Date(event.event_date);
            const now = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(now.getDate() + 30);
            return eventDate >= now && eventDate <= thirtyDaysFromNow;
        }).slice(0, 5); // Limit to 5
        setEvents(upcomingEvents);
      } catch (error) {
        console.error(`Failed to fetch economic events:`, error);
        toast({
          title: 'Error Fetching Events',
          description: 'Could not load upcoming economic events.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const renderSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="grid grid-cols-2 gap-4">
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
                <CardTitle className="flex items-center gap-2"><Globe /> Economic Calendar</CardTitle>
                 <CardDescription>Loading key dates...</CardDescription>
            </CardHeader>
            <CardContent>
                {renderSkeleton()}
            </CardContent>
        </Card>
    );
  }

  if (events.length === 0) {
    return null; // Don't render the card if there are no upcoming events
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Globe /> Upcoming Economic Events</CardTitle>
        <CardDescription>
            Key market-wide dates that could impact volatility across all stocks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Event</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {events.map(event => (
                    <TableRow key={event.id}>
                        <TableCell className="font-medium">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</TableCell>
                        <TableCell>{event.event_name}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
