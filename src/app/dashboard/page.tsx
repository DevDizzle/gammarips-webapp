
import TodaysWinners from "@/app/dashboard/todays-winners";
import DashboardPageClient from "./dashboard-client";

function DashboardContent() {
    return (
        <div className="space-y-8">
            <TodaysWinners />
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
