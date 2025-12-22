'use client';

import { Button } from '@/components/ui/button';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlurGateProps {
  children: React.ReactNode;
  isLocked: boolean;
  blurStrength?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function BlurGate({ 
  children, 
  isLocked, 
  blurStrength = 'md', 
  message = "Sign in to unlock full access",
  className 
}: BlurGateProps) {
  const { openAuthModal } = useAuthModal();

  if (!isLocked) {
    return <>{children}</>;
  }

  const blurClass = {
    sm: 'blur-sm',
    md: 'blur-md',
    lg: 'blur-lg'
  }[blurStrength];

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* The Blurred Content */}
      <div className={cn("select-none pointer-events-none transition-all duration-300", blurClass)}>
        {children}
      </div>

      {/* The Gate Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 z-10">
        <div className="text-center p-6 bg-background/90 rounded-lg border shadow-lg backdrop-blur-sm">
          <Lock className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Restricted Access</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-[250px]">
            {message}
          </p>
          <Button onClick={() => openAuthModal('signUp')} className="w-full">
            Unlock Now (Free)
          </Button>
          <div className="mt-3 text-xs text-muted-foreground">
            Already have an account?{' '}
            <button 
                onClick={() => openAuthModal('signIn')}
                className="underline hover:text-primary font-medium"
            >
                Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
