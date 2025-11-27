
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { createCheckoutSession } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ProcessingPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (authLoading) {
            return; // Wait until we know the user's auth state
        }
        if (!user) {
            // If for some reason the user isn't authenticated, send them to the homepage.
            router.replace('/');
            return;
        }

        const redirectToCheckout = async () => {
            try {
                const gaClientId = localStorage.getItem('ga_client_id');
                const { sessionId } = await createCheckoutSession(user.uid, gaClientId);
                const stripe = await stripePromise;
                if (stripe) {
                    const { error } = await stripe.redirectToCheckout({ sessionId });
                    if (error) throw new Error(error.message);
                } else {
                    throw new Error("Stripe.js has not loaded yet.");
                }
            } catch (error: any) {
                console.error("Failed to redirect to checkout:", error);
                toast({
                    title: "Subscription Error",
                    description: error.message || "Could not initiate subscription. Please contact support.",
                    variant: "destructive",
                });
                // If redirect fails, send them to the homepage so they aren't stuck.
                router.replace('/');
            }
        };

        // Adding a short delay so the user can read the message.
        const timer = setTimeout(() => {
            redirectToCheckout();
        }, 2500);

        return () => clearTimeout(timer);

    }, [user, authLoading, router, toast]);

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-center">Account Created.</CardTitle>
                <CardDescription className="text-center">
                    We are redirecting you to Stripe to complete your secure checkout.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Do not close this window...</p>
            </CardContent>
        </Card>
    );
}

