/**
 * Consent decision. The browser posts {rid, idToken, decision}; we verify the
 * Firebase ID token (no cookie, no ambient authority, so no CSRF surface),
 * consume the pending request atomically, and hand back the redirect URL the
 * page navigates to (window.location, so private-use schemes like cursor://
 * work the same as https).
 */
import { randomUUID } from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/lib/firebase-admin';
import { OAUTH_ISSUER } from '@/lib/oauth/config';
import { errorRedirect } from '@/lib/oauth/errors';
import { allow, clientIp } from '@/lib/oauth/ratelimit';
import { consumePendingRequest, issueCode } from '@/lib/oauth/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!allow(`consent:ip:${ip}`, 30, 60)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  let body: { rid?: unknown; idToken?: unknown; decision?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const rid = typeof body.rid === 'string' ? body.rid : '';
  const idToken = typeof body.idToken === 'string' ? body.idToken : '';
  const decision = body.decision === 'allow' ? 'allow' : body.decision === 'deny' ? 'deny' : null;
  if (!rid || !idToken || !decision) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  let uid: string;
  try {
    // Same verification the key-issuance server actions use (signature +
    // expiry against Google's certs, no revocation round-trip).
    uid = (await getAdminAuth(getAdminApp()).verifyIdToken(idToken)).uid;
  } catch (err) {
    console.warn('oauth consent: id token rejected', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const pending = await consumePendingRequest(rid, decision, uid);
  if (!pending) {
    return NextResponse.json({ error: 'expired' }, { status: 410 });
  }

  if (decision === 'deny') {
    return NextResponse.json(
      { redirect_to: errorRedirect(pending.redirect_uri, 'access_denied', 'The user denied the request.', pending.state) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const code = await issueCode({
    client_id: pending.client_id,
    uid,
    redirect_uri: pending.redirect_uri,
    code_challenge: pending.code_challenge,
    scope: pending.scope,
    resource: pending.resource,
    family_id: randomUUID(),
  });
  const url = new URL(pending.redirect_uri);
  url.searchParams.set('code', code);
  if (pending.state) url.searchParams.set('state', pending.state);
  url.searchParams.set('iss', OAUTH_ISSUER); // RFC 9207
  return NextResponse.json({ redirect_to: url.toString() }, { headers: { 'Cache-Control': 'no-store' } });
}
