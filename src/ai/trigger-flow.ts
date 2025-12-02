
'use server';

import { config } from 'dotenv';
config();

import { 
    sendEmail,
    buildWelcomeEmailContent,
    buildSubscriptionThankYouEmailContent,
    buildTrialReminderEmailContent,
    buildReferralEmailContent,
    buildFeedbackRequestEmailContent,
    buildFeedbackAcknowledgmentEmailContent,
    buildAgentResponseEmailContent,
    buildDailySetupsEmailContent,
    buildTopPickEmailContent
} from '@/lib/mailgun';
import { 
    getWinnersDashboardAdmin, 
    getPerformanceSignals as getPerformanceSignalsAdmin, 
    getTopPickAdmin, 
    getGcsFileContentAdmin, 
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
        subject: '[TEST] Welcome to GammaRips!',
        text,
        html,
    });
    console.log('Result:', result.ok ? 'Success' : `Failed (${result.status})`);
}

async function testSendSubscriptionThankYouEmail() {
    console.log('Testing: Subscription Thank You Email');
    const { text, html } = await buildSubscriptionThankYouEmailContent(TEST_NAME);
    const result = await sendEmail({
        to: TEST_EMAIL,
        subject: '[TEST] Thank You for Subscribing!',
        text,
        html,
    });
    console.log('Result:', result.ok ? 'Success' : `Failed (${result.status})`);
}

async function testSendTrialReminderEmail() {
    console.log('Testing: Trial Reminder Email');
    const { text, html } = await buildTrialReminderEmailContent(TEST_NAME);
    const result = await sendEmail({
        to: TEST_EMAIL,
        subject: '[TEST] Your GammaRips Access Requires Subscription',
        text,
        html,
    });
    console.log('Result:', result.ok ? 'Success' : `Failed (${result.status})`);
}

async function testSendReferralEmail() {
    console.log('Testing: Referral Email');
    const referralLink = 'https://gammarips.com/?ref=TESTUSER123';
    const { text, html } = await buildReferralEmailContent(TEST_NAME, referralLink);
    const result = await sendEmail({
        to: TEST_EMAIL,
        subject: '[TEST] Share the edge: Give your friends 45 days of GammaRips',
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
        subject: "[TEST] A personal check-in from GammaRips's founder",
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
            subject: '[TEST] Daily AI-Powered Market Briefing',
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

async function runAllEmailTests() {
    const allTests = [
        testSendWelcomeEmail,
        testSendSubscriptionThankYouEmail,
        testSendTrialReminderEmail,
        testSendReferralEmail,
        testSendFeedbackRequestEmail,
        testSendFeedbackAcknowledgmentEmail,
        testSendDailySetups,
        testSendTopPick,
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

runAllEmailTests();
