
const admin = require("firebase-admin");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2/options");
const winston = require("winston");

// Removed genkit, zod, fs, and resolve as the AI logic is now handled by the Next.js app.

setGlobalOptions({
  region: "us-central1",
  memory: "512MiB",
  timeoutSeconds: 120,
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

admin.initializeApp();

// This function now calls the Next.js app's endpoint where the real AI flow lives.
async function answerFeedbackViaApp(input) {
    const APP_URL = process.env.APP_HOSTING_URL;
    const GENKIT_API_KEY = process.env.GENKIT_API_KEY;

    if (!APP_URL || !GENKIT_API_KEY) {
        throw new Error("Missing required environment variables: APP_HOSTING_URL or GENKIT_API_KEY.");
    }
    
    // The path corresponds to the `answerFeedback` flow.
    const endpoint = `${APP_URL}/api/genkit/flow/answerFeedback`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GENKIT_API_KEY}`,
        },
        body: JSON.stringify({ input }),
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Failed to call app AI flow: ${response.status} ${errorDetails}`);
    }

    const result = await response.json();
    return result.output; // The output of the Genkit flow is nested here
}


async function sendAgentResponseEmail({ to, response, trackingId }) {
    const API_KEY = process.env.MAILGUN_SENDING_KEY;
    const DOMAIN = 'profitscout.app';
    const FROM = 'GammaRips <admin@profitscout.app>'; // Corrected branding
    const REPLY_TO = process.env.MY_PERSONAL_EMAIL;

    if (!API_KEY || !REPLY_TO) {
        throw new Error("Mailgun environment variables (MAILGUN_SENDING_KEY, MY_PERSONAL_EMAIL) are not set.");
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <body>
        <div>Response to Your Inquiry (Ref: ${trackingId})</div>
        <div style="border-left: 2px solid #ccc; padding-left: 15px; margin-top: 20px;">
            ${response.replace(/\n/g, '<br>')}
        </div>
        <p>If you have any further questions, please reply to this email.</p>
    </body>
    </html>
    `;
    const text = `Response to your inquiry (Ref: ${trackingId}):\n\n${response}\n\nIf you have further questions, reply to this email.`;

    const form = new URLSearchParams();
    form.append('from', FROM);
    form.append('to', to);
    form.append('subject', `Re: Your GammaRips Inquiry (Ref: ${trackingId})`); // Corrected branding
    form.append('text', text);
    form.append('html', html);
    form.append('h:Reply-To', REPLY_TO);

    const resp = await fetch(`https://api.mailgun.net/v3/${DOMAIN}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`api:${API_KEY}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
    });

    if (!resp.ok) {
        const details = await resp.json().catch(() => ({}));
        logger.error('Mailgun Failure', { status: resp.status, details });
        throw new Error(`Mailgun API error: ${details.message || 'Failed to send'}`);
    }
    return resp.json();
}

exports.processNewFeedback = onDocumentCreated("feedback/{feedbackId}", async (event) => {
    // This is the correct way to get the snapshot for a 2nd Gen function
    const snap = event.data.data;

    if (!snap) {
        logger.error("processNewFeedback triggered without snapshot data.", { eventId: event.id });
        return;
    }

    const newFeedback = snap.data();
    const { feedbackId } = event.params;

    logger.info("Processing new feedback", { feedbackId });

    if (!newFeedback?.message || !newFeedback?.replyToEmail || !newFeedback?.trackingId) {
        logger.error("Feedback document is missing required fields.", { feedbackId });
        await snap.ref.set({
            status: "error",
            errorMessage: "Missing message, replyToEmail, or trackingId",
            checkedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        return;
    }

    try {
        // Call the centralized AI flow in the Next.js app
        const aiResponse = await answerFeedbackViaApp({
            message: newFeedback.message,
            trackingId: newFeedback.trackingId,
        });

        if (!aiResponse || !aiResponse.response) {
            throw new Error("AI agent did not return a valid response object.");
        }

        await sendAgentResponseEmail({
            to: newFeedback.replyToEmail,
            response: aiResponse.response,
            trackingId: newFeedback.trackingId,
        });

        await snap.ref.set({
            agentResponse: aiResponse.response,
            status: "responded",
            respondedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        logger.info("Successfully processed feedback", { feedbackId });
    } catch (error) {
        logger.error("Failed to process feedback", { feedbackId, error: error.message, stack: error.stack });
        await snap.ref.set({ status: "error", errorMessage: error.message }, { merge: true });
    }
});
