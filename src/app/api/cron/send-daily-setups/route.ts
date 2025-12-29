
import { NextRequest, NextResponse } from 'next/server';
import { sendDailySetupsFlow } from '@/ai/flows/send-daily-setups';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(request: NextRequest) {
  noStore(); // Ensure this function is always executed dynamically

  const { searchParams } = new URL(request.url);
  const cronKey = searchParams.get('cronKey');
  const testEmail = searchParams.get('testEmail') || undefined;

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
    console.log('Cron job triggered: Starting sendDailySetupsFlow...', { testEmail });
    const result = await sendDailySetupsFlow({ testEmail });
    console.log('sendDailySetupsFlow completed successfully.', result);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('An error occurred during the cron job execution:', error);
    return NextResponse.json({ error: 'Failed to trigger email flow.', details: error.message }, { status: 500 });
  }
}
