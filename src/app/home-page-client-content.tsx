
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

export default function HomePageClientContent({ showButton = false, buttonText = "Get Instant Access ($19/mo)" }: HomePageClientContentProps) {
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogDefaultView, setAuthDialogDefaultView] = useState<'signIn' | 'signUp'>('signUp');

  useEffect(() => {
    // Handle showing auth dialog from verification link
    if (searchParams.get('from') === 'verification' && searchParams.get('verified') === 'true') {
      setAuthDialogDefaultView('signIn');
      setShowAuthDialog(true);
    }
  }, [searchParams]);

  // While loading, show nothing to avoid layout shifts. The root layout client handles the loader.
  if (loading || user) {
    return null;
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
