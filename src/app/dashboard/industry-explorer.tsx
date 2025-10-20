
import { getWinnersDashboard } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, ArrowUp, Briefcase, ChevronRight, Pilcrow } from 'lucide-react';
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

    const winnersByIndustry = allWinners.reduce((acc, winner) => {
        const industry = winner.industry || 'Other';
        if (!acc[industry]) {
            acc[industry] = [];
        }
        acc[industry].push(winner);
        return acc;
    }, {} as Record<string, Winner[]>);

    // Sort industries by the number of winners
    const sortedIndustries = Object.keys(winnersByIndustry).sort((a, b) => {
        return winnersByIndustry[b].length - winnersByIndustry[a].length;
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Briefcase />
                    Industry Explorer
                </CardTitle>
                <CardDescription>
                    Browse all active Call and Put setups, grouped by industry. Click any stock to see its full analysis dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                    {sortedIndustries.map(industry => {
                        const winners = winnersByIndustry[industry];
                        const bullishCount = winners.filter(w => w.outlook_signal.toLowerCase().includes('bullish')).length;
                        const bearishCount = winners.filter(w => w.outlook_signal.toLowerCase().includes('bearish')).length;
                        
                        return (
                            <AccordionItem key={industry} value={industry}>
                                <AccordionTrigger>
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{industry}</span>
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
                                                <TableHead>Ticker</TableHead>
                                                <TableHead>Last Close</TableHead>
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
                                                                <span className="truncate">{winner.company_name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{winner.ticker}</TableCell>
                                                        <TableCell>${winner.last_close.toFixed(2)}</TableCell>
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
