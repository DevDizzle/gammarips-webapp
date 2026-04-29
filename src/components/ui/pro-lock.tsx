'use client';

import { Button } from '@/components/ui/button';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import { useAuth } from '@/hooks/use-auth';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ProLockProps {
  children: React.ReactNode;
  blurStrength?: 'sm' | 'md' | 'lg';
  title?: string;
  description?: string;
  message?: string;
  className?: string;
  minHeight?: string;
}

export function ProLock({
  children,
  blurStrength = 'md',
  title,
  description,
  message,
  className,
  minHeight = "min-h-[200px]"
}: ProLockProps) {
  const { openAuthModal, openSubscriptionModal } = useAuthModal();
  const { user, isPro, loading } = useAuth();

  // If auth is still loading, show a skeleton state to avoid flashing the lock
  if (loading) {
      return (
          <div className={cn("w-full space-y-4 p-4", minHeight)}>
             <Skeleton className="h-4 w-3/4" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-5/6" />
             <Skeleton className="h-32 w-full rounded-xl" />
          </div>
      )
  }

  // If user is Pro, show content
  if (isPro) {
    return <>{children}</>;
  }

  const blurClass = {
    sm: 'blur-sm',
    md: 'blur-md',
    lg: 'blur-lg'
  }[blurStrength];

  const defaultMessage = user 
    ? "Upgrade to Pro to unlock this analysis."
    : "Sign in to unlock this analysis.";

  const handleUnlock = () => {
      if (!user) {
          openAuthModal('signUp');
      } else {
          openSubscriptionModal();
      }
  };

  const buttonText = user ? "Upgrade to Unlock" : "Sign In to Unlock";

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* The Blurred Content */}
      <div className={cn("select-none pointer-events-none transition-all duration-300", blurClass)}>
        {children}
      </div>

      {/* The Gate Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 z-10">
        <div className="text-center p-6 bg-background/90 rounded-lg border shadow-lg backdrop-blur-sm max-w-[300px]">
          <Lock className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h3 className="text-lg font-semibold mb-2">{title || "Pro Analysis"}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {description || message || defaultMessage}
          </p>
          <Button onClick={handleUnlock} className="w-full">
            {buttonText}
          </Button>
          {!user && (
             <div className="mt-3 text-xs text-muted-foreground">
                Already have an account?{' '}
                <button 
                    onClick={() => openAuthModal('signIn')}
                    className="underline hover:text-primary font-medium"
                >
                    Sign In
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
