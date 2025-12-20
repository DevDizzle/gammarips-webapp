
import { NextRequest, NextResponse } from 'next/server';
import { sendTopPickFlow } from '@/ai/flows/send-top-pick';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(request: NextRequest) {
  noStore(); // Ensure this function is always executed a dynamically

  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) {
    if (!cronSecret) {
      console.error('CRON_SECRET is not set in environment variables.');
      return NextResponse.json({ error: 'Internal server configuration error.' }, { status: 500 });
    }

    const isAuthorized = authHeader === `Bearer ${cronSecret}`;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
  }

  try {
    console.log('Cron job triggered: Starting sendTopPickFlow...');
    const result = await sendTopPickFlow();
    console.log('sendTopPickFlow completed successfully.', result);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('An error occurred during the "Top Pick" cron job execution:', error);
    return NextResponse.json({ error: 'Failed to trigger top pick email flow.', details: error.message }, { status: 500 });
  }
}
