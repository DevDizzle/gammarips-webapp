

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  getAdditionalUserInfo,
  UserCredential,
} from 'firebase/auth';
import { app, getOrCreateUser, type DbUser } from '@/lib/firebase';
import { useToast } from './use-toast';
import { getDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { event as trackEvent } from '@/lib/gtag';
import { useRouter } from 'next/navigation';
import { handleWelcomeEmail, createCheckoutSession } from '@/app/actions';
import { loadStripe } from '@stripe/stripe-js';

const auth = getAuth(app);
const db = getFirestore(app);
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);


interface AuthContextType {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setDbUser(userDocSnap.data() as DbUser);
        } else {
          console.warn(`Authenticated user ${user.uid} not found in Firestore. A new record will be created if they sign in again.`);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const redirectToCheckout = async (uid: string) => {
      try {
        const gaClientId = localStorage.getItem('ga_client_id');
        const { sessionId } = await createCheckoutSession(uid, gaClientId);
        const stripe = await stripePromise;
        if (stripe) {
            const { error } = await stripe.redirectToCheckout({ sessionId });
            if (error) throw new Error(error.message);
        } else {
            throw new Error("Stripe.js has not loaded yet.");
        }
    } catch (error: any) {
        console.error("Failed to redirect to checkout:", error);
        toast({
            title: "Subscription Error",
            description: error.message || "Could not initiate subscription process. Please try again or contact support.",
            variant: "destructive",
        });
        // If redirect fails, send them to the homepage so they aren't stuck.
        router.push('/');
    }
  }

  const handleSuccessfulAuth = async (userCredential: UserCredential, method: 'Google' | 'Email') => {
    const { user } = userCredential;
    const additionalInfo = getAdditionalUserInfo(userCredential);

    const newDbUser = await getOrCreateUser(user.uid, user.isAnonymous, user.displayName ?? undefined, user.email ?? undefined);
    setDbUser(newDbUser);

    if (additionalInfo?.isNewUser) {
      trackEvent('sign_up', { method });
      
      // Trigger welcome email for new users
      if (user.email) {
          handleWelcomeEmail(user.email, user.displayName || user.email).catch(err => {
              console.error("Failed to send welcome email:", err);
          });
      }
      
      // Redirect to Stripe checkout for new users instead of dashboard
      await redirectToCheckout(user.uid);

    } else {
       toast({ title: "Successfully signed in." });
       router.push('/dashboard');
    }
  };


  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await handleSuccessfulAuth(userCredential, 'Google');
    } catch (error) {
      console.error("Google sign-in error", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await handleSuccessfulAuth(userCredential, 'Email');
    } catch (error) {
        console.error("Email sign-up error", error);
        throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // For sign-in, we just go to the dashboard. The dashboard client will handle subscription checks.
      const { user } = userCredential;
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
          setDbUser(userDocSnap.data() as DbUser);
      }
      toast({ title: "Successfully signed in." });
      router.push('/dashboard');

    } catch (error) {
        console.error("Email sign-in error", error);
        throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Sign out error", error);
      toast({
        title: 'Sign Out Failed',
        description: 'Could not sign out. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await sendEmailVerification(currentUser);
      } catch (error) {
        console.error("Error sending verification email", error);
        throw error;
      }
    } else {
      throw new Error("No user is currently signed in.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOut, sendVerificationEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
