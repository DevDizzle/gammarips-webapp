
import { getWinnersDashboard } from '@/app/actions';
import type { Winner } from '@/lib/firebase-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '../ui/badge';

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

const SignalCard = ({ signal, title, hubLink }: { signal: Winner | null, title: string, hubLink: string }) => {
    if (!signal) {
        return (
             <Card className="flex-1 bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No setup met the criteria today. Check back tomorrow.</p>
                </CardContent>
            </Card>
        );
    }

    const imageUrl = signal.image_uri 
        ? convertGcsUriToUrl(signal.image_uri) 
        : `https://placehold.co/40x40/1e293b/a855f7?text=${signal.ticker[0]}`;
    const signalMeta = getSignalMeta(signal.outlook_signal);
    const expiration = new Date(signal.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

    return (
        <Card className="flex-1 bg-card/50 hover:bg-card/70 transition-colors">
            <Link href={hubLink}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Image 
                            src={imageUrl} 
                            alt={`${signal.company_name} logo`}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        <div>
                            <p className="font-bold text-xl">{signal.ticker}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{signal.company_name}</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Contract</p>
                            <p className="font-semibold">${signal.strike_price.toFixed(2)} {signal.option_type.toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">Expires: {expiration}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">AI Outlook</p>
                            <div className={cn("flex items-center gap-1 font-semibold", signalMeta.color)}>
                                {signalMeta.icon}
                                <span>{signal.outlook_signal}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
};

export default async function SignalsPreview() {
    const allWinners = await getWinnersDashboard();
    
    const topCall = allWinners
        .filter(w => w.option_type.toLowerCase() === 'call')
        .sort((a, b) => (b.weighted_score ?? -1) - (a.weighted_score ?? -1))[0] || null;

    const topPut = allWinners
        .filter(w => w.option_type.toLowerCase() === 'put')
        .sort((a, b) => (b.weighted_score ?? -1) - (a.weighted_score ?? -1))[0] || null;

    const lastUpdated = allWinners.length > 0 
        ? new Date(allWinners[0].run_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
        : 'N/A';

    return (
        <section className="py-16 sm:py-24 bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold font-headline">Today's Signals Preview</h2>
                    <p className="mt-4 text-muted-foreground">
                        Here's a sample of today’s top-rated setups from our AI engine. Full list and analysis available in the dashboard. Data from {lastUpdated}.
                    </p>
                </div>
                <div className="mt-12 flex flex-col lg:flex-row justify-center gap-8">
                    <SignalCard signal={topCall} title="Top-Rated Call Setup" hubLink="/options/call-setups" />
                    <SignalCard signal={topPut} title="Top-Rated Put Setup" hubLink="/options/put-hedges" />
                </div>
                 <div className="text-center mt-8">
                    <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
                        View all setups in the Dashboard &rarr;
                    </Link>
                </div>
            </div>
        </section>
    );
}

    

    