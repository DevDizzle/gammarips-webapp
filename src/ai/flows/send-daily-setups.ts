
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getSubscribedUsersAdmin, getWinnersDashboard, type DbUser, type Winner } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailgun';

const SendDailySetupsInputSchema = z.object({});
const SendDailySetupsOutputSchema = z.object({
  sentCount: z.number(),
  skippedCount: z.number(),
  totalUsers: z.number(),
});

export async function sendDailySetups(_: z.infer<typeof SendDailySetupsInputSchema>) {
  return sendDailySetupsFlow({});
}

// --- Helper Functions ---

/**
 * Builds the HTML and plain text content for the daily email.
 */
const buildEmailContent = (winners: Winner[]): { html: string; text: string } => {
  const topCalls = winners.filter(w => w.option_type === 'call').slice(0, 5);
  const topPuts = winners.filter(w => w.option_type === 'put').slice(0, 5);

  const formatSetupHtml = (w: Winner) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #333;">${w.ticker}</td>
      <td style="padding: 8px; border-bottom: 1px solid #333;">${w.company_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #333;">${w.option_type.toUpperCase()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #333;">$${w.strike_price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #333;">${new Date(w.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
      <td style="padding: 8px; border-bottom: 1px solid #333;">${w.outlook_signal}</td>
    </tr>
  `;

  const formatSetupText = (w: Winner) => 
    `${w.ticker} | ${w.company_name} | ${w.option_type.toUpperCase()} @ $${w.strike_price.toFixed(2)} | Expires: ${new Date(w.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC' })} | Outlook: ${w.outlook_signal}`;

  const html = `
    <h1>Your Daily Options Setups</h1>
    <p>Here are the top-rated Call and Put setups for today, based on our AI analysis.</p>
    
    <h2>Top 5 Bullish Call Setups</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <thead><tr><th>Ticker</th><th>Company</th><th>Type</th><th>Strike</th><th>Expires</th><th>Outlook</th></tr></thead>
      <tbody>${topCalls.map(formatSetupHtml).join('')}</tbody>
    </table>

    <h2>Top 5 Bearish Put Setups</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <thead><tr><th>Ticker</th><th>Company</th><th>Type</th><th>Strike</th><th>Expires</th><th>Outlook</th></tr></thead>
      <tbody>${topPuts.map(formatSetupHtml).join('')}</tbody>
    </table>
    
    <p>To see the full list and do your own research, visit your <a href="https://profitscout.app/dashboard">dashboard</a>.</p>
  `;

  const text = `
Your Daily Options Setups
Here are the top-rated Call and Put setups for today.

Top 5 Bullish Call Setups:
${topCalls.map(formatSetupText).join('\n')}

Top 5 Bearish Put Setups:
${topPuts.map(formatSetupText).join('\n')}

View all setups and do your own research on your dashboard: https://profitscout.app/dashboard
  `;

  return { html, text };
};


const sendDailySetupsFlow = ai.defineFlow(
  {
    name: 'sendDailySetupsFlow',
    inputSchema: SendDailySetupsInputSchema,
    outputSchema: SendDailySetupsOutputSchema,
  },
  async () => {
    // Determine if we're in a test environment
    const isTestMode = process.env.NODE_ENV !== 'production';

    // Fetch necessary data
    const allWinners = await getWinnersDashboard();
    if (allWinners.length === 0) {
      console.log('No winners found in the dashboard. Skipping email send.');
      return { sentCount: 0, skippedCount: 0, totalUsers: 0 };
    }

    const { html, text } = buildEmailContent(allWinners);
    const subject = `ProfitScout Daily Setups for ${new Date().toLocaleDateString('en-US', { timeZone: 'UTC' })}`;

    let users: DbUser[];
    if (isTestMode) {
      console.log('Starting sendDailySetupsFlow in TEST MODE...');
      const testEmail = process.env.TEST_RECIPIENT_EMAIL;
      if (!testEmail) {
        console.error('TEST_RECIPIENT_EMAIL environment variable is not set. Aborting test send.');
        return { sentCount: 0, skippedCount: 1, totalUsers: 1 };
      }
      users = [{ 
        uid: 'test-user', 
        email: testEmail, 
        displayName: process.env.TEST_RECIPIENT_NAME || 'Test User',
        isAnonymous: false,
        isSubscribed: true,
        usageCount: 0,
      }];
    } else {
      console.log('Starting sendDailySetupsFlow in PRODUCTION MODE...');
      users = await getSubscribedUsersAdmin();
    }
    
    if (users.length === 0) {
      console.log('No users to send emails to.');
      return { sentCount: 0, skippedCount: 0, totalUsers: 0 };
    }

    let sentCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      if (!user.email) {
        console.log(`Skipping user ${user.uid} due to missing email.`);
        skippedCount++;
        continue;
      }

      const userName = user.displayName || 'Trader';
      const userTo = `${userName} <${user.email}>`;
      
      console.log(`Sending email to: ${user.email}`);

      const res = await sendEmail({
        to: userTo,
        subject,
        html,
        text,
      });

      if (res.ok) {
        sentCount++;
      } else {
        skippedCount++;
        // Log the failure but continue the loop
        console.error(`Failed to send email to ${user.email}`, res.details || '');
      }
    }

    console.log(`Finished sending emails. Sent: ${sentCount}, Skipped: ${skippedCount}`);

    return {
      sentCount,
      skippedCount,
      totalUsers: users.length,
    };
  }
);
