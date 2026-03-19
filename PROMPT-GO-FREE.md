# PROMPT: Make GammaRips 100% Free — Remove All Paywalls

## Goal
Remove all subscription gating so every visitor gets full access to all content without logging in or paying. Keep the auth system intact (users can still create accounts) but stop using it to restrict content. No features should be behind a paywall.

## Context
- Plans: `free`, `edge` ($49/mo), `warroom` ($149/mo)
- User docs in Firestore `users` collection have: `isSubscribed`, `plan`, `subscriptionStatus`
- Content gating happens client-side by checking `dbUser?.isSubscribed` and `dbUser?.plan`
- There is no middleware.ts — all gating is in React components
- Stripe checkout and webhooks exist but can stay dormant

---

## Changes Required

### 1. Signal Detail Page — `src/app/signals/[ticker]/signal-client.tsx`
- Currently checks `const isSubscribed = !!dbUser?.isSubscribed` and blurs/hides: AI trade thesis, contract recommendations, key levels, technicals, catalyst info
- **Change:** Remove all `!isSubscribed` conditional rendering. Show all content to everyone regardless of auth state.
- Remove the upgrade/paywall overlay cards that appear when `!isSubscribed && !loading`
- Keep the `useAuth()` hook if needed for other purposes (e.g., showing username) but don't gate any content on it

### 2. Arena Page — `src/app/arena/arena-client.tsx`
- Currently checks `const hasAccess = dbUser?.plan === 'warroom' || dbUser?.subscriptionStatus === 'founder_lifetime'`
- **Change:** Remove the `hasAccess` gate entirely. Show the full debate, rounds, consensus, and agent picks to everyone.
- Remove any "upgrade to War Room" prompts or locked-content overlays

### 3. Pricing Page — `src/app/pricing/pricing-client.tsx`
- Currently shows 3-tier pricing table (Free / $49 Edge / $149 War Room)
- **Change:** Replace the entire pricing page with a simple message:
  - Headline: "GammaRips is Free"
  - Body: "Every overnight signal, AI trade thesis, contract recommendation, and Agent Arena debate — completely free. We're building in public and proving our edge before we charge for anything."
  - Remove the Subscribe buttons and Stripe checkout triggers
  - Optionally add a "Create Free Account" button linking to /auth for users who want to save preferences

### 4. Pricing Feature Table — same file
- The `features` array defines what's free/edge/war
- **Change:** Set ALL features to `free: true` (or just remove the tier columns entirely since everything is free)

### 5. Homepage / Landing — `src/app/page.tsx`
- Review for any "Subscribe" or "$49/mo" or "War Room $149" language
- **Change:** Update CTAs to "View Signals" or "Explore Free" instead of "Subscribe"
- Remove any pricing references from the hero section

### 6. Navigation / Header — `src/components/layout/public-header.tsx`
- If there are "Upgrade" or "Subscribe" links in the nav, change them to just link to /signals or /arena
- Keep "Sign In" if you want account creation, but it shouldn't be required to view anything

### 7. Account Page — `src/app/account/page.tsx`
- Review for subscription management UI
- **Change:** Remove or hide the subscription/billing section since there's nothing to manage
- Keep basic account info (email, display name) if applicable

### 8. Stripe Checkout Route — `src/app/api/checkout/route.ts`
- **Change:** You can leave this file in place but it won't be triggered since Subscribe buttons are removed. No code change strictly necessary, but you can add a comment: `// Checkout disabled — GammaRips is free`

### 9. Stripe Webhook — `src/app/api/stripe/webhook/route.ts`
- **Change:** Same as above — leave in place but dormant. No active subscriptions to process.

### 10. Default User State — `src/lib/firebase.ts` and `src/lib/firebase-admin.ts`
- Currently defaults new users to `isSubscribed: false` and `plan: 'free'`
- **Change:** Default new users to `isSubscribed: true` and `plan: 'warroom'` so if any gating logic was missed, they still get full access
- In `firebase-admin.ts` line ~434: change `isSubscribed: false` to `isSubscribed: true`
- In `firebase.ts` line ~116: change `isSubscribed: false` to `isSubscribed: true`  
- In `firebase.ts` line ~120: change `plan: 'free'` to `plan: 'warroom'`

### 11. SEO / Meta — `src/app/pricing/page.tsx` or layout
- Update meta title/description to reflect free access
- Something like: "GammaRips — Free Overnight Options Intelligence"

---

## What NOT to Change
- **Keep Firebase Auth** — users can still sign up/log in for personalization later
- **Keep Stripe files** — just dormant, not deleted. We may re-enable paid tiers later
- **Keep the Firestore user schema** — don't remove `isSubscribed` or `plan` fields
- **Keep the MCP server** — already free, no changes needed
- **Keep all data pipelines** — overnight scanner, enrichment, arena all stay the same

## Testing
After changes:
1. Visit /signals as a logged-out user → should see full signal details (thesis, contracts, levels)
2. Visit /signals/AAPL (or any ticker) as logged-out → no blur, no paywall overlay
3. Visit /arena as logged-out → full debate visible
4. Visit /pricing → shows "GammaRips is Free" message
5. Create a new account → user doc should have `isSubscribed: true`, `plan: 'warroom'`
6. No subscribe/checkout buttons anywhere on the site

## Deploy
Deploy to Firebase Hosting after all changes verified locally.
