
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface HomePageClientContentProps {
  showButton?: boolean;
  buttonText?: string;
}

export default function HomePageClientContent({ showButton = false, buttonText = "Start Your Free 30-Day Trial" }: HomePageClientContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogDefaultView, setAuthDialogDefaultView] = useState<'signIn' | 'signUp'>('signUp');

  useEffect(() => {
    // If auth is done loading and we have a user, redirect to dashboard.
    if (!loading && user) {
      router.push('/dashboard');
      return; // Stop further execution
    }

    // Handle showing auth dialog from verification link
    if (searchParams.get('from') === 'verification' && searchParams.get('verified') === 'true') {
      setAuthDialogDefaultView('signIn');
      setShowAuthDialog(true);
    }
  }, [searchParams, user, loading, router]);


  // While loading, if we don't have a user yet, we can show a placeholder
  // to prevent the main page from flashing.
  if (loading || user) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    );
  }

  if (showButton) {
     return (
        <>
            <AuthDialog
                open={showAuthDialog}
                onOpenChange={setShowAuthDialog}
                defaultView={authDialogDefaultView}
            />
            <Button onClick={() => setShowAuthDialog(true)} size="lg">
                {buttonText} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </>
     )
  }


  return (
    <AuthDialog
      open={showAuthDialog}
      onOpenChange={setShowAuthDialog}
      defaultView={authDialogDefaultView}
    />
  );
}
