
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
import { TOOL_COUNT, PRICE_MONTHLY } from '@/lib/constants';
import { MachineClientsSection } from '@/components/account/machine-clients';

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
      setKeyStatus(await getMcpApiKeyStatus(token));
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
      const { key } = await generateMcpApiKey(token);
      setNewKey(key);
      await refreshKeyStatus();
      toast({ title: 'API key generated', description: 'Copy it now; it is shown only once.' });
    } catch (error: any) {
      toast({
        title: 'Could not generate key',
        description: error?.message || 'Please try again.',
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
      await revokeMcpApiKey(token);
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
        <section className="p-6 rounded-lg border bg-card space-y-4">
          <h2 className="text-xl font-bold">Agent Access: MCP API Key</h2>
          {isPro ? (
            <>
              <p className="text-muted-foreground">
                Your subscription includes full MCP Agent Access (all {TOOL_COUNT} tools).
                Generate an API key and connect Claude Code, Codex, Cursor, Gemini CLI,
                or any agent that can send a bearer key. Steps per client are in
                the connect section on the homepage.
              </p>

              {/* One-time reveal of a freshly generated key */}
              {newKey && (
                <div className="p-4 rounded border border-green-600 bg-green-500/10 space-y-2">
                  <p className="text-sm font-semibold text-green-500">
                    ⚠️ Copy this key now. You won&apos;t be able to see it again.
                  </p>
                  <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                    {newKey}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copy(newKey)}>
                    Copy key
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
                      . For security the full key is only shown at creation.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No active API key yet.</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleGenerateKey} disabled={keyBusy}>
                      {keyBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {keyStatus?.hasActiveKey ? 'Regenerate key' : 'Generate API key'}
                    </Button>
                    {keyStatus?.hasActiveKey && (
                      <Button variant="destructive" onClick={handleRevokeKey} disabled={keyBusy}>
                        Revoke
                      </Button>
                    )}
                  </div>
                  {keyStatus?.hasActiveKey && (
                    <p className="text-xs text-muted-foreground">
                      Regenerating immediately invalidates your previous key.
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm font-semibold mb-2">MCP Endpoint:</p>
                <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                  {MCP_ENDPOINT}
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Transport: Streamable HTTP • Auth: Authorization: Bearer &lt;your key&gt;
                </p>
                <code className="block p-2 mt-2 bg-muted rounded text-xs font-mono break-all">
                  claude mcp add --transport http gammarips {MCP_ENDPOINT} --header
                  &quot;Authorization: Bearer &lt;your key&gt;&quot;
                </code>
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
                history, and methodology playbooks. {PRICE_MONTHLY}/mo, 7-day free trial.
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
