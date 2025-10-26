
'use client';

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { SubscriptionDialog } from "@/components/auth/subscription-dialog";
import { createCheckoutSession } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { MailCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const VerifyEmailCard = () => {
    const { sendVerificationEmail } = useAuth();
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    const handleResend = async () => {
        setIsSending(true);
        try {
            await sendVerificationEmail();
            toast({
                title: 'Verification Email Sent',
                description: 'Please check your inbox for a new verification link.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to send verification email. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-xl mx-auto">
                <CardHeader className="text-center">
                    <MailCheck className="mx-auto h-12 w-12 text-primary mb-4" />
                    <CardTitle>Verify Your Email Address</CardTitle>
                    <CardDescription>
                        We've sent a verification link to your email. Please click the link to finish setting up your account and access the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Didn't receive an email? Check your spam folder or click below to resend.
                    </p>
                    <Button onClick={handleResend} disabled={isSending} variant="secondary">
                        {isSending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Resend Verification Email'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function DashboardPageClient({ children }: { children: React.ReactNode }) {
    const { user, dbUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [showSubDialog, setShowSubDialog] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);

    const trialHasEnded = useMemo(() => {
        if (!dbUser?.createdAt) return false;
        const createdAtDate = (dbUser.createdAt as any).toDate ? (dbUser.createdAt as any).toDate() : new Date((dbUser.createdAt as any).seconds * 1000);
        return (new Date().getTime() - createdAtDate.getTime()) > 30 * 24 * 60 * 60 * 1000;
    }, [dbUser]);

    const hasAccess = useMemo(() => {
        if (authLoading || !dbUser) return false;
        const isVerified = user?.providerData.some(p => p.providerId === 'google.com') || user?.emailVerified;
        if (!isVerified) return false;
        return dbUser.isSubscribed || !trialHasEnded;
    }, [dbUser, user, trialHasEnded, authLoading]);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setShowAuthDialog(true);
            return;
        }

        const isVerified = user.providerData.some(p => p.providerId === 'google.com') || user.emailVerified;
        if (!isVerified) {
            return; // Will render VerifyEmailCard
        }

        if (!hasAccess) {
            setShowSubDialog(true);
        }

    }, [authLoading, user, hasAccess]);
    
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
    
      const handleDialogClose = () => {
          setShowAuthDialog(false);
          setShowSubDialog(false);
          router.push('/');
      }

    if (authLoading) {
        return (
          <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
              <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        );
    }
    
    if (!user) {
        return <AuthDialog open={showAuthDialog} onOpenChange={handleDialogClose} />;
    }

    if (!user.emailVerified && !user.providerData.some(p => p.providerId === 'google.com')) {
        return <VerifyEmailCard />;
    }

    if (!hasAccess) {
        return (
            <SubscriptionDialog
              open={showSubDialog}
              onOpenChange={handleDialogClose}
              onSubscribe={handleSubscribe}
              loading={isSubscribing}
            />
          );
    }

    return <>{children}</>;
}
