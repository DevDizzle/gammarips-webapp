

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
Hi ${name},

Thanks for joining GammaRips. You now have full access to the Daily Playbook.

Our goal is to make your research process simple and data-driven. Here is how to get the most out of the platform every morning:

1. Check the Dashboard
Log in to see the daily list of high-gamma Call & Put contracts. We filter the market down to the handful of setups that matter.

2. Read the Briefing
Don't trade blindly. Click any card to read the AI Breakdown. You’ll see the fundamentals, catalysts, and risks behind every trade in plain English.

3. Plan Your Trade
We provide the conviction; you manage the risk. Use the data to validate your entry and exit points.

Go to Your Dashboard: https://profitscout.app/dashboard

Join the Conversation
Follow us for real-time updates and community discussion:
- X: https://x.com/GammaRipsAI
- Reddit: https://www.reddit.com/r/GammaRips/

Welcome aboard,
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
    <title>Welcome to GammaRips</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 800; color: #ffffff; margin: 0;">Hi ${name},</h1>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">Thanks for joining GammaRips. You now have full access to the Daily Playbook.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">Our goal is to make your research process simple and data-driven. Here is how to get the most out of the platform every morning:</p>
                            
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px;">
                                <tr>
                                    <td width="40" valign="top" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 700; color: hsl(74, 80%, 50%);">1.</td>
                                    <td valign="top">
                                        <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Check the Dashboard</h3>
                                        <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #A0A0A0;">Log in to see the daily list of high-gamma Call & Put contracts. We filter the market down to the handful of setups that matter.</p>
                                    </td>
                                </tr>
                                <tr><td height="24"></td></tr>
                                <tr>
                                    <td width="40" valign="top" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 700; color: hsl(74, 80%, 50%);">2.</td>
                                    <td valign="top">
                                        <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Read the Briefing</h3>
                                        <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #A0A0A0;">Don't trade blindly. Click any card to read the AI Breakdown. You’ll see the fundamentals, catalysts, and risks behind every trade in plain English.</p>
                                    </td>
                                </tr>
                                <tr><td height="24"></td></tr>
                                 <tr>
                                    <td width="40" valign="top" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 700; color: hsl(74, 80%, 50%);">3.</td>
                                    <td valign="top">
                                        <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">Plan Your Trade</h3>
                                        <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #A0A0A0;">We provide the conviction; you manage the risk. Use the data to validate your entry and exit points.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px 40px 30px;">
                            <a href="https://profitscout.app/dashboard" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Go to Your Dashboard</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 20px;">
                             <p style="font-size: 14px; line-height: 1.6; color: #A0A0A0; text-align: center; border-top: 1px solid #393b4d; padding-top: 30px;">
                                Join the Conversation<br>
                                Follow us for real-time updates and community discussion:
                            </p>
                            <p style="text-align: center; margin-top: 16px;">
                                <a href="https://x.com/GammaRipsAI" style="color: hsl(74, 80%, 50%); text-decoration: none; margin: 0 10px;">Follow on X</a> |
                                <a href="https://www.reddit.com/r/GammaRips/" style="color: hsl(74, 80%, 50%); text-decoration: none; margin: 0 10px;">Join us on Reddit</a>
                            </p>
                        </td>
                     </tr>
                     <tr>
                        <td style="padding: 20px 40px 40px; text-align: left; font-size: 14px; color: #A0A0A0;">
                            <p style="margin: 0;">Welcome aboard,</p>
                            <p style="margin-top: 4px;">Evan P.<br>Founder, GammaRips</p>
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
        subject: `Welcome to GammaRips. Here is your daily routine.`,
        text,
        html,
    });
}

export async function buildFeedbackRequestEmailContent(name: string): Promise<{ text: string; html: string }> {
    const textContent = `
Hi ${name},

I’m Evan, the founder of GammaRips.

You’ve had access to the Playbook for a week now. I want to check in and see if the daily contracts are matching your trading style.

We build this tool for Rippers, not for Wall Street. We want to know exactly what is working and what we need to fix.

If you have a minute, let me know your honest thoughts.

Share Your Feedback: https://profitscout.app/feedback

All the best,
Evan
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
    <title>One week in. How is the data?</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td style="padding: 40px;">
                            <p style="font-size: 16px; line-height: 1.6; margin: 0;">Hi ${name},</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">I’m Evan, the founder of GammaRips.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">You’ve had access to the Playbook for a week now. I want to check in and see if the daily contracts are matching your trading style.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">We build this tool for Rippers, not for Wall Street. We want to know exactly what is working and what we need to fix.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">If you have a minute, let me know your honest thoughts.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px 40px 30px;">
                            <a href="https://profitscout.app/feedback" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Share Your Feedback</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: left; font-size: 14px; color: #A0A0A0;">
                            <p style="margin: 0;">All the best,</p>
                            <p style="margin-top: 4px;">Evan<br>Founder, GammaRips</p>
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
        from: 'Evan at GammaRips <admin@profitscout.app>',
        to: `${name} <${to}>`,
        subject: `One week in. How is the data?`,
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
    const topBullish = winners.filter(w => w.option_type === 'call').sort((a,b) => (b.weighted_score ?? -1) - (a.weighted_score ?? -1)).slice(0, 5);
    const topBearish = winners.filter(w => w.option_type === 'put').sort((a,b) => (a.weighted_score ?? Infinity) - (b.weighted_score ?? Infinity)).slice(0, 5);

    const generateSetupTableRows = (setups: Winner[]) => 
        setups.map(s => `
            <tr>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.ticker}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">$${s.strike_price.toFixed(2)} ${s.option_type.toUpperCase()}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${new Date(s.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.outlook_signal}</td>
            </tr>
        `).join('');

    const generatePerformanceTableRows = (signals: PerformanceSignal[]) =>
        signals.map(s => `
             <tr>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.ticker}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">$${s.strike_price.toFixed(2)} ${s.option_type?.toUpperCase()}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #393b4d; color: ${s.percent_gain >= 0 ? '#22c55e' : '#ef4444'}; font-weight: bold;">
                    ${s.percent_gain >= 0 ? '+' : ''}${s.percent_gain.toFixed(2)}%
                </td>
            </tr>
        `).join('');
    
    let textContent = `The Daily Playbook: Tomorrow’s contracts are ready.\n\n The session is over. Our engine has processed the day's volatility. Do your research now. Get your trade ideas locked in before tomorrow's opening bell. \n\n First, let's look at the scoreboard. Here are the top-performing contracts from our playbook today. This is the volatility we hunt.\n\n`;

    textContent += `Today's Scorecard:\n${topGainers.map(s => `${s.ticker} | $${s.strike_price.toFixed(2)} ${s.option_type?.toUpperCase()} | +${s.percent_gain.toFixed(2)}%`).join('\n')}\n\n`;
    textContent += `Missed these? Don't chase yesterday's moves. We have identified the high-gamma contracts primed for tomorrow.\nReview these setups tonight. Check the AI breakdown. Have your plan locked in before the opening bell.\n\n`;
    textContent += `Top 5 Bullish Call Contracts:\n${topBullish.map(s => `${s.ticker} | $${s.strike_price.toFixed(2)} ${s.option_type.toUpperCase()} | Expires: ${new Date(s.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })} | ${s.outlook_signal}`).join('\n')}\n\n`;
    textContent += `Top 5 Bearish Put Contracts:\n${topBearish.map(s => `${s.ticker} | $${s.strike_price.toFixed(2)} ${s.option_type.toUpperCase()} | Expires: ${new Date(s.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })} | ${s.outlook_signal}`).join('\n')}\n\n`;
    textContent += `Unlock the Full Playbook: https://profitscout.app/dashboard`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
    <title>The Daily Playbook: Tomorrow’s contracts are ready.</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1a1b26; font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1a1b26;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #282A3A; border-radius: 8px; overflow: hidden; border: 1px solid #393b4d;">
                    <tr>
                        <td align="center" style="padding: 30px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 800; color: #ffffff; margin: 0;">Market Closed. Data Processed.</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                             <p style="font-size: 16px; line-height: 1.6;">The session is over. Our engine has processed the day's volatility. Do your research now. Get your trade ideas locked in before tomorrow's opening bell.</p>
                             <p style="font-size: 16px; line-height: 1.6; margin-top: 10px;">First, let's look at the scoreboard. Here are the top-performing contracts from our playbook today. This is the volatility we hunt.</p>
                            
                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; color: #ffffff; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid hsl(74, 80%, 50%); padding-bottom: 5px;">Today's Scorecard</h2>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0;">
                                <thead>
                                     <tr style="color: #A0A0A0; font-size: 12px; text-transform: uppercase;">
                                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #393b4d;">Ticker</th>
                                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #393b4d;">Contract</th>
                                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #393b4d;">Top Intraday Gain</th>
                                     </tr>
                                </thead>
                                <tbody>${generatePerformanceTableRows(topGainers)}</tbody>
                            </table>
                            
                             <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Missed these? Don't chase yesterday's moves. We have identified the high-gamma contracts primed for tomorrow.</p>
                             <p style="font-size: 16px; line-height: 1.6; margin-top: 10px;">Review these setups tonight. Check the AI breakdown. Have your plan locked in before the opening bell.</p>

                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; color: #ffffff; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid hsl(74, 80%, 50%); padding-bottom: 5px;">Top 5 Bullish Call Contracts</h2>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0;">
                                <thead>
                                    <tr style="color: #A0A0A0; font-size: 12px; text-transform: uppercase;">
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Ticker</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Contract</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Expiry</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">AI Outlook</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generateSetupTableRows(topBullish)}
                                </tbody>
                            </table>

                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; color: #ffffff; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid hsl(74, 80%, 50%); padding-bottom: 5px;">Top 5 Bearish Put Contracts</h2>
                             <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0;">
                                <thead>
                                     <tr style="color: #A0A0A0; font-size: 12px; text-transform: uppercase;">
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Ticker</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Contract</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">Expiry</th>
                                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">AI Outlook</th>
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
                            <a href="https://profitscout.app/dashboard" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Unlock the Full Playbook</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: center; font-size: 12px; color: #A0A0A0;">
                            <p style="margin: 0;">This is not financial advice. All trading involves risk. Past performance does not guarantee future results.</p>
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
<body style="margin: 0; padding: 0; background-color: #1a1b26; font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1a1b26;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #282A3A; border-radius: 8px; overflow: hidden; border: 1px solid #393b4d;">
                    <tr>
                        <td align="center" style="padding: 30px 20px;">
                             <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 800; color: #ffffff; margin: 0;">AI Top Pick of the Day</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                             <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; color: #ffffff; margin: 0; text-align: center;">${stock.company_name} (${stock.id})</h2>
                             <p style="text-align: center; font-size: 14px; color: #A0A0A0; margin-top: 8px;">
                                Our AI has analyzed thousands of data points and identified this as today's top-rated setup based on our proprietary scoring model.
                             </p>

                            <div style="background-color: #1F212E; border: 1px solid #393b4d; border-radius: 8px; padding: 20px; margin-top: 25px;">
                                <h3 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; color: #ffffff; margin: 0 0 10px 0;">AI Summary</h3>
                                <p style="font-size: 16px; line-height: 1.6; margin:0;">${summary}</p>
                            </div>
                            
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 25px;">This is just a glimpse of the full picture. To see the complete step-by-step AI analysis, key metrics, and the specific options contract our model flagged, view the full dashboard.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px;">
                            <a href="${dashboardLink}" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">View Full Analysis</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: center; font-size: 12px; color: #A0A0A0;">
                            <p style="margin: 0;">This is not financial advice. All trading involves risk.</p>
                             <div style="margin-top: 20px;">
                                <a href="https://x.com/GammaRipsAI" style="color: #A0A0A0; text-decoration: none; margin: 0 8px;">X (Twitter)</a>
                                <a href="https://www.reddit.com/r/GammaRips/" style="color: #A0A0A0; text-decoration: none; margin: 0 8px;">Reddit</a>
                                <a href="https://profitscout.app/privacy" style="color: #A0A0A0; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
                            </div>
                            <p style="margin-top: 8px;">&copy; ${new Date().getFullYear()} GammaRips. All rights reserved.</p>
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
