# PROMPT: Update GammaRips Homepage

## Objective
Update the GammaRips landing page to remove free trial messaging and improve value proposition clarity.

---

## Files to Modify

### 1. `/src/components/landing/hero.tsx`
**Current state:**
```tsx
<h1>Options Scanner</h1>
<p>Daily AI Options Analysis & Market Research.</p>
```

**Update to:**
```tsx
<h1>AI Options Intelligence</h1>
<p>High-conviction signals powered by fundamentals, technicals, and options flow analysis. Data over vibes.</p>
```

---

### 2. `/src/app/page.tsx` (Metadata)
**Current:**
```tsx
description: "Real-time AI options signals, gamma exposure analysis, and market performance tracking.",
```

**Update to:**
```tsx
description: "High-conviction options signals powered by AI. Fundamentals, technicals, and flow analysis combined. $19/mo.",
```

---

## Key Messaging Rules

### DO NOT INCLUDE:
- ❌ "Free trial" (anywhere)
- ❌ "14-day trial"
- ❌ "No credit card required"
- ❌ "Money back guarantee"
- ❌ "Refund"
- ❌ "Try free"

### DO INCLUDE:
- ✅ "$19/mo" pricing upfront
- ✅ "Data over vibes"
- ✅ Performance stats: "64% win rate" or "+114% avg gain" this can be a variable from used in performance_tracker win rate
- ✅ Clear value prop: fundamentals + technicals + flow

---

## Brand Voice

- Sharp, not corporate
- Confident, not arrogant
- Human contractions ("we're", "it's", "don't")
- NO: "leverage", "robust", "game-changer", "innovative"
- NO em dashes (—)

---

## Verification Checklist

After changes, grep the entire codebase for banned terms:
```bash
grep -ri "free trial" src/
grep -ri "14-day" src/
grep -ri "no credit card" src/
grep -ri "money back" src/
grep -ri "refund" src/
```

All should return empty.

---

## Commit Message
```
feat: remove free trial messaging, update homepage hero copy
```
