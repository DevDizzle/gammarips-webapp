
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
} from 'firebase/auth';
import { app, getOrCreateUser, type DbUser } from '@/lib/firebase';
import { useToast } from './use-toast';
import { getDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { event as trackEvent } from '@/lib/gtag';

const auth = getAuth(app);
const db = getFirestore(app);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch user document from Firestore to get subscription status and other details
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setDbUser(userDocSnap.data() as DbUser);
        } else {
          // If doc doesn't exist, create it. This is the definitive "sign up" moment.
          const newDbUser = await getOrCreateUser(user.uid, user.isAnonymous, user.displayName ?? undefined, user.email ?? undefined);
          setDbUser(newDbUser);
          // Fire the sign_up event now that we know for sure it's a new user in our DB
          trackEvent('sign_up', { event_category: 'engagement', event_label: user.providerData[0]?.providerId || 'email' });
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting the user states and tracking the event
    } catch (error) {
      console.error("Google sign-in error", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Send verification email
      await sendEmailVerification(userCredential.user);
      // onAuthStateChanged will handle setting the user states and tracking the event
    } catch (error) {
        console.error("Email sign-up error", error);
        throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
       // onAuthStateChanged will handle setting the user states
    } catch (error) {
        console.error("Email sign-in error", error);
        throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will set user and dbUser to null
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
