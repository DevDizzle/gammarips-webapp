'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Cookie } from 'lucide-react';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
      setIsVisible(false);
    }
  }, []);

  const handleConsent = (consent: 'granted' | 'denied') => {
    localStorage.setItem('cookie_consent', consent);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 w-full p-4 sm:p-6',
        'transform-gpu transition-all duration-300 ease-in-out',
        'translate-y-0 opacity-100'
      )}
    >
      <div className="mx-auto max-w-4xl rounded-xl border bg-background/80 p-4 shadow-lg backdrop-blur-md sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex-shrink-0">
             <Cookie className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">We Use Cookies</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. By clicking "Accept," you agree to our use of cookies. Read our{' '}
              <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex w-full flex-shrink-0 gap-2 sm:w-auto sm:flex-col">
            <Button size="sm" onClick={() => handleConsent('granted')}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleConsent('denied')}>
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
