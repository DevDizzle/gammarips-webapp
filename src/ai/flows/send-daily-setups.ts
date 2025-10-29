
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getSubscribedUsersAdmin, getWinnersDashboardAdmin, type DbUser, type Winner } from '@/lib/firebase-admin';
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
      <td style="padding: 12px 15px; border-bottom: 1px solid #4A4C5A;">${w.ticker}</td>
      <td style="padding: 12px 15px; border-bottom: 1px solid #4A4C5A;">${w.company_name}</td>
      <td style="padding: 12px 15px; border-bottom: 1px solid #4A4C5A;">${w.option_type.toUpperCase()}</td>
      <td style="padding: 12px 15px; border-bottom: 1px solid #4A4C5A;">$${w.strike_price.toFixed(2)}</td>
      <td style="padding: 12px 15px; border-bottom: 1px solid #4A4C5A;">${new Date(w.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</td>
      <td style="padding: 12px 15px; border-bottom: 1px solid #4A4C5A;">${w.outlook_signal}</td>
    </tr>
  `;

  const formatSetupText = (w: Winner) => 
    `${w.ticker} | ${w.company_name} | ${w.option_type.toUpperCase()} @ $${w.strike_price.toFixed(2)} | Expires: ${new Date(w.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC' })} | Outlook: ${w.outlook_signal}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Plus+Jakarta+Sans:wght@800&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #282A3A;
          color: #E5E7EB;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
        }
        .header h1 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 36px;
          font-weight: 800;
          margin: 0;
        }
        .header .logo-profit { color: #FFFFFF; }
        .header .logo-scout { color: #BEFF0A; }
        .content {
          background-color: #1F212E;
          border-radius: 8px;
          padding: 30px;
        }
        h2 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #FFFFFF;
          border-bottom: 1px solid #4A4C5A;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          color: #E5E7EB;
        }
        th {
          text-align: left;
          padding: 12px 15px;
          color: #9CA3AF;
          font-weight: normal;
          text-transform: uppercase;
          font-size: 12px;
        }
        .cta-button {
          display: inline-block;
          background-color: #BEFF0A;
          color: #1F212E;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-weight: bold;
          margin: 30px 0;
          font-family: 'Inter', sans-serif;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #9CA3AF;
        }
        .footer a {
          color: #BEFF0A;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1><span class="logo-profit">Profit</span><span class="logo-scout">Scout</span></h1>
        </div>
        <div class="content">
          <h2>Your Daily Options Setups</h2>
          <p>Here are the top-rated Call and Put setups for today, based on our AI analysis. For a deeper dive, visit your interactive dashboard.</p>
          
          <h3>Top 5 Bullish Call Setups</h3>
          <table>
            <thead><tr><th>Ticker</th><th>Company</th><th>Type</th><th>Strike</th><th>Expires</th><th>Outlook</th></tr></thead>
            <tbody>${topCalls.map(formatSetupHtml).join('')}</tbody>
          </table>

          <h3 style="margin-top: 30px;">Top 5 Bearish Put Setups</h3>
          <table>
            <thead><tr><th>Ticker</th><th>Company</th><th>Type</th><th>Strike</th><th>Expires</th><th>Outlook</th></tr></thead>
            <tbody>${topPuts.map(formatSetupHtml).join('')}</tbody>
          </table>
          
          <div style="text-align: center;">
            <a href="https://profitscout.app/dashboard" class="cta-button">View Full Dashboard</a>
          </div>
          
          <p style="font-size: 12px; color: #9CA3AF;">These signals are for informational purposes only and are not investment advice. Always conduct your own research before making any trade.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ProfitScout. All Rights Reserved.</p>
          <p>
            <a href="https://profitscout.app/terms">Terms of Service</a> | <a href="https://profitscout.app/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Your Daily Options Setups
Here are the top-rated Call and Put setups for today.

Top 5 Bullish Call Setups:
${topCalls.map(formatSetupText).join('\n')}

Top 5 Bearish Put Setups:
${topPuts.map(formatSetupText).join('\n')}

View all setups and do your own research on your dashboard: https://profitscout.app/dashboard

Disclaimer: This is not financial advice. All investments involve risk.
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
    const API_KEY = process.env.MAILGUN_API_KEY;
    const DOMAIN = process.env.MAILGUN_DOMAIN;
    const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL;

    if (!API_KEY || !DOMAIN || !FROM_EMAIL) {
        console.error('Mailgun environment variables are missing.');
        throw new Error('Mailgun environment variables are not configured.');
    }
    
    // Determine if we're in a test environment
    const isTestMode = process.env.NODE_ENV !== 'production';

    // Fetch necessary data
    const allWinners = await getWinnersDashboardAdmin();
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
        from: FROM_EMAIL,
        to: [userTo],
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
