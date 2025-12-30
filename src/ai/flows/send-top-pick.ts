
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getEligibleEmailRecipientsAdmin, getTopPickAdmin, getGcsFileContentAdmin, type Stock } from '@/lib/firebase-admin';
import { sendEmail, buildTopPickEmailContent } from '@/lib/mailgun';

const SummarizeAnalysisInputSchema = z.object({
  analysisText: z.string().describe('The full AI analyst briefing text.'),
});

const SummarizeAnalysisOutputSchema = z.object({
  summary: z.string().describe('A compelling, one-paragraph summary of the analysis, suitable for an email. It should grab the reader\'s attention and make them want to learn more.'),
});

export const summarizeForEmailPrompt = ai.definePrompt({
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

export const sendTopPickFlow = ai.defineFlow(
  {
    name: 'sendTopPickFlow',
    inputSchema: z.object({
      testEmail: z.string().email().optional(),
    }).optional(),
    outputSchema: SendTopPickOutputSchema,
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

    // 1. Get the top pick stock
    const topPick = await getTopPickAdmin();

    if (!topPick) {
      console.warn('No top pick found for today. Skipping "Top Pick" email.');
      return { sentCount: 0, skippedCount: eligibleUsers.length, totalUsers: eligibleUsers.length, topPickTicker: null };
    }
    
    // 2. Get the full analysis text
    if (!topPick.recommendation_analysis) {
        console.error(`Top pick ${topPick.id} is missing recommendation_analysis path. Skipping email.`);
        return { sentCount: 0, skippedCount: eligibleUsers.length, totalUsers: eligibleUsers.length, topPickTicker: topPick.id };
    }
    const analysisText = await getGcsFileContentAdmin(topPick.recommendation_analysis);

    // 3. Summarize the analysis with AI
    const { output } = await summarizeForEmailPrompt({ analysisText });
    if (!output?.summary) {
        console.error(`AI failed to generate a summary for ${topPick.id}. Skipping email.`);
        return { sentCount: 0, skippedCount: eligibleUsers.length, totalUsers: eligibleUsers.length, topPickTicker: topPick.id };
    }
    const summary = output.summary;

    // 4. Build the email content
    const { text, html } = await buildTopPickEmailContent(topPick, summary);
    
    // 5. Send the email
    for (const user of eligibleUsers) {
      if (user.email) {
        const result = await sendEmail({
            to: `${user.displayName || user.email} <${user.email}>`,
            subject: `GammaRips AI Top Pick of the Day: ${topPick.id}`,
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
