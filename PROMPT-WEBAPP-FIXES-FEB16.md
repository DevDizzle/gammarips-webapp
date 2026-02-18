# PROMPT: Webapp Fixes — Deploy Before Monday Open

## Priority: CRITICAL
## Project: gammarips-webapp

---

### Fix 1: Markdown tables not rendering on `/reports/[date]`

The report content is full markdown including tables (`| Ticker | Score | ... |`). The `react-markdown` component does NOT render tables by default — it needs the `remark-gfm` plugin for GitHub Flavored Markdown (tables, strikethrough, etc).

**Install:**
```bash
npm install remark-gfm
```

**Update `src/app/reports/[date]/page.tsx`:**
```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// In the JSX:
<article className="prose prose-invert max-w-none">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.content}</ReactMarkdown>
</article>
```

Also style the tables properly. Add to the article wrapper or global CSS:
```css
.prose table {
  width: 100%;
  border-collapse: collapse;
}
.prose th, .prose td {
  border: 1px solid hsl(var(--border));
  padding: 0.5rem 0.75rem;
  text-align: left;
}
.prose th {
  background: hsl(var(--muted));
  font-weight: 600;
}
```

---

### Fix 2: Subscribe button linking to /account instead of Stripe checkout

The "Subscribe" or "Get Started" buttons on the pricing/landing pages are linking to `/account`. They should link to the Stripe checkout flow.

Find all subscribe/CTA buttons and update their `href` to either:
- `/api/checkout?priceId=<STRIPE_PRICE_ID>` (if using the existing checkout API route)
- Or use an `onClick` handler that calls the checkout API

Check `src/app/api/checkout/route.ts` for the existing checkout endpoint and wire the buttons to it with the correct Stripe price IDs.

For unauthenticated users, the button should go to `/auth/action?mode=signUp&redirect=/pricing` (sign up first, then redirect to pricing to subscribe).

---

### Fix 3: Hamburger menu (mobile nav) and footer on ALL pages

Some pages are missing the `PublicHeader` component (which contains the hamburger menu) and/or the footer. Every single page needs both.

**Check these pages and add `<PublicHeader />` and footer if missing:**
- `/reports/[date]` 
- `/signals/[ticker]`
- `/scorecard`
- `/how-it-works`
- `/pricing`
- `/about`
- `/developers`
- `/privacy`
- `/terms`

The pattern should be:
```tsx
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer"; // or wherever footer lives

export default function SomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* page content */}
      </main>
      <Footer />
    </div>
  );
}
```

If there's a layout file (`src/app/layout.tsx`) that already wraps pages with header/footer, make sure ALL route groups use it. If some pages opt out of the layout, fix that.

---

### Fix 4: Logo/brand name in header — "GammaRips" is ONE WORD

In `src/components/layout/public-header.tsx`, the header shows:
```tsx
<span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
```

This renders as two separate spans which may look like two words on some screens. Make sure there is NO whitespace or gap between them. The brand name is **GammaRips** — one word. Consider removing the two-span approach and just doing:
```tsx
<span className="font-bold">GammaRips</span>
```
Or keep the two-tone color but ensure they render as one continuous word with no gap.

Also check the mobile Sheet menu header — same fix needed there.

### Fix 5: Founder/admin bypass for paywall

The user with UID `nIr2HaGwPSZqtKfjr5WC5LSIpE12` (eraphaelparra@gmail.com) has `plan: "warroom"` and `subscriptionStatus: "founder_lifetime"` in Firestore. 

Make sure the paywall/gating logic recognizes `plan === "warroom"` as having full access to everything — all signals, all enriched data, all contract recommendations. The `subscriptionStatus: "founder_lifetime"` should be treated the same as an active paid subscription (never expires).

If there's a check like `if (user.isSubscribed && user.plan === 'edge')` make sure `warroom` also passes. War Room should have everything Edge has plus more.

### Fix 6: (More fixes will be added here before Sunday deploy)

*Reserved — Evan adding more items.*

---

## Verification

After all fixes:
1. `npm run build` must pass clean
2. `/reports/2026-02-13` should render markdown tables properly
3. Subscribe buttons should initiate Stripe checkout (or redirect to auth first)
4. Every page should have hamburger menu on mobile + footer
5. Commit and push to main for Firebase App Hosting auto-deploy
