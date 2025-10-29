
'use server';

/**
 * @fileOverview A Genkit flow to send daily options setups to subscribed users.
 * This flow is designed to be triggered by a scheduled job (cron).
 *
 * - sendDailySetups - The main flow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
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
    
    // The flow is now responsible for getting and validating all env vars.
    const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL;
    if (!FROM_EMAIL) {
        console.error('CRITICAL: MAILGUN_FROM_EMAIL environment variable is not set.');
        // Return failure without attempting to send.
        return { sentCount: 0, skippedCount: 1, totalUsers: 1 };
    }

    const testUser = { email: 'admin@profitscout.app', name: 'Evan Parra' };
    const subject = `Hello ${testUser.name}`;
    const text = `Congratulations ${testUser.name}, you just sent an email with Mailgun! You are truly awesome!`;
    const html = `<strong>${text}</strong>`;
    
    console.log(`Sending test email to: ${testUser.email}`);
    
    const res = await sendEmail({
      from: FROM_EMAIL, // Pass the validated 'from' address
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
