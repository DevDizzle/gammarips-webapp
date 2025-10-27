
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getOptionsCandidates } from '../actions';
import type { OptionCandidate } from '@/lib/firebase-admin';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';

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


function OptionsCandidatesTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState<OptionCandidate[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const candidatesData = await getOptionsCandidates();
        setCandidates(candidatesData);
      } catch (error) {
        console.error('Failed to fetch options candidates:', error);
        toast({
          title: 'Error Fetching Data',
          description: 'Could not load noteworthy options. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleRowClick = (ticker: string) => {
    router.push(`/dashboard/${ticker.toUpperCase()}`);
  };

  const getSignalMeta = (signal: string) => {
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('bullish') || lowerSignal.includes('strong')) {
      return { color: 'text-green-500', icon: <ArrowUp className="h-4 w-4" /> };
    }
    if (lowerSignal.includes('bearish') || lowerSignal.includes('weak')) {
      return { color: 'text-red-500', icon: <ArrowDown className="h-4 w-4" /> };
    }
    return { color: 'text-muted-foreground', icon: null };
  };

  const renderSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Noteworthy Options Setups</CardTitle>
        <CardDescription>
          At-the-money or other interesting options contracts that have high potential but didn't make the top cut. Click any row to view the full analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? renderSkeleton() : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>AI Outlook</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map(c => {
                const imageUrl = c.image_uri 
                    ? convertGcsUriToUrl(c.image_uri) 
                    : `https://placehold.co/24x24/1e293b/a855f7?text=${c.ticker[0]}`;
                const signalMeta = getSignalMeta(c.stock_outlook_signal);
                return (
                  <TableRow key={c.id} onClick={() => handleRowClick(c.ticker)} className="cursor-pointer">
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Image 
                                src={imageUrl} 
                                alt={`${c.company_name} logo`}
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                            <div>
                                <span className="font-semibold">{c.ticker}</span>
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{c.company_name}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.industry}</TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-semibold">${c.strike.toFixed(2)} {c.option_type.toUpperCase()}</span>
                            <span className="text-xs text-muted-foreground">Expires: {new Date(c.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
                            <span className="text-xs text-muted-foreground font-mono">{c.contract_symbol}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className={cn("flex items-center gap-1", signalMeta.color)}>
                            {signalMeta.icon}
                            <span>{c.stock_outlook_signal}</span>
                        </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default OptionsCandidatesTable;
