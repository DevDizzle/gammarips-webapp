
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import TodaysWinners from "@/app/dashboard/todays-winners";
import DashboardPageClient from "./dashboard-client";
import { IndustryExplorer, IndustryExplorerSkeleton } from "./industry-explorer";
import OptionsCandidatesTable from "./options-candidates-table";

function DashboardContent() {
    return (
        <div className="space-y-8">
            <TodaysWinners />
            <Suspense fallback={<IndustryExplorerSkeleton />}>
              <IndustryExplorer />
            </Suspense>
            <OptionsCandidatesTable />
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
