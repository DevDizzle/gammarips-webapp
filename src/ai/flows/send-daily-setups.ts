
'use server';

/**
 * @fileOverview A Genkit flow to send daily options setups to subscribed users.
 * This flow is designed to be triggered by a scheduled job (cron).
 *
 * - sendDailySetups - The main flow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getSubscribedUsersAdmin } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/mailgun';
import { config } from 'dotenv';
config();


// This flow doesn't require any input as it fetches all necessary data.
const SendDailySetupsInputSchema = z.object({});
export type SendDailySetupsInput = z.infer<typeof SendDailySetupsInputSchema>;

// The output will be a summary of the operation.
const SendDailySetupsOutputSchema = z.object({
  sentCount: z.number(),
  skippedCount: z.number(),
  totalUsers: z.number(),
});
export type SendDailySetupsOutput = z.infer<typeof SendDailySetupsOutputSchema>;

/**
 * Sends a simple test email.
 */
export async function sendDailySetups(input: SendDailySetupsInput): Promise<SendDailySetupsOutput> {
  return sendDailySetupsFlow(input);
}

const sendDailySetupsFlow = ai.defineFlow(
  {
    name: 'sendDailySetupsFlow',
    inputSchema: SendDailySetupsInputSchema,
    outputSchema: SendDailySetupsOutputSchema,
  },
  async () => {
    console.log('Starting simplified sendDailySetupsFlow to send a test email...');

    const testUser = { email: 'admin@profitscout.app', name: 'Evan Parra' };
    const subject = `Hello ${testUser.name}`;
    const text = `Congratulations ${testUser.name}, you just sent an email with Mailgun! You are truly awesome!`;
    const html = `<strong>${text}</strong>`;
    
    // TEMPORARY: Hardcode the from address for testing to bypass environment variable issues.
    const testFromEmail = "Mailgun Sandbox <postmaster@sandbox050988b0938643568634dc539a857463.mailgun.org>";


    if (!testUser.email) {
      console.error("Test user email is not defined.");
      return { sentCount: 0, skippedCount: 1, totalUsers: 1 };
    }
    
    console.log(`Sending test email to: ${testUser.email}`);
    
    const res = await sendEmail({
      from: testFromEmail, // Pass the hardcoded value here
      to: [`${testUser.name} <${testUser.email}>`],
      subject,
      html,
      text,
    });

    if (res?.ok) {
      console.log("Test email sent successfully.");
      return { sentCount: 1, skippedCount: 0, totalUsers: 1 };
    } else {
      console.error("Failed to send test email.", res?.details);
      return { sentCount: 0, skippedCount: 1, totalUsers: 1 };
    }
  }
);
