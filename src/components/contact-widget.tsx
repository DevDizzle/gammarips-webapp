
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { handleFeedback } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContactWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !email.trim()) {
        toast({
            title: 'Missing Information',
            description: 'Please provide your email and a message.',
            variant: 'destructive',
        });
        return;
    }

    setStatus('loading');
    try {
      await handleFeedback(user?.uid || null, message, email);
      setStatus('success');
      setMessage('');
      setTimeout(() => {
        setStatus('idle');
        setOpen(false);
      }, 2000); // Reset after 2 seconds
    } catch (error: any) {
      toast({
        title: 'Failed to Send Message',
        description: error.message || 'An unknown error occurred. Please try again.',
        variant: 'destructive',
      });
      setStatus('idle');
    }
  };

  useEffect(() => {
    // This effect runs only on the client, after hydration.
    // It safely sets the email from the user object if it exists.
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="sr-only">Contact Us</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-80 rounded-lg shadow-2xl p-0 border-none"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Card className="border-none shadow-none">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle>Have a question?</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              We'll get back to you via email as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {status === 'success' ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="font-semibold">Message Sent!</h3>
                    <p className="text-sm text-muted-foreground">We'll be in touch soon.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="contact-email">Your Email</Label>
                    <Input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === 'loading'}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contact-message">Your Question</Label>
                    <Textarea
                    id="contact-message"
                    placeholder="Ask us anything..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={status === 'loading'}
                    className="min-h-[100px]"
                    />
                </div>
                <Button type="submit" className="w-full" disabled={status === 'loading'}>
                    {status === 'loading' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-4 w-4" />
                    )}
                    Send Message
                </Button>
                </form>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
