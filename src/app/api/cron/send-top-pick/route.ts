
import { NextRequest, NextResponse } from 'next/server';
import { sendTopPickFlow } from '@/ai/flows/send-top-pick';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(request: NextRequest) {
  noStore(); // Ensure this function is always executed a dynamically

  const { searchParams } = new URL(request.url);
  const cronKey = searchParams.get('cronKey');
  const testEmail = searchParams.get('testEmail') || undefined;

  const headerAuth = request.headers.get('X-Cloud-Scheduler');
  const isAuthorized = headerAuth === 'true' || cronKey === 'GammaRipsCron2025';
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment && !isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    console.log('Cron job triggered: Starting sendTopPickFlow...', { testEmail });
    const result = await sendTopPickFlow({ testEmail });
    console.log('sendTopPickFlow completed successfully.', result);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('An error occurred during the "Top Pick" cron job execution:', error);
    return NextResponse.json({ error: 'Failed to trigger top pick email flow.', details: error.message }, { status: 500 });
  }
}
