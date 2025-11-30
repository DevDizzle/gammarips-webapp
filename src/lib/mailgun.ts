'use server';

import { Buffer } from 'node:buffer';

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
  const DOMAIN = 'gammarips.com';
  // Hardcode the default from address to the verified domain.
  const DEFAULT_FROM = 'GammaRips <admin@gammarips.com>';

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


function buildWelcomeEmailContent(name: string): { text: string; html: string } {
    const textContent = `
Welcome to GammaRips, ${name}!

You now have full access to our AI-powered options research dashboard. Here's what you can do right now:

- View today's top-rated Call and Put rippers.
- Dive deep into any stock with our AI Analyst Briefings.
- Explore the interactive dashboard to find your next trade idea.

Get started now: https://gammarips.com/dashboard

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
    <title>Welcome to GammaRips!</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                            <p style="font-size: 18px; color: #A0A0A0; margin-top: 12px;">Welcome, ${name}!</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <p style="font-size: 16px; line-height: 1.6;">You now have full access to our complete suite of AI-powered research tools.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">Here's what you can do right now:</p>
                             <ul style="font-size: 16px; line-height: 1.6; margin-top: 16px; padding-left: 20px; color: #E0E0E0;">
                                <li style="margin-bottom: 10px;">View today's top-rated Call & Put rippers.</li>
                                <li style="margin-bottom: 10px;">Dive deep with our AI Analyst Briefings.</li>
                                <li style="margin-bottom: 10px;">Explore the interactive dashboard.</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px;">
                            <a href="https://gammarips.com/dashboard" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Go to Your Dashboard</a>
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
    const { text, html } = buildWelcomeEmailContent(name);
    return sendEmail({
        to: `${name} <${to}>`,
        subject: `Welcome to GammaRips!`,
        text,
        html,
    });
}

function buildSubscriptionThankYouEmailContent(name: string): { text: string; html: string } {
    const textContent = `
Thank You for Subscribing, ${name}!

Welcome to GammaRips Pro! We're thrilled to have you as a premium member.

Your support helps us continue to build and improve the tools that power your research. We're committed to providing you with the best AI-driven market insights available.

If you have any questions, feedback, or ideas for how we can improve, please don't hesitate to reach out. You can reply directly to this email or contact us anytime at admin@gammarips.com.

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
    <title>Thank You for Subscribing!</title>
</head>
<body style="margin: 0; padding: 0; background-color: hsl(224, 20%, 12%); font-family: 'Inter', sans-serif; color: #E0E0E0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: hsl(224, 20%, 12%);">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: hsl(224, 20%, 15%); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <h1 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 36px; font-weight: 800; color: #ffffff; margin: 0;">Gamma<span style="color: hsl(74, 80%, 50%);">Rips</span></h1>
                            <p style="font-size: 18px; color: #A0A0A0; margin-top: 12px;">Thank You, ${name}!</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;">
                            <p style="font-size: 16px; line-height: 1.6;">Welcome to <strong>GammaRips Pro!</strong> We're thrilled to have you as a premium member. Your support helps us continue to build and improve the tools that power your research.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">We are committed to providing you with the best AI-driven market insights available. If you have any questions, feedback, or ideas for new features, please don't hesitate to reach out. You can reply directly to this email or contact support anytime at <a href="mailto:admin@gammarips.com" style="color: hsl(74, 80%, 50%); text-decoration: none;">admin@gammarips.com</a>.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px;">
                            <a href="https://gammarips.com/dashboard" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Explore Your Pro Dashboard</a>
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

export async function sendSubscriptionThankYouEmail({ to, name }: { to: string, name: string }) {
    const { text, html } = buildSubscriptionThankYouEmailContent(name);
    return sendEmail({
        to: `${name} <${to}>`,
        subject: `Thank you for subscribing to GammaRips Pro!`,
        text,
        html,
    });
}

function buildTrialReminderEmailContent(name: string): { text: string; html: string } {
    const textContent = `
Hi ${name},

Your GammaRips access will require a subscription soon.

Upgrade to Pro now to keep receiving daily options rippers and full access to your interactive dashboard.

Upgrade to Pro: https://gammarips.com/

If you have any questions, just reply to this email.

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
    <title>Your Access Requires Subscription</title>
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
                            <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">Just a friendly reminder that your access to GammaRips will require a subscription soon. Don't lose access to the AI-powered tools that help you find your analytical edge.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">Upgrade to Pro to keep receiving daily options rippers, full AI Analyst Briefings, and unlimited access to your interactive dashboard.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 30px 40px 40px;">
                            <a href="https://gammarips.com/" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Upgrade to Pro - $19/month</a>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 0 40px 40px; text-align: center; font-size: 12px; color: #A0A0A0;">
                             <p style="margin: 0;">If you have any questions, just reply to this email. We're happy to help.</p>
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

export async function sendTrialReminderEmail({ to, name }: { to: string, name: string }) {
    const { text, html } = buildTrialReminderEmailContent(name);
    return sendEmail({
        to: `${name} <${to}>`,
        subject: `Your GammaRips Access Requires Subscription`,
        text,
        html,
    });
}

function buildReferralEmailContent(name: string, referralLink: string): { text: string; html: string } {
    const suggestedPost = `I'm using GammaRips for AI-driven options trading insights. My link gets you an extended 45-day free trial (usually 7 days) if you want to check it out: ${referralLink}`;
    const twitterShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(suggestedPost)}&hashtags=optionstrading,AI,fintech,tradingtools`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    const redditShareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(referralLink)}&title=${encodeURIComponent("Check out this AI-powered tool for options traders - GammaRips")}`;


    const textContent = `
Hi ${name},

I hope you're finding an edge with GammaRips's AI-driven market insights.

As you continue to explore the tool, I wanted to share a quick way you can give your friends and colleagues that same advantage. We've created a special referral offer. When you use your unique link below, you can give anyone in your network an extended 45-day free trial—on us.

1. Share Directly with a Friend
Know someone specific who would benefit from GammaRips? Just copy your link and send it their way.
Your unique link: ${referralLink}

2. Share on Social Media
Want to share this offer with your wider network? 
Share on X/Twitter: ${twitterShareUrl}
Share on Facebook: ${facebookShareUrl}
Share on Reddit: ${redditShareUrl}

Suggested Post:
I'm using GammaRips for AI-driven options trading insights. My link gets you an extended 45-day free trial (usually 7 days) if you want to check it out:
${referralLink}
#optionstrading #AI #fintech #tradingtools

Thanks for helping spread the word!

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
    <title>Share the edge: Give your friends 45 days of GammaRips</title>
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
                            <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">I hope you're finding an edge with GammaRips's AI-driven market insights.</p>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 16px;">As you continue to explore the tool, I wanted to share a quick way you can give your friends and colleagues that same advantage. We've created a special referral offer. When you use your unique link below, you can give anyone in your network an extended <strong>45-day free trial</strong>—on us.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px 0;">
                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; color: #ffffff; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #393b4d; padding-bottom: 10px;">1. Share Directly with a Friend</h2>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Know someone specific who would benefit? Just copy your link and send it their way.</p>
                            <div style="background-color: #282A3A; border: 1px solid #393b4d; border-radius: 8px; padding: 12px; text-align: center; margin-top: 8px; margin-bottom: 20px;">
                                <a href="${referralLink}" style="font-family: monospace; font-size: 15px; color: hsl(74, 80%, 50%); text-decoration: none; word-break: break-all;">${referralLink}</a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px 0;">
                            <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; color: #ffffff; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #393b4d; padding-bottom: 10px;">2. Share on Social Media</h2>
                            <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Want to share this offer with your wider network? We've made it easy.</p>
                            <table border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; width: 100%;">
                                <tr>
                                    <td align="center" style="padding-right: 5px;">
                                        <a href="${twitterShareUrl}" style="background-color: #393b4d; color: #ffffff; padding: 12px 10px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: block;">X/Twitter</a>
                                    </td>
                                    <td align="center" style="padding-left: 5px; padding-right: 5px;">
                                        <a href="${facebookShareUrl}" style="background-color: #393b4d; color: #ffffff; padding: 12px 10px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: block;">Facebook</a>
                                    </td>
                                     <td align="center" style="padding-left: 5px;">
                                        <a href="${redditShareUrl}" style="background-color: #393b4d; color: #ffffff; padding: 12px 10px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: block;">Reddit</a>
                                    </td>
                                </tr>
                            </table>
                             <p style="font-size: 14px; line-height: 1.6; margin-top: 20px; color: #A0A0A0;">You can also copy and paste the message below:</p>
                             <div style="background-color: #282A3A; border: 1px solid #393b4d; border-radius: 8px; padding: 15px; margin-top: 8px;">
                                <p style="font-size: 14px; line-height: 1.6; margin: 0;">I'm using GammaRips for AI-driven options trading insights. My link gets you an extended 45-day free trial (usually 7 days) if you want to check it out:</p>
                                <p style="font-size: 14px; line-height: 1.6; margin: 10px 0 0;"><a href="${referralLink}" style="color: hsl(74, 80%, 50%); text-decoration: none;">${referralLink}</a></p>
                                <p style="font-size: 14px; line-height: 1.6; margin: 10px 0 0; color: #A0A0A0;">#optionstrading #AI #fintech #tradingtools</p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: left; font-size: 14px; color: #A0A0A0;">
                            <p style="margin: 0;">Thanks for helping spread the word!</p>
                            <p style="margin: 16px 0 0;">All the best,</p>
                            <p style="margin-top: 4px;">Evan P.<br>Founder, GammaRips</p>
                        </td>
                    </tr>
                     <tr>
                        <td style="padding: 20px 40px 20px; text-align: center; font-size: 12px; color: #A0A0A0; border-top: 1px solid #393b4d; margin-top: 20px;">
                             <p style="margin: 0;">&copy; ${new Date().getFullYear()} GammaRips. All rights reserved.</p>
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


export async function sendReferralEmail({ to, name, referralLink }: { to: string; name: string; referralLink: string; }) {
    const { text, html } = buildReferralEmailContent(name, referralLink);
    return sendEmail({
        to: `${name} <${to}>`,
        subject: `Share the edge: Give your friends 45 days of GammaRips`,
        text,
        html,
    });
}

function buildFeedbackRequestEmailContent(name: string): { text: string; html: string } {
    const textContent = `I'm Evan Parra, the founder of GammaRips.

You've been using the tool for about a week now, and I wanted to personally check in. As an early user, your perspective is incredibly valuable for shaping what we build next.

I would be grateful if you could take 60 seconds to share your initial thoughts. Your feedback goes directly to our product team (and me) to help us improve.

Share Your Feedback: https://gammarips.com/feedback

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
                            <a href="https://gammarips.com/feedback" style="background-color: hsl(74, 80%, 50%); color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Share Your Feedback</a>
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
    const { text, html } = buildFeedbackRequestEmailContent(name);
    return sendEmail({
        from: 'GammaRips <admin@gammarips.com>',
        to: `${name} <${to}>`,
        subject: `A personal check-in from GammaRips's founder`,
        text,
        html,
    });
}

function buildFeedbackAcknowledgmentEmailContent(trackingId: string): { text: string; html: string } {
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
    const { text, html } = buildFeedbackAcknowledgmentEmailContent(trackingId);
    return sendEmail({
        to,
        subject: `We've received your message (Ref: ${trackingId})`,
        text,
        html,
    });
}


function buildAgentResponseEmailContent({ userEmail, response, trackingId }: { userEmail: string, response: string, trackingId: string }): { text: string; html: string } {
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
    const { text, html } = buildAgentResponseEmailContent({ userEmail: to, response, trackingId });
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
