
import { Suspense } from "react";
import TodaysWinners from "@/app/dashboard/todays-winners";
import DashboardPageClient from "./dashboard-client";
import { IndustryExplorer, IndustryExplorerSkeleton } from "./industry-explorer";
import PerformanceTracker, { PerformanceTrackerSkeleton } from "@/components/performance-tracker";

function DashboardContent() {
    return (
        <div className="space-y-8">
            <TodaysWinners />
            <Suspense fallback={<PerformanceTrackerSkeleton />}>
                <PerformanceTracker />
            </Suspense>
            <Suspense fallback={<IndustryExplorerSkeleton />}>
              <IndustryExplorer />
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
