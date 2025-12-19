
import { NextRequest, NextResponse } from 'next/server';
import { sendDailySetupsFlow } from '@/ai/flows/send-daily-setups';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(request: NextRequest) {
  noStore(); // Ensure this function is always executed dynamically

  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) {
    if (!cronSecret) {
      console.error('CRON_SECRET is not set in environment variables.');
      return NextResponse.json({ error: 'Internal server configuration error.' }, { status: 500 });
    }

    const isScheduler = request.headers.get('x-cloud-scheduler') === 'true';
    const isAuthorized = authHeader === `Bearer ${cronSecret}`;

    if (!isScheduler && !isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
  }

  try {
    console.log('Cron job triggered: Starting sendDailySetupsFlow...');
    const result = await sendDailySetupsFlow();
    console.log('sendDailySetupsFlow completed successfully.', result);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('An error occurred during the cron job execution:', error);
    return NextResponse.json({ error: 'Failed to trigger email flow.', details: error.message }, { status: 500 });
  }
}
