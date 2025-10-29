
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

function buildEmailContent(winners: Winner[]): { text: string; html: string } {
    const topBullish = winners.filter(w => w.option_type === 'call').slice(0, 5);
    const topBearish = winners.filter(w => w.option_type === 'put').slice(0, 5);

    const generateTableRows = (setups: Winner[]) => 
        setups.map(s => `
            <tr>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.ticker}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.company_name}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.option_type.toUpperCase()}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">$${s.strike_price.toFixed(2)}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${new Date(s.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.outlook_signal}</td>
            </tr>
        `).join('');
    
    const textContent = `
Your Daily Options Setups

Here are the top-rated Call and Put setups for today, based on our AI analysis.

Top 5 Bullish Call Setups:
${topBullish.map(s => `${s.ticker} | ${s.company_name} | ${s.option_type.toUpperCase()} | $${s.strike_price.toFixed(2)} | Expires: ${new Date(s.expiration_date).toLocaleDateString()} | ${s.outlook_signal}`).join('\n')}

Top 5 Bearish Put Setups:
${topBearish.map(s => `${s.ticker} | ${s.company_name} | ${s.option_type.toUpperCase()} | $${s.strike_price.toFixed(2)} | Expires: ${new Date(s.expiration_date).toLocaleDateString()} | ${s.outlook_signal}`).join('\n')}

To see the full list and do your own research, visit your dashboard: https://profitscout.app/dashboard
    `;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
    <title>Your Daily Options Setups</title>
</head>
<body style="margin: 0; padding: 0; background-color: #282A3A; font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #282A3A;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1F212E; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Profit<span style="color: #BEFF0A;">Scout</span></h1>
                            <p style="font-size: 16px; color: #A0A0A0; margin-top: 8px;">Your Daily Options Setups</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <p style="font-size: 16px; line-height: 1.6;">Here are the top-rated Call and Put setups for today, based on our AI analysis.</p>
                            
                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; color: #ffffff; margin-top: 30px; margin-bottom: 15px;">Top 5 Bullish Call Setups</h2>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0;">
                                <thead>
                                    <tr style="color: #A0A0A0; font-size: 12px; text-transform: uppercase;">
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Ticker</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Company</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Type</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Strike</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Expires</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Outlook</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generateTableRows(topBullish)}
                                </tbody>
                            </table>

                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; color: #ffffff; margin-top: 30px; margin-bottom: 15px;">Top 5 Bearish Put Setups</h2>
                             <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0;">
                                <thead>
                                     <tr style="color: #A0A0A0; font-size: 12px; text-transform: uppercase;">
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Ticker</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Company</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Type</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Strike</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Expires</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Outlook</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generateTableRows(topBearish)}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 40px;">
                            <a href="https://profitscout.app/dashboard" style="background-color: #BEFF0A; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">View Full Dashboard</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: center; font-size: 12px; color: #A0A0A0;">
                            <p style="margin: 0;">This is not financial advice. All trading involves risk.</p>
                            <p style="margin-top: 4px;">&copy; ${new Date().getFullYear()} ProfitScout. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return { text: textContent, html: htmlContent };
}


const sendDailySetupsFlow = ai.defineFlow(
  {
    name: 'sendDailySetupsFlow',
    inputSchema: SendDailySetupsInputSchema,
    outputSchema: SendDailySetupsOutputSchema,
  },
  async (input) => {
    let sentCount = 0;
    let skippedCount = 0;

    // Use a test flag to decide logic path
    const isTestRun = process.env.NODE_ENV !== 'production';

    if (isTestRun) {
        console.log('Starting simplified sendDailySetupsFlow to send a test email...');
        const testUserEmail = 'admin@profitscout.app';
        const testUserName = 'Evan Parra';
        const winners = await getWinnersDashboardAdmin();

        if (winners.length > 0) {
            const { text, html } = buildEmailContent(winners);
            console.log(`Sending test email to: ${testUserEmail}`);
            const result = await sendEmail({
                to: `${testUserName} <${testUserEmail}>`,
                subject: `[TEST] Your Daily Options Setups`,
                text,
                html,
            });
            if (result.ok) {
                sentCount++;
            } else {
                 console.error(`Failed to send test email.`, result.details || 'Unknown error');
                 skippedCount++;
            }
        } else {
            console.warn('No winners found in the dashboard, skipping test email.');
            skippedCount++;
        }
        return { sentCount, skippedCount, totalUsers: 1 };
    }

    // Production logic starts here
    const subscribedUsers = await getSubscribedUsersAdmin();
    const winners = await getWinnersDashboardAdmin();

    if (winners.length === 0) {
        console.warn('No winners found in the dashboard. Skipping email send for all users.');
        return { sentCount: 0, skippedCount: subscribedUsers.length, totalUsers: subscribedUsers.length };
    }

    const { text, html } = buildEmailContent(winners);

    for (const user of subscribedUsers) {
      if (user.email) {
        const result = await sendEmail({
            to: `${user.displayName || user.email} <${user.email}>`,
            subject: 'Your Daily Options Setups',
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
    return { sentCount, skippedCount, totalUsers: subscribedUsers.length };
  }
);

export async function sendDailySetups(input: z.infer<typeof SendDailySetupsInputSchema>): Promise<z.infer<typeof SendDailySetupsOutputSchema>> {
    return sendDailySetupsFlow(input);
}
