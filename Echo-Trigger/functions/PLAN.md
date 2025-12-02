# Deploying a 2nd Gen Serverless Cloud Function

This guide provides instructions for deploying a 2nd Generation Cloud Function that is triggered by an event in Firestore.

**Prerequisites:** You must have `Editor` or `Owner` permissions on the GCP/Firebase project and be logged into the Google Cloud Console.

---

### Step 1: Navigate to Cloud Functions

1.  Open the **Google Cloud Console** for your project (`profitscout-fida8`).
2.  Using the navigation menu, go to **Cloud Functions**.
3.  Click the **"Create function"** button.

---

### Step 2: Configure the Function's Trigger

This is the most critical step. The function must be event-driven.

1.  **Environment:** Select **`2nd gen`**.
2.  **Function name:** Enter `processNewFeedback`.
3.  **Region:** Select `us-central1`.
4.  **Trigger type:** In the "Trigger" section, select **`Eventarc`**.
5.  **Event provider:** Select **`Cloud Firestore`**.
6.  **Event type:** Select **`google.cloud.firestore.document.v1.created`**.
7.  **Document path:** Enter the exact path: `feedback/{feedbackId}`.
8.  Click **"Save trigger"**.

---

### Step 3: Configure Runtime and Code

1.  Click **"Next"** to proceed to the code section.
2.  **Runtime:** Select **`Node.js 20`**.
3.  **Source code:** Keep the "Inline editor" option selected.
4.  **Entry point:** Enter `processNewFeedback`.

---

### Step 4: Update package.json

In the inline editor, select the `package.json` file. Replace its entire contents with the following JSON to declare the necessary dependencies.

```json
{
  "name": "gammarips-cloud-functions",
  "description": "Cloud Functions for the GammaRips project.",
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.1",
    "@genkit-ai/googleai": "^1.14.1",
    "genkit": "^1.14.1",
    "winston": "^3.13.0",
    "zod": "^3.24.2"
  },
  "engines": {
    "node": "20"
  },
  "private": true
}
```

---

### Step 5: Add the Function Code to index.js

Select the `index.js` file in the editor. Replace its entire contents with the code from your local `index.js` file. This code has been updated to use the correct Genkit syntax and will work in the 2nd Gen environment.

```javascript
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
    const DOMAIN = 'gammarips.com';
    const FROM = 'GammaRips <admin@gammarips.com>';
    const REPLY_TO = process.env.MY_PERSONAL_EMAIL;

    if (!API_KEY || !REPLY_TO) {
        throw new Error("Mailgun environment variables (MAILGUN_SENDING_KEY, MY_PERSONAL_EMAIL) are not set.");
    }

    const html = \`
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
    \`;
    const text = \`Response to your inquiry (Ref: ${trackingId}):\n\n${response}\n\nIf you have further questions, reply to this email.\`;

    const form = new URLSearchParams();
    form.append('from', FROM);
    form.append('to', to);
    form.append('subject', \`Re: Your GammaRips Inquiry (Ref: ${trackingId})\`);
    form.append('text', text);
    form.append('html', html);
    form.append('h:Reply-To', REPLY_TO);

    const resp = await fetch(\`https://api.mailgun.net/v3/${DOMAIN}/messages\`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(\`api:${API_KEY}\`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
    });

    if (!resp.ok) {
        const details = await resp.json().catch(() => ({}));
        logger.error('Mailgun Failure', { status: resp.status, details });
        throw new Error(\`Mailgun API error: ${details.message || 'Failed to send'}\`);
    }
    return resp.json();
}

exports.processNewFeedback = onDocumentCreated("feedback/{feedbackId}", async (event) => {
    const snap = event.data;

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
```

---

### Step 6: Set Environment Variables

This function requires access to secret keys.

1.  Under "Runtime, build and connections settings", find the **"Runtime environment variables"** tab.
2.  Click **"Add variable"** and add the following keys and their corresponding secret values:
    *   `MAILGUN_SENDING_KEY`: [Your Mailgun API Key]
    *   `MY_PERSONAL_EMAIL`: [Your personal email for the "Reply-To" header]
    *   `GEMINI_API_KEY`: [Your Google AI/Gemini API Key]

---

### Step 7: Deploy the Function

Click the **"Deploy"** button at the bottom of the page. After a few minutes, the function will be deployed and active. It will **not** have a public URL, confirming it is an event-driven function.
