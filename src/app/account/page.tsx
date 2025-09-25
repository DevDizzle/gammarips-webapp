
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createStripePortalLink, sendPasswordReset } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function AccountPage() {
  const { user, dbUser, loading: authLoading } = useAuth();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    if (!user) return;
    setLoadingPortal(true);
    try {
      const { portalUrl } = await createStripePortalLink(user.uid);
      router.push(portalUrl);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not access the customer portal. Please contact support.',
        variant: 'destructive',
      });
      setLoadingPortal(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordReset(user.email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your inbox to reset your password.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not send password reset email.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // This will redirect to the home page if user is not authenticated after loading.
    // AuthProvider should handle the redirect or show a login modal.
     router.push('/');
     return (
        <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
             <AuthDialog open={true} onOpenChange={() => router.push('/')} />
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Your Account</h1>
        <p className="text-muted-foreground">Manage your subscription and account details.</p>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>This is your account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email || ''} readOnly disabled />
            </div>
             <Button onClick={handlePasswordReset} variant="outline">
                Send Password Reset Email
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
                {dbUser?.isSubscribed 
                    ? `You are currently on the Pro plan.` 
                    : "You are currently on the free trial plan."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dbUser?.isSubscribed ? (
                <Button onClick={handleManageSubscription} disabled={loadingPortal}>
                    {loadingPortal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Manage Subscription & Billing
                </Button>
            ) : (
                <p className="text-sm text-muted-foreground">
                    You can manage your subscription once you upgrade to Pro.
                </p>
            )}
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
