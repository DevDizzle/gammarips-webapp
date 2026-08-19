'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createOAuthMachineClient, listOAuthMachineClients, revokeOAuthMachineClient } from '@/app/actions';

const MCP_PRO_ENDPOINT = 'https://mcp.gammarips.com/pro';
const TOKEN_ENDPOINT = 'https://gammarips.com/oauth/token';

type Row = {
  clientId: string;
  clientName: string;
  status: string;
  createdAtISO: string | null;
  lastUsedAtISO: string | null;
};

/**
 * Machine clients: OAuth client credentials for a headless agent (a VM, a
 * cron, a server). The agent trades the id + secret for a short-lived access
 * token at /oauth/token and sends that token to the MCP. Shown only to
 * entitled users; the server action enforces the same rule.
 */
export function MachineClientsSection() {
  const { user, isPro } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState<{ clientId: string; clientSecret: string } | null>(null);

  const refresh = useCallback(async () => {
    if (!user || !isPro) return;
    try {
      const token = await user.getIdToken();
      setRows(await listOAuthMachineClients(token));
    } catch {
      setRows([]);
    }
  }, [user, isPro]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!user || !isPro) return null;

  const active = (rows || []).filter((r) => r.status === 'active');

  const create = async () => {
    setBusy(true);
    try {
      const token = await user.getIdToken();
      const res = await createOAuthMachineClient(token, name || 'Headless agent');
      setFresh({ clientId: res.clientId, clientSecret: res.clientSecret });
      setName('');
      await refresh();
      toast({ title: 'Machine client created', description: 'Copy the secret now. It is shown once.' });
    } catch (error: any) {
      toast({ title: 'Could not create the client', description: error?.message || 'Try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (clientId: string) => {
    if (!confirm('Revoke this machine client? Any agent that uses it loses access within one hour.')) return;
    setBusy(true);
    try {
      const token = await user.getIdToken();
      await revokeOAuthMachineClient(token, clientId);
      if (fresh?.clientId === clientId) setFresh(null);
      await refresh();
      toast({ title: 'Machine client revoked' });
    } catch (error: any) {
      toast({ title: 'Could not revoke', description: error?.message || 'Try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const mintExample = fresh
    ? `curl -s -u '${fresh.clientId}:${fresh.clientSecret}' \\
  -d grant_type=client_credentials \\
  -d resource=${MCP_PRO_ENDPOINT} \\
  ${TOKEN_ENDPOINT}`
    : `curl -s -u '<client_id>:<client_secret>' \\
  -d grant_type=client_credentials \\
  -d resource=${MCP_PRO_ENDPOINT} \\
  ${TOKEN_ENDPOINT}`;

  return (
    <section className="p-6 rounded-lg border bg-card space-y-4">
      <h2 className="text-xl font-bold">Agent Access: Machine clients (OAuth)</h2>
      <p className="text-muted-foreground">
        For an agent that runs with no browser and no human: a VM, a cron job, a server. The agent
        exchanges a client id and secret for a one-hour access token and sends that token to the MCP.
        Chat clients (Claude, ChatGPT, Cursor) do not need this: they sign in through the OAuth flow on
        their own.
      </p>

      {fresh && (
        <div className="p-4 rounded border border-green-600 bg-green-500/10 space-y-2">
          <p className="text-sm font-semibold text-green-500">
            Copy the secret now. You will not see it again.
          </p>
          <p className="text-xs text-muted-foreground">Client id</p>
          <code className="block p-2 bg-muted rounded text-sm font-mono break-all">{fresh.clientId}</code>
          <p className="text-xs text-muted-foreground">Client secret</p>
          <code className="block p-2 bg-muted rounded text-sm font-mono break-all">{fresh.clientSecret}</code>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => copy(fresh.clientId)}>
              Copy id
            </Button>
            <Button size="sm" variant="outline" onClick={() => copy(fresh.clientSecret)}>
              Copy secret
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rows === null ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </p>
        ) : active.length === 0 ? (
          <p className="text-sm text-muted-foreground">No machine clients yet.</p>
        ) : (
          <ul className="space-y-2">
            {active.map((r) => (
              <li key={r.clientId} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  <span className="font-medium">{r.clientName}</span>{' '}
                  <code className="text-primary">{r.clientId}</code>
                  {r.createdAtISO ? ` · created ${new Date(r.createdAtISO).toLocaleDateString()}` : ''}
                  {r.lastUsedAtISO ? ` · last token ${new Date(r.lastUsedAtISO).toLocaleDateString()}` : ' · never used'}
                </span>
                <Button size="sm" variant="destructive" onClick={() => revoke(r.clientId)} disabled={busy}>
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name, for example: trading VM"
            maxLength={100}
            className="max-w-xs"
          />
          <Button onClick={create} disabled={busy || active.length >= 5}>
            {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create machine client
          </Button>
        </div>
        {active.length >= 5 && (
          <p className="text-xs text-muted-foreground">Limit: 5 active machine clients. Revoke one to add another.</p>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold mb-2">Mint a token, then call the MCP:</p>
        <code className="block p-2 bg-muted rounded text-xs font-mono whitespace-pre-wrap break-all">{mintExample}</code>
        <p className="text-xs text-muted-foreground mt-2">
          The response carries <code>access_token</code> (valid 1 hour). Send it as{' '}
          <code>Authorization: Bearer &lt;access_token&gt;</code> to {MCP_PRO_ENDPOINT}. Mint a new token before
          each run; there is no refresh token for machine clients.
        </p>
      </div>
    </section>
  );
}
