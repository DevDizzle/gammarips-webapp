
import { getPerformanceSignals } from '@/app/actions';
import type { PerformanceSignal } from '@/lib/firebase-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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

const PerformanceList = ({ signals }: { signals: PerformanceSignal[] }) => {
    if (signals.length === 0) {
        return null;
    }

    return (
        <Card className="flex-1 bg-card/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ArrowUp className="text-green-500" />
                    Top Recent Contracts
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Desktop Table */}
                <Table className="hidden md:table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>Contract</TableHead>
                            <TableHead className="text-right">Gain</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {signals.map(signal => {
                            const isGainer = signal.percent_gain >= 0;
                            const imageUrl = signal.image_uri ? convertGcsUriToUrl(signal.image_uri) : `https://placehold.co/24x24/1e293b/a855f7?text=${signal.ticker?.[0] || '?'}`;
                            
                            return (
                                <TableRow key={signal.contract_symbol}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Image 
                                                src={imageUrl} 
                                                alt={`${signal.company_name ?? signal.ticker} logo`}
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                            <div>
                                                <Link href={`/dashboard/${signal.ticker}`} className="font-bold hover:underline">{signal.ticker}</Link>
                                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{signal.company_name}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{signal.industry}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{signal.strike_price ? `$${signal.strike_price.toFixed(2)}` : 'N/A'} {signal.option_type?.toUpperCase()}</span>
                                            <span className="text-xs text-muted-foreground">Expires: {new Date(signal.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={cn("text-right font-semibold", isGainer ? "text-green-500" : "text-red-500")}>
                                        {isGainer ? '+' : ''}{signal.percent_gain.toFixed(2)}%
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                
                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                     {signals.map(signal => {
                        const isGainer = signal.percent_gain >= 0;
                        const imageUrl = signal.image_uri ? convertGcsUriToUrl(signal.image_uri) : `https://placehold.co/40x40/1e293b/a855f7?text=${signal.ticker?.[0] || '?'}`;

                        return (
                            <Card key={signal.contract_symbol} className="transition-colors hover:bg-muted/50">
                                <Link href={`/dashboard/${signal.ticker}`} className="block">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Image 
                                                    src={imageUrl} 
                                                    alt={`${signal.company_name ?? signal.ticker} logo`}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold truncate">{signal.company_name}</p>
                                                    <p className="text-sm text-muted-foreground">{signal.ticker}</p>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <p className={cn("font-semibold text-lg", isGainer ? "text-green-500" : "text-red-500")}>
                                                    {isGainer ? '+' : ''}{signal.percent_gain.toFixed(2)}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 border-t pt-3 text-sm">
                                            <p className="text-xs text-muted-foreground">Contract</p>
                                            <p className="font-semibold">{signal.strike_price ? `$${signal.strike_price.toFixed(2)}` : 'N/A'} {signal.option_type?.toUpperCase()}</p>
                                            <p className="text-xs text-muted-foreground">Expires: {new Date(signal.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</p>
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
};


export default async function MarketMovers() {
    const topGainers = await getPerformanceSignals('desc', 5);

    return (
        <PerformanceList signals={topGainers} />
    );
}
