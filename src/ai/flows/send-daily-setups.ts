
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getEligibleEmailRecipientsAdmin, getWinnersDashboardAdmin, type Winner, getPerformanceSignals as getPerformanceSignalsAdmin, type PerformanceSignal } from '@/lib/firebase-admin';
import { sendEmail, buildDailySetupsEmailContent } from '@/lib/mailgun';

const SendDailySetupsOutputSchema = z.object({
  sentCount: z.number(),
  skippedCount: z.number(),
  totalUsers: z.number(),
});

export const sendDailySetupsFlow = ai.defineFlow(
  {
    name: 'sendDailySetupsFlow',
    inputSchema: z.void(),
    outputSchema: SendDailySetupsOutputSchema,
  },
  async () => {
    let sentCount = 0;
    let skippedCount = 0;

    const [eligibleUsers, winners, topGainers, topLosers] = await Promise.all([
        getEligibleEmailRecipientsAdmin(),
        getWinnersDashboardAdmin(),
        getPerformanceSignalsAdmin('desc', 5),
        getPerformanceSignalsAdmin('asc', 5)
    ]);
    
    // Sort losers to show most negative first
    topLosers.sort((a,b) => a.percent_gain - b.percent_gain);

    if (winners.length === 0) {
        console.warn('No winners found in the dashboard. Skipping email send for all users.');
        return { sentCount: 0, skippedCount: eligibleUsers.length, totalUsers: eligibleUsers.length };
    }

    const { text, html } = buildDailySetupsEmailContent(winners, topGainers, topLosers);

    for (const user of eligibleUsers) {
      if (user.email) {
        const result = await sendEmail({
            to: `${user.displayName || user.email} <${user.email}>`,
            subject: 'Today\'s AI-Powered Market Briefing',
            text,
            html,
        });

        if (result.ok) {
            sentCount++;
        } else {
            console.error(`Failed to send email to ${user.email}:`, result.details || 'Unknown error');
            skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }
    return { sentCount, skippedCount, totalUsers: eligibleUsers.length };
  }
);
