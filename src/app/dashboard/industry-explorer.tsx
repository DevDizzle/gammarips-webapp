import { getWinnersDashboard } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, ArrowUp, Briefcase, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Winner } from '@/lib/firebase-admin';

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

const getSignalMeta = (signal: string) => {
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('bullish')) {
      return { color: 'text-green-500', icon: <ArrowUp className="h-4 w-4" /> };
    }
    if (lowerSignal.includes('bearish')) {
      return { color: 'text-red-500', icon: <ArrowDown className="h-4 w-4" /> };
    }
    return { color: 'text-muted-foreground', icon: null };
};


export async function IndustryExplorer() {
    const allWinners = await getWinnersDashboard();

    // 1. De-duplicate winners by ticker, keeping only the one with the highest score
    const uniqueWinnersMap = new Map<string, Winner>();
    allWinners.forEach(winner => {
        const existing = uniqueWinnersMap.get(winner.ticker);
        if (!existing || (winner.weighted_score ?? -1) > (existing.weighted_score ?? -1)) {
            uniqueWinnersMap.set(winner.ticker, winner);
        }
    });
    const uniqueWinners = Array.from(uniqueWinnersMap.values());

    // 2. Group the unique winners by sector
    const winnersBySector = uniqueWinners.reduce((acc, winner) => {
        const sector = winner.sector || 'Other';
        if (!acc[sector]) {
            acc[sector] = [];
        }
        acc[sector].push(winner);
        return acc;
    }, {} as Record<string, Winner[]>);

    // 3. Sort sectors by the number of winners
    const sortedSectors = Object.keys(winnersBySector).sort((a, b) => {
        return winnersBySector[b].length - winnersBySector[a].length;
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase />
                    Sector Explorer
                </CardTitle>
                <CardDescription>
                    Browse all active Call and Put setups, grouped by GICS sector. Click any stock to see its full analysis dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                    {sortedSectors.map(sector => {
                        const winners = winnersBySector[sector];
                        const bullishCount = winners.filter(w => w.outlook_signal.toLowerCase().includes('bullish')).length;
                        const bearishCount = winners.filter(w => w.outlook_signal.toLowerCase().includes('bearish')).length;
                        
                        return (
                            <AccordionItem key={sector} value={sector}>
                                <AccordionTrigger>
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{sector}</span>
                                            <Badge variant="secondary">{winners.length} Stocks</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            {bullishCount > 0 && <span className="flex items-center gap-1 text-green-500"><ArrowUp size={16}/> {bullishCount}</span>}
                                            {bearishCount > 0 && <span className="flex items-center gap-1 text-red-500"><ArrowDown size={16}/> {bearishCount}</span>}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Company</TableHead>
                                                <TableHead>Industry</TableHead>
                                                <TableHead>Contract</TableHead>
                                                <TableHead>AI Outlook</TableHead>
                                                <TableHead className="text-right">View</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {winners.map(winner => {
                                                const imageUrl = winner.image_uri 
                                                    ? convertGcsUriToUrl(winner.image_uri) 
                                                    : `https://placehold.co/24x24/1e293b/a855f7?text=${winner.ticker[0]}`;
                                                const signalMeta = getSignalMeta(winner.outlook_signal);
                                                return (
                                                    <TableRow key={winner.id}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <Image 
                                                                    src={imageUrl} 
                                                                    alt={`${winner.company_name} logo`}
                                                                    width={24}
                                                                    height={24}
                                                                    className="rounded-full"
                                                                />
                                                                <div>
                                                                    <span className="font-semibold">{winner.ticker}</span>
                                                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{winner.company_name}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">{winner.industry}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">${winner.strike_price.toFixed(2)} {winner.option_type.toUpperCase()}</span>
                                                                <span className="text-xs text-muted-foreground">{new Date(winner.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className={cn("flex items-center gap-1", signalMeta.color)}>
                                                                {signalMeta.icon}
                                                                <span>{winner.outlook_signal}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                             <Link href={`/dashboard/${winner.ticker.toUpperCase()}`} className="text-muted-foreground hover:text-primary">
                                                                <ChevronRight className="h-5 w-5" />
                                                             </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </CardContent>
        </Card>
    )
}

export function IndustryExplorerSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-full max-w-lg" /></CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
