
import { getPerformanceTrackerStatsAdmin } from "@/lib/firebase-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

const StatCard = ({ title, value, subtext }: { title: string; value: string; subtext?: string }) => {
    const isPositive = value.startsWith('+');
    const isNegative = value.startsWith('-');

    const valueColor = isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-primary";

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-lg">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn("text-4xl font-bold", valueColor)}>{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
    )
};


export async function PerformanceTracker() {
    const stats = await getPerformanceTrackerStatsAdmin();

    return (
        <Card className="bg-primary/10 border-primary/20">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline text-2xl">
                        Historical Model Performance
                    </CardTitle>
                </div>
                 <CardDescription className="max-w-2xl mx-auto">
                    This data reflects the historical performance of the AI model's analyses, tracked since 10/01/2024 from the date of identification to the standard expiry. All data is for informational purposes and does not guarantee future results.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                        title="Avg. Gain" 
                        value={`${stats.averageGain >= 0 ? '+' : ''}${stats.averageGain.toFixed(2)}%`}
                        subtext={stats.signalCount > 0 ? `Across ${stats.signalCount} signals` : ''}
                    />
                    <StatCard 
                        title="Win Rate" 
                        value={`${stats.winRate.toFixed(1)}%`}
                        subtext="Signals with positive gain"
                    />
                     <StatCard 
                        title="Avg. Winner" 
                        value={`${stats.averageWinnerGain >= 0 ? '+' : ''}${stats.averageWinnerGain.toFixed(2)}%`}
                        subtext="Avg. gain on winning signals"
                    />
                     <StatCard 
                        title="Avg. Loser" 
                        value={`${stats.averageLoserGain.toFixed(2)}%`}
                        subtext="Avg. loss on losing signals"
                    />
                </div>
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
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-lg">
                        <Skeleton className="h-5 w-24 mb-2" />
                        <Skeleton className="h-10 w-32 mb-1" />
                        <Skeleton className="h-3 w-28" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default PerformanceTracker;


