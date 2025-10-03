
import Link from 'next/link';
import { getApprovedWins } from '../actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { SubmissionForm } from './submission-form';
import type { Win } from '@/lib/firebase-admin';
import { TickerSearch } from '@/components/ticker-search';
import { Metadata } from 'next';
import { Skeleton } from '@/components/ui/skeleton';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Community Insights | Real Trade Examples from the ProfitScout Community",
    description: "See real success stories and trade screenshots from members of the ProfitScout community. Browse top stock and options trades and get inspired.",
  };
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : name[0];
};

const WinCard = ({ win }: { win: Win }) => {
    const altText = `Trade example screenshot for ${win.tickers} showing a +${win.percentGain.toFixed(2)}% gain, submitted by a ProfitScout user.`;

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
                 <Avatar>
                    <AvatarImage src={win.authorImage ?? undefined} alt={win.authorName ?? 'User'} />
                    <AvatarFallback>{getInitials(win.authorName)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base">{win.authorName || 'Anonymous Trader'}</CardTitle>
                    <CardDescription className="text-xs">
                        Posted on {format(win.createdAt.toDate(), 'MMM d, yyyy')}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow aspect-[4/3] relative">
                <Image
                    src={win.imageUrl}
                    alt={altText}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain rounded-md"
                />
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground">TICKER(S)</p>
                    <p className="font-bold">{win.tickers.toUpperCase()}</p>
                </div>
                 <div className="text-right">
                    <p className="text-xs font-semibold text-green-500">GAIN</p>
                    <p className="font-bold text-lg text-green-500">+{win.percentGain.toFixed(2)}%</p>
                </div>
            </CardFooter>
        </Card>
    );
};

const NoWinsPlaceholder = () => (
    <div className="text-center col-span-full py-16 px-6 bg-card rounded-lg border-2 border-dashed">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">The Community Gallery is Waiting for its First Submission.</h2>
        <p className="mt-2 text-muted-foreground">
            Be the first to claim the spotlight! Submit your trade example and kickstart the gallery of insights.
        </p>
    </div>
);

export default async function CommunityInsightsPage() {
    // Fetch wins on the server
    let wins: Win[] = [];
    let loading = true;
    try {
        wins = await getApprovedWins();
        loading = false;
    } catch (error) {
        console.error("Failed to fetch wins on server", error);
        loading = false;
    }

    const totalGain = wins.reduce((acc, win) => acc + win.percentGain, 0);
    const averageGain = wins.length > 0 ? (totalGain / wins.length) : 0;

    return (
        <div className="flex flex-col min-h-screen">
             <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold font-headline text-primary">
                        ProfitScout
                    </Link>
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <TickerSearch />
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <section className="text-center mb-12">
                    <Trophy className="mx-auto h-12 w-12 text-yellow-500" />
                    <h1 className="mt-4 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
                       Community Insights
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                       Welcome to the hub of community-shared trade examples. Browse screenshots below for inspiration, or share your own to help fellow traders. Examples are user-submitted, may not be representative, and are not predictive of results. Educational use only.
                    </p>
                </section>
                
                {wins.length > 0 && (
                    <Card className="mb-12 bg-primary/10 border-primary/20 text-center">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Community Average Submitted Gain</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-5xl font-bold text-primary">
                                +{averageGain.toFixed(2)}%
                            </p>
                            <p className="text-sm text-primary/80 mt-2">
                                Average ROI from all featured community submissions.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <section id="share-win" className="mb-12 scroll-mt-20">
                    <SubmissionForm />
                </section>
                
                <section className="text-center mb-12">
                     <h2 className="text-3xl font-bold font-headline">Recent Community Submissions</h2>
                    <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
                        Check out the latest trade examples submitted by the ProfitScout community.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {loading ? (
                       Array.from({ length: 3 }).map((_, i) => (
                           <Card key={i}>
                               <CardContent className="p-4">
                                   <Skeleton className="h-96 w-full" />
                                </CardContent>
                           </Card>
                       ))
                   ) : wins.length > 0 ? (
                        wins.map(win => <WinCard key={win.id} win={win} />)
                   ) : (
                        <NoWinsPlaceholder />
                   )}
                </div>
            </main>
        </div>
    );
}
