
import { NextRequest, NextResponse } from 'next/server';
import { sendFeedbackRequestsFlow } from '@/ai/flows/send-feedback-requests';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(request: NextRequest) {
  noStore();

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
    console.log('Cron job triggered: Starting sendFeedbackRequestsFlow...');
    const result = await sendFeedbackRequestsFlow();
    console.log('sendFeedbackRequestsFlow completed successfully.', result);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('An error occurred during the feedback request cron job execution:', error);
    return NextResponse.json({ error: 'Failed to trigger feedback request flow.', details: error.message }, { status: 500 });
  }
}
