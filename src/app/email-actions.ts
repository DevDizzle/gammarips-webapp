'use server';

import { headers } from 'next/headers';
import { addEmailSubscriber, unsubscribeEmailAdmin } from '@/lib/firebase-admin';
import { sendServerAdConversions } from '@/lib/ad-conversions';

export async function subscribeEmail(
  email: string,
  attribution?: Record<string, string>,
  eventId?: string
): Promise<{ success: boolean; error?: string }> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email address.' };
  }
  const result = await addEmailSubscriber(email, attribution);
  if (result.success) {
    const reqHeaders = await headers();
    const clientIpAddress =
      reqHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;
    const clientUserAgent = reqHeaders.get('user-agent') || undefined;
    await sendServerAdConversions({
      eventName: 'Lead',
      eventId: eventId || `email_${Date.now()}`,
      eventSourceUrl: 'https://gammarips.com',
      email,
      value: 0,
      currency: 'USD',
      contentName: 'newsletter_signup',
      fbc: attribution?.fbc,
      fbp: attribution?.fbp,
      rdtCid: attribution?.rdt_cid,
      clientIpAddress,
      clientUserAgent,
    });
  }
  return result;
}

export async function unsubscribeEmail(email: string): Promise<{ success: boolean }> {
  return await unsubscribeEmailAdmin(email);
}
