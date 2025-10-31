

'use server';

import { Buffer } from 'node:buffer';

// Node 18+ has global fetch. If you're on older Node, install `node-fetch`.
export interface EmailOptions {
  from?: string;           // optional override
  to: string | string[];   // can be single or list
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions) {
  const API_KEY = process.env.MAILGUN_SENDING_KEY;
  const DOMAIN = 'profitscout.app';
  // Hardcode the default from address to the verified domain.
  const DEFAULT_FROM = 'ProfitScout <admin@profitscout.app>';

  const FROM = options.from || DEFAULT_FROM;
  const TO =
    Array.isArray(options.to) ? options.to.join(', ') : options.to;

  if (!API_KEY) {
    console.error(
      '[Mailgun Error] Missing MAILGUN_SENDING_KEY'
    );
    return { ok: false, error: 'missing-env' };
  }

  // Build form-data manually as URL-encoded form
  // NOTE: Mailgun accepts either multipart/form-data or application/x-www-form-urlencoded.
  // We're going to send x-www-form-urlencoded because it's simple and works reliably.
  const form = new URLSearchParams();
  form.append('from', FROM);
  form.append('to', TO);
  form.append('subject', options.subject);
  form.append('text', options.text);
  if (options.html) {
    form.append('html', options.html);
  }

  // Basic auth header: "api:KEY"
  const authHeader =
    'Basic ' + Buffer.from(`api:${API_KEY}`).toString('base64');

  console.log('[Mailgun Debug] DOMAIN=', DOMAIN);
  console.log('[Mailgun Debug] FROM  =', FROM);
  console.log('[Mailgun Debug] TO    =', TO);
  console.log('[Mailgun Debug] SUBJ  =', options.subject);

  const resp = await fetch(
    `https://api.mailgun.net/v3/${DOMAIN}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    }
  );

  if (!resp.ok) {
    // Mailgun returns JSON on errors like:
    // { "message": "'from' parameter is missing" } or
    // { "message": "Domain ... is not allowed to send ..." }
    const details = await resp.json().catch(() => ({}));
    console.error('[Mailgun Failure]', resp.status, details);
    return {
      ok: false,
      status: resp.status,
      details,
    };
  }

  const data = await resp.json().catch(() => ({}));
  console.log('[Mailgun Success]', data);
  return { ok: true, data };
}


function buildWelcomeEmailContent(name: string): { text: string; html: string } {
    const textContent = `
Welcome to ProfitScout, ${name}!

Your 30-day free trial has officially started.

You now have full access to our AI-powered options research dashboard. Here's what you can do right now:

- View today's top-rated Call and Put setups.
- Dive deep into any stock with our AI Analyst Briefings.
- Explore the interactive dashboard to find your next trade idea.

Get started now: https://profitscout.app/dashboard

Happy trading,
The ProfitScout Team
`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
    <title>Welcome to ProfitScout!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #282A3A; font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #282A3A;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1F212E; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Profit<span style="color: #BEFF0A;">Scout</span></h1>
                            <p style="font-size: 18px; color: #A0A0A0; margin-top: 12px;">Welcome, ${name}!</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <p style="font-size: 16px; line-height: 1.6;">Your <strong>30-day free trial</strong> has officially started. You now have full access to our complete suite of AI-powered research tools.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">Here's what you can do right now:</p>
                             <ul style="font-size: 16px; line-height: 1.6; margin-top: 16px; padding-left: 20px; color: #E0E0E0;">
                                <li style="margin-bottom: 10px;">View today's top-rated Call & Put setups.</li>
                                <li style="margin-bottom: 10px;">Dive deep with our AI Analyst Briefings.</li>
                                <li style="margin-bottom: 10px;">Explore the interactive dashboard.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px;">
                            <a href="https://profitscout.app/dashboard" style="background-color: #BEFF0A; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Go to Your Dashboard</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: center; font-size: 12px; color: #A0A0A0;">
                             <p style="margin: 0;">This is not financial advice. All trading involves risk.</p>
                            <p style="margin-top: 4px;">&copy; ${new Date().getFullYear()} ProfitScout. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

    return { text: textContent, html: htmlContent };
}

export async function sendWelcomeEmail({ to, name }: { to: string, name: string }) {
    const { text, html } = buildWelcomeEmailContent(name);
    return sendEmail({
        to: `${name} <${to}>`,
        subject: `Welcome to ProfitScout! Your Free Trial Has Started.`,
        text,
        html,
    });
}

function buildSubscriptionThankYouEmailContent(name: string): { text: string; html: string } {
    const textContent = `
Thank You for Subscribing, ${name}!

Welcome to ProfitScout Pro! We're thrilled to have you as a premium member.

Your support helps us continue to build and improve the tools that power your research. We're committed to providing you with the best AI-driven market insights available.

If you have any questions, feedback, or ideas for how we can improve, please don't hesitate to reach out. You can reply directly to this email or contact us anytime at admin@profitscout.app.

Happy trading,
The ProfitScout Team
`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
    <title>Thank You for Subscribing!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #282A3A; font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #282A3A;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1F212E; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Profit<span style="color: #BEFF0A;">Scout</span></h1>
                            <p style="font-size: 18px; color: #A0A0A0; margin-top: 12px;">Thank You, ${name}!</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <p style="font-size: 16px; line-height: 1.6;">Welcome to <strong>ProfitScout Pro!</strong> We're thrilled to have you as a premium member. Your support helps us continue to build and improve the tools that power your research.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">We are committed to providing you with the best AI-driven market insights available. If you have any questions, feedback, or ideas for new features, please don't hesitate to reach out. You can reply directly to this email or contact support anytime at <a href="mailto:admin@profitscout.app" style="color: #BEFF0A; text-decoration: none;">admin@profitscout.app</a>.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px;">
                            <a href="https://profitscout.app/dashboard" style="background-color: #BEFF0A; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Explore Your Pro Dashboard</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: center; font-size: 12px; color: #A0A0A0;">
                             <p style="margin: 0;">This is not financial advice. All trading involves risk.</p>
                            <p style="margin-top: 4px;">&copy; ${new Date().getFullYear()} ProfitScout. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

    return { text: textContent, html: htmlContent };
}

export async function sendSubscriptionThankYouEmail({ to, name }: { to: string, name: string }) {
    const { text, html } = buildSubscriptionThankYouEmailContent(name);
    return sendEmail({
        to: `${name} <${to}>`,
        subject: `Thank you for subscribing to ProfitScout Pro!`,
        text,
        html,
    });
}

function buildTrialReminderEmailContent(name: string): { text: string; html: string } {
    const textContent = `
Hi ${name},

Your ProfitScout free trial is ending in 5 days.

Don't lose access to the AI-powered tools that help you find your analytical edge. Upgrade to Pro now to keep receiving daily options setups and full access to your interactive dashboard.

Upgrade to Pro: https://profitscout.app/dashboard

If you have any questions, just reply to this email.

Happy trading,
The ProfitScout Team
`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
    <title>Your Trial Ends in 5 Days</title>
</head>
<body style="margin: 0; padding: 0; background-color: #282A3A; font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #282A3A;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1F212E; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Profit<span style="color: #BEFF0A;">Scout</span></h1>
                            <p style="font-size: 18px; color: #A0A0A0; margin-top: 12px;">Your Trial Ends in 5 Days</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">Just a friendly reminder that your free trial of ProfitScout is ending in 5 days. Don't lose access to the AI-powered tools that help you find your analytical edge.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">Upgrade to Pro to keep receiving daily options setups, full AI Analyst Briefings, and unlimited access to your interactive dashboard.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px;">
                            <a href="https://profitscout.app/dashboard" style="background-color: #BEFF0A; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Upgrade to Pro - $19/month</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: center; font-size: 12px; color: #A0A0A0;">
                             <p style="margin: 0;">If you have any questions, just reply to this email. We're happy to help.</p>
                            <p style="margin-top: 4px;">&copy; ${new Date().getFullYear()} ProfitScout. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

    return { text: textContent, html: htmlContent };
}

export async function sendTrialReminderEmail({ to, name }: { to: string, name: string }) {
    const { text, html } = buildTrialReminderEmailContent(name);
    return sendEmail({
        to: `${name} <${to}>`,
        subject: `Your ProfitScout Trial Ends in 5 Days`,
        text,
        html,
    });
}
