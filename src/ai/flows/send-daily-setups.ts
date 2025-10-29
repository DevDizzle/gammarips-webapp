
'use server';

/**
 * @fileOverview A Genkit flow to send daily options setups to subscribed users.
 * This flow is designed to be triggered by a scheduled job (cron).
 *
 * - sendDailySetups - The main flow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { config } from 'dotenv';
config();

import Mailgun from 'mailgun.js';
import formData from 'form-data';


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
    const API_KEY = process.env.MAILGUN_API_KEY;
    const DOMAIN = process.env.MAILGUN_DOMAIN;
    const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL;

    if (!API_KEY || !DOMAIN || !FROM_EMAIL) {
      console.error(
        'CRITICAL: Mailgun environment variables are not configured. Check MAILGUN_API_KEY, MAILGUN_DOMAIN, and MAILGUN_FROM_EMAIL.'
      );
      // Return failure without attempting to send.
      return { sentCount: 0, skippedCount: 1, totalUsers: 1 };
    }

    const testUser = { email: 'admin@profitscout.app', name: 'Evan Parra' };
    const subject = `Hello ${testUser.name}`;
    const text = `Congratulations ${testUser.name}, you just sent an email with Mailgun! You are truly awesome!`;
    
    console.log(`Sending test email to: ${testUser.email}`);

    try {
        const mailgun = new Mailgun(formData);
        const mg = mailgun.client({ username: 'api', key: API_KEY });

        const data = {
            from: FROM_EMAIL,
            to: [`${testUser.name} <${testUser.email}>`],
            subject: subject,
            text: text,
            html: `<strong>${text}</strong>`
        };

        const result = await mg.messages.create(DOMAIN, data);
        console.log("Test email sent successfully.", result);
        return { sentCount: 1, skippedCount: 0, totalUsers: 1 };

    } catch (error: any) {
        console.error("Failed to send test email.", error?.status, error?.details || error);
        return { sentCount: 0, skippedCount: 1, totalUsers: 1 };
    }
  }
);
