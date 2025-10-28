
import { Suspense } from "react";
import TodaysWinners from "@/app/dashboard/todays-winners";
import DashboardPageClient from "./dashboard-client";
import { IndustryExplorer, IndustryExplorerSkeleton } from "./industry-explorer";

function DashboardContent() {
    return (
        <div className="space-y-8">
            <TodaysWinners />
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
