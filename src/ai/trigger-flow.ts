
'use server';

import { config } from 'dotenv';
config();

import { sendEmail } from '@/lib/mailgun';
import { getWinnersDashboardAdmin, getPerformanceSignalsAdmin, getTopPickAdmin, getGcsFileContentAdmin, type Winner, type PerformanceSignal, type Stock } from '@/lib/firebase-admin';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- Test for Daily Setups Email ---

// Import the actual email builder function from the flow
import { buildEmailContent as buildDailySetupsEmailContent } from '@/ai/flows/send-daily-setups';


async function testSendDailySetups(email: string) {
    console.log('Attempting to send a test "Daily Setups" email...');
    try {
        const [winners, topGainers, topLosers] = await Promise.all([
            getWinnersDashboardAdmin(),
            getPerformanceSignalsAdmin('desc', 5),
            getPerformanceSignalsAdmin('asc', 5)
        ]);

        if (winners.length === 0) {
            console.warn('No winners found in the dashboard. Cannot generate a realistic test email.');
            return;
        }

        // Ensure losers are sorted correctly
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
        console.error('An error occurred while sending the test "Daily Setups" email:', error);
    }
}


// --- Test for Top Pick Email ---

// Import the actual email builder and summarizer from the flow
import { buildTopPickEmailContent, summarizeForEmailPrompt } from '@/ai/flows/send-top-pick';


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
        console.error('An error occurred while sending the test "Top Pick" email:', error);
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
