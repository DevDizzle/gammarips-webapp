import { NextRequest, NextResponse } from 'next/server';
import { createStripeCheckoutSession } from '@/lib/stripe';
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth(getAdminApp()).verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const priceId =
      process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ||
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    if (!priceId) {
      console.error('No Stripe price ID configured (NEXT_PUBLIC_STRIPE_PRICE_ID)');
      return NextResponse.json(
        { error: 'Checkout is not configured yet. Please try again shortly.' },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const gaClientId =
      typeof body?.gaClientId === 'string' ? body.gaClientId : undefined;

    const successUrl = `${req.nextUrl.origin}/account?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${req.nextUrl.origin}/pricing`;

    const metadata: Record<string, string> = { plan: 'pro' };
    if (gaClientId) metadata.ga_client_id = gaClientId;

    const sessionId = await createStripeCheckoutSession(
      uid,
      email,
      priceId,
      successUrl,
      cancelUrl,
      metadata,
      { trialPeriodDays: 7 }
    );

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
