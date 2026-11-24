

'use server';

import { Buffer } from 'node:buffer';
import type { Winner, PerformanceSignal, Stock } from '@/lib/firebase-admin';
import {
  TOOL_COUNT,
  PRICE_MONTHLY,
  PRICE_ANNUAL,
  TRIAL_DAYS,
  BUILD_STANDARD_PRICE,
  AGENT_CARE_PRICE,
  AGENT_CARE_MCP_PRICE,
  BUILD_TURNAROUND_DAYS,
} from '@/lib/constants';


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
  // Trimmed: the Secret Manager value ends in a newline (wrong Basic auth).
  const API_KEY = process.env.MAILGUN_SENDING_KEY?.trim();
  const DOMAIN = process.env.MAILGUN_DOMAIN || 'mg.gammarips.com';
  const DEFAULT_FROM = 'Evan Parra <evan@gammarips.com>';

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
  // Explicitly set testmode to false to prevent [TEST] prefix.
  form.append('o:testmode', 'false');

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

You're in. GammaRips Agent Access is live on your account.

Here's how to get your agent working the data:

1. Generate your API key.
   Go to your account page (https://gammarips.com/account) and click
   "Generate API key". The key is shown once, so copy it right then.
   Any trouble, just reply to this email and we'll sort it
   immediately.

2. Connect your agent.
   Claude Code, Cursor, or any MCP client that can send an
   Authorization header. Copy-paste setup at
   https://gammarips.com/developers

3. Run your first brief.
   Ask your agent to run the morning_brief prompt, or say "pull the
   GammaRips pool and tell me what's interesting." All ${TOOL_COUNT} tools
   (the curated pool, opportunity surfaces, outcome history, exit-rule
   simulation, and methodology playbooks) are live on your key.

Your ${TRIAL_DAYS}-day free trial started today. No charge if you cancel
before day ${TRIAL_DAYS}. Manage anytime at https://gammarips.com/account.

One honest note, because it's the whole point: we sell data, not
picks. The engine curates the pool and tracks every outcome in
public; what your agent concludes from it is your analysis.

Questions? Reply and it goes straight to me.

Welcome aboard,
Evan Parra
Founder, GammaRips
evan@gammarips.com

Data on a paper-trading basis, educational only. Not investment advice. Past performance is not a guarantee of future results.
`;

    const step = (n: string, title: string, body: string) => `
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                                <tr>
                                    <td width="40" valign="top" style="font-size: 24px; font-weight: 700; color: hsl(74, 80%, 50%);">${n}.</td>
                                    <td valign="top">
                                        <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 4px 0; color: #ffffff;">${title}</h3>
                                        <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #A0A0A0;">${body}</p>
                                    </td>
                                </tr>
                            </table>`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to GammaRips</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', Arial, sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-size: 36px; font-weight: 700; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">Hi ${name},</h1>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">You're in. <strong>GammaRips Agent Access</strong> is live on your account. Here's how to get your agent working the data:</p>
                            ${step('1', 'Generate your API key', `Go to your <a href="https://gammarips.com/account" style="color: hsl(74, 80%, 50%);">account page</a> and click &ldquo;Generate API key&rdquo;. The key is shown once, so copy it right then. Any trouble, just reply to this email and we'll sort it immediately.`)}
                            ${step('2', 'Connect your agent', `Claude Code, Cursor, or any MCP client that can send an Authorization header. Copy-paste setup on the <a href="https://gammarips.com/developers" style="color: hsl(74, 80%, 50%);">MCP docs page</a>.`)}
                            ${step('3', 'Run your first brief', `Ask your agent to run the <code>morning_brief</code> prompt, or say &ldquo;pull the GammaRips pool and tell me what's interesting.&rdquo; All ${TOOL_COUNT} tools (the curated pool, opportunity surfaces, outcome history, exit-rule simulation, and methodology playbooks) are live on your key.`)}
                            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding: 32px 0 8px;">
                                <a href="https://gammarips.com/developers" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Set up your agent →</a>
                            </td></tr></table>
                            <p style="font-size: 14px; line-height: 1.6; margin-top: 24px; color: #A0A0A0;">Your ${TRIAL_DAYS}-day free trial started today. No charge if you cancel before day ${TRIAL_DAYS}; manage anytime from your <a href="https://gammarips.com/account" style="color: hsl(74, 80%, 50%);">account page</a>.</p>
                            <p style="font-size: 14px; line-height: 1.6; margin-top: 16px; color: #A0A0A0;">One honest note, because it's the whole point: we sell data, not picks. The engine curates the pool and tracks every outcome in public; what your agent concludes from it is your analysis.</p>
                            <p style="font-size: 14px; line-height: 1.6; margin-top: 16px;">Questions? Reply and it goes straight to me.<br/>Evan Parra, Founder</p>
                            <p style="font-size: 12px; line-height: 1.5; margin-top: 24px; color: #707070;">Data on a paper-trading basis, educational only. Not investment advice. Past performance is not a guarantee of future results.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return { text: textContent, html: htmlContent };
}

export async function sendWelcomeEmail({ to, name }: { to: string, name: string }) {
    const { text, html } = await buildWelcomeEmailContent(name);
    return sendEmail({
        to: `${name} <${to}>`,
        subject: `You're in. Let's get your agent connected.`,
        text,
        html,
    });
}

export async function buildSignupWelcomeEmailContent(name: string): Promise<{ text: string; html: string }> {
    const textContent = `
Hi ${name},

Welcome to GammaRips. Your free account is live.

What that gets you, free, forever:

- gammarips.com/signals is today's 3-contract pool preview from our nightly Combo A scan of ~3,500 optionable US stocks.
- gammarips.com/how-it-works is Learn: the 4-stage overnight pipeline and Catalyst Lab microstructure research.
- gammarips.com/lab is The Lab: our published walk-forward experiments, including the killed hypotheses.
- gammarips.com/blog and @gammarips on X: methodology and daily research notes.

The Pro tier (${PRICE_MONTHLY}/mo founding price, ${TRIAL_DAYS}-day free trial) unlocks the full daily 40–50 contract Combo A dataset, 10-minute intraday liquidity snapshots, and 3-day excursion outcome history over MCP in Claude, ChatGPT, Cursor, or Codex. Your agent analyzes; you decide.

See how it works: https://gammarips.com/how-it-works

Reply to this email if you have questions and it goes straight to me.

Evan Parra
Founder, GammaRips
evan@gammarips.com

Educational market data only. Not investment advice.
`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to GammaRips</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', Arial, sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-size: 36px; font-weight: 700; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">Hi ${name},</h1>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">Welcome to GammaRips. Your free account is live:</p>
                            <ul style="font-size: 15px; line-height: 1.8; color: #A0A0A0; padding-left: 20px;">
                                <li><a href="https://gammarips.com/signals" style="color: hsl(74, 80%, 50%);">Today's Pool Preview</a>: the daily 3-contract preview from our nightly Combo A scan of ~3,500 optionable US stocks.</li>
                                <li><a href="https://gammarips.com/how-it-works" style="color: hsl(74, 80%, 50%);">Learn</a>: how the 4-stage pipeline works and the Catalyst Lab research behind the Combo A gates.</li>
                                <li><a href="https://gammarips.com/lab" style="color: hsl(74, 80%, 50%);">The Lab</a>: our walk-forward research experiments, including the killed ideas.</li>
                                <li><a href="https://gammarips.com/blog" style="color: hsl(74, 80%, 50%);">Blog</a> + @gammarips on X: methodology and daily intelligence notes.</li>
                            </ul>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;"><strong>Pro MCP Access</strong> (${PRICE_MONTHLY}/mo founding price, ${TRIAL_DAYS}-day free trial) connects Claude, ChatGPT, Cursor, or Codex to the full 40–50 contract daily dataset, 10-minute intraday liquidity snapshots, and 3-day excursion outcome history over MCP. Your agent analyzes; you decide.</p>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding: 28px 0 8px;">
                                <a href="https://gammarips.com/pricing" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Unlock Pro MCP Access →</a>
                            </td></tr></table>
                            <p style="font-size: 14px; line-height: 1.6; margin-top: 24px;">Reply to this email if you have questions and it goes straight to me.<br/>Evan Parra, Founder</p>
                            <p style="font-size: 12px; line-height: 1.5; margin-top: 24px; color: #707070;">Educational market data only. Not investment advice.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return { text: textContent, html: htmlContent };
}

export async function sendSignupWelcomeEmail({ to, name }: { to: string, name: string }) {
    const { text, html } = await buildSignupWelcomeEmailContent(name);
    return sendEmail({
        to: `${name} <${to}>`,
        subject: `Welcome to GammaRips: here's how it works.`,
        text,
        html,
    });
}

export async function buildTrialEndingEmailContent(
    name: string,
    chargeDateISO: string,
    amountDisplay: string,
    interval: 'month' | 'year' = 'month',
): Promise<{ text: string; html: string }> {
    const chargeDate = new Date(chargeDateISO).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York',
    });
    const periodLabel = interval === 'year' ? 'year' : 'month';
    const annualUpgradeText =
        interval === 'month'
            ? `\nWant to save $49/yr and lock in the founding rate for 12 months?\n- Switch to annual (${PRICE_ANNUAL}/year): https://gammarips.com/pricing?checkout=year\n`
            : '';
    const annualUpgradeHtml =
        interval === 'month'
            ? `<p style="font-size: 15px; line-height: 1.6; margin-top: 16px; padding: 14px 16px; background-color: hsl(224, 20%, 12%); border-left: 3px solid hsl(74, 80%, 50%); border-radius: 4px;">Want to save $49/yr and lock in the founding rate for 12 months? <a href="https://gammarips.com/pricing?checkout=year" style="color: hsl(74, 80%, 50%); font-weight: 600;">Switch to the ${PRICE_ANNUAL}/year annual plan</a> before ${chargeDate}.</p>`
            : '';

    const textContent = `
Hi ${name},

Quick heads-up: your GammaRips Pro ${TRIAL_DAYS}-day trial ends in 3 days.

Your card will be charged ${amountDisplay} on ${chargeDate} and you'll stay subscribed at ${amountDisplay}/${periodLabel} going forward. No action needed if you want to continue; just keep using the data.
${annualUpgradeText}
If it isn't for you:
- Cancel anytime before ${chargeDate} and you won't be charged.
- Manage subscription: https://gammarips.com/account

What you keep with Pro MCP Access:
- All ${TOOL_COUNT} MCP tools on your key: the full 40–50 contract daily Combo A dataset, 10-minute intraday liquidity snapshots, 3-day excursion outcome history, exit-rule simulation, and methodology playbooks.
- Fresh pool data every trading day, leakage-checked, plus the full labeled history your agent reasons over.
- The 3-contract preview, daily reports, and Lab stay free either way; the subscription unlocks the full machine dataset.

If anything's off or you have a question before the trial ends, reply to this email and it goes straight to me.

Paper-trading, educational only. Not investment advice.

Evan
evan@gammarips.com
`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
    <title>Your GammaRips trial ends in 3 days</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px 20px;">
                            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 700; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 20px;">
                            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #ffffff; margin: 0;">Your trial ends in 3 days.</h2>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">Hi ${name},</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">Your card will be charged <strong style="color: #ffffff;">${amountDisplay}</strong> on <strong style="color: #ffffff;">${chargeDate}</strong> and you'll stay subscribed at ${amountDisplay}/${periodLabel} going forward. No action needed if the data's earning its keep.</p>
                            ${annualUpgradeHtml}
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">If it's not for you, cancel anytime before the charge and you won't pay a cent.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 10px 40px 30px;">
                            <a href="https://gammarips.com/account" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Manage subscription</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 20px;">
                            <p style="font-size: 14px; line-height: 1.6; color: #A0A0A0; border-top: 1px solid #393b4d; padding-top: 24px;">
                                If anything's off or you have a question before the trial ends, reply to this email and it goes straight to me.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 40px 20px; font-size: 12px; line-height: 1.5; color: #6A6A6A; text-align: center; border-top: 1px solid #393b4d;">
                            Paper-trading, educational only. Not investment advice. Past performance is not a guarantee of future results.
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 40px 40px; text-align: left; font-size: 14px; color: #A0A0A0;">
                            <p style="margin: 0;">Evan<br><a href="mailto:evan@gammarips.com" style="color: hsl(74, 80%, 50%);">evan@gammarips.com</a></p>
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

export async function sendTrialEndingEmail({
    to,
    name,
    chargeDateISO,
    amountDisplay,
    interval = 'month',
}: {
    to: string;
    name: string;
    chargeDateISO: string;
    amountDisplay: string;
    interval?: 'month' | 'year';
}) {
    const { text, html } = await buildTrialEndingEmailContent(name, chargeDateISO, amountDisplay, interval);
    const chargeDateShort = new Date(chargeDateISO).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', timeZone: 'America/New_York',
    });
    return sendEmail({
        to: `${name} <${to}>`,
        subject: `Your GammaRips trial ends in 3 days; ${amountDisplay} charges on ${chargeDateShort}.`,
        text,
        html,
    });
}

export async function buildFeedbackRequestEmailContent(name: string): Promise<{ text: string; html: string }> {
    const textContent = `
Hi ${name},

I’m Evan, the founder of GammaRips.

You’ve been using GammaRips for a while now. I want to check in and see if the daily contracts are matching your trading style.

We built this for self-directed traders, not for Wall Street. We want to know what is working and what we need to fix.

If you have a minute, let me know your honest thoughts.

Share Your Feedback: https://gammarips.com/feedback

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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
    <title>How is the data working for you?</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <div style="display: none; max-height: 0px; overflow: hidden;">&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                     <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 700; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <p style="font-size: 16px; line-height: 1.6; margin: 0;">Hi ${name},</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 24px;">I’m Evan, the founder of GammaRips.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">You’ve been using GammaRips for a while now. I want to check in and see if the daily contracts are matching your trading style.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">We built this for self-directed traders, not for Wall Street. We want to know what is working and what we need to fix.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">If you have a minute, let me know your honest thoughts.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 30px;">
                            <a href="https://gammarips.com/feedback" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Share Your Feedback</a>
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
        from: 'Evan Parra <evan@gammarips.com>',
        to: `${name} <${to}>`,
        subject: `GammaRips: How is the data working for you?`,
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
    <title>We've Received Your Feedback</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <div style="display: none; max-height: 0px; overflow: hidden;">&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 700; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; color: #ffffff; margin-top: 0;">Message Received</h2>
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
        replyTo: 'evan@gammarips.com', // Ensure replies go to support
    });
}


export async function buildAgentResponseEmailContent({ response, trackingId }: { response: string, trackingId: string }): Promise<{ text: string; html: string }> {
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
    <title>Response to your inquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <div style="display: none; max-height: 0px; overflow: hidden;">&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 700; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; color: #ffffff; margin-top: 0;">Response to Your Inquiry (Ref: ${trackingId})</h2>
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
    const { text, html } = await buildAgentResponseEmailContent({ response, trackingId });
    
    return sendEmail({
        to,
        subject: `Re: Your GammaRips Inquiry (Ref: ${trackingId})`,
        text,
        html,
        replyTo: 'evan@gammarips.com',
    });
}


export async function buildDailySetupsEmailContent(winners: Winner[], topGainers: PerformanceSignal[]): Promise<{ text: string; html: string }> {
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
    
    let textContent = `GammaRips: tomorrow’s pick at ~09:50 ET, right before the 10:00 entry.\n\n The session is over. Our engine has processed the day's volatility. Do your research now. Get your trade ideas locked in before tomorrow's opening bell. \n\n First, let's look at the scoreboard. Here are the top-performing contracts from our playbook today. This is the volatility we hunt.\n\n`;

    textContent += `The Scoreboard:\n${topGainers.map(s => `${s.ticker} | $${s.strike_price.toFixed(2)} ${s.option_type?.toUpperCase()} | +${s.percent_gain.toFixed(2)}%`).join('\n')}\n\n`;
    textContent += `Missed these? Don't chase yesterday's moves. We have identified the high-gamma contracts primed for tomorrow.\nReview these setups tonight. Check the AI breakdown. Have your plan locked in before the opening bell.\n\n`;
    textContent += `Top 5 Bullish Call Contracts:\n${topBullish.map(s => `${s.ticker} | $${s.strike_price.toFixed(2)} ${s.option_type.toUpperCase()} | Expires: ${new Date(s.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })} | ${s.outlook_signal}`).join('\n')}\n\n`;
    textContent += `Top 5 Bearish Put Contracts:\n${topBearish.map(s => `${s.ticker} | $${s.strike_price.toFixed(2)} ${s.option_type.toUpperCase()} | Expires: ${new Date(s.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })} | ${s.outlook_signal}`).join('\n')}\n\n`;
    textContent += `See today’s pick: https://gammarips.com/`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
    <title>GammaRips: tomorrow’s pick at ~09:50 ET, right before the 10:00 entry.</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <div style="display: none; max-height: 0px; overflow: hidden;">&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden; border: 1px solid #393b4d;">
                    <tr>
                        <td align="center" style="padding: 40px 20px 10px;">
                            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 700; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 10px 20px 30px;">
                            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">Tomorrow’s Pick</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                             <p style="font-size: 16px; line-height: 1.6;">The session is over. Our engine has processed the day's volatility. Do your research now. Get your trade ideas locked in before tomorrow's opening bell.</p>
                             <p style="font-size: 16px; line-height: 1.6; margin-top: 10px;">First, let's look at the scoreboard. Here are the top-performing contracts from our playbook. This is the volatility we hunt.</p>
                            
                            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 20px; color: #ffffff; margin-top: 30px; margin-bottom: 5px;">The Scoreboard</h3>
                            <p style="font-size: 14px; color: #A0A0A0; margin-top: 0; margin-bottom: 15px;">Live performance of our top active contracts.</p>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0; font-size: 14px;">
                                <thead>
                                     <tr style="color: #A0A0A0; font-size: 12px; text-transform: uppercase;">
                                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #393b4d;">Ticker</th>
                                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #393b4d;">Contract</th>
                                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #393b4d;">Gain</th>
                                     </tr>
                                </thead>
                                <tbody>${generatePerformanceTableRows(topGainers)}</tbody>
                            </table>
                            
                             <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Missed these? Don't chase yesterday's moves. We have identified the high-gamma contracts primed for tomorrow.</p>
                             <p style="font-size: 16px; line-height: 1.6; margin-top: 10px;">Review these setups tonight. Check the AI breakdown. Have your plan locked in before the opening bell.</p>

                            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 20px; color: #ffffff; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid hsl(74, 80%, 50%); padding-bottom: 5px;">Top 5 Bullish Call Contracts</h3>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0; font-size: 14px;">
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

                            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 20px; color: #ffffff; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid hsl(74, 80%, 50%); padding-bottom: 5px;">Top 5 Bearish Put Contracts</h3>
                             <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0; font-size: 14px;">
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
                            <a href="https://gammarips.com/" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">See today’s pick</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: center; font-size: 12px; color: #A0A0A0;">
                             <div style="margin-bottom: 20px; border-top: 1px solid #393b4d; padding-top: 30px;">
                                <a href="https://x.com/GammaRips" style="color: #A0A0A0; text-decoration: none; margin: 0 8px;">Follow on X</a> &bull;
                                <a href="https://x.com/GammaRips" style="color: #A0A0A0; text-decoration: none; margin: 0 8px;">Follow on X</a>
                            </div>
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
    const dashboardLink = `https://gammarips.com/${stock.id}`;
    
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
    <title>AI Top Pick of the Day: ${stock.id}</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <div style="display: none; max-height: 0px; overflow: hidden;">&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden; border: 1px solid #393b4d;">
                    <tr>
                        <td align="center" style="padding: 40px 20px 10px;">
                            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 700; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 10px 20px 30px;">
                             <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">AI Top Pick of the Day</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                             <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 28px; color: #ffffff; margin: 0; text-align: center;">${stock.company_name} (${stock.id})</h3>
                             <p style="text-align: center; font-size: 14px; color: #A0A0A0; margin-top: 8px;">
                                Our AI has analyzed thousands of data points and identified this as today's top-rated setup based on our proprietary scoring model.
                             </p>

                            <div style="background-color: #1F212E; border: 1px solid #393b4d; border-radius: 8px; padding: 20px; margin-top: 25px;">
                                <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 18px; color: #ffffff; margin: 0 0 10px 0;">AI Summary</h3>
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
                            <div style="margin-top: 20px;">
                                <a href="https://x.com/GammaRips" style="color: #A0A0A0; text-decoration: none; margin: 0 8px;">X (Twitter)</a>
                                &bull;
                                <a href="https://x.com/GammaRips" style="color: #A0A0A0; text-decoration: none; margin: 0 8px;">X</a>
                                &bull;
                                <a href="https://gammarips.com/privacy" style="color: #A0A0A0; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
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


export async function buildInsiderInvitationEmailContent(name: string, dashboardLink: string): Promise<{ text: string; html: string }> {
    const textContent = `
Hi ${name},

Good news! We've made a big change to our platform.

GammaRips is now free for all early adopters. That includes you.

You now have full access to the curated signals pool, the enriched signals list, the daily report, and the methodology & Lab research. No strings attached.

We're doing this to gather feedback from a core group of traders as we continue to build out the platform.

Log in now to see today's top Call & Put contracts.

Go to your Dashboard: ${dashboardLink}

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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
    <title>GammaRips is Now Free for Early Adopters</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <div style="display: none; max-height: 0px; overflow: hidden;">&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden; border: 1px solid #393b4d;">
                    <tr>
                        <td align="center" style="padding: 40px 20px 10px;">
                            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 700; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">Hi ${name},</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">Good news! We've made a big change to our platform.</p>
                            
                            <div style="background-color: #1F212E; border: 1px solid #393b4d; border-radius: 8px; padding: 20px; margin-top: 25px; text-align: center;">
                                <p style="font-size: 18px; line-height: 1.6; margin: 0; color: #ffffff; font-weight: 500;">
                                    GammaRips is now <span style="color: hsl(74, 80%, 50%);">free for all early adopters</span>. That includes you.
                                </p>
                            </div>

                            <p style="font-size: 16px; line-height: 1.6; margin-top: 25px;">You now have full access to the curated signals pool, the enriched signals list, the daily report, and the methodology & Lab research. No strings attached.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">We're doing this to gather feedback from a core group of traders as we continue to build out the platform.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">Log in now to see today's top Call & Put contracts.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px;">
                            <a href="${dashboardLink}" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Go to your Dashboard</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: left; font-size: 14px; color: #A0A0A0;">
                            <p style="margin: 0;">All the best,</p>
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


export async function sendInsiderInvitationEmail({ to, name, activationLink }: { to: string, name: string, activationLink: string }) {
    const { text, html } = await buildInsiderInvitationEmailContent(name, activationLink);
    return sendEmail({
        to: `${name} <${to}>`,
        subject: `Good News: GammaRips is Now Free`,
        text,
        html,
    });
}


export async function buildMidDayMoversEmailContent(movers: PerformanceSignal[]): Promise<{ text: string; html: string }> {
    const generateMoversTableRows = (signals: PerformanceSignal[]) =>
        signals.map(s => `
             <tr>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">${s.ticker}</td>
                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #393b4d;">$${s.strike_price.toFixed(2)} ${s.option_type?.toUpperCase()}</td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #393b4d; color: #22c55e; font-weight: bold;">
                    +${s.percent_gain.toFixed(2)}%
                </td>
            </tr>
        `).join('');
    
    let textContent = `Mid-Day Movers: Catching Up\n\nHere are yesterday's top signals that are on the move today.\n\n`;
    textContent += `Top 4 Movers:\n${movers.map(s => `${s.ticker} | $${s.strike_price.toFixed(2)} ${s.option_type?.toUpperCase()} | +${s.percent_gain.toFixed(2)}%`).join('\n')}\n\n`;
    textContent += `See the full performance tracker on the dashboard: https://gammarips.com/performance`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
    <title>Mid-Day Movers</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <div style="display: none; max-height: 0px; overflow: hidden;">&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden; border: 1px solid #393b4d;">
                    <tr>
                        <td align="center" style="padding: 40px 20px 10px;">
                            <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 700; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 10px 20px 30px;">
                            <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #ffffff; margin: 0;">Mid-Day Movers</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                             <p style="font-size: 16px; line-height: 1.6;">Here are yesterday's top signals that are on the move today. See what's ripping and what's dipping from the previous session's playbook.</p>
                            
                            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 20px; color: #ffffff; margin-top: 30px; margin-bottom: 5px;">Top 4 Movers</h3>
                            <p style="font-size: 14px; color: #A0A0A0; margin-top: 0; margin-bottom: 15px;">Today's biggest gainers from yesterday's signals.</p>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; color: #E0E0E0; font-size: 14px;">
                                <thead>
                                     <tr style="color: #A0A0A0; font-size: 12px; text-transform: uppercase;">
                                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #393b4d;">Ticker</th>
                                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #393b4d;">Contract</th>
                                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #393b4d;">Gain</th>
                                     </tr>
                                </thead>
                                <tbody>${generateMoversTableRows(movers)}</tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 40px;">
                            <a href="https://gammarips.com/performance" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">View Full Performance Tracker</a>
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

export interface BuildIntakeEmailPayload {
  requestId: string;
  name: string;
  email: string;
  assetClasses: string[];
  dataSource: string;
  brokerTarget: string;
  hostingTarget: string;
  rulesSummary: string;
  fastTrackCheckout: boolean;
}

export async function sendBuildIntakeEmails(payload: BuildIntakeEmailPayload) {
  const modeLabel = payload.fastTrackCheckout
    ? `DIRECT ${BUILD_STANDARD_PRICE} CHECKOUT INITIATED`
    : 'FREE 24H SCOPE CHECK REQUESTED';

  const ownerText = [
    `New Custom Trading Agent Spec (${modeLabel})`,
    `Request ID: ${payload.requestId}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Instruments: ${payload.assetClasses.join(', ')}`,
    `Data Feed: ${payload.dataSource}`,
    `Broker Target: ${payload.brokerTarget}`,
    `Hosting Target: ${payload.hostingTarget}`,
    '',
    'Written Strategy Rules:',
    payload.rulesSummary,
  ].join('\n');

  await sendEmail({
    to: 'Evan Parra <evan@gammarips.com>',
    replyTo: payload.email,
    subject: `[Agent Build] ${modeLabel} — ${payload.name} (${payload.assetClasses.join('/')})`,
    text: ownerText,
  });

  const clientText = `Hi ${payload.name},

Thanks for submitting your trading agent specification to GammaRips (Ref: ${payload.requestId}).

What happens next:
- Scope review: I review every written specification personally within 24 hours to confirm it fits our fixed ${BUILD_STANDARD_PRICE} standard scope (${BUILD_TURNAROUND_DAYS}-business-day delivery, Paper-first handoff to your private GitHub repository).
- Stack submitted: ${payload.assetClasses.join(', ')} | Data: ${payload.dataSource} | Broker: ${payload.brokerTarget} | Hosting: ${payload.hostingTarget}.
- Optional ongoing maintenance (${AGENT_CARE_PRICE}/mo Agent Care or ${AGENT_CARE_MCP_PRICE}/mo Agent Care + Pro MCP) is never billed during build week—only offered at Day-${BUILD_TURNAROUND_DAYS} handoff.

If you want to add any extra rule details or API docs, just reply directly to this email.

Evan Parra
Founder, GammaRips
evan@gammarips.com

Work-for-hire software engineering only. Client owns strategy logic, repository, and broker credentials. Not investment advice.
`;

  return sendEmail({
    to: `${payload.name} <${payload.email}>`,
    subject: `We received your custom trading agent spec (Ref: ${payload.requestId.slice(0, 8)})`,
    text: clientText,
  });
}

export async function sendBuildPaidKickoffEmails({
  requestId,
  name,
  email,
  amountDisplay,
}: {
  requestId: string;
  name: string;
  email: string;
  amountDisplay: string;
}) {
  await sendEmail({
    to: 'Evan Parra <evan@gammarips.com>',
    replyTo: email,
    subject: `[PAID ${amountDisplay}] Custom Agent Build — ${name} (${requestId})`,
    text: `PAID custom agent build order!\n\nRequest ID: ${requestId}\nClient: ${name} <${email}>\nAmount Paid: ${amountDisplay}\n\nCheck Firestore collection agent_build_requests/${requestId} for the full written spec.`,
  });

  const kickoffText = `Hi ${name},

Your ${amountDisplay} GammaRips Custom Trading Agent Build slot is locked in (Order Ref: ${requestId}).

Here is our ${BUILD_TURNAROUND_DAYS}-business-day fulfillment timeline:
1. Day 0–1 (Spec Confirmation & Scaffold): I review your written rules from request ${requestId} and spin up your private Python 3.12 repository with limit-order-only execution, fill-derived hard stops, and restart-safe order-intent state. (If anything in your spec falls outside standard fixed scope, I'll flag it within 24 hours with a 100% immediate refund option.)
2. Day 2–4 (Implementation & Live-Market Paper Verification): We implement your strategy adapter, unit-test stop/sizing/idempotency rails, and verify a live-market session in Paper Mode.
3. Day ${BUILD_TURNAROUND_DAYS} (Private GitHub Handoff): Reply to this email with the GitHub username you'd like invited to your private repository. You'll receive the full source code, Docker + systemd deployment files, .env.example (we never hold your live broker keys), and walkthrough notes.

Reply right here with your GitHub username and any extra edge cases you want covered.

Let's build,
Evan Parra
Founder, GammaRips
evan@gammarips.com

Work-for-hire software engineering only; delivered in Paper Mode by default. Not investment advice.
`;

  return sendEmail({
    to: `${name} <${email}>`,
    subject: `Build slot confirmed (${amountDisplay}) — reply with your GitHub username`,
    text: kickoffText,
  });
}




    