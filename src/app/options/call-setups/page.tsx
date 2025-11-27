import type { Metadata } from 'next';
import { getWinnersDashboard } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ChevronRight, ArrowRight, Filter, Bot, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { Winner } from '@/lib/firebase-admin';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Daily Call Rippers on Russell 1000 Stocks',
  description: 'Browse our full list of AI-scored bullish call option rippers on Russell 1000 stocks. Updated daily with fresh analysis.',
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
                    Daily Call Rippers
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    This is a preview of our complete, daily-updated list of bullish Call option rippers for Russell 1000 stocks, scored by our AI engine.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Today's Top Call Rippers</CardTitle>
                    <CardDescription>
                       A preview of the top-scoring bullish Call rippers from today's market analysis. Click any setup to see the full dashboard.
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
                        <p className="text-muted-foreground text-center">No bullish call rippers met the criteria today. Check back tomorrow for new signals.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>How We Find Top Call Rippers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Filter className="h-6 w-6 text-primary" />
                           </div>
                           <div className="h-full w-px bg-border"></div>
                        </div>
                        <div>
                            <h3 className="font-semibold">1. Smart Screening</h3>
                            <p className="text-muted-foreground">We first identify liquid Call options (10-60 days to expiry) that are slightly out-of-the-money and meet strict volume, open interest, and spread criteria. We ensure the breakeven is realistic based on volatility.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Bot className="h-6 w-6 text-primary" />
                           </div>
                           <div className="h-full w-px bg-border"></div>
                        </div>
                        <div>
                            <h3 className="font-semibold">2. AI Quality Check</h3>
                            <p className="text-muted-foreground">Our AI analyzes the best candidates, rating their "setup quality". It checks for alignment with the stock's trend, fair volatility pricing, liquidity, and time decay risks.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                            <BarChart className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">3. Stock Outlook Confirmation</h3>
                            <p className="text-muted-foreground">Only Call rippers rated "Strong" by the AI and where the underlying stock has a Bullish overall outlook ("Strongly" or "Moderately Bullish") make the final list. This ensures our featured Call rippers combine strong contract specifics with a positive underlying stock forecast.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>


            <div className="text-center">
                 <Card className="inline-block bg-primary/10 border-primary/20">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-semibold font-headline">See All {allBullishSetups.length}+ Rippers</h3>
                        <p className="text-muted-foreground mt-2 mb-4">
                            Sign up for a membership to get the full list of daily rippers, access the interactive dashboard, and unlock complete AI analysis.
                        </p>
                        <Button asChild size="lg">
                             <Link href="/dashboard">
                                Become a Member ($19/mo) <ArrowRight className="ml-2 h-5 w-5"/>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
