
import { NextRequest, NextResponse } from 'next/server';
import { sendFeedbackRequestsFlow } from '@/ai/flows/send-feedback-requests';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(request: NextRequest) {
  noStore();

  const { searchParams } = new URL(request.url);
  const cronKey = searchParams.get('cronKey');

  // Log headers for debugging
  const headerAuth = request.headers.get('X-Cloud-Scheduler');
  console.log('[Cron Debug] Headers:', Object.fromEntries(request.headers));
  console.log('[Cron Debug] Header Auth:', headerAuth);
  console.log('[Cron Debug] Query Key:', cronKey);

  // Allow if Header is present OR if the correct secret key is provided
  const isAuthorized = headerAuth === 'true' || cronKey === 'GammaRipsCron2025';
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment && !isAuthorized) {
    console.warn('[Cron Blocked] Unauthorized access attempt.');
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
