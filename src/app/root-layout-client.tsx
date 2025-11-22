
'use client';

import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // The automatic redirect from '/' to '/dashboard' for logged-in users has been removed
    // to allow users to visit the homepage even when authenticated.
    // The dashboard is now the explicit entry point for authenticated, subscribed users.

    // While auth is loading on any page, you might want a global loader,
    // but for now, we'll keep it minimal to avoid layout shifts.
    // The original logic was tied only to the homepage, which is no longer desired.
    if (loading && !user) {
        // Show a brief loader on initial load if user state is unknown
        // to prevent flashes of content.
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
