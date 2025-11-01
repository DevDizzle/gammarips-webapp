'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getUsersForReferralEmailAdmin } from '@/lib/firebase-admin';
import { sendReferralEmail } from '@/lib/mailgun';

const SendReferralLinksOutputSchema = z.object({
  sentCount: z.number(),
  skippedCount: z.number(),
  totalEligibleUsers: z.number(),
});

export const sendReferralLinksFlow = ai.defineFlow(
  {
    name: 'sendReferralLinksFlow',
    inputSchema: z.void(),
    outputSchema: SendReferralLinksOutputSchema,
  },
  async () => {
    let sentCount = 0;
    let skippedCount = 0;

    const eligibleUsers = await getUsersForReferralEmailAdmin();
    
    if (eligibleUsers.length === 0) {
        console.log('No users found who signed up 14 days ago. Skipping referral emails.');
        return { sentCount: 0, skippedCount: 0, totalEligibleUsers: 0 };
    }

    for (const user of eligibleUsers) {
      if (user.email) {
        // The user's UID is the referral code
        const referralLink = `https://profitscout.app/?ref=${user.uid}`;
        
        const result = await sendReferralEmail({
            to: user.email,
            name: user.displayName || user.email.split('@')[0],
            referralLink: referralLink,
        });

        if (result.ok) {
            sentCount++;
        } else {
            console.error(`Failed to send referral email to ${user.email}:`, result.details || 'Unknown error');
            skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }
    return { sentCount, skippedCount, totalEligibleUsers: eligibleUsers.length };
  }
);
