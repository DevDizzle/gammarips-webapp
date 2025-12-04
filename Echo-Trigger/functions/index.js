const admin = require("firebase-admin");
const { genkit } = require("genkit");
const { googleAI } = require("@genkit-ai/googleai");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2/options");
const winston = require("winston");
const { z } = require("zod");
const { readFileSync } = require("fs");
const { resolve } = require("path");

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

const ai = genkit({
  plugins: [googleAI()],
});

const knowledgeBasePath = resolve(__dirname, "knowledge", "customer-service-policy.md");
const knowledgeBase = readFileSync(knowledgeBasePath, "utf-8");

const AnswerFeedbackInputSchema = z.object({
  message: z.string(),
  trackingId: z.string(),
});

const AnswerFeedbackOutputSchema = z.object({
  response: z.string(),
});

const prompt = ai.definePrompt({
  name: 'customerServiceAgentPrompt',
  input: {schema: AnswerFeedbackInputSchema},
  output: {schema: AnswerFeedbackOutputSchema},
  prompt: `You are an expert customer service agent for GammaRips, an AI-powered options trading research tool. Your goal is to provide a helpful, empathetic, and professional response to user feedback. You MUST strictly adhere to the policies and tone outlined in the knowledge base. Never give financial advice.

Knowledge Base:
---
{{{knowledgeBase}}}
---

User's Message:
"{{{message}}}"

Generate a helpful response to the user.`,
});

const customerServiceAgentFlow = ai.defineFlow({
    name: 'customerServiceAgentFlow',
    inputSchema: AnswerFeedbackInputSchema,
    outputSchema: AnswerFeedbackOutputSchema,
}, async (input) => {
    const { output } = await prompt({ ...input, knowledgeBase });
    if (!output) {
        throw new Error("AI Agent failed to generate an output.");
    }
    return output;
});

async function sendAgentResponseEmail({ to, response, trackingId }) {
    const API_KEY = process.env.MAILGUN_SENDING_KEY;
    const DOMAIN = 'profitscout.app';
    const FROM = 'GammaRips <admin@profitscout.app>';
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
    form.append('subject', `Re: Your GammaRips Inquiry (Ref: ${trackingId})`);
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
    const snap = event.data.data;

    if (!snap) {
        logger.error("processNewFeedback triggered without snapshot", { eventId: event.id });
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
        const aiResponse = await customerServiceAgentFlow({
            message: newFeedback.message,
            trackingId: newFeedback.trackingId,
        });

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
        logger.error("Failed to process feedback", { feedbackId, error: error.message });
        await snap.ref.set({ status: "error", errorMessage: error.message }, { merge: true });
    }
});
