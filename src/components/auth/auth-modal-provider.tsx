'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthDialog } from './auth-dialog';

interface AuthModalContextType {
  openAuthModal: (view?: 'signIn' | 'signUp') => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'signIn' | 'signUp'>('signUp');

  const openAuthModal = (initialView: 'signIn' | 'signUp' = 'signUp') => {
    setView(initialView);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      <AuthDialog 
        open={isOpen} 
        onOpenChange={setIsOpen} 
        defaultView={view}
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
