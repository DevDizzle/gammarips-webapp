import type { Metadata } from 'next';
import Link from 'next/link';
import { getPendingRequest } from '@/lib/oauth/store';
import { isLoopbackHost } from '@/lib/oauth/redirect';
import { ConsentClient, type ConsentSummary } from './consent-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Connect your agent | GammaRips',
  robots: { index: false, follow: false },
};

function describeRedirect(redirectUri: string): { host: string; loopback: boolean } {
  try {
    const u = new URL(redirectUri);
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      return { host: u.host, loopback: isLoopbackHost(u.hostname) };
    }
    // Private-use scheme (cursor://, vscode://): show the scheme as the destination.
    return { host: `${u.protocol}//${u.host}`, loopback: false };
  } catch {
    return { host: redirectUri, loopback: false };
  }
}

function describeClientOrigin(clientId: string): string | null {
  if (!clientId.startsWith('https://')) return null;
  try {
    return new URL(clientId).host;
  } catch {
    return null;
  }
}

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ rid?: string }>;
}) {
  const { rid } = await searchParams;
  const pending = rid ? await getPendingRequest(rid) : null;

  if (!pending) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16">
        <h1 className="text-2xl font-bold">This connection request has expired</h1>
        <p className="mt-4 text-muted-foreground">
          Authorization requests are valid for 10 minutes and can be used once. Go back to your agent and
          start the connection again.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Setup help is on the <Link href="/developers" className="underline">developers page</Link>.
        </p>
      </div>
    );
  }

  const redirect = describeRedirect(pending.redirect_uri);
  const summary: ConsentSummary = {
    rid: pending.rid,
    clientName: pending.client_name,
    clientOrigin: describeClientOrigin(pending.client_id),
    redirectHost: redirect.host,
    redirectIsLoopback: redirect.loopback,
    scope: pending.scope,
  };
  return <ConsentClient summary={summary} />;
}
