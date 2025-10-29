
'use server';

/**
 * @fileOverview A Genkit flow to send daily options setups to subscribed users.
 * This flow is designed to be triggered by a scheduled job (cron).
 *
 * - sendDailySetups - The main flow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getSubscribedUsersAdmin, getWinnersDashboardAdmin, type Winner } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailgun';

// This flow doesn't require any input as it fetches all necessary data.
const SendDailySetupsInputSchema = z.object({});
export type SendDailySetupsInput = z.infer<typeof SendDailySetupsInputSchema>;

// The output will be a summary of the operation.
const SendDailySetupsOutputSchema = z.object({
  sentCount: z.number(),
  skippedCount: z.number(),
  totalUsers: z.number(),
});
export type SendDailySetupsOutput = z.infer<typeof SendDailySetupsOutputSchema>;

/**
 * Fetches top call/put setups and emails them to all subscribed users.
 */
export async function sendDailySetups(input: SendDailySetupsInput): Promise<SendDailySetupsOutput> {
  return sendDailySetupsFlow(input);
}

const sendDailySetupsFlow = ai.defineFlow(
  {
    name: 'sendDailySetupsFlow',
    inputSchema: SendDailySetupsInputSchema,
    outputSchema: SendDailySetupsOutputSchema,
  },
  async () => {
    console.log('Starting sendDailySetupsFlow in TEST MODE...');

    // 1. Use a hardcoded user for testing instead of fetching all subscribed users.
    const users = [{ email: 'admin@profitscout.app', isSubscribed: true, uid: 'test-user' }];
    console.log(`Sending test email to: ${users[0].email}`);

    // 2. Fetch top setups from the winners_dashboard
    const allWinners = await getWinnersDashboardAdmin();
    
    const getTopSetups = (winners: Winner[], type: 'call' | 'put', count: number) => {
        return winners
            .filter(w => w.option_type.toLowerCase() === type)
            .sort((a, b) => (b.weighted_score ?? -1) - (a.weighted_score ?? -1))
            .slice(0, count);
    };

    const topCalls = getTopSetups(allWinners, 'call', 5);
    const topPuts = getTopSetups(allWinners, 'put', 5);

    if (topCalls.length === 0 && topPuts.length === 0) {
        console.warn("No top Call or Put setups found in winners_dashboard. No emails will be sent.");
        return { sentCount: 0, skippedCount: users.length, totalUsers: users.length };
    }

    // 3. Construct the email content
    const { html, text } = buildEmailContent(topCalls, topPuts);
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const subject = `ProfitScout: Top Setups for ${today}`;

    // 4. Send email to each user
    let sentCount = 0;
    for (const user of users) {
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject,
          html,
          text,
        });
        sentCount++;
      }
    }

    console.log(`Finished sending emails. Sent: ${sentCount}, Skipped: ${users.length - sentCount}`);

    return {
      sentCount,
      skippedCount: users.length - sentCount,
      totalUsers: users.length,
    };
  }
);


// Helper to build email HTML and text
function buildEmailContent(topCalls: Winner[], topPuts: Winner[]): { html: string, text: string } {
    const header = `
        <h1>ProfitScout Daily Setups</h1>
        <p>Here are your top-rated Call and Put setups for today. For full analysis, visit your dashboard.</p>
    `;

    const footer = `
        <br>
        <p><a href="https://profitscout.app/dashboard">Go to your Dashboard</a></p>
        <br>
        <p><small>Disclaimer: This is for informational purposes only and is not investment advice. All investments involve risk.</small></p>
        <p><small>To unsubscribe, please manage your subscription in your account settings.</small></p>
    `;

    const formatSetup = (setup: Winner) => {
        const expiration = new Date(setup.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
        return `<li><strong>${setup.ticker}</strong>: ${setup.company_name} - $${setup.strike_price.toFixed(2)} ${setup.option_type.toUpperCase()} (Expires ${expiration})</li>`;
    };
    
    const formatSetupText = (setup: Winner) => {
        const expiration = new Date(setup.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
        return `- ${setup.ticker}: ${setup.company_name} - $${setup.strike_price.toFixed(2)} ${setup.option_type.toUpperCase()} (Expires ${expiration})`;
    };

    let html = header;
    let text = "ProfitScout Daily Setups\n\n";

    if (topCalls.length > 0) {
        html += '<h2>Top 5 Call Setups</h2><ul>';
        text += 'Top 5 Call Setups:\n';
        topCalls.forEach(call => {
            html += formatSetup(call);
            text += formatSetupText(call) + '\n';
        });
        html += '</ul>';
        text += '\n';
    }

    if (topPuts.length > 0) {
        html += '<h2>Top 5 Put Setups</h2><ul>';
        text += 'Top 5 Put Setups:\n';
        topPuts.forEach(put => {
            html += formatSetup(put);
            text += formatSetupText(put) + '\n';
        });
        html += '</ul>';
        text += '\n';
    }

    html += footer;
    text += "Go to your Dashboard: https://profitscout.app/dashboard\n";

    return { html, text };
}
