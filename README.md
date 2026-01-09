# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Local Development Setup

To run the application locally, you need to set up your environment variables.

1.  **Create a `.env` file** in the root of your project if it doesn't exist.
2.  **Add the credentials listed below** to the `.env` file.

Your final `.env` file will look something like this:

```env
# Firebase Client SDK Configuration (for the browser)
# Found in Firebase Console > Project Settings > Your Apps > Web App > SDK Snippet > Config
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"

# Firebase Admin SDK Configuration (for the server)
# Found in Firebase Console > Project Settings > Service Accounts > Generate new private key
FIREBASE_PROJECT_ID="YOUR_PROJECT_ID_FROM_SERVICE_ACCOUNT"
FIREBASE_CLIENT_EMAIL="YOUR_CLIENT_EMAIL_FROM_SERVICE_ACCOUNT"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Generative AI (Gemini)
# Found in Google AI Studio (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Stripe (Payments & Subscriptions)
# Found in Stripe Dashboard > Developers > API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_BILLING_PORTAL_CONFIG_ID="bpc_..."

# Mailgun (Email Sending)
# Found in Mailgun Dashboard > Sending > Domain Settings > Sending API keys
MAILGUN_SENDING_KEY="YOUR_MAILGUN_API_KEY"

# Financial Data APIs
# Create accounts and get keys from their respective websites
FMP_API_KEY="YOUR_FINANCIAL_MODELING_PREP_API_KEY"
POLYGON_API_KEY="YOUR_POLYGON_IO_API_KEY"

# Google Analytics (for purchase tracking)
# Found in Google Analytics Admin > Data Streams > Your Web Stream
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
# Create this in GA Admin > Data Streams > Measurement Protocol API secrets
GA_API_SECRET="YOUR_GA_API_SECRET"

# App Hosting Cron Secret
# A secret string of your choice to secure cron job endpoints. Must match apphosting.yaml.
CRON_SECRET="GammaRipsCron2025"

# Model Context Protocol Server (if used)
MCP_SERVER_URL="YOUR_MCP_SERVER_URL"

```

**Note:** After populating your `.env` file, you must **restart your local development server** for the changes to take effect.
