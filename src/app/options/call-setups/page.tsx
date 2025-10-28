
import type { Metadata } from 'next';
import { getWinnersDashboard } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Winner } from '@/lib/firebase-admin';

export const metadata: Metadata = {
  title: 'Daily Bullish Call Setups on Russell 1000 Stocks',
  description: 'Browse our full list of AI-scored bullish call option setups on Russell 1000 stocks. Updated daily with fresh analysis.',
};

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

async function getBullishSetups(): Promise<Winner[]> {
    const allWinners = await getWinnersDashboard();
    return allWinners
        .filter(w => w.option_type.toLowerCase() === 'call' && w.outlook_signal.toLowerCase().includes('bullish'))
        .sort((a, b) => (b.weighted_score ?? -1) - (a.weighted_score ?? -1));
}


export default async function CallSetupsPage() {
    const bullishSetups = await getBullishSetups();

    return (
        <div className="space-y-8">
            <header className="text-center">
                <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight">
                    Daily Bullish Call Setups
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    This is our complete, daily-updated list of bullish Call option setups for Russell 1000 stocks, scored by our AI engine.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>How We Score Call Setups</CardTitle>
                    <CardDescription>
                        We analyze thousands of contracts to find setups with a favorable risk/reward profile. Our scoring model prioritizes contracts with strong liquidity, fair volatility, and alignment with the underlying stock's positive trend and fundamental outlook.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {bullishSetups.length > 0 ? (
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
                                {bullishSetups.map(winner => {
                                    const imageUrl = winner.image_uri 
                                        ? convertGcsUriToUrl(winner.image_uri) 
                                        : `https://placehold.co/24x24/1e293b/a855f7?text=${winner.ticker[0]}`;
                                    
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
                                                    <span className="text-xs text-muted-foreground">Expires: {new Date(winner.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className={cn("flex items-center gap-1 font-semibold text-green-500")}>
                                                    <ArrowUp className="h-4 w-4" />
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
                    ) : (
                        <p className="text-muted-foreground text-center">No bullish call setups met the criteria today. Check back tomorrow for new signals.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
