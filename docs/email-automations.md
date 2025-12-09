# Email Automations

This document outlines the core email automations running for the GammaRips application.

## 1. Onboarding & Engagement

### Welcome Email (On New Subscription)
- **Trigger:** A new user successfully completes the Stripe checkout and their subscription becomes active (`customer.subscription.created` or `checkout.session.completed` webhook).
- **Purpose:** Welcomes the new subscriber, confirms their access, and guides them on how to get started with the dashboard.
- **File:** `src/app/api/stripe/webhook/route.ts` calls `sendWelcomeEmail` from `src/lib/mailgun.ts`.

### Feedback Request Email (Periodic)
- **Trigger:** A cron job (`/api/cron/send-feedback-requests`) runs daily, triggering a flow that finds users who signed up at specific intervals (e.g., 7, 28, 112 days ago).
- **Purpose:** Proactively asks for feedback to improve the product and engage the user base.
- **File:** `src/ai/flows/send-feedback-requests.ts`

## 2. Daily Market Briefings (Cron-based)

### Daily Setups Email ("Top Trade Ideas")
- **Trigger:** A daily cron job (`/api/cron/send-daily-setups`).
- **Purpose:** Delivers the main daily digest of top-rated Call setups, Put setups, and a list of recent top-performing contracts. This is the core "playbook" email.
- **File:** `src/ai/flows/send-daily-setups.ts`

### Top Pick of the Day Email
- **Trigger:** A daily cron job (`/api/cron/send-top-pick`).
- **Purpose:** A separate, focused email that highlights the single highest-rated stock (`weighted_score`) from the `winners_dashboard` for that day. It includes a short, enticing AI-generated summary.
- **File:** `src/ai/flows/send-top-pick.ts`

## 3. User Feedback & Support

### Feedback Acknowledgment (Instant)
- **Trigger:** A user submits a message via the main contact form on the website.
- **Purpose:** Instantly confirms that the message has been received and provides a tracking ID for the user's reference.
- **File:** The `handleFeedback` server action in `src/app/actions.ts` calls `sendFeedbackAcknowledgmentEmail` from `src/lib/mailgun.ts`.

### AI Agent Response (Asynchronous)
- **Trigger:** The `processNewFeedback` Cloud Function completes processing a user's inquiry with the Genkit AI agent.
- **Purpose:** Delivers the AI-generated answer directly to the user's inbox and provides a "Reply-To" address for further human assistance if needed.
- **File:** `Echo-Trigger/functions/index.js` calls `sendAgentResponseEmail` from `src/lib/mailgun.ts`.
