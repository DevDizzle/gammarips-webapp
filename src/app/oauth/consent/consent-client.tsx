'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { PRICE_MONTHLY, TRIAL_DAYS } from '@/lib/constants';

export interface ConsentSummary {
  rid: string;
  clientName: string;
  /** Host of the client's metadata document (Client ID Metadata Document clients). */
  clientOrigin: string | null;
  /** Where the browser goes after approval (host, or scheme for native apps). */
  redirectHost: string;
  redirectIsLoopback: boolean;
  scope: string;
}

export function ConsentClient({ summary }: { summary: ConsentSummary }) {
  const { user, loading, isPro } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState<'allow' | 'deny' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // isPro mirrors isUserMcpEntitledAdmin (the server-side gate); it is the
  // same rule the token endpoint applies when it stamps `tier` on the token.
  const entitled = isPro;

  const decide = async (decision: 'allow' | 'deny') => {
    if (!user) return;
    setBusy(decision);
    setError(null);
    try {
      const idToken = await user.getIdToken(true);
      const res = await fetch('/oauth/consent/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rid: summary.rid, idToken, decision }),
      });
      if (res.status === 410) {
        setError('This request has expired. Go back to your agent and start the connection again.');
        return;
      }
      if (!res.ok) {
        setError('The request could not be completed. Try again.');
        return;
      }
      const { redirect_to } = (await res.json()) as { redirect_to: string };
      window.location.assign(redirect_to);
    } catch {
      setError('The request could not be completed. Try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Connect {summary.clientName} to GammaRips</CardTitle>
          <CardDescription>
            {summary.clientName} asks to use your GammaRips account through the MCP server.
            {summary.clientOrigin ? (
              <> Client identity: {summary.clientOrigin}.</>
            ) : (
              <> The client name is self-declared and not verified. Check the return address below.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border bg-muted/30 p-4 text-sm">
            <p className="font-medium">What it can do</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Read the curated pool, the opportunity surfaces, and the methodology tools.</li>
              <li>Nothing else. It cannot change your account, your key, or your billing.</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Scope: {summary.scope}</p>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking your session...
            </div>
          ) : !user ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Sign in to continue. You come back to this page.</p>
              <Button className="w-full" onClick={() => setAuthOpen(true)}>
                Sign in to continue
              </Button>
              <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultView="signIn" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm">
                <p>
                  Signed in as <span className="font-medium">{user.email}</span>
                </p>
                {entitled ? (
                  <p className="mt-1 text-muted-foreground">Your plan: Agent Access. The pro tools are included.</p>
                ) : (
                  <p className="mt-1 text-muted-foreground">
                    Your plan: Free. The free tools work now. The pro tools need Agent Access ({PRICE_MONTHLY}/mo,
                    {TRIAL_DAYS}-day trial).{' '}
                    <Link href="/pricing" target="_blank" className="underline">
                      See pricing
                    </Link>
                    .
                  </p>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                After you approve, you return to <span className="font-mono">{summary.redirectHost}</span>.
                {summary.redirectIsLoopback ? ' This client runs on your own computer (localhost).' : ''}
              </p>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => decide('allow')} disabled={busy !== null}>
                  {busy === 'allow' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Allow
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => decide('deny')} disabled={busy !== null}>
                  {busy === 'deny' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Deny
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Paper-traded research data. Educational only. Not investment advice. Your agent reaches its own
            conclusions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
