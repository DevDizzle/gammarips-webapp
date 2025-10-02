
import { getPerformanceTrackerStatsAdmin } from "@/lib/firebase-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export async function PerformanceTracker() {
    const { averageGain, signalCount } = await getPerformanceTrackerStatsAdmin();

    const gainColor = averageGain >= 0 ? "text-green-500" : "text-red-500";
    const gainSign = averageGain >= 0 ? "+" : "";

    return (
        <Card className="bg-primary/10 border-primary/20 text-center">
            <CardHeader>
                <div className="flex justify-center items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline text-2xl">
                        Signal Performance Tracker
                    </CardTitle>
                </div>
                 <CardDescription className="max-w-2xl mx-auto">
                    This is the average gain from our AI-recommended options signals, tracked from recommendation to expiry. This shows the real-world performance of our model.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className={`text-6xl font-bold ${gainColor}`}>
                    {gainSign}{averageGain.toFixed(2)}%
                </p>
                {signalCount > 0 && (
                    <p className="text-sm text-primary/80 mt-2">
                        Average ROI across all {signalCount} tracked signals.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export function PerformanceTrackerSkeleton() {
    return (
        <Card className="bg-primary/10 border-primary/20 text-center">
             <CardHeader className="items-center text-center">
                <Skeleton className="h-7 w-72" />
                <Skeleton className="h-4 w-full max-w-lg mt-2" />
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <Skeleton className="h-16 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardContent>
        </Card>
    );
}

export default PerformanceTracker;
