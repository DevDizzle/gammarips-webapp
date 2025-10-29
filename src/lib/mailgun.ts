
'use server';

import Mailgun from 'mailgun.js';
import formData from 'form-data';

let mailgun: Mailgun;
let mailgunClient: ReturnType<Mailgun['client']>;

interface EmailOptions {
    to: string[];
    subject: string;
    html: string;
    text: string;
    from?: string; // Make from optional
}

export const sendEmail = async (options: EmailOptions) => {
    const API_KEY = process.env.MAILGUN_API_KEY;
    const DOMAIN = process.env.MAILGUN_DOMAIN;
    // Use the provided 'from' address, or fall back to the environment variable.
    const FROM_EMAIL = options.from || process.env.MAILGUN_FROM_EMAIL;


    if (!API_KEY || !DOMAIN || !FROM_EMAIL) {
        console.error(
          'Mailgun env missing. Need MAILGUN_API_KEY, MAILGUN_DOMAIN, and a FROM_EMAIL source.'
        );
        return {
          ok: false,
          error: 'missing-env',
        };
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
        console.log(`Email sent successfully to ${options.to.join(', ')}`, result);
        return { ok: true };
    } catch (error: any) {
        console.error(
            `Failed to send email to ${options.to.join(', ')}`,
            error?.status,
            error?.details || error
        );
        return {
            ok: false,
            error: 'mailgun-failed',
            status: error?.status,
            details: error?.details,
        };
    }
};
