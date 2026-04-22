'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { handleFeedback } from '@/app/actions';
import { useAuth } from '@/hooks/use-auth';

export default function ContactForm() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await handleFeedback(user?.uid ?? null, message, email);
      setSubmitted(true);
    } catch {
      alert('Failed to send. Please email evan@gammarips.com directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="text-center">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold font-headline">Message Sent!</h3>
          <p className="text-muted-foreground mt-2">We&apos;ll get back to you soon.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Contact Us</CardTitle>
        <p className="text-sm text-muted-foreground">Have a question? Reach out at evan@gammarips.com or use the form below.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Textarea
            placeholder="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
