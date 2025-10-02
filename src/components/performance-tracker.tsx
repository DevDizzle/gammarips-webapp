
// This component has been deprecated and its functionality merged into TodaysWinners.tsx
// It can be safely deleted.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PerformanceTrackerSkeleton = () => (
    <Card>
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

const PerformanceTracker = () => null;

export default PerformanceTracker;
