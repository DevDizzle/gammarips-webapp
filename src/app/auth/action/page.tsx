'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAuth, applyActionCode, checkActionCode } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const auth = getAuth(app);

function AuthActionHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  const mode = searchParams.get('mode');
  const actionCode = searchParams.get('oobCode');

  useEffect(() => {
    const handleAction = async () => {
      if (!mode || !actionCode) {
        setStatus('error');
        setMessage('Invalid verification link. Please try again.');
        return;
      }

      try {
        switch (mode) {
          case 'verifyEmail':
            // Verify the action code is valid
            await checkActionCode(auth, actionCode);
            // Apply the action code to verify the email
            await applyActionCode(auth, actionCode);
            setStatus('success');
            setMessage('Your email has been successfully verified! You will be redirected shortly.');
            
            // Redirect to home page with a query param to trigger login modal
            setTimeout(() => {
              router.push('/?from=verification&verified=true');
            }, 3000);
            break;
          // Add cases for other modes like 'resetPassword' if needed in the future
          default:
            setStatus('error');
            setMessage('Unsupported action. Please check the link and try again.');
        }
      } catch (error: any) {
        setStatus('error');
        if (error.code === 'auth/invalid-action-code') {
          setMessage('This verification link is invalid or has already been used. Please request a new one if needed.');
        } else {
          setMessage('An error occurred during verification. Please try again.');
        }
        console.error('Firebase auth action error:', error);
      }
    };

    handleAction();
  }, [mode, actionCode, router]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-12 w-12 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Email Verification</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
        {getIcon()}
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}


export default function AuthActionPage() {
    return (
        <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin" />}>
            <AuthActionHandler />
        </Suspense>
    )
}
