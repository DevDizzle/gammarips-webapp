'use server';

import Mailgun from 'mailgun.js';
import formData from 'form-data';

let mailgun: Mailgun;
let mailgunClient: ReturnType<Mailgun['client']>;

interface EmailOptions {
    from: string; // 'from' is now required
    to: string[];
    subject: string;
    html: string;
    text: string;
}

export const sendEmail = async (options: EmailOptions) => {
    const API_KEY = process.env.MAILGUN_API_KEY;
    const DOMAIN = process.env.MAILGUN_DOMAIN;
    
    if (!API_KEY || !DOMAIN) {
        console.error(
          'Mailgun server env missing. Need MAILGUN_API_KEY, MAILGUN_DOMAIN.'
        );
        return {
          ok: false,
          error: 'missing-server-env',
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
            from: options.from,
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
