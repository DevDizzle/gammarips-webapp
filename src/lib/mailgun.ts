
'use server';

import Mailgun from 'mailgun.js';
import formData from 'form-data';

let mailgun: Mailgun;
let mailgunClient: ReturnType<Mailgun['client']>;

const initializeMailgun = () => {
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        throw new Error('Mailgun API key and domain are not configured in environment variables.');
    }
    
    if (!mailgun) {
        mailgun = new Mailgun(formData);
        mailgunClient = mailgun.client({
            username: 'api',
            key: process.env.MAILGUN_API_KEY,
        });
    }
    
    return mailgunClient;
};

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text: string;
}

export const sendEmail = async (options: EmailOptions) => {
    const client = initializeMailgun();
    const domain = process.env.MAILGUN_DOMAIN!;

    try {
        const result = await client.messages.create(domain, {
            from: `ProfitScout <postmaster@${domain}>`,
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
