
'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { SubscriptionDialog } from "@/components/auth/subscription-dialog";
import { createCheckoutSession } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";

import { FREE_MODE } from "@/lib/config";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function DashboardPageClient({ children }: { children: React.ReactNode }) {
    const { user, dbUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscribe = async () => {
        if (!user) return;
        setIsSubscribing(true);
        try {
          const gaClientId = localStorage.getItem('ga_client_id');
          const { sessionId } = await createCheckoutSession(user.uid, gaClientId);
          const stripe = await stripePromise;
          if (stripe) {
            const { error } = await stripe.redirectToCheckout({ sessionId });
            if (error) throw error;
          }
        } catch (error: any) {
          toast({
            title: "Subscription Error",
            description: error.message || "Could not initiate subscription.",
            variant: "destructive",
          });
        } finally {
          setIsSubscribing(false);
        }
    };
    
    // 1. Show loader while authentication is in progress
    if (authLoading) {
        return (
          <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
              <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        );
    }
    
    // 2. If user is not logged in, show the authentication dialog
    if (!user) {
        return <AuthDialog open={true} onOpenChange={() => router.push('/dashboard')} />;
    }

    // 3. If user exists but their database record is still loading or doesn't exist, show loader.
    // This can happen briefly after sign-up.
    if (!dbUser) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="ml-4">Finalizing account...</p>
            </div>
        )
    }

    // 4. If user is not subscribed and we are NOT in free mode, show subscription dialog.
    if (!dbUser.isSubscribed && !FREE_MODE) {
        return (
            <SubscriptionDialog
              open={true}
              onOpenChange={() => router.push('/')} // Redirect to home on close
              onSubscribe={handleSubscribe}
              loading={isSubscribing}
            />
        );
    }

    // 5. If all checks pass, render the premium content
    return <>{children}</>;
}
