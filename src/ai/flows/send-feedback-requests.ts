'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getUsersForFeedbackEmailAdmin } from '@/lib/firebase-admin';
import { sendFeedbackRequestEmail } from '@/lib/mailgun';

const SendFeedbackRequestsOutputSchema = z.object({
  sentCount: z.number(),
  skippedCount: z.number(),
  totalEligibleUsers: z.number(),
});

export const sendFeedbackRequestsFlow = ai.defineFlow(
  {
    name: 'sendFeedbackRequestsFlow',
    inputSchema: z.void(),
    outputSchema: SendFeedbackRequestsOutputSchema,
  },
  async () => {
    let sentCount = 0;
    let skippedCount = 0;

    const eligibleUsers = await getUsersForFeedbackEmailAdmin();
    
    if (eligibleUsers.length === 0) {
        console.log('No users found who signed up 7 days ago. Skipping feedback request emails.');
        return { sentCount: 0, skippedCount: 0, totalEligibleUsers: 0 };
    }

    for (const user of eligibleUsers) {
      if (user.email) {
        const result = await sendFeedbackRequestEmail({
            to: user.email,
            name: user.displayName || user.email.split('@')[0],
        });

        if (result.ok) {
            sentCount++;
        } else {
            console.error(`Failed to send feedback request email to ${user.email}:`, result.details || 'Unknown error');
            skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }
    return { sentCount, skippedCount, totalEligibleUsers: eligibleUsers.length };
  }
);
