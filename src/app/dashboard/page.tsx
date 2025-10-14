
'use client';

import { Suspense, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import TodaysWinners from "@/app/dashboard/todays-winners";
import PerformanceTracker, { PerformanceTrackerSkeleton } from "@/components/performance-tracker";
import { AuthDialog } from "@/components/auth/auth-dialog";

// Force dynamic rendering to ensure performance data is always fresh.
export const revalidate = 0;

function DashboardContent() {
    return (
        <div className="space-y-8">
            <Suspense fallback={<PerformanceTrackerSkeleton />}>
                <PerformanceTracker />
            </Suspense>
            <TodaysWinners />
        </div>
    )
}


export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);


    if (loading) {
        return (
          <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
              <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        );
    }
    
    if (!user) {
        // While useEffect redirects, this prevents rendering the dashboard content for non-users.
        // It also provides a fallback in case the redirect is slow.
        return <AuthDialog open={true} onOpenChange={() => router.push('/')} />;
    }

    return <DashboardContent />;
}
