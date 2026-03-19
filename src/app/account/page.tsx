
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordReset } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FREE_MODE } from '@/lib/config';


export default function AccountPage() {
  const { user, dbUser, loading: authLoading, isPro } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordReset(user.email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your inbox to reset your password.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not send password reset email.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // This will redirect to the home page if user is not authenticated after loading.
    // AuthProvider should handle the redirect or show a login modal.
     router.push('/');
     return (
        <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
             <AuthDialog open={true} onOpenChange={() => router.push('/')} />
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Your Account</h1>
        <p className="text-muted-foreground">Manage your subscription and account details.</p>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>This is your account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email || ''} readOnly disabled />
            </div>
             <Button onClick={handlePasswordReset} variant="outline">
                Send Password Reset Email
            </Button>
          </CardContent>
        </Card>

        {/* API Access Section */}
        <section className="p-6 rounded-lg border bg-card space-y-4">
          <h2 className="text-xl font-bold">MCP API Access</h2>
          <p className="text-muted-foreground">
            The GammaRips MCP API is free and open. No API key required.
          </p>
          <div>
            <p className="text-sm font-semibold mb-2">MCP Endpoint:</p>
            <code className="block p-2 bg-muted rounded text-sm font-mono">
              https://gammarips-mcp-406581297632.us-central1.run.app/sse
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Transport: SSE (Server-Sent Events) • No authentication required
            </p>
          </div>
          <Link href="/developers" className="text-sm text-primary hover:underline inline-block mt-2">
            View full API documentation →
          </Link>
        </section>
      </div>
    </div>
  );
}
