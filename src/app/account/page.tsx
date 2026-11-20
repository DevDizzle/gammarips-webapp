
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  sendPasswordReset,
  generateMcpApiKey,
  getMcpApiKeyStatus,
  revokeMcpApiKey,
} from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FREE_MODE } from '@/lib/config';
import { TOOL_COUNT, PRICE_MONTHLY, TRIAL_DAYS } from '@/lib/constants';
import { MachineClientsSection } from '@/components/account/machine-clients';
import { AgentQuickConnect } from '@/components/account/agent-quick-connect';

const MCP_ENDPOINT = 'https://mcp.gammarips.com/mcp';


export default function AccountPage() {
  const { user, dbUser, loading: authLoading, isPro } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // MCP API key state
  const [keyStatus, setKeyStatus] = useState<{
    hasActiveKey: boolean;
    keyPrefix: string | null;
    createdAtISO: string | null;
  } | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null); // shown once
  const [keyBusy, setKeyBusy] = useState(false);

  // Arrived from checkout (?welcome=1)? If entitlement hasn't landed yet,
  // show a finalizing state instead of the upsell — the Firestore snapshot in
  // useAuth flips isPro live the moment the webhook or the post-checkout
  // provisioning writes the user doc. window.location, not useSearchParams:
  // this page is client-only and not an SEO surface.
  const [fromCheckout, setFromCheckout] = useState(false);
  useEffect(() => {
    setFromCheckout(
      new URLSearchParams(window.location.search).get('welcome') === '1'
    );
  }, []);

  const refreshKeyStatus = useCallback(async () => {
    if (!user || !isPro) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/keys', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setKeyStatus(await res.json());
      } else {
        const fallback = await getMcpApiKeyStatus(token);
        if (fallback) setKeyStatus(fallback);
      }
    } catch {
      // non-fatal: the section still renders a generate button
    }
  }, [user, isPro]);

  useEffect(() => {
    refreshKeyStatus();
  }, [refreshKeyStatus]);

  const handleGenerateKey = async () => {
    if (!user) return;
    setKeyBusy(true);
    try {
      const token = await user.getIdToken();
      let generatedKey: string | undefined;
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        generatedKey = data?.key;
      } else if (res.status === 404) {
        const data = await generateMcpApiKey(token);
        generatedKey = data?.key;
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Could not generate key.');
      }
      if (!generatedKey) {
        throw new Error('A new version of the app just deployed. Please refresh this page and click Generate API key again.');
      }
      setNewKey(generatedKey);
      await refreshKeyStatus();
      toast({ title: 'API key generated', description: 'Copy it now; it is shown only once.' });
    } catch (error: any) {
      toast({
        title: 'Could not generate key',
        description: error?.message || 'Please refresh the page and try again.',
        variant: 'destructive',
      });
    } finally {
      setKeyBusy(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!user) return;
    if (!confirm('Revoke your current API key? Any agent using it will lose access immediately.')) return;
    setKeyBusy(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/keys', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status === 404) {
        await revokeMcpApiKey(token);
      } else if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Could not revoke key.');
      }
      setNewKey(null);
      await refreshKeyStatus();
      toast({ title: 'API key revoked' });
    } catch (error: any) {
      toast({
        title: 'Could not revoke key',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setKeyBusy(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
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

        {/* API Access Section */}
        <section className="p-6 rounded-lg border bg-card space-y-5">
          <h2 className="text-xl font-bold">Connect Your AI Agent</h2>
          {isPro ? (
            <>
              <AgentQuickConnect apiKey={newKey} />

              <div className="border-t pt-4 space-y-3">
                <h3 className="text-base font-semibold">Optional: Generate an API Key (`gr_live_...`)</h3>
                <p className="text-sm text-muted-foreground">
                  If you use Claude Desktop, Claude Web, or ChatGPT, you can skip API keys completely and sign in with Option 2 above. If you use a CLI or code agent (Claude Code, Cursor, Codex, GrokBot), click below to generate a key—the setup prompt above will automatically update with your new key included.
                </p>

                {/* One-time reveal of a freshly generated key */}
                {newKey && (
                  <div className="p-4 rounded border border-green-600 bg-green-500/10 space-y-2">
                    <p className="text-sm font-semibold text-green-500">
                      ✓ API key generated &amp; inserted into Option 1 above. Copy the prompt above or save the raw key below (shown once):
                    </p>
                    <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                      {newKey}
                    </code>
                    <Button size="sm" variant="outline" onClick={() => copy(newKey)}>
                      Copy raw key
                    </Button>
                  </div>
                )}

                {/* Current key status + actions */}
                {!newKey && (
                  <div className="space-y-2">
                    {keyStatus?.hasActiveKey ? (
                      <p className="text-sm text-muted-foreground">
                        Active key: <code className="text-primary">{keyStatus.keyPrefix}…</code>
                        {keyStatus.createdAtISO
                          ? ` · created ${new Date(keyStatus.createdAtISO).toLocaleDateString()}`
                          : ''}
                        . Click Regenerate if you want a fresh one-click setup prompt with your key pre-filled.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No active API key yet.</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleGenerateKey} disabled={keyBusy}>
                        {keyBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {keyStatus?.hasActiveKey ? 'Regenerate key & prompt' : 'Generate API key & setup prompt'}
                      </Button>
                      {keyStatus?.hasActiveKey && (
                        <Button variant="destructive" onClick={handleRevokeKey} disabled={keyBusy}>
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : fromCheckout ? (
            <div className="flex items-start gap-3">
              <Loader2 className="h-5 w-5 animate-spin shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                Finalizing your subscription. This page updates automatically,
                usually within a few seconds. If this message doesn&apos;t clear,
                email <a href="mailto:evan@gammarips.com" className="text-primary hover:underline">evan@gammarips.com</a> and
                we&apos;ll sort it immediately.
              </p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground">
                Connect Claude Code, Codex, Cursor, Gemini CLI, or any agent that
                can send a bearer key to the GammaRips data layer: the curated pool, opportunity surfaces, outcome
                history, and methodology playbooks. {PRICE_MONTHLY}/mo, {TRIAL_DAYS}-day free trial.
              </p>
              <Button asChild>
                <Link href="/pricing">Get Agent Access &rarr;</Link>
              </Button>
            </>
          )}
          <Link href="/developers" className="text-sm text-primary hover:underline inline-block mt-2">
            View full API documentation →
          </Link>
        </section>

        <MachineClientsSection />
      </div>
    </div>
  );
}
