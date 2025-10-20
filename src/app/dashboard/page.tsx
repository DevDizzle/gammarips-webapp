
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import TodaysWinners from "@/app/dashboard/todays-winners";
import PerformanceTracker, { PerformanceTrackerSkeleton } from "@/components/performance-tracker";
import DashboardPageClient from "./dashboard-client";
import IndustryExplorer, { IndustryExplorerSkeleton } from "./industry-explorer";

function DashboardContent() {
    return (
        <div className="space-y-8">
            <TodaysWinners />
            <Suspense fallback={<IndustryExplorerSkeleton />}>
              <IndustryExplorer />
            </Suspense>
            <Suspense fallback={<PerformanceTrackerSkeleton />}>
                <PerformanceTracker />
            </Suspense>
        </div>
    )
}


export default function DashboardPage() {
    return (
        <DashboardPageClient>
            <DashboardContent />
        </DashboardPageClient>
    );
}
