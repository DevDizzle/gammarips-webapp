# MCP API Key Lifecycle (Phase 3)

How a subscriber gets, uses, and loses an MCP API key. This is the webapp side
of the `gammarips-mcp` auth contract (the MCP server reads `mcp_api_keys/{hash}`;
this app owns all writes).

## The contract with the MCP server

- **Key:** `gr_live_` + 32 hex chars. Sent by the agent as
  `Authorization: Bearer <key>`.
- **Storage:** `mcp_api_keys/{sha256(key)}` → `{ uid, tier: 'pro', status:
  'active'|'revoked', keyPrefix, createdAt, source, revokedAt?, revokedReason? }`.
  The raw key is NEVER stored — only its SHA-256 (the doc id). Hashing must match
  the server: `sha256(rawKey utf-8) hex`.
- The MCP grants pro **only** on `status=='active' AND tier=='pro'`, and caches a
  resolved identity for ~120s — so a revoke takes effect within ~2 minutes.
- Firestore rules: `mcp_api_keys` is Admin-SDK-only (no client access).

## Customer journey

1. **Discover (anon).** The agent uses free-tier MCP tools; a pro tool returns
   `subscription_required` with the pricing URL → the agent tells its human.
2. **Sign up.** Google sign-in → `users/{uid}`.
3. **Subscribe.** `/pricing` → `createCheckoutSession` (Stripe Checkout,
   subscription mode, 7-day trial). Stripe creates the Customer; `stripeCustomerId`
   is saved on the user.
4. **Entitlement.** Stripe → webhook `checkout.session.completed` /
   `customer.subscription.created` → `setUserSubscriptionStatusAdmin(true, …)`
   (`isSubscribed`, `plan`, `proUntil`+2-day grace). **No key is minted here.**
5. **Generate key (self-serve, show-once).** `/account` → "Generate API Key" →
   server action `generateMcpApiKey(idToken)` verifies the token, re-checks
   *real* entitlement server-side (`isUserMcpEntitledAdmin` — subscribed / trial /
   founder; deliberately ignores site-wide `FREE_MODE`), and calls
   `provisionMcpKeyAdmin`. The raw key is shown once; only its hash is stored.
6. **Wire the agent.** User pastes the key into their MCP client config.
7. **Use.** Each call: MCP hashes → `mcp_api_keys` get (cached 120s) → pro.

## How access is revoked when they stop paying (automated, two layers)

**Layer 1 — real-time (Stripe webhook).** On a terminal subscription status
(`canceled`, `unpaid`, `incomplete_expired`) or `customer.subscription.deleted`,
the webhook calls `revokeMcpKeysForUserAdmin(uid, …)`. `past_due` is left active
during dunning (matches the 2-day `proUntil` grace). Access dies within ~120s.

**Layer 2 — reconciliation cron (safety net for missed webhooks).**
`POST /api/cron/reconcile-keys` (secret-gated) walks every ACTIVE key, verifies
each owner against **Stripe** (the source of truth — retrieves the subscription;
entitled only if `active`/`trialing`/`past_due`; founders always entitled), and
revokes + resyncs any mismatch. Idempotent; safe to run anytime.

### Cron setup (Cloud Scheduler → the App Hosting URL)

```bash
# One-time: create the shared secret + set it on the webapp env, then:
gcloud scheduler jobs create http mcp-reconcile-keys \
  --project=profitscout-fida8 --location=us-central1 \
  --schedule="0 8 * * *" --time-zone="America/New_York" \
  --uri="https://gammarips.com/api/cron/reconcile-keys" \
  --http-method=POST \
  --headers="x-reconcile-secret=<RECONCILE_CRON_SECRET>"
```

## Rotation & manual revoke

- **Rotate:** `/account` → "Regenerate" → old hash revoked, new key minted, shown
  once (`provisionMcpKeyAdmin` enforces one active key per user).
- **Manual revoke:** `/account` → "Revoke" (`revokeMcpApiKey`) for a suspected leak.

## Required env vars

| Var | Purpose |
|---|---|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe API + webhook signature |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` (or `NEXT_PUBLIC_STRIPE_PRICE_ID`) | the $39 MCP price |
| `NEXT_PUBLIC_STRIPE_BILLING_PORTAL_CONFIG_ID` | Customer Portal (cancel/update card) |
| `RECONCILE_CRON_SECRET` | shared secret for the reconciliation cron |
| `FIREBASE_*` / ADC | Admin SDK (Firestore + Auth) |

## Go-live checklist

1. Register the Stripe webhook endpoint (`/api/stripe/webhook`) for events:
   `checkout.session.completed`, `customer.subscription.created|updated|deleted`,
   `customer.subscription.trial_will_end`. Set `STRIPE_WEBHOOK_SECRET`.
2. Set the $39 price id + Billing Portal config id + `RECONCILE_CRON_SECRET`.
3. Create the reconciliation Cloud Scheduler job (above).
4. Deploy the webapp; verify `/account` generate → key resolves on the MCP.
5. Flip the MCP server to enforce: `REQUIRE_API_KEY=true` (env flip, no redeploy).
