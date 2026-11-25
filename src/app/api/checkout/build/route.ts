import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase-admin';
import { createOneTimeCheckoutSession } from '@/lib/stripe';

const BUILD_PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_BUILD_PRICE_ID || 'price_1UfRzR9rAjmDTproqsOge8HY';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestId = String(body.requestId || '').trim().slice(0, 80);
    const email = String(body.email || '').trim().toLowerCase().slice(0, 160);
    const name = String(body.name || '').trim().slice(0, 120);
    const gaClientId = typeof body.gaClientId === 'string' ? body.gaClientId.slice(0, 100) : '';
    const gaSessionId = typeof body.gaSessionId === 'string' ? body.gaSessionId.slice(0, 100) : '';

    if (!requestId || !email) {
      return NextResponse.json(
        { error: 'Missing intake request ID or email.' },
        { status: 400 }
      );
    }

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://gammarips.com';

    const metadata: Record<string, string> = {
      product_type: 'agent_build',
      request_id: requestId,
      customer_name: name,
    };
    if (gaClientId) metadata.ga_client_id = gaClientId;
    if (gaSessionId) metadata.ga_session_id = gaSessionId;
    if (body.attribution && typeof body.attribution === 'object') {
      for (const key of [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'gclid',
        'fbclid',
        'fbc',
        'fbp',
        'rdt_cid',
      ]) {
        const val = (body.attribution as Record<string, unknown>)[key];
        if (typeof val === 'string' && val.trim().length > 0) {
          metadata[key] = val.trim().slice(0, 200);
        }
      }
    }

    const checkout = await createOneTimeCheckoutSession(
      email,
      BUILD_PRICE_ID,
      `${origin}/build?paid=1&request_id=${encodeURIComponent(requestId)}`,
      `${origin}/build?canceled=1&request_id=${encodeURIComponent(requestId)}`,
      metadata
    );

    const db = getFirestore(getAdminApp());
    await db
      .collection('agent_build_requests')
      .doc(requestId)
      .set(
        {
          stripeCheckoutSessionId: checkout.id,
          status: 'checkout_initiated',
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    return NextResponse.json({ sessionId: checkout.id, url: checkout.url });
  } catch (err) {
    console.error('checkout/build: unhandled error', err);
    return NextResponse.json(
      { error: 'Could not start Stripe Checkout. Please try again or email evan@gammarips.com.' },
      { status: 500 }
    );
  }
}
