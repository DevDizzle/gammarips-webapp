import { NextRequest, NextResponse } from 'next/server';
import { createStripeCheckoutSession } from '@/lib/stripe';
import { getAuth } from 'firebase-admin/auth';
// Import something from firebase-admin to trigger initialization
import { getOrCreateUserAdmin } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const { plan } = await req.json();

    let priceId = process.env.NEXT_PUBLIC_STRIPE_OVERNIGHT_EDGE_PRICE_ID; // Default
    if (plan === 'warroom') {
        priceId = process.env.NEXT_PUBLIC_STRIPE_WAR_ROOM_PRICE_ID;
    }

    if (!priceId) {
        console.warn("Stripe Price IDs not set in env, using placeholders");
        priceId = plan === 'warroom' ? 'price_warroom_placeholder' : 'price_edge_placeholder';
    }

    const successUrl = plan === 'warroom' 
      ? `${req.nextUrl.origin}/war-room?session_id={CHECKOUT_SESSION_ID}`
      : `${req.nextUrl.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`;

    const sessionId = await createStripeCheckoutSession(
      uid,
      email,
      priceId,
      successUrl,
      `${req.nextUrl.origin}/pricing`,
      { plan }
    );

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
