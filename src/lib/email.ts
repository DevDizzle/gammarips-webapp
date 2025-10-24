
'use server';

import Mailgun from 'mailgun.js';
import formData from 'form-data';
import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';
import { Winner } from './firebase-admin';

// Initialize Mailgun client
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY!,
});

const domain = process.env.MAILGUN_DOMAIN!;
const fromEmail = process.env.MAILGUN_FROM_EMAIL!;

// Helper to convert GCS URI to public URL
const convertGcsUriToUrl = (gcsUri: string) => {
    if (!gcsUri?.startsWith('gs://')) return '';
    const withoutScheme = gcsUri.slice('gs://'.length);
    const slash = withoutScheme.indexOf('/');
    const bucket = slash === -1 ? withoutScheme : withoutScheme.slice(0, slash);
    const object = slash === -1 ? '' : withoutScheme.slice(slash + 1);
    const encodedObject = object.split('/').map(encodeURIComponent).join('/');
    return `https://storage.googleapis.com/${bucket}/${encodedObject}`;
};

// Helper function to compile template and send email
async function sendEmail(to: string, subject: string, templateName: string, data: object) {
    try {
        // Read and compile the Handlebars template
        const templatePath = path.resolve(process.cwd(), 'src', 'lib', 'email-templates', `${templateName}.hbs`);
        const templateSource = await fs.readFile(templatePath, 'utf-8');
        const template = Handlebars.compile(templateSource);
        const html = template(data);

        const messageData = {
            from: fromEmail,
            to,
            subject,
            html,
        };
        
        console.log(`Sending email to ${to} with subject "${subject}"`);
        const response = await mg.messages.create(domain, messageData);
        console.log('Email sent successfully:', response);
        return response;

    } catch (error: any) {
        console.error('Error sending email:', error);
        // Mailgun often provides useful info in the error body
        if (error.response) {
            console.error('Mailgun error body:', error.response.body);
        }
        throw new Error('Failed to send email.');
    }
}

// Specific function for sending the winners email
export async function sendWinnersEmail(to: string, winners: Winner[]) {
    const top5Winners = winners.slice(0, 5);

    const templateData = {
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        winners: top5Winners.map(winner => ({
            ...winner,
            outlookPositive: winner.outlook_signal.toLowerCase().includes('bullish'),
            last_close_formatted: winner.last_close.toFixed(2),
            logoUrl: winner.image_uri 
                ? convertGcsUriToUrl(winner.image_uri) 
                : `https://placehold.co/48x48/1e293b/a855f7?text=${winner.ticker[0]}`,
            dashboardUrl: `https://profitscout.app/dashboard/${winner.ticker.toUpperCase()}`
        })),
        hasWinners: top5Winners.length > 0,
    };

    return sendEmail(
        to,
        `🏆 Your Top 5 Daily Setups from ProfitScout`,
        'winners',
        templateData
    );
}

