'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthDialog } from './auth-dialog';
import { SubscriptionDialog } from './subscription-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/app/actions';
import { loadStripe } from "@stripe/stripe-js";
import { event as trackEvent } from '@/lib/gtag';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface AuthModalContextType {
  openAuthModal: (view?: 'signIn' | 'signUp') => void;
  closeAuthModal: () => void;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  // Auth Dialog State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<'signIn' | 'signUp'>('signUp');

  // Subscription Dialog State
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  // Auth Handlers
  const openAuthModal = (initialView: 'signIn' | 'signUp' = 'signUp') => {
    trackEvent('auth_modal_open', { view: initialView });
    setAuthView(initialView);
    setIsAuthOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthOpen(false);
  };

  // Subscription Handlers
  const openSubscriptionModal = () => {
    if (!user) {
        openAuthModal('signUp');
        return;
    }
    setIsSubOpen(true);
  };

  const closeSubscriptionModal = () => {
    setIsSubOpen(false);
  };

  const handleSubscribe = async () => {
    if (!user) return;
    setIsSubscribing(true);
    try {
      const gaClientId = localStorage.getItem('ga_client_id');
      const idToken = await user.getIdToken();
      const { sessionId } = await createCheckoutSession(idToken, gaClientId);
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) throw error;
      }
    } catch (error: any) {
      toast({
        title: "Subscription Error",
        description: error.message || "Could not initiate subscription.",
        variant: "destructive",
      });
      setIsSubscribing(false); 
    }
    // Note: We don't set isSubscribing(false) on success because the page redirects
  };

  return (
    <AuthModalContext.Provider value={{ 
        openAuthModal, 
        closeAuthModal,
        openSubscriptionModal,
        closeSubscriptionModal
    }}>
      {children}
      <AuthDialog 
        open={isAuthOpen} 
        onOpenChange={setIsAuthOpen} 
        defaultView={authView}
      />
      <SubscriptionDialog
        open={isSubOpen}
        onOpenChange={setIsSubOpen}
        onSubscribe={handleSubscribe}
        loading={isSubscribing}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
