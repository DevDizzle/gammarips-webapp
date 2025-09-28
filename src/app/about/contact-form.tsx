'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { handleFeedback } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Loader2, CheckCircle } from 'lucide-react';

export default function ContactForm() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

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
      // Don't clear email if user was logged in
      if (!user) {
        setEmail('');
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Send Message',
        description: error.message || 'An unknown error occurred. Please try again.',
        variant: 'destructive',
      });
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 bg-card rounded-lg">
        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="font-semibold text-xl">Message Sent!</h3>
        <p className="text-muted-foreground mt-2">
          Thank you for reaching out. We'll get back to you as soon as possible.
        </p>
        <Button onClick={() => setStatus('idle')} variant="outline" className="mt-4">
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
        <CardDescription>
          Have a question or feedback? Fill out the form below and we'll get back to you.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <Label htmlFor="contact-message">Your Question or Feedback</Label>
            <Textarea
              id="contact-message"
              placeholder="Ask us anything or share your ideas..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={status === 'loading'}
              className="min-h-[120px]"
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
      </CardContent>
    </Card>
  );
}
