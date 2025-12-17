
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getEligibleEmailRecipientsAdmin, getMidDayMoversAdmin } from '@/lib/firebase-admin';
import { sendEmail, buildMidDayMoversEmailContent } from '@/lib/mailgun';

const SendMidDayMoversOutputSchema = z.object({
  sentCount: z.number(),
  skippedCount: z.number(),
  totalUsers: z.number(),
  moversFound: z.number(),
});

export const sendMidDayMoversFlow = ai.defineFlow(
  {
    name: 'sendMidDayMoversFlow',
    inputSchema: z.void(),
    outputSchema: SendMidDayMoversOutputSchema,
  },
  async () => {
    let sentCount = 0;
    let skippedCount = 0;

    // 1. Get the top movers from yesterday
    const movers = await getMidDayMoversAdmin();

    if (movers.length === 0) {
      console.warn('No mid-day movers found for yesterday. Skipping email.');
      const allUsers = await getEligibleEmailRecipientsAdmin();
      return { sentCount: 0, skippedCount: allUsers.length, totalUsers: allUsers.length, moversFound: 0 };
    }

    // 2. Build the email content
    const { text, html } = await buildMidDayMoversEmailContent(movers);
    
    // 3. Get all eligible users and send the email
    const eligibleUsers = await getEligibleEmailRecipientsAdmin();
    
    for (const user of eligibleUsers) {
      if (user.email) {
        const result = await sendEmail({
            to: `${user.displayName || user.email} <${user.email}>`,
            subject: `GammaRips Mid-Day Movers: See What's Ripping`,
            text,
            html,
        });

        if (result.ok) {
            sentCount++;
        } else {
            console.error(`Failed to send mid-day movers email to ${user.email}:`, result.details || 'Unknown error');
            skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }
    return { sentCount, skippedCount, totalUsers: eligibleUsers.length, moversFound: movers.length };
  }
);
