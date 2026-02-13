
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordReset, handleCancellationIntent } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FREE_MODE } from '@/lib/config';
import { generateApiKey, hashApiKey } from '@/lib/api-key';
import { doc, updateDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';

function CancellationForm() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    const handleProceedToCancel = async () => {
        if (!user || !feedback.trim()) return;

        setLoading(true);
        try {
            const { portalUrl } = await handleCancellationIntent(user.uid, feedback);
            if (portalUrl) {
                router.push(portalUrl);
            } else {
                toast({
                    title: "Error",
                    description: "Could not create customer portal session.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Could not access the customer portal. Please contact support.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <h3 className="font-semibold">We're sorry to see you go</h3>
            <p className="text-sm text-muted-foreground">
                Before you cancel, could you please share why GammaRips wasn't the right fit for you? Your feedback is vital for us to improve.
            </p>
            <Textarea
                placeholder="e.g., Too expensive, not enough signals, missing a feature..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-background/50"
                disabled={loading}
            />
            <Button
                onClick={handleProceedToCancel}
                disabled={loading || feedback.trim().length < 5}
                className="w-full"
                variant="secondary"
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Proceed to Cancellation
            </Button>
        </div>
    );
}


export default function AccountPage() {
  const { user, dbUser, loading: authLoading, isPro } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const db = getFirestore(app);

  const handleGenerateApiKey = async () => {
    if (!user) return;
    setGenerating(true);
    
    try {
      const apiKey = generateApiKey();
      const apiKeyHash = hashApiKey(apiKey);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        apiKeyHash: apiKeyHash,
        apiKeyCreatedAt: serverTimestamp(),
      });
      
      setNewApiKey(apiKey);
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate API key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    if (confirm('This will invalidate your existing API key. Any agents using the old key will stop working. Continue?')) {
      setNewApiKey(null);
      await handleGenerateApiKey();
    }
  };

  const handleCopyKey = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey);
      toast({
        title: 'Copied!',
        description: 'API key copied to clipboard.',
      });
    }
  };

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
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
                {FREE_MODE 
                  ? "You are currently on the Early Adopter Free Tier."
                  : dbUser?.isSubscribed 
                    ? `You are currently on the Pro plan.` 
                    : "You are not currently subscribed to a Pro plan."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {FREE_MODE ? (
               <p className="text-sm text-muted-foreground">
                  Enjoy full access to GammaRips for free during our beta period.
               </p>
            ) : dbUser?.isSubscribed ? (
                <CancellationForm />
            ) : (
                <p className="text-sm text-muted-foreground">
                    You can manage your subscription once you upgrade to Pro.
                </p>
            )}
            
          </CardContent>
        </Card>

        {/* API Access Section */}
        <section className="p-6 rounded-lg border bg-card space-y-4">
          <h2 className="text-xl font-bold">API Access</h2>
          
          {!isPro ? (
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Subscribe to generate an API key for MCP access.
              </p>
              {/* Show subscribe button or link */}
            </div>
          ) : !dbUser?.apiKeyHash ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Generate an API key to connect your AI agent to GammaRips MCP.
              </p>
              <Button onClick={handleGenerateApiKey} disabled={generating}>
                {generating ? 'Generating...' : 'Generate API Key'}
              </Button>
            </div>
          ) : newApiKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500 rounded">
                <p className="text-sm font-semibold text-green-400 mb-2">
                  ⚠️ Copy this key now — you won't see it again!
                </p>
                <code className="block p-3 bg-muted rounded text-sm break-all font-mono">
                  {newApiKey}
                </code>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={handleCopyKey}>
                    Copy to Clipboard
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setNewApiKey(null)}>
                    Done
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-500">
                <span>✓</span>
                <span className="font-semibold">API Key Active</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Created: {(dbUser.apiKeyCreatedAt as any)?.toDate?.()?.toLocaleDateString() || 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground">
                Key prefix: <code className="text-primary">gr_live_••••••••</code>
              </p>
              <Button variant="outline" size="sm" onClick={handleRegenerateApiKey}>
                Regenerate Key
              </Button>
              <p className="text-xs text-muted-foreground">
                Regenerating will invalidate your current key immediately.
              </p>
            </div>
          )}
          
          <div className="pt-4 border-t mt-4">
            <p className="text-sm font-semibold mb-2">MCP Endpoint:</p>
            <code className="block p-2 bg-muted rounded text-sm font-mono">
              https://gammarips-mcp-406581297632.us-central1.run.app/sse
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Use header: <code>X-API-Key: your_key_here</code>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
