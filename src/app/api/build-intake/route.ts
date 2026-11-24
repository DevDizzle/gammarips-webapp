import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase-admin';
import { sendBuildIntakeEmails } from '@/lib/mailgun';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim().slice(0, 120);
    const email = String(body.email || '').trim().toLowerCase().slice(0, 160);
    const assetClasses: string[] = Array.isArray(body.assetClasses)
      ? body.assetClasses.map((v: unknown) => String(v).trim().slice(0, 40)).filter(Boolean).slice(0, 6)
      : [];
    const dataSource = String(body.dataSource || '').trim().slice(0, 100);
    const brokerTarget = String(body.brokerTarget || '').trim().slice(0, 100);
    const hostingTarget = String(body.hostingTarget || '').trim().slice(0, 100);
    const rulesSummary = String(body.rulesSummary || '').trim().slice(0, 6000);
    const complianceAccepted = body.complianceAccepted === true;
    const fastTrackCheckout = body.fastTrackCheckout === true;
    const attribution =
      body.attribution && typeof body.attribution === 'object'
        ? Object.fromEntries(
            Object.entries(body.attribution as Record<string, unknown>)
              .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
              .map(([k, v]) => [k.slice(0, 40), String(v).slice(0, 200)])
          )
        : {};

    if (!name || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid name and email address.' },
        { status: 400 }
      );
    }
    if (assetClasses.length === 0 || !dataSource || !brokerTarget || !hostingTarget) {
      return NextResponse.json(
        { error: 'Please select your target asset class, data feed, broker, and hosting setup.' },
        { status: 400 }
      );
    }
    if (rulesSummary.length < 20) {
      return NextResponse.json(
        { error: 'Please write at least a brief summary of your entry, exit, and sizing rules.' },
        { status: 400 }
      );
    }
    if (!complianceAccepted) {
      return NextResponse.json(
        { error: 'Please accept the non-advisory software engineering scope agreement.' },
        { status: 400 }
      );
    }

    const db = getFirestore(getAdminApp());
    const docRef = db.collection('agent_build_requests').doc();
    const requestId = docRef.id;

    await docRef.set({
      requestId,
      name,
      email,
      assetClasses,
      dataSource,
      brokerTarget,
      hostingTarget,
      rulesSummary,
      complianceAccepted: true,
      complianceAcceptedAt: FieldValue.serverTimestamp(),
      fastTrackCheckout,
      status: fastTrackCheckout ? 'checkout_initiated' : 'scope_check_requested',
      attribution,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await sendBuildIntakeEmails({
      requestId,
      name,
      email,
      assetClasses,
      dataSource,
      brokerTarget,
      hostingTarget,
      rulesSummary,
      fastTrackCheckout,
    }).catch((err) => {
      console.error('build-intake: failed to send notification email', err);
    });

    return NextResponse.json({ ok: true, requestId });
  } catch (err) {
    console.error('build-intake: unhandled error', err);
    return NextResponse.json(
      { error: 'Could not submit your spec right now. Please email evan@gammarips.com.' },
      { status: 500 }
    );
  }
}
