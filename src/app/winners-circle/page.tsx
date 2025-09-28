
'use client';

import Link from 'next/link';
import { getApprovedWins } from '../actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { SubmissionForm } from './submission-form';
import React, { useState, useEffect } from 'react';
import type { Win } from '@/lib/firebase-admin';
import { TickerSearch } from '@/components/ticker-search';

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : name[0];
};

const WinCard = ({ win }: { win: Win }) => (
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
                alt={`A user's winning trade screenshot`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover rounded-md"
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

const NoWinsPlaceholder = () => (
    <div className="text-center col-span-full py-16 px-6 bg-card rounded-lg border-2 border-dashed">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">The Winner's Circle is Fresh</h2>
        <p className="mt-2 text-muted-foreground">
            No wins have been featured yet. Be the first to share your success and claim a spot!
        </p>
    </div>
);

export default function WinnersCirclePage() {
    const [wins, setWins] = useState<Win[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWins = async () => {
            setLoading(true);
            try {
                const approvedWins = await getApprovedWins();
                setWins(approvedWins);
            } catch (error) {
                console.error("Failed to fetch wins", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWins();
    }, []);

    const onSubmissionSuccess = (newWin: Win) => {
        // For now, we just tell the user their submission is pending review.
        // A more advanced implementation could refetch or optimistically add.
    };

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
                       The Winner's Circle
                    </h1>
                </section>
                
                {wins.length > 0 && (
                    <Card className="mb-12 bg-primary/10 border-primary/20 text-center">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Community Average Gain</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-5xl font-bold text-primary">
                                +{averageGain.toFixed(2)}%
                            </p>
                            <p className="text-sm text-primary/80 mt-2">
                                Average ROI from all featured community wins.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <section id="share-win" className="mb-12 scroll-mt-20">
                    <SubmissionForm onSubmissionSuccess={onSubmissionSuccess} />
                </section>
                
                <section className="text-center mb-12">
                     <h2 className="text-3xl font-bold font-headline">Real Traders, Real Wins.</h2>
                    <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
                        Check out the latest winning screenshots submitted by the ProfitScout community.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {loading ? (
                       Array.from({ length: 3 }).map((_, i) => (
                           <Card key={i}><CardContent className="p-4"><div className="animate-pulse bg-muted rounded-md h-96 w-full"></div></CardContent></Card>
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
