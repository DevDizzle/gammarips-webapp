
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
    inputSchema: z.object({
      testEmail: z.string().email().optional(),
    }).optional(),
    outputSchema: SendMidDayMoversOutputSchema,
  },
  async (input) => {
    let sentCount = 0;
    let skippedCount = 0;

    let eligibleUsers: any[] = [];
    if (input?.testEmail) {
        eligibleUsers = [{
            uid: 'test-user',
            email: input.testEmail,
            displayName: 'Test User',
            isAnonymous: false,
            isSubscribed: true,
            usageCount: 0,
        }];
        console.log(`Running in TEST mode. Sending email only to ${input.testEmail}`);
    } else {
        eligibleUsers = await getEligibleEmailRecipientsAdmin();
    }

    // 1. Get the top movers from yesterday
    const movers = await getMidDayMoversAdmin();

    if (movers.length === 0) {
      console.warn('No mid-day movers found for yesterday. Skipping email.');
      return { sentCount: 0, skippedCount: eligibleUsers.length, totalUsers: eligibleUsers.length, moversFound: 0 };
    }

    // 2. Build the email content
    const { text, html } = await buildMidDayMoversEmailContent(movers);
    
    // 3. Send the email
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
