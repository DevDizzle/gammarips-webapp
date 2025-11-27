
import type { Metadata } from 'next';
import { getWinnersDashboard } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ChevronRight, ArrowRight, Filter, Bot, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { Winner } from '@/lib/firebase-admin';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Daily Bearish Put Setups & Hedges on Russell 1000 Stocks',
  description: 'Browse our full list of AI-scored bearish put option setups on Russell 1000 stocks. Ideal for hedging or speculative plays. Updated daily.',
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

async function getBearishSetups(): Promise<Winner[]> {
    const allWinners = await getWinnersDashboard();
    return allWinners
        .filter(w => w.option_type.toLowerCase() === 'put' && w.outlook_signal.toLowerCase().includes('bearish'))
        .sort((a, b) => (b.weighted_score ?? -1) - (a.weighted_score ?? -1));
}


export default async function PutSetupsPage() {
    const allBearishSetups = await getBearishSetups();
    const topSetups = allBearishSetups.slice(0, 4);

    return (
        <div className="space-y-8">
            <header className="text-center">
                <h1 className="text-4xl sm:text-5xl font-bold font-headline tracking-tight">
                    Daily Bearish Put Setups
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                    This is a preview of our complete, daily-updated list of bearish Put option setups, ideal for hedging or directional plays.
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Today's Top Put Setups</CardTitle>
                    <CardDescription>
                       A preview of the top-scoring bearish Put setups from today's analysis. Click any setup to see the full dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {topSetups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {topSetups.map(winner => {
                                const imageUrl = winner.image_uri 
                                    ? convertGcsUriToUrl(winner.image_uri) 
                                    : `https://placehold.co/40x40/1e293b/a855f7?text=${winner.ticker[0]}`;
                                const signalMeta = { color: 'text-red-500', icon: <ArrowDown className="h-4 w-4" /> };

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
                        <p className="text-muted-foreground text-center">No bearish put setups met the criteria today. Check back tomorrow for new signals.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>How We Find Top Put Setups</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-xl">
                                1
                           </div>
                        </div>
                        <div>
                            <h3 className="font-semibold">Identify Weak Stocks First</h3>
                            <p className="text-muted-foreground">We start by identifying stocks with bearish conviction. We target companies with low AI scores (e.g., Score &lt; 0.2) or those facing significant negative catalysts, such as poor earnings or sector-wide weakness.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-xl">
                                2
                           </div>
                        </div>
                        <div>
                            <h3 className="font-semibold">The "Hedge Hunter" Protocol</h3>
                            <p className="text-muted-foreground">For these weak stocks, we deploy our "Hedge Hunter" logic. We look for Put contracts (10-60 days to expiry) with fair volatility pricing and sufficient liquidity to act as effective hedges or directional bets against downward momentum.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-xl flex-shrink-0">
                            3
                        </div>
                        <div>
                            <h3 className="font-semibold">AI Validation & Ranking</h3>
                            <p className="text-muted-foreground">Our AI validates the setup, ensuring the contract's risk profile is reasonable. It boosts scores for Puts on stocks showing strong bearish trends and flags any unusual volume, ensuring only the highest-conviction hedges and bearish plays make the list.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>


            <div className="text-center">
                 <Card className="inline-block bg-primary/10 border-primary/20">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-semibold font-headline">See All {allBearishSetups.length}+ Setups</h3>
                        <p className="text-muted-foreground mt-2 mb-4 max-w-md mx-auto">
                            Daily setups are the ideas. Traders are the ones who use them. Join GammaRips to unlock the full list, the dashboard, and the AI breakdowns behind every setup.
                        </p>
                        <Button asChild size="lg">
                             <Link href="/dashboard">
                                Become a Member – $19/mo <ArrowRight className="ml-2 h-5 w-5"/>
                            </Link>
                        </Button>
                         <p className="text-xs text-muted-foreground mt-3">Billed monthly, cancel anytime. GammaRips is an AI-powered options research tool, not a broker or advisor.</p>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
