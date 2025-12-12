'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

interface ChatStore {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  activeTicker: string | null;
  setActiveTicker: (ticker: string | null) => void;
}

const ChatContext = React.createContext<ChatStore | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTicker, setActiveTicker] = React.useState<string | null>(null);
  const pathname = usePathname();

  // Auto-detect ticker from URL (e.g., /dashboard/A or /stocks/A)
  React.useEffect(() => {
    const match = pathname?.match(/\/(?:dashboard|stocks)\/([A-Z]+)/);
    if (match && match[1]) {
      setActiveTicker(match[1]);
    } else {
      setActiveTicker(null);
    }
  }, [pathname]);

  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <ChatContext.Provider value={{ isOpen, setIsOpen, toggle, activeTicker, setActiveTicker }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
