
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
import { getDoc, doc, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { event as trackEvent } from '@/lib/gtag';
import { useRouter } from 'next/navigation';
import { createCheckoutSession } from '@/app/actions';
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
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Use onSnapshot for real-time updates
        unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setDbUser(docSnap.data() as DbUser);
          } else {
            console.warn(`Authenticated user ${user.uid} not found in Firestore. A new record will be created if they sign in again.`);
            setDbUser(null);
          }
          setLoading(false);
        }, (error) => {
            console.error("Error listening to user document:", error);
            setLoading(false);
        });

      } else {
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
        }
        setDbUser(null);
        setLoading(false);
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
        }
    };
  }, []);

  const handleSuccessfulAuth = async (userCredential: UserCredential, method: 'Google' | 'Email') => {
    const { user } = userCredential;
    const additionalInfo = getAdditionalUserInfo(userCredential);

    const newDbUser = await getOrCreateUser(user.uid, user.isAnonymous, user.displayName ?? undefined, user.email ?? undefined);
    setDbUser(newDbUser);

    if (additionalInfo?.isNewUser) {
      trackEvent('sign_up', { method });
      
      // The welcome email is no longer sent on sign up.
      // It is now sent via the Stripe webhook upon successful subscription.
      router.push('/auth/processing');

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
