
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HomePageClientContentProps {
  showButton?: boolean;
  buttonText?: string;
}

export default function HomePageClientContent({ showButton = false, buttonText = "Start Your Free 30-Day Trial" }: HomePageClientContentProps) {
  const searchParams = useSearchParams();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogDefaultView, setAuthDialogDefaultView] = useState<'signIn' | 'signUp'>('signUp');

  useEffect(() => {
    if (searchParams.get('from') === 'verification' && searchParams.get('verified') === 'true') {
      setAuthDialogDefaultView('signIn');
      setShowAuthDialog(true);
    }
  }, [searchParams]);

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
