'use server';

import { addEmailSubscriber, unsubscribeEmailAdmin } from '@/lib/firebase-admin';

export async function subscribeEmail(email: string): Promise<{ success: boolean; error?: string }> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email address.' };
  }
  return await addEmailSubscriber(email);
}

export async function unsubscribeEmail(email: string): Promise<{ success: boolean }> {
  return await unsubscribeEmailAdmin(email);
}
