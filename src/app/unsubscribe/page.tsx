'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { unsubscribeEmail } from '@/app/email-actions';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      return;
    }

    const unsubscribe = async () => {
      try {
        await unsubscribeEmail(email);
        setStatus('success');
      } catch (error) {
        setStatus('error');
      }
    };

    unsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Unsubscribing...</h1>
            <p className="text-zinc-400">Please wait while we update your preferences.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-10 w-10 text-green-500 mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Unsubscribed</h1>
            <p className="text-zinc-400">You have been successfully removed from our list. You won't receive any more emails from us.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="h-10 w-10 text-red-500 mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-zinc-400">We couldn't process your request. Please try again or contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <UnsubscribeContent />
    </Suspense>
  );
}
