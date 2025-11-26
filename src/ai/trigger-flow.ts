
'use server';

import { config } from 'dotenv';
config();

import { sendEmail } from '@/lib/mailgun';
import { getWinnersDashboardAdmin, getPerformanceSignalsAdmin, getTopPickAdmin, getGcsFileContentAdmin } from '@/lib/firebase-admin';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- Test for Daily Setups Email ---

function buildDailySetupsEmailContent(winners, topGainers, topLosers) {
    const topBullish = winners.filter(w => w.option_type === 'call').slice(0, 5);
    const topBearish = winners.filter(w => w.option_type === 'put').slice(0, 5);
    const topGainer = topGainers.length > 0 ? topGainers[0] : null;

    const generateSetupTableRows = (setups) => 
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

    const generatePerformanceTableRows = (signals) =>
        signals.map(s => `
             <tr>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.ticker}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #393b4d; color: ${s.percent_gain >= 0 ? '#22c55e' : '#ef4444'}; font-weight: bold;">
                    ${s.percent_gain >= 0 ? '+' : ''}${s.percent_gain.toFixed(2)}%
                </td>
            </tr>
        `).join('');
    
    let textContent = `Today's Top-Rated Options Setups...\n`;

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

async function testSendDailySetups(email: string) {
    console.log('Attempting to send a test "Daily Setups" email...');
    try {
        const [winners, topGainers, topLosers] = await Promise.all([
            getWinnersDashboardAdmin(),
            getPerformanceSignalsAdmin('desc', 5),
            getPerformanceSignalsAdmin('asc', 5)
        ]);

        if (winners.length === 0) {
            console.warn('No winners found, cannot generate test email.');
            return;
        }

        topLosers.sort((a,b) => a.percent_gain - b.percent_gain);
        const { text, html } = buildDailySetupsEmailContent(winners, topGainers, topLosers);

        const result = await sendEmail({
            to: email,
            subject: '[TEST] Daily AI-Powered Market Briefing',
            text,
            html,
        });

        if (result.ok) {
            console.log(`Test "Daily Setups" email sent successfully to ${email}.`);
        } else {
            console.error('Failed to send test "Daily Setups" email:', result.details);
        }
    } catch (error) {
        console.error('An error occurred while sending the test email:', error);
    }
}


// --- Test for Top Pick Email ---

const SummarizeAnalysisInputSchema = z.object({
  analysisText: z.string(),
});
const SummarizeAnalysisOutputSchema = z.object({
  summary: z.string(),
});
const summarizeForEmailPrompt = ai.definePrompt({
    name: 'summarizeAnalysisForEmail',
    input: { schema: SummarizeAnalysisInputSchema },
    output: { schema: SummarizeAnalysisOutputSchema },
    prompt: `You are a financial marketing expert. Summarize the provided analysis into one punchy paragraph for an email. Create FOMO and entice the reader to click a link to see the full report. Focus on exciting catalysts. Use strong, active language.

Full Analysis:
---
{{{analysisText}}}
---

Generate a compelling one-paragraph summary.`,
});

function buildTopPickEmailContent(stock, summary) {
    const dashboardLink = `https://profitscout.app/dashboard/${stock.id}`;
    const textContent = `ProfitScout AI Top Pick of the Day: ${stock.company_name} (${stock.id})...\n${summary}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
    <title>AI Top Pick of the Day: ${stock.id}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #282A3A; font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #282A3A;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1F212E; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Profit<span style="color: #BEFF0A;">Scout</span></h1>
                            <p style="font-size: 16px; color: #A0A0A0; margin-top: 8px;">AI Top Pick of the Day</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                             <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; color: #ffffff; margin: 0; text-align: center;">${stock.company_name} (${stock.id})</h2>
                             <p style="text-align: center; font-size: 14px; color: #A0A0A0; margin-top: 8px;">
                                Our AI has analyzed thousands of data points and identified ${stock.company_name} as today's top-rated setup.
                             </p>

                            <div style="background-color: #282A3A; border: 1px solid #393b4d; border-radius: 8px; padding: 20px; margin-top: 25px;">
                                <h3 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; color: #ffffff; margin: 0 0 10px 0;">AI Summary</h3>
                                <p style="font-size: 16px; line-height: 1.6; margin:0;">${summary}</p>
                            </div>
                            
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 25px;">This is a glimpse of the full picture. View the full AI analysis on the dashboard.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px;">
                            <a href="${dashboardLink}" style="background-color: #BEFF0A; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">View Full Analysis</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: center; font-size: 12px; color: #A0A0A0;">
                            <p style="margin: 0;">This is not financial advice. All trading involves risk.</p>
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


async function testSendTopPick(email: string) {
    console.log('Attempting to send a test "Top Pick" email...');
    try {
        const topPick = await getTopPickAdmin();
        if (!topPick || !topPick.recommendation_analysis) {
            console.warn('No top pick found or top pick is missing analysis path. Cannot send test email.');
            return;
        }

        const analysisText = await getGcsFileContentAdmin(topPick.recommendation_analysis);
        const { output } = await summarizeForEmailPrompt({ analysisText });
        const summary = output?.summary;

        if (!summary) {
            console.error('AI failed to generate a summary. Cannot send test email.');
            return;
        }

        const { text, html } = buildTopPickEmailContent(topPick, summary);
        
        const result = await sendEmail({
            to: email,
            subject: `[TEST] AI Top Pick of the Day: ${topPick.id}`,
            text,
            html,
        });

        if (result.ok) {
            console.log(`Test "Top Pick" email sent successfully to ${email}.`);
        } else {
            console.error('Failed to send test "Top Pick" email:', result.details);
        }
    } catch (error) {
        console.error('An error occurred while sending the test email:', error);
    }
}


// --- Main Execution ---
async function runTests() {
    const testEmail = 'eraphaelparra@gmail.com';
    
    await testSendDailySetups(testEmail);
    console.log('-------------------------');
    await testSendTopPick(testEmail);
    
    process.exit(0);
}

runTests();

    