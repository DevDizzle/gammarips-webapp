
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, User, X, Minimize2, Sparkles } from 'lucide-react';
import { submitChatQuery } from '@/app/actions/chat-actions';
import { Markdown } from './markdown';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import GeminiIcon from './icons/GeminiIcon';
import { useChat } from '@/components/layout/chat-context';
import { Drawer } from 'vaul';
import { useMediaQuery } from '@/hooks/use-media-query';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface ChatInterfaceProps {
  className?: string;
  activeTicker: string | null;
  setIsOpen: (open: boolean) => void;
  isDesktop: boolean;
  messages: Message[];
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  endOfMessagesRef: React.RefObject<HTMLDivElement>;
}

const ChatInterface = ({
  className,
  activeTicker,
  setIsOpen,
  isDesktop,
  messages,
  isLoading,
  input,
  setInput,
  handleSubmit,
  scrollAreaRef,
  endOfMessagesRef
}: ChatInterfaceProps) => (
  <div className={cn("flex flex-col h-full bg-background", className)}>
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b bg-muted/30 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-1 bg-primary/10 rounded-md text-primary">
          <GeminiIcon size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-sm">GammaRips</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Powered by Gemini
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
          {isDesktop ? <Minimize2 size={16} /> : <X size={16} />}
        </Button>
      </div>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-hidden relative">
      <ScrollArea className="h-full px-4 py-4" ref={scrollAreaRef}>
         <div className="space-y-6 pb-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'flex items-start gap-3',
                m.role === 'user' && 'justify-end'
              )}
            >
              {m.role === 'assistant' && (
                <Avatar className="h-7 w-7 shrink-0 mt-1">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'p-3 rounded-2xl text-sm max-w-[85%]',
                  m.role === 'user'
                    ? 'bg-muted rounded-br-none'
                    : 'bg-background rounded-bl-none'
                )}
              >
                <Markdown content={m.content} className="prose-sm dark:prose-invert" />
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-border/50 text-xs opacity-80">
                    <p className="font-medium mb-1 flex items-center gap-1"><Sparkles size={10} /> Sources</p>
                    <ul className="space-y-1">
                      {m.sources.slice(0, 3).map((source, index) => (
                        <li key={index} className="truncate max-w-[200px]">
                          <Link href={source} target="_blank" className="hover:underline flex items-center gap-1">
                            • {new URL(source).hostname}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {m.role === 'user' && (
                <Avatar className="h-7 w-7 shrink-0 mt-1">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">You</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
             <div className="flex items-start gap-3 animate-pulse">
              <Avatar className="h-7 w-7 shrink-0 mt-1">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-bl-none p-3 flex items-center gap-2">
                 <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                 <span className="text-xs text-muted-foreground">Analyzing data...</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
         </div>
      </ScrollArea>
    </div>

    {/* Input */}
    <div className="p-4 border-t bg-background">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeTicker ? `Ask about ${activeTicker}...` : "Ask a question..."}
          className="pr-10 h-11 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/20 transition-all"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()} 
          size="icon"
          className="absolute right-1 top-1 h-9 w-9 rounded-md transition-all hover:scale-105"
        >
          <Send size={16} />
        </Button>
      </form>
      <p className="text-[10px] text-center text-muted-foreground mt-2 opacity-60">
        AI can make mistakes. Check important info.
      </p>
    </div>
  </div>
);

export default function AgentChat() {
  const { isOpen, setIsOpen, activeTicker } = useChat();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content:
        "Hello! I'm your GammaRips AI analyst. I can help you analyze setups, check stock outlooks, or answer support questions.",
    },
  ]);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add User Message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // If we have an active ticker and the user didn't mention it, prepend it for context
      // (This is a simple client-side context injection)
      let finalQuery = input;
      if (activeTicker && !input.toUpperCase().includes(activeTicker)) {
         finalQuery = `Regarding ${activeTicker}: ${input}`;
      }
      
      // Prepare history for the router (convert to Genkit format)
      // We only send the last few messages to save tokens/latency
      const history = messages.slice(-5).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content
      })) as { role: 'user' | 'model'; content: string }[];

      // Call the Server Action
      const response = await submitChatQuery(finalQuery, history);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.answer,
        // The router currently returns { response, source }, we might need to adjust if we want grounded sources back.
        // For now, grounded sources are embedded in the text or not passed separately by the router wrapper.
        // If we want sources, we should update the RouterOutputSchema to include them.
        // For now, let's leave sources undefined or parse them if we add them to Router.
        sources: undefined, 
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching answer:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          "I'm sorry, I'm having trouble connecting to the research engine right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Desktop: Render ONLY if open, as a fixed side panel (handled by parent layout or conditional here?)
  // Actually, for the "Push" effect, the Layout needs to know about this. 
  // For now, we will render it as a fixed overlay on the right for Desktop if we don't refactor the whole layout yet.
  // Better yet, let's use the Drawer for Mobile and a fixed positioning for Desktop for now to ensure it works without breaking layout.
  
  if (isDesktop) {
     if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl z-50 animate-in zoom-in duration-300"
                size="icon"
            >
                <GeminiIcon size={32} />
                <span className="sr-only">Open Chat</span>
            </Button>
        );
     }
     return (
        <div className="fixed top-0 right-0 h-full w-[400px] bg-background border-l z-40 shadow-2xl animate-in slide-in-from-right duration-300">
            <ChatInterface 
              className="border-l border-border/50 shadow-xl"
              activeTicker={activeTicker}
              setIsOpen={setIsOpen}
              isDesktop={isDesktop}
              messages={messages}
              isLoading={isLoading}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              scrollAreaRef={scrollAreaRef}
              endOfMessagesRef={endOfMessagesRef}
            />
        </div>
     );
  }

  // Mobile: Drawer
  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen} shouldScaleBackground>
        {!isOpen && (
            <Drawer.Trigger asChild>
                <Button
                    className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg z-50 md:hidden"
                    size="icon"
                >
                    <GeminiIcon size={28} />
                </Button>
            </Drawer.Trigger>
        )}
        <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
            <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] h-[85vh] fixed bottom-0 left-0 right-0 z-50 outline-none">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-4 mb-2" />
                <div className="flex-1 min-h-0">
                    <ChatInterface 
                      activeTicker={activeTicker}
                      setIsOpen={setIsOpen}
                      isDesktop={isDesktop}
                      messages={messages}
                      isLoading={isLoading}
                      input={input}
                      setInput={setInput}
                      handleSubmit={handleSubmit}
                      scrollAreaRef={scrollAreaRef}
                      endOfMessagesRef={endOfMessagesRef}
                    />
                </div>
            </Drawer.Content>
        </Drawer.Portal>
    </Drawer.Root>
  );
}

    

    