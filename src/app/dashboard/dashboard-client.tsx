
'use client';

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";

export default function DashboardPageClient({ children }: { children: React.ReactNode }) {
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

    return <>{children}</>;
}
