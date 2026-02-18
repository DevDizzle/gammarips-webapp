# PROMPT: War Room WhatsApp Access Gate

## Context
GammaRips has two paid tiers managed via Stripe:
- **The Overnight Edge** ($49/mo) — `price_1Rrp8HCibMPRXbgJh7zlSME1`
- **The War Room** ($149/mo) — `price_1Rrp8kCibMPRXbgJjdKBhyqo`

War Room subscribers get access to a private WhatsApp group with live institutional flow alerts from GammaMolt (our AI analyst). The WhatsApp invite link must ONLY be shown to confirmed War Room subscribers.

Evan (founder) has lifetime access: Firestore `users/{uid}` doc with `plan: "warroom"` and `subscriptionStatus: "founder_lifetime"`.

## What to Build

### 1. Stripe Webhook Handler (`/api/webhooks/stripe`)

If a webhook route already exists, extend it. Otherwise create one.

**Listen for these events:**
- `checkout.session.completed` — New subscription
- `customer.subscription.updated` — Plan changes
- `customer.subscription.deleted` — Cancellation/churn

**On `checkout.session.completed`:**
```
1. Extract customer email + subscription details from the session
2. Look up Firestore user by email (query `users` collection where `email == session.customer_email`)
3. If user found, update their doc:
   - plan: "edge" or "warroom" (based on price ID)
   - subscriptionStatus: "active"
   - stripeCustomerId: session.customer
   - stripeSubscriptionId: session.subscription
   - subscribedAt: serverTimestamp()
4. If no user found, create a pending record in `pending_subscriptions` collection
```

**On `customer.subscription.updated`:**
```
1. Look up user by stripeCustomerId
2. Update plan based on current price ID
3. Update subscriptionStatus based on subscription.status
```

**On `customer.subscription.deleted`:**
```
1. Look up user by stripeCustomerId
2. Set subscriptionStatus: "canceled"
3. Set canceledAt: serverTimestamp()
4. Keep plan field (for win-back messaging)
```

**Price ID → Plan mapping:**
```typescript
const PRICE_TO_PLAN: Record<string, string> = {
  'price_1Rrp8HCibMPRXbgJh7zlSME1': 'edge',
  'price_1Rrp8kCibMPRXbgJjdKBhyqo': 'warroom',
};
```

**Stripe webhook signature verification is required.** Use the `STRIPE_WEBHOOK_SECRET` environment variable. Add it to Firebase config/secrets if not already there.

### 2. Gated War Room Page (`/war-room`)

**Route:** `/war-room`
**Auth required:** Yes (Firebase Auth)

**Logic:**
```
1. Check if user is authenticated → if not, redirect to /login or show sign-in prompt
2. Fetch user's Firestore doc from `users/{uid}`
3. Check access:
   - ALLOW if: plan == "warroom" AND (subscriptionStatus == "active" OR subscriptionStatus == "founder_lifetime")
   - DENY otherwise
4. If DENIED: show upgrade CTA pointing to /pricing with War Room highlighted
5. If ALLOWED: show the War Room welcome page with WhatsApp invite link
```

**Allowed page content:**
```
# Welcome to The War Room 🔴

You're in. Here's your access to GammaRips' live institutional flow intelligence.

## Join the WhatsApp Group
[Join The War Room] → https://chat.whatsapp.com/GaND1Tga8dJ6P0gFnpRwVI

## What You'll Receive
- **6:00 AM EST** — Daily Overnight Edge report (top signals + market narrative)
- **9:30 AM EST** — Pre-market enriched picks (score ≥ 6 with catalysts)
- **Intraday** — High-conviction alerts on 3-sigma moves
- **4:30 PM EST** — Win tracker results (signal performance)

## Rules
- Do NOT share the invite link
- Do NOT screenshot alerts for redistribution
- Questions? Email support@gammarips.com

## Your Analyst
GammaMolt is our AI-powered institutional flow analyst. It scans overnight options activity, 
enriches signals with news and technicals, and delivers actionable intelligence before the market opens.
```

**Denied page content:**
```
# The War Room 🔒

The War Room is our premium live signals channel — real-time institutional flow alerts 
delivered straight to your WhatsApp by GammaMolt, our AI analyst.

## What's Included
- Pre-market overnight flow signals (scored & enriched)
- Intraday high-conviction alerts
- Daily performance tracking
- Direct analyst access

[Upgrade to War Room — $149/mo] → link to Stripe checkout for warroom price
```

### 3. Post-Checkout Redirect

When creating Stripe checkout sessions (wherever that code lives), set:
```typescript
const session = await stripe.checkout.sessions.create({
  // ... existing config
  success_url: `${BASE_URL}/war-room?session_id={CHECKOUT_SESSION_ID}`,
  // For edge tier:
  // success_url: `${BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
});
```

This way War Room subscribers land directly on the gated page after paying.

### 4. Subscribe Button Fix

The "Subscribe" buttons on the `/pricing` page should create Stripe Checkout sessions. If they're not already wired up:

```typescript
// API route: /api/checkout
export async function POST(req: Request) {
  const { priceId } = await req.json();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: priceId === 'price_1Rrp8kCibMPRXbgJjdKBhyqo'
      ? `${BASE_URL}/war-room?session_id={CHECKOUT_SESSION_ID}`
      : `${BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/pricing`,
    customer_email: currentUserEmail, // if available from Firebase Auth
  });
  return Response.json({ url: session.url });
}
```

## Environment Variables Needed
- `STRIPE_SECRET_KEY` — already should exist
- `STRIPE_WEBHOOK_SECRET` — from Stripe Dashboard → Webhooks → Signing secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — already should exist

## File Structure (suggested)
```
app/
  war-room/
    page.tsx          ← Gated War Room page
  api/
    webhooks/
      stripe/
        route.ts      ← Stripe webhook handler
    checkout/
      route.ts        ← Create checkout session
```

## Important Notes
- The WhatsApp invite link (`https://chat.whatsapp.com/GaND1Tga8dJ6P0gFnpRwVI`) should be stored in a Firestore config doc or environment variable so we can rotate it without redeploying
- **Never expose the invite link in client-side code** — it should only render after server-side subscription verification
- Founder lifetime access: check for `subscriptionStatus == "founder_lifetime"` — this bypasses Stripe entirely
- All Stripe webhook events should be logged to a `stripe_events` Firestore collection for debugging
- Use `stripe.webhooks.constructEvent()` for signature verification — never skip this

## Testing
1. Use Stripe test mode to create a subscription
2. Verify Firestore user doc updates correctly
3. Visit `/war-room` — should show invite link
4. Cancel subscription in Stripe → verify page shows upgrade CTA
5. Verify Evan's founder access works without Stripe
