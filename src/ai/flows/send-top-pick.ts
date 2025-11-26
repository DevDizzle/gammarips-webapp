
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getEligibleEmailRecipientsAdmin, getTopPickAdmin, getGcsFileContentAdmin, type Stock } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailgun';

const SummarizeAnalysisInputSchema = z.object({
  analysisText: z.string().describe('The full AI analyst briefing text.'),
});

const SummarizeAnalysisOutputSchema = z.object({
  summary: z.string().describe('A compelling, one-paragraph summary of the analysis, suitable for an email. It should grab the reader\'s attention and make them want to learn more.'),
});

const summarizeForEmailPrompt = ai.definePrompt({
    name: 'summarizeAnalysisForEmail',
    input: { schema: SummarizeAnalysisInputSchema },
    output: { schema: SummarizeAnalysisOutputSchema },
    prompt: `You are a financial marketing expert. Your task is to summarize the provided stock analysis into a single, punchy paragraph for an email. The goal is to create FOMO and entice the reader to click a link to see the full report.

Focus on the most exciting bullish or bearish catalysts. Use strong, active language. Do not be vague.

Full Analysis:
---
{{{analysisText}}}
---

Generate a compelling one-paragraph summary.`,
});


const SendTopPickOutputSchema = z.object({
  sentCount: z.number(),
  skippedCount: z.number(),
  totalUsers: z.number(),
  topPickTicker: z.string().nullable(),
});

function buildTopPickEmailContent(stock: Stock, summary: string): { text: string; html: string } {
    const dashboardLink = `https://profitscout.app/dashboard/${stock.id}`;
    
    const textContent = `
ProfitScout AI Top Pick of the Day: ${stock.company_name} (${stock.id})

Our AI has analyzed thousands of data points and identified ${stock.company_name} (${stock.id}) as today's top-rated setup based on our proprietary scoring model.

AI Summary:
${summary}

This is just a glimpse of the full picture. To see the complete step-by-step AI analysis, key metrics, and the specific options contract our model flagged, view the full dashboard.

View the Full Analysis: ${dashboardLink}

Happy trading,
The ProfitScout Team
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
                                Our AI has analyzed thousands of data points and identified ${stock.company_name} as today's top-rated setup based on our proprietary scoring model.
                             </p>

                            <div style="background-color: #282A3A; border: 1px solid #393b4d; border-radius: 8px; padding: 20px; margin-top: 25px;">
                                <h3 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; color: #ffffff; margin: 0 0 10px 0;">AI Summary</h3>
                                <p style="font-size: 16px; line-height: 1.6; margin:0;">${summary}</p>
                            </div>
                            
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 25px;">This is just a glimpse of the full picture. To see the complete step-by-step AI analysis, key metrics, and the specific options contract our model flagged, view the full dashboard.</p>
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


export const sendTopPickFlow = ai.defineFlow(
  {
    name: 'sendTopPickFlow',
    inputSchema: z.void(),
    outputSchema: SendTopPickOutputSchema,
  },
  async () => {
    let sentCount = 0;
    let skippedCount = 0;

    // 1. Get the top pick stock
    const topPick = await getTopPickAdmin();

    if (!topPick) {
      console.warn('No top pick found for today. Skipping "Top Pick" email.');
      const allUsers = await getEligibleEmailRecipientsAdmin();
      return { sentCount: 0, skippedCount: allUsers.length, totalUsers: allUsers.length, topPickTicker: null };
    }
    
    // 2. Get the full analysis text
    if (!topPick.recommendation_analysis) {
        console.error(`Top pick ${topPick.id} is missing recommendation_analysis path. Skipping email.`);
        const allUsers = await getEligibleEmailRecipientsAdmin();
        return { sentCount: 0, skippedCount: allUsers.length, totalUsers: allUsers.length, topPickTicker: topPick.id };
    }
    const analysisText = await getGcsFileContentAdmin(topPick.recommendation_analysis);

    // 3. Summarize the analysis with AI
    const { output } = await summarizeForEmailPrompt({ analysisText });
    if (!output?.summary) {
        console.error(`AI failed to generate a summary for ${topPick.id}. Skipping email.`);
        const allUsers = await getEligibleEmailRecipientsAdmin();
        return { sentCount: 0, skippedCount: allUsers.length, totalUsers: allUsers.length, topPickTicker: topPick.id };
    }
    const summary = output.summary;

    // 4. Build the email content
    const { text, html } = buildTopPickEmailContent(topPick, summary);
    
    // 5. Get all users and send the email
    const eligibleUsers = await getEligibleEmailRecipientsAdmin();
    
    for (const user of eligibleUsers) {
      if (user.email) {
        const result = await sendEmail({
            to: `${user.displayName || user.email} <${user.email}>`,
            subject: `ProfitScout AI Top Pick of the Day: ${topPick.id}`,
            text,
            html,
        });

        if (result.ok) {
            sentCount++;
        } else {
            console.error(`Failed to send top pick email to ${user.email}:`, result.details || 'Unknown error');
            skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }
    return { sentCount, skippedCount, totalUsers: eligibleUsers.length, topPickTicker: topPick.id };
  }
);
