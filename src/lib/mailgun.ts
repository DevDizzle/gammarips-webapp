
'use server';

import { Buffer } from 'node:buffer';
import type { Winner, PerformanceSignal, Stock } from '@/lib/firebase-admin';


// Node 18+ has global fetch. If you're on older Node, install `node-fetch`.
export interface EmailOptions {
  from?: string;           // optional override
  to: string | string[];   // can be single or list
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions) {
  const API_KEY = process.env.MAILGUN_SENDING_KEY;
  const DOMAIN = 'profitscout.app'; // Reverted to original domain
  // Use GammaRips as sender name but profitscout.app as domain
  const DEFAULT_FROM = 'GammaRips <admin@profitscout.app>'; 

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
   if (options.replyTo) {
    form.append('h:Reply-To', options.replyTo);
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


export async function buildWelcomeEmailContent(name: string): Promise<{ text: string; html: string }> {
    const textContent = `
Welcome to GammaRips, ${name}.

You stopped guessing. You started hunting.

You now have access to the one simple options playbook. No more scanning 500 tickers or chasing random noise. You have the high-gamma filter.

Your Daily Routine Starts Now:

1. Grab Today’s Contracts
Log in to the dashboard to see the tight list of specific Call & Put setups our AI flagged for today. Look for the "Strongly Bullish" or "Bearish" tags.

2. Read the "Why"
Don't trade blindly. Click any card to read the AI Breakdown. Understand why the gamma profile, catalysts, and technicals align before you pull the trigger.

3. Run Your Plan
We provide the setups; you manage the trade. Decide your entry, size, and risk.

The market is moving. Go see what’s primed to rip.

Unlock Today’s Contracts: https://profitscout.app/dashboard

The GammaRips Team
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
    <title>Your daily contracts are ready.</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 800; color: #ffffff; margin: 0;">You stopped guessing. You started hunting.</h1>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">Welcome to GammaRips, ${name}.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">You now have access to the one simple options playbook. No more scanning 500 tickers or chasing random noise. You have the high-gamma filter.</p>
                            
                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; color: #ffffff; margin-top: 32px; margin-bottom: 20px; border-top: 1px solid #393b4d; padding-top: 32px;">Your Daily Routine Starts Now:</h2>
                            
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td width="40" valign="top" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 700; color: hsl(74, 80%, 50%);">1.</td>
                                    <td valign="top">
                                        <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Grab Today’s Contracts</h3>
                                        <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #A0A0A0;">Log in to the dashboard to see the tight list of specific Call & Put setups our AI flagged. Look for "Strongly Bullish" or "Bearish" tags.</p>
                                    </td>
                                </tr>
                                <tr><td height="24"></td></tr>
                                <tr>
                                    <td width="40" valign="top" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 700; color: hsl(74, 80%, 50%);">2.</td>
                                    <td valign="top">
                                        <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Read the "Why"</h3>
                                        <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #A0A0A0;">Don't trade blindly. Click any card to read the AI Breakdown. Understand why the gamma profile and catalysts align.</p>
                                    </td>
                                </tr>
                                <tr><td height="24"></td></tr>
                                 <tr>
                                    <td width="40" valign="top" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 700; color: hsl(74, 80%, 50%);">3.</td>
                                    <td valign="top">
                                        <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Run Your Plan</h3>
                                        <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #A0A0A0;">We provide the setups; you manage the trade. Decide your entry, size, and risk.</p>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 16px; line-height: 1.6; margin-top: 32px; text-align: center;">The market is moving. Go see what’s primed to rip.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px 40px 40px;">
                            <a href="https://profitscout.app/dashboard" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Unlock Today’s Contracts</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: center; font-size: 12px; color: #A0A0A0;">
                             <p style="margin: 0;">This is not financial advice. All trading involves risk.</p>
                            <p style="margin-top: 4px;">&copy; ${new Date().getFullYear()} GammaRips. All rights reserved.</p>
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
    const { text, html } = await buildWelcomeEmailContent(name);
    return sendEmail({
        to: `${name} <${to}>`,
        subject: `Your daily contracts are ready.`,
        text,
        html,
    });
}

export async function buildFeedbackRequestEmailContent(name: string): Promise<{ text: string; html: string }> {
    const textContent = `I'm Evan Parra, the founder of GammaRips.

You've been using the tool for about a week now, and I wanted to personally check in. As an early user, your perspective is incredibly valuable for shaping what we build next.

I would be grateful if you could take 60 seconds to share your initial thoughts. Your feedback goes directly to our product team (and me) to help us improve.

Share Your Feedback: https://profitscout.app/feedback

All the best,
Evan P.
Founder, GammaRips
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
    <title>A personal check-in from GammaRips's founder</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">I'm Evan Parra, the founder of GammaRips.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">You've been using the tool for about a week now, and I wanted to personally check in. As an early user, your perspective is incredibly valuable for shaping what we build next.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">I would be grateful if you could take 60 seconds to share your initial thoughts. Your feedback goes directly to our product team (and me) to help us improve.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px;">
                            <a href="https://profitscout.app/feedback" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Share Your Feedback</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: left; font-size: 14px; color: #A0A0A0;">
                            <p style="margin: 0;">All the best,</p>
                            <p style="margin-top: 4px;">Evan P.<br>Founder, GammaRips</p>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 20px; text-align: center; font-size: 12px; color: #A0A0A0; border-top: 1px solid #393b4d; padding-top: 20px;">
                             <p style="margin: 0;">&copy; 2025 GammaRips. All rights reserved.</p>
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


export async function sendFeedbackRequestEmail({ to, name }: { to: string, name: string }) {
    const { text, html } = await buildFeedbackRequestEmailContent(name);
    return sendEmail({
        from: 'GammaRips <admin@profitscout.app>', // Reverted
        to: `${name} <${to}>`,
        subject: `A personal check-in from GammaRips's founder`,
        text,
        html,
    });
}

export async function buildFeedbackAcknowledgmentEmailContent(trackingId: string): Promise<{ text: string; html: string }> {
    const textContent = `
Thank you for contacting GammaRips!

We've received your message and will get back to you as soon as possible.

Your reference ID is: ${trackingId}

Best,
The GammaRips Team
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
    <title>We've Received Your Feedback</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; color: #ffffff; margin-top: 0;">Message Received</h2>
                            <p style="font-size: 16px; line-height: 1.6;">Thank you for contacting us! We've received your message and our team will review it shortly. We appreciate you taking the time to reach out.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">For your records, your reference ID is:</p>
                             <div style="background-color: #282A3A; border: 1px solid #393b4d; border-radius: 8px; padding: 12px; text-align: center; margin-top: 8px;">
                                <p style="font-family: monospace; font-size: 18px; color: hsl(74, 80%, 50%); margin: 0;">${trackingId}</p>
                            </div>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 40px 40px 40px; text-align: left; font-size: 14px; color: #A0A0A0;">
                            <p style="margin: 0;">Best regards,</p>
                            <p style="margin-top: 4px;">The GammaRips Team</p>
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

export async function sendFeedbackAcknowledgmentEmail({ to, trackingId }: { to: string, trackingId: string }) {
    const { text, html } = await buildFeedbackAcknowledgmentEmailContent(trackingId);
    return sendEmail({
        to,
        subject: `We've received your message (Ref: ${trackingId})`,
        text,
        html,
    });
}


export async function buildAgentResponseEmailContent({ userEmail, response, trackingId }: { userEmail: string, response: string, trackingId: string }): Promise<{ text: string; html: string }> {
    const textContent = `
Hello,

Here is the response regarding your inquiry (Ref: ${trackingId}):

${response}

If you have any further questions, please reply to this email.

Best,
The GammaRips Team
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
    <title>Response to your inquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; color: #ffffff; margin-top: 0;">Response to Your Inquiry (Ref: ${trackingId})</h2>
                            <div style="font-size: 16px; line-height: 1.6; color: #E0E0E0; border-left: 2px solid #393b4d; padding-left: 15px; margin-top: 20px;">
                                ${response.replace(/\n/g, '<br>')}
                            </div>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">If you have any further questions, please feel free to reply directly to this email.</p>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 40px 40px 40px; text-align: left; font-size: 14px; color: #A0A0A0;">
                            <p style="margin: 0;">Best regards,</p>
                            <p style="margin-top: 4px;">The GammaRips Team</p>
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


export async function sendAgentResponseEmail({ to, response, trackingId }: { to: string, response: string, trackingId: string }) {
    const { text, html } = await buildAgentResponseEmailContent({ userEmail: to, response, trackingId });
    const MY_EMAIL = process.env.MY_PERSONAL_EMAIL;

    if (!MY_EMAIL) {
        console.error('[Mailgun Error] Missing MY_PERSONAL_EMAIL for Reply-To');
        // Proceed without Reply-To if not set, but log error
    }

    return sendEmail({
        to,
        subject: `Re: Your GammaRips Inquiry (Ref: ${trackingId})`,
        text,
        html,
        replyTo: MY_EMAIL,
    });
}


export async function buildDailySetupsEmailContent(winners: Winner[], topGainers: PerformanceSignal[], topLosers: PerformanceSignal[]): Promise<{ text: string; html: string }> {
    const topBullish = winners.filter(w => w.option_type === 'call').slice(0, 5);
    const topBearish = winners.filter(w => w.option_type === 'put').slice(0, 5);

    const generateSetupTableRows = (setups: Winner[]) => 
        setups.map(s => `
            <tr>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.ticker}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.company_name}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.option_type.toUpperCase()}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">$${s.strike_price.toFixed(2)}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${new Date(s.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.outlook_signal}</td>
            </tr>
        `).join('');

    const generatePerformanceTableRows = (signals: PerformanceSignal[]) =>
        signals.map(s => `
             <tr>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.ticker}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.company_name}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">$${s.strike_price.toFixed(2)} ${s.option_type?.toUpperCase()}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #393b4d; color: ${s.percent_gain >= 0 ? '#22c55e' : '#ef4444'}; font-weight: bold;">
                    ${s.percent_gain >= 0 ? '+' : ''}${s.percent_gain.toFixed(2)}%
                </td>
            </tr>
        `).join('');
    
    let textContent = `Top Trade Ideas for Today\n\nThe market has closed, and our AI has just finished processing the day's fresh data.\n`;

    textContent += `
Top Recent Gainers:
${topGainers.map(s => `${s.ticker} | ${s.company_name} | +${s.percent_gain.toFixed(2)}%`).join('\n')}

Top 5 Bullish Call Setups:
${topBullish.map(s => `${s.ticker} | ${s.company_name} | ${s.option_type.toUpperCase()} | $${s.strike_price.toFixed(2)} | Expires: ${new Date(s.expiration_date).toLocaleDateString()} | ${s.outlook_signal}`).join('\n')}

Top 5 Bearish Put Setups:
${topBearish.map(s => `${s.ticker} | ${s.company_name} | ${s.option_type.toUpperCase()} | $${s.strike_price.toFixed(2)} | Expires: ${new Date(s.expiration_date).toLocaleDateString()} | ${s.outlook_signal}`).join('\n')}

To see the full list and do your own research, visit your dashboard: https://profitscout.app/dashboard
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
    <title>Top Trade Ideas for Today</title>
</head>
<body style="margin: 0; padding: 0; background-color: #282A3A; font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #282A3A;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1F212E; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Gamma<span style="color: #BEFF0A;">Rips</span></h1>
                            <p style="font-size: 16px; color: #A0A0A0; margin-top: 8px;">Top Trade Ideas for Today</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <p style="font-size: 16px; line-height: 1.6;">The market has closed. Our AI has processed the day's data to find tomorrow's potential rips. Do your research tonight to get your trade ideas locked in before the opening bell.</p>
                            
                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; color: #ffffff; margin-top: 30px; margin-bottom: 15px;">Top Recent Gainers</h2>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0;">
                                <thead>
                                     <tr style="color: #A0A0A0; font-size: 12px; text-transform: uppercase;">
                                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #393b4d;">Ticker</th>
                                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #393b4d;">Company</th>
                                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #393b4d;">Gain</th>
                                     </tr>
                                </thead>
                                <tbody>${generatePerformanceTableRows(topGainers)}</tbody>
                            </table>
                            
                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; color: #ffffff; margin-top: 30px; margin-bottom: 15px;">Top 5 Bullish Call Setups</h2>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0;">
                                <thead>
                                    <tr style="color: #A0A0A0; font-size: 12px; text-transform: uppercase;">
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Ticker</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Company</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Type</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Strike</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Expires</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Outlook</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generateSetupTableRows(topBullish)}
                                </tbody>
                            </table>

                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; color: #ffffff; margin-top: 30px; margin-bottom: 15px;">Top 5 Bearish Put Setups</h2>
                             <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0;">
                                <thead>
                                     <tr style="color: #A0A0A0; font-size: 12px; text-transform: uppercase;">
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Ticker</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Company</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Type</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Strike</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Expires</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Outlook</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generateSetupTableRows(topBearish)}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 40px;">
                            <a href="https://profitscout.app/dashboard" style="background-color: #BEFF0A; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">View Full Dashboard</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: center; font-size: 12px; color: #A0A0A0;">
                            <p style="margin: 0;">This is not financial advice. All trading involves risk.</p>
                            <p style="margin-top: 4px;">&copy; ${new Date().getFullYear()} GammaRips. All rights reserved.</p>
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


export async function buildTopPickEmailContent(stock: Stock, summary: string): Promise<{ text: string; html: string }> {
    const dashboardLink = `https://profitscout.app/dashboard/${stock.id}`;
    
    const textContent = `
GammaRips AI Top Pick of the Day: ${stock.company_name} (${stock.id})

Our AI has analyzed thousands of data points and identified ${stock.company_name} (${stock.id}) as today's top-rated setup based on our proprietary scoring model.

AI Summary:
${summary}

This is just a glimpse of the full picture. To see the complete step-by-step AI analysis, key metrics, and the specific options contract our model flagged, view the full dashboard.

View the Full Analysis: ${dashboardLink}

Happy trading,
The GammaRips Team
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
    <title>AI Top Pick of the Day: ${stock.id}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #282A3A; font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #282A3A;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1F212E; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Gamma<span style="color: #BEFF0A;">Rips</span></h1>
                            <p style="font-size: 16px; color: #A0A0A0; margin-top: 8px;">AI Top Pick of the Day</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                             <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; color: #ffffff; margin: 0; text-align: center;">${stock.company_name} (${stock.id})</h2>
                             <p style="text-align: center; font-size: 14px; color: #A0A0A0; margin-top: 8px;">
                                Our AI has analyzed thousands of data points and identified ${stock.company_name} as today's top-rated setup based on our proprietary scoring model.
                             </p>

                            <div style="background-color: #282A3A; border: 1px solid #393b4d; border-radius: 8px; padding: 20px; margin-top: 25px;">
                                <h3 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; color: #ffffff; margin: 0 0 10px 0;">AI Summary</h3>
                                <p style="font-size: 16px; line-height: 1.6; margin:0;">${summary}</p>
                            </div>
                            
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 25px;">This is just a glimpse of the full picture. To see the complete step-by-step AI analysis, key metrics, and the specific options contract our model flagged, view the full dashboard.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px;">
                            <a href="${dashboardLink}" style="background-color: #BEFF0A; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">View Full Analysis</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: center; font-size: 12px; color: #A0A0A0;">
                            <p style="margin: 0;">This is not financial advice. All trading involves risk.</p>
                            <p style="margin-top: 4px;">&copy; ${new Date().getFullYear()} GammaRips. All rights reserved.</p>
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
