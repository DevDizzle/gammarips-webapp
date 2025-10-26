
'use client';

import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && user && pathname === '/') {
            router.push('/dashboard');
        }
    }, [user, loading, pathname, router]);

    // While auth is loading and we are on the homepage with a potential user, show a loader
    if (loading && pathname === '/') {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    // If user is logged in and on the homepage, the effect will redirect them.
    // We render null here to avoid a flash of the homepage content.
    if (user && pathname === '/') {
        return (
             <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
