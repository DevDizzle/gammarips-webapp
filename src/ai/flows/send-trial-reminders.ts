'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getUsersForTrialReminderAdmin } from '@/lib/firebase-admin';
import { sendTrialReminderEmail } from '@/lib/mailgun';

const SendTrialRemindersOutputSchema = z.object({
  sentCount: z.number(),
  skippedCount: z.number(),
  totalEligibleUsers: z.number(),
});

export const sendTrialRemindersFlow = ai.defineFlow(
  {
    name: 'sendTrialRemindersFlow',
    inputSchema: z.void(),
    outputSchema: SendTrialRemindersOutputSchema,
  },
  async () => {
    let sentCount = 0;
    let skippedCount = 0;

    const eligibleUsers = await getUsersForTrialReminderAdmin();
    
    if (eligibleUsers.length === 0) {
        console.log('No users found with trials ending in 5 days. Skipping reminder emails.');
        return { sentCount: 0, skippedCount: 0, totalEligibleUsers: 0 };
    }

    for (const user of eligibleUsers) {
      if (user.email) {
        const result = await sendTrialReminderEmail({
            to: user.email,
            name: user.displayName || user.email.split('@')[0],
        });

        if (result.ok) {
            sentCount++;
        } else {
            console.error(`Failed to send trial reminder email to ${user.email}:`, result.details || 'Unknown error');
            skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }
    return { sentCount, skippedCount, totalEligibleUsers: eligibleUsers.length };
  }
);
