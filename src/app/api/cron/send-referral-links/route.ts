import { NextRequest, NextResponse } from 'next/server';
import { sendReferralLinksFlow } from '@/ai/flows/send-referral-links';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(request: NextRequest) {
  noStore(); // Ensure this function is always executed dynamically

  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET is not set in environment variables.');
    return NextResponse.json({ error: 'Internal server configuration error.' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    console.log('Cron job triggered: Starting sendReferralLinksFlow...');
    const result = await sendReferralLinksFlow();
    console.log('sendReferralLinksFlow completed successfully.', result);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('An error occurred during the referral link cron job execution:', error);
    return NextResponse.json({ error: 'Failed to trigger referral link flow.', details: error.message }, { status: 500 });
  }
}
