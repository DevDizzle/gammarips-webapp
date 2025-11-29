
import { Suspense } from "react";
import TodaysWinners from "@/app/dashboard/todays-winners";
import DashboardPageClient from "./dashboard-client";
import { IndustryExplorer, IndustryExplorerSkeleton } from "./industry-explorer";
import PerformanceTracker, { PerformanceTrackerSkeleton } from "@/components/performance-tracker";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function DashboardContent() {
    return (
        <div className="space-y-8">
            <TodaysWinners />
            
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader className="text-center px-0">
                <CardTitle className="text-3xl font-bold font-headline">Live Model Performance</CardTitle>
                <CardDescription className="max-w-2xl mx-auto">
                    We track every Call and Put setup from entry to exit. Here is the real-time scorecard for every contract currently active in our system. Real P&L. No hiding.
                </CardDescription>
              </CardHeader>
              <Suspense fallback={<PerformanceTrackerSkeleton />}>
                <PerformanceTracker />
              </Suspense>
            </Card>

            <IndustryExplorer />
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
