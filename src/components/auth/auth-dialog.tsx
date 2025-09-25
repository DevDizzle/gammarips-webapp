
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createCheckoutSession } from '@/app/actions';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-69.5 69.5c-23.6-22.6-55.2-36.3-90.4-36.3-82.9 0-149.6 66.2-149.6 148.4s66.7 148.4 149.6 148.4c97.1 0 134.3-70.8 138.8-103.8H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
  );

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe?: () => void;
  showSubscribeButton?: boolean;
};

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignIn, setIsSignIn] = useState(false);
  const [loading, setLoading] = useState<'google' | 'email' | null>(null);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setLoading('google');
    try {
      await signInWithGoogle();
      onOpenChange(false);
      toast({ title: isSignIn ? "Successfully signed in." : "Free trial started!" });
    } catch (error: any) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email');
    try {
      if (isSignIn) {
        await signInWithEmail(email, password);
        onOpenChange(false);
        toast({ title: "Successfully signed in." });
      } else {
        await signUpWithEmail(email, password);
        onOpenChange(false);
        toast({ title: "Free trial started!" });
      }
    } catch (error: any) {
       toast({
        title: isSignIn ? "Sign-In Failed" : "Sign-Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSignIn ? 'Sign In' : 'Start Your 30-Day Free Trial'}</DialogTitle>
          <DialogDescription>
             {isSignIn ? 'Sign in to your ProfitScout account.' : 'Get unlimited, full access to all ProfitScout Pro features for 30 days.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={!!loading}
          >
            {loading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Sign up with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={!!loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={!!loading}>
               {loading === 'email' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignIn ? 'Sign In' : 'Start My Free Trial'}
            </Button>
          </form>

            {!isSignIn && <p className="text-center text-xs text-muted-foreground">No credit card required.</p>}

          <p className="text-center text-sm text-muted-foreground">
            {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              className="underline hover:text-primary"
            >
              {isSignIn ? 'Start Free Trial' : 'Sign In'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

