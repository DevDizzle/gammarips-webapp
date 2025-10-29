
'use server';

import Mailgun from 'mailgun.js';
import formData from 'form-data';

let mailgun: Mailgun;
let mailgunClient: ReturnType<Mailgun['client']>;

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text: string;
}

export const sendEmail = async (options: EmailOptions) => {
    // Validate all necessary environment variables *before* use.
    const API_KEY = process.env.MAILGUN_API_KEY;
    const DOMAIN = process.env.MAILGUN_DOMAIN;
    const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL;

    if (!API_KEY || !DOMAIN || !FROM_EMAIL) {
        console.error("Mailgun environment variables are not configured correctly. Check API_KEY, DOMAIN, and FROM_EMAIL.");
        // Do not throw in a batch job, but log a severe error.
        return; 
    }

    if (!mailgun) {
        mailgun = new Mailgun(formData);
        mailgunClient = mailgun.client({
            username: 'api',
            key: API_KEY,
        });
    }

    try {
        const result = await mailgunClient.messages.create(DOMAIN, {
            from: FROM_EMAIL,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });
        console.log(`Email sent successfully to ${options.to}`, result);
        return result;
    } catch (error) {
        console.error(`Failed to send email to ${options.to}`, error);
        // Do not re-throw in a batch job to avoid stopping the entire process
    }
};
