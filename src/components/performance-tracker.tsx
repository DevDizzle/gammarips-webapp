

import { getPerformanceTrackerStatsAdmin } from "@/lib/firebase-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
        <Link href="/performance" className="block group">
            <Card className="bg-transparent border-none shadow-none transition-colors">
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard 
                            title="Total ROI" 
                            value={`${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(2)}%`}
                            subtext={stats.signalCount > 0 ? `Across ${stats.signalCount} Setups` : ''}
                        />
                        <StatCard 
                            title="Win Rate" 
                            value={`${stats.winRate.toFixed(1)}%`}
                            subtext="Setups with positive gain"
                        />
                        <StatCard 
                            title="Avg. Winner" 
                            value={`${stats.averageWinnerGain >= 0 ? '+' : ''}${stats.averageWinnerGain.toFixed(2)}%`}
                            subtext="Avg. gain on winning Setups"
                        />
                        <StatCard 
                            title="Avg. Loser" 
                            value={`${stats.averageLoserGain.toFixed(2)}%`}
                            subtext="Avg. loss on losing Setups"
                        />
                    </div>
                     <p className="text-center text-xs text-muted-foreground mt-4 group-hover:underline">Click to view full performance history →</p>
                </CardContent>
            </Card>
        </Link>
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



