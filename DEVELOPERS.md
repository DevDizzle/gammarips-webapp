# PROMPT: Update GammaRips /developers Page

## Objective
Remove all free trial/refund messaging from the developers page and update to paid-only subscription model at $19/mo.

---

## Files to Modify

### 1. `/src/app/developers/page.tsx` (Metadata)

**Current:**
```tsx
description: "Connect your AI agent to GammaRips MCP. Get high-conviction options signals, performance tracking, and market analysis. 14-day free trial, then $19/mo.",
```

**Update to:**
```tsx
description: "Connect your AI agent to GammaRips MCP. High-conviction options signals, performance tracking, and market analysis. $19/mo.",
```

**Current (OpenGraph):**
```tsx
description: "High-conviction options signals for AI agents. +114% avg gain. Connect via MCP.",
```

**Update to:**
```tsx
description: "High-conviction options signals for AI agents. 64% win rate. $19/mo. Connect via MCP.",
```

---

### 2. `/src/app/developers/developer-page-client.tsx`

#### Section: Hero badges (around line 55)
**Remove this line:**
```tsx
<span className="px-3 py-1 bg-muted rounded-full">✓ 14-Day Free Trial</span>
```

**Replace with:**
```tsx
<span className="px-3 py-1 bg-muted rounded-full">✓ $19/mo</span>
```

---

#### Section: CTA for logged out users (around line 85-105)
**Current:**
```tsx
<div className="space-y-4">
  <p className="text-muted-foreground">
    Start your 14-day free trial. No credit card required.
  </p>
  <Button size="lg" onClick={() => setAuthOpen(true)}>
    Sign Up Free →
  </Button>
  <p className="text-xs text-muted-foreground">
    Already have an account?{" "}
    <button onClick={() => setAuthOpen(true)} className="text-primary hover:underline">
      Sign in
    </button>
  </p>
</div>
```

**Update to:**
```tsx
<div className="space-y-4">
  <p className="text-muted-foreground">
    Get instant access to all 17 MCP tools for $19/mo.
  </p>
  <Button size="lg" onClick={() => setAuthOpen(true)}>
    Subscribe Now →
  </Button>
  <p className="text-xs text-muted-foreground">
    Already have an account?{" "}
    <button onClick={() => setAuthOpen(true)} className="text-primary hover:underline">
      Sign in
    </button>
  </p>
</div>
```

---

#### Section: Pricing cards (around line 175-210)
**Delete the entire "Free Trial" card:**
```tsx
<div className="p-6 rounded-lg border bg-card">
  <div className="text-sm text-muted-foreground mb-2">Free Trial</div>
  <div className="text-3xl font-bold mb-4">14 days</div>
  <ul className="space-y-2 text-sm text-muted-foreground">
    <li>✓ Full API access</li>
    <li>✓ All 17 tools included</li>
    <li>✓ No credit card required</li>
    <li>✓ Unlimited calls during trial</li>
  </ul>
</div>
```

**Update the Pro card to be full-width (remove md:grid-cols-2, make single card):**
```tsx
<section className="space-y-6">
  <h2 className="text-2xl font-bold font-headline">Pricing</h2>
  
  <div className="max-w-md mx-auto">
    <div className="p-6 rounded-lg border-2 border-primary bg-card">
      <div className="text-sm text-primary mb-2">Pro</div>
      <div className="text-3xl font-bold mb-4">$19<span className="text-lg text-muted-foreground">/mo</span></div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>✓ Full API access</li>
        <li>✓ All 17 MCP tools</li>
        <li>✓ Unlimited API calls</li>
        <li>✓ Priority support</li>
        <li>✓ Early access to new tools</li>
        <li>✓ Direct line to GammaMolt</li>
      </ul>
      <Button className="w-full mt-6" size="lg" onClick={() => setAuthOpen(true)}>
        Subscribe Now
      </Button>
    </div>
  </div>
</section>
```

Note: You'll need to add the Button import if not already used in that section, and pass the `setAuthOpen` state.

---

#### Section: Bottom CTA (around line 240)
**Current:**
```tsx
{!user && (
  <Button size="lg" onClick={() => setAuthOpen(true)}>
    Start Free Trial
  </Button>
)}
```

**Update to:**
```tsx
{!user && (
  <Button size="lg" onClick={() => setAuthOpen(true)}>
    Subscribe - $19/mo
  </Button>
)}
```

---

## Key Messaging Rules

### DO NOT INCLUDE ANYWHERE:
- ❌ "Free trial"
- ❌ "14-day" / "14 day"
- ❌ "No credit card required"
- ❌ "Money back guarantee"
- ❌ "Refund"
- ❌ "Try free"
- ❌ "Sign up free"
- ❌ "Start free"

### DO INCLUDE:
- ✅ "$19/mo" pricing prominently
- ✅ "Subscribe" as primary CTA
- ✅ Value props: 17 tools, unlimited calls, priority support
- ✅ Performance: "64% win rate" or "+114% avg gain"

---

## Brand Voice

- Sharp, confident, professional
- Human contractions ("we're", "it's", "don't")
- NO: "leverage", "robust", "game-changer", "innovative"
- NO em dashes (—)
- Tone: "data over vibes" — we show our work

---

## Verification Checklist

After all changes, run these greps on the codebase:
```bash
grep -ri "free trial" src/
grep -ri "14-day" src/
grep -ri "14 day" src/
grep -ri "no credit card" src/
grep -ri "money back" src/
grep -ri "refund" src/
grep -ri "sign up free" src/
grep -ri "start free" src/
```

**All should return empty.**

---

## Test Locally

```bash
npm run dev
# Visit http://localhost:3000/developers
# Verify:
# 1. No "free trial" text visible
# 2. Pricing shows single $19/mo card
# 3. CTA says "Subscribe Now" not "Sign Up Free"
# 4. Hero badges show "$19/mo" not "14-Day Free Trial"
```

---

## Commit Message
```
feat: remove free trial, update /developers to paid-only $19/mo model

- Remove free trial card from pricing section
- Update all CTAs to "Subscribe Now"
- Update hero badges and metadata
- Single pricing tier: $19/mo Pro
```
