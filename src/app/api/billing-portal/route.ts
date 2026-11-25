import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp, getOrCreateUserAdmin } from '@/lib/firebase-admin';
import { createStripePortalSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    const user = await getOrCreateUserAdmin(decoded.uid);

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active billing profile found for this account. Email evan@gammarips.com for help.' },
        { status: 404 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_BASE_URL ||
      req.headers.get('origin') ||
      'https://gammarips.com';
    const portalUrl = await createStripePortalSession(
      user.stripeCustomerId,
      `${origin.replace(/\/$/, '')}/account`
    );

    return NextResponse.json({ url: portalUrl });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Could not open billing portal.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
