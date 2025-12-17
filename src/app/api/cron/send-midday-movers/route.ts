
import { NextRequest, NextResponse } from 'next/server';
import { sendMidDayMoversFlow } from '@/ai/flows/send-midday-movers';
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
    console.log('Cron job triggered: Starting sendMidDayMoversFlow...');
    const result = await sendMidDayMoversFlow();
    console.log('sendMidDayMoversFlow completed successfully.', result);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('An error occurred during the Mid-Day Movers cron job execution:', error);
    return NextResponse.json({ error: 'Failed to trigger Mid-Day Movers email flow.', details: error.message }, { status: 500 });
  }
}
