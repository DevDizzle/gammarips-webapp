
'use server';

import { config } from 'dotenv';
config();

import { 
    sendEmail,
    buildWelcomeEmailContent,
    buildFeedbackRequestEmailContent,
    buildFeedbackAcknowledgmentEmailContent,
    buildDailySetupsEmailContent,
    buildTopPickEmailContent,
    buildMidDayMoversEmailContent
} from '@/lib/mailgun';
import { 
    getWinnersDashboardAdmin, 
    getPerformanceSignals as getPerformanceSignalsAdmin, 
    getTopPickAdmin, 
    getGcsFileContentAdmin, 
    getMidDayMoversAdmin,
    type Stock, 
    type Winner, 
    type PerformanceSignal 
} from '@/lib/firebase-admin';
import { summarizeForEmailPrompt } from '@/ai/flows/send-top-pick';

const TEST_EMAIL = 'eraphaelparra@gmail.com';
const TEST_NAME = 'Test User';

async function testSendWelcomeEmail() {
    console.log('Testing: Welcome Email');
    const { text, html } = await buildWelcomeEmailContent(TEST_NAME);
    const result = await sendEmail({
        to: TEST_EMAIL,
        subject: '[TEST] Welcome to GammaRips. Here is your daily routine.',
        text,
        html,
    });
    console.log('Result:', result.ok ? 'Success' : `Failed (${result.status})`);
}

async function testSendFeedbackRequestEmail() {
    console.log('Testing: Feedback Request Email');
    const { text, html } = await buildFeedbackRequestEmailContent(TEST_NAME);
    const result = await sendEmail({
        to: TEST_EMAIL,
        subject: "[TEST] One week in. How is the data?",
        text,
        html,
    });
    console.log('Result:', result.ok ? 'Success' : `Failed (${result.status})`);
}

async function testSendFeedbackAcknowledgmentEmail() {
    console.log('Testing: Feedback Acknowledgment Email');
    const trackingId = `PS-TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { text, html } = await buildFeedbackAcknowledgmentEmailContent(trackingId);
    const result = await sendEmail({
        to: TEST_EMAIL,
        subject: `[TEST] We've received your message (Ref: ${trackingId})`,
        text,
        html,
    });
    console.log('Result:', result.ok ? 'Success' : `Failed (${result.status})`);
}

async function testSendDailySetups() {
    console.log('Testing: Daily Setups Email');
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

        topLosers.sort((a,b) => a.percent_gain - b.percent_gain);

        const { text, html } = await buildDailySetupsEmailContent(winners, topGainers, topLosers);
        const result = await sendEmail({
            to: TEST_EMAIL,
            subject: '[TEST] The Daily Playbook: Tomorrow’s contracts are ready.',
            text,
            html,
        });
        console.log('Result:', result.ok ? 'Success' : `Failed (${result.status})`);
    } catch (error) {
        console.error('An error occurred while sending the test "Daily Setups" email:', error);
    }
}

async function testSendTopPick() {
    console.log('Testing: Top Pick Email');
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

        const { text, html } = await buildTopPickEmailContent(topPick, summary);
        
        const result = await sendEmail({
            to: TEST_EMAIL,
            subject: `[TEST] GammaRips AI Top Pick of the Day: ${topPick.id}`,
            text,
            html,
        });
        console.log('Result:', result.ok ? 'Success' : `Failed (${result.status})`);
    } catch (error) {
        console.error('An error occurred while sending the test "Top Pick" email:', error);
    }
}

async function testSendMidDayMovers() {
    console.log('Testing: Mid-Day Movers Email');
    try {
        const movers = await getMidDayMoversAdmin();
        if (movers.length === 0) {
            console.warn('No mid-day movers found for yesterday. Cannot generate a realistic test email.');
            return;
        }
        
        const { text, html } = await buildMidDayMoversEmailContent(movers);
        const result = await sendEmail({
            to: TEST_EMAIL,
            subject: "[TEST] GammaRips Mid-Day Movers: See What's Ripping",
            text,
            html,
        });
        console.log('Result:', result.ok ? 'Success' : `Failed (${result.status})`);
    } catch (error) {
        console.error('An error occurred while sending the test "Mid-Day Movers" email:', error);
    }
}

async function runAllEmailTests() {
    const allTests = [
        testSendWelcomeEmail,
        testSendFeedbackRequestEmail,
        testSendFeedbackAcknowledgmentEmail,
        testSendDailySetups,
        testSendTopPick,
        testSendMidDayMovers,
    ];

    for (const test of allTests) {
        await test();
        console.log('-------------------------');
        // Wait 1 second between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('All email tests completed.');
    process.exit(0);
}

// To run all tests, uncomment the line below and comment out the single test line.
// runAllEmailTests();

// To run a single test, call it directly.
testSendMidDayMovers();
