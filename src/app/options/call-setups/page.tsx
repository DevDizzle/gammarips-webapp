

import type { Metadata } from 'next';
import { getWinnersDashboard } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ChevronRight, ArrowRight, Filter, Bot, BarChart, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { Winner } from '@/lib/firebase-admin';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Daily Call Rips on Russell 1000 Stocks',
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
    const allBullishSetups = await getBullishSetups();
    const topSetups = allBullishSetups.slice(0, 4);

    return (
        <div className="space-y-8">
            <header className="text-center">
                <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight">
                    Daily Call Rips
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    This is a preview of our high-conviction Call contracts. We scan the Russell 1000 to find stocks primed for upside momentum. Scored by AI. Filtered for volatility.
                </p>
                 <Button asChild variant="link" className="mt-2">
                    <Link href="/options/put-hedges">
                        Hunting for downside? View Put Rips <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Today's Top Call Rips</CardTitle>
                    <CardDescription>
                       A sample of the top-scoring Call contracts from today's market analysis. Click any card to unlock the full dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {topSetups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {topSetups.map(winner => {
                                const imageUrl = winner.image_uri 
                                    ? convertGcsUriToUrl(winner.image_uri) 
                                    : `https://placehold.co/40x40/1e293b/a855f7?text=${winner.ticker[0]}`;
                                const signalMeta = { color: 'text-green-500', icon: <ArrowUp className="h-4 w-4" /> };

                                return (
                                    <Link key={winner.id} href={`/dashboard/${winner.ticker.toUpperCase()}`} className="block">
                                        <Card className="cursor-pointer transition-colors hover:bg-muted/50 h-full">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <Image 
                                                            src={imageUrl} 
                                                            alt={`${winner.company_name} logo`}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold truncate">{winner.company_name}</p>
                                                            <p className="text-sm text-muted-foreground">{winner.ticker}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                </div>
                                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Contract</p>
                                                        <p className="font-semibold">${winner.strike_price.toFixed(2)} {winner.option_type.toUpperCase()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">AI Outlook</p>
                                                        <div className={cn("flex items-center gap-1 font-semibold", signalMeta.color)}>
                                                            {signalMeta.icon}
                                                            <span>{winner.outlook_signal}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center">No bullish call setups met the criteria today. Check back tomorrow for new signals.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>How We Find Call Rips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-xl">
                                1
                           </div>
                        </div>
                        <div>
                            <h3 className="font-semibold">Identify High-Conviction Stocks First</h3>
                            <p className="text-muted-foreground">We do not scan for random option activity. We start by identifying the market's strongest stocks. We target the top 20% of companies based on our proprietary AI conviction score or those with a massive breaking news catalyst.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-xl">
                                2
                           </div>
                        </div>
                        <div>
                            <h3 className="font-semibold">The "Rip Hunter" Protocol</h3>
                            <p className="text-muted-foreground">For these elite stocks, we deploy the Rip Hunter logic. We hunt for aggressive, high-gamma contracts with 3 to 60 days to expiry. We look for setups geared toward buying premium (Long Calls). We look for out-of-the-money strikes primed for explosive acceleration.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-xl flex-shrink-0">
                            3
                        </div>
                        <div>
                            <h3 className="font-semibold">AI Validation & Ranking</h3>
                            <p className="text-muted-foreground">Finally, our AI validates the trade. It applies a dynamic safety check. It relaxes liquidity rules for high-conviction breakouts to catch them early but enforces strict filters for standard setups. It boosts scores for unusual options activity where volume exceeds open interest. Only the most explosive contracts make the daily list.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>


            <div className="text-center">
                <Card className="inline-block bg-primary/10 border-primary/20">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-semibold font-headline">Get the Daily Playbook</h3>
                        <p className="text-muted-foreground mt-2 mb-4 max-w-md mx-auto">
                            Become a Ripper to get full access to our daily ranked Call & Put contracts. Unlock the interactive dashboard and the complete AI analysis behind every trade.
                        </p>
                        <Button asChild size="lg">
                             <Link href="/dashboard">
                                Become a Ripper ($19/mo) <ArrowRight className="ml-2 h-5 w-5"/>
                            </Link>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3">Billed monthly. Cancel anytime. GammaRips is an AI-powered options research tool, not a broker or advisor.</p>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
