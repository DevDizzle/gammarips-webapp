
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getEligibleEmailRecipientsAdmin, getWinnersDashboardAdmin, type Winner, getPerformanceSignals as getPerformanceSignalsAdmin, type PerformanceSignal } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailgun';

const SendDailySetupsOutputSchema = z.object({
  sentCount: z.number(),
  skippedCount: z.number(),
  totalUsers: z.number(),
});

export function buildEmailContent(winners: Winner[], topGainers: PerformanceSignal[], topLosers: PerformanceSignal[]): { text: string; html: string } {
    const topBullish = winners.filter(w => w.option_type === 'call').slice(0, 5);
    const topBearish = winners.filter(w => w.option_type === 'put').slice(0, 5);
    const topGainer = topGainers.length > 0 ? topGainers[0] : null;

    const generateSetupTableRows = (setups: Winner[]) => 
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

    const generatePerformanceTableRows = (signals: PerformanceSignal[]) =>
        signals.map(s => `
             <tr>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.ticker}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.company_name}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">$${s.strike_price.toFixed(2)} ${s.option_type?.toUpperCase()}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #393b4d; color: ${s.percent_gain >= 0 ? '#22c55e' : '#ef4444'}; font-weight: bold;">
                    ${s.percent_gain >= 0 ? '+' : ''}${s.percent_gain.toFixed(2)}%
                </td>
            </tr>
        `).join('');
    
    let textContent = `Today's Top-Rated Options Setups\n\nThe market has closed, and our AI has just finished processing the day's fresh data.\n`;

    if (topGainer) {
        textContent = `Yesterday's Top Signal Gained +${topGainer.percent_gain.toFixed(2)}%\n\nOur AI model flagged ${topGainer.ticker} (${topGainer.company_name}) as a top setup, and it returned a ${topGainer.percent_gain.toFixed(2)}% gain. See today's new setups below.\n\n` + textContent;
    }

    textContent += `
Top 5 Bullish Call Setups:
${topBullish.map(s => `${s.ticker} | ${s.company_name} | ${s.option_type.toUpperCase()} | $${s.strike_price.toFixed(2)} | Expires: ${new Date(s.expiration_date).toLocaleDateString()} | ${s.outlook_signal}`).join('\n')}

Top 5 Bearish Put Setups:
${topBearish.map(s => `${s.ticker} | ${s.company_name} | ${s.option_type.toUpperCase()} | $${s.strike_price.toFixed(2)} | Expires: ${new Date(s.expiration_date).toLocaleDateString()} | ${s.outlook_signal}`).join('\n')}

Performance Spotlight:
Top Gainers:
${topGainers.map(s => `${s.ticker} | ${s.company_name} | +${s.percent_gain.toFixed(2)}%`).join('\n')}

Top Losers:
${topLosers.map(s => `${s.ticker} | ${s.company_name} | ${s.percent_gain.toFixed(2)}%`).join('\n')}


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
    <title>Today's Top-Rated Options Setups</title>
</head>
<body style="margin: 0; padding: 0; background-color: #282A3A; font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #282A3A;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1F212E; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Profit<span style="color: #BEFF0A;">Scout</span></h1>
                            <p style="font-size: 16px; color: #A0A0A0; margin-top: 8px;">Today's AI-Powered Market Briefing</p>
                        </td>
                    </tr>
                    ${topGainer ? `
                    <tr>
                        <td style="padding: 0 40px 20px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #BEFF0A1A; border: 1px solid #BEFF0A33; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; color: #ffffff; margin: 0;">Yesterday's Top Signal Gained +${topGainer.percent_gain.toFixed(2)}%</h2>
                                        <p style="font-size: 14px; color: #A0A0A0; margin-top: 8px;">Our AI model flagged ${topGainer.ticker} (${topGainer.company_name}) as a top setup, and it returned a <strong>${topGainer.percent_gain.toFixed(2)}% gain</strong>. See today's new setups below.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 0 40px;">
                            <p style="font-size: 16px; line-height: 1.6;">The market has closed, and our AI has just finished processing the day's fresh data. Here are the top-rated Call and Put setups identified for tomorrow's trading day.</p>
                            
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
                                    ${generateSetupTableRows(topBullish)}
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
                                    ${generateSetupTableRows(topBearish)}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                         <td style="padding: 40px 40px 0;">
                             <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; color: #ffffff; margin-top: 0; margin-bottom: 15px;">Performance Spotlight</h2>
                             <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td width="48%" valign="top">
                                        <h3 style="font-size: 16px; color: #ffffff; margin-bottom: 10px;">Top 5 Recent Gainers</h3>
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0;">
                                            <thead>
                                                 <tr style="color: #A0A0A0; font-size: 12px; text-transform: uppercase;">
                                                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid #393b4d;">Ticker</th>
                                                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #393b4d;">Gain</th>
                                                 </tr>
                                            </thead>
                                            <tbody>${generatePerformanceTableRows(topGainers.slice(0, 5))}</tbody>
                                        </table>
                                    </td>
                                    <td width="4%"></td>
                                    <td width="48%" valign="top">
                                        <h3 style="font-size: 16px; color: #ffffff; margin-bottom: 10px;">Top 5 Recent Losers</h3>
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0;">
                                              <thead>
                                                 <tr style="color: #A0A0A0; font-size: 12px; text-transform: uppercase;">
                                                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid #393b4d;">Ticker</th>
                                                    <th style="padding: 8px; text-align: right; border-bottom: 1px solid #393b4d;">Gain</th>
                                                 </tr>
                                            </thead>
                                            <tbody>${generatePerformanceTableRows(topLosers.slice(0, 5))}</tbody>
                                        </table>
                                    </td>
                                </tr>
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

    const { text, html } = buildEmailContent(winners, topGainers, topLosers);

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
