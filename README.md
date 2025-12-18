# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Local Development Setup

To run the application locally, you need to set up your environment variables.

1.  **Create a `.env` file** in the root of your project if it doesn't exist.
2.  **Add your Firebase Client and Server credentials** to the `.env` file.

### Client-Side SDK Credentials

You can find these in your Firebase project settings:
*   Go to your [Firebase Console](https://console.firebase.google.com/).
*   Select your project.
*   Click the gear icon next to "Project Overview" and select "Project settings".
*   In the "Your apps" card, select your web app.
*   Under "Firebase SDK snippet", choose the "Config" option.
*   Copy the values and add them to your `.env` file for the `NEXT_PUBLIC_FIREBASE_*` variables.

### Server-Side (Admin) SDK Credentials

For server-side operations, you need a service account key.

*   In your Firebase project settings, go to the "Service accounts" tab.
*   Click "Generate new private key". A JSON file will be downloaded.
*   **Do not commit this file to your repository.**
*   Open the JSON file and copy the following values into your `.env` file:
    *   `project_id` -> `FIREBASE_PROJECT_ID`
    *   `client_email` -> `FIREBASE_CLIENT_EMAIL`
    *   `private_key` -> `FIREBASE_PRIVATE_KEY` (Ensure the entire key, including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`, is enclosed in double quotes).

Your final `.env` file will look something like this:

```env
# Firebase Client SDK Configuration (for the browser)
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"

# Firebase Admin SDK Configuration (for the server)
FIREBASE_PROJECT_ID="YOUR_PROJECT_ID_FROM_SERVICE_ACCOUNT"
FIREBASE_CLIENT_EMAIL="YOUR_CLIENT_EMAIL_FROM_SERVICE_ACCOUNT"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# ... other variables ...
```

**Note:** After populating your `.env` file, you must **restart your local development server** for the changes to take effect.
