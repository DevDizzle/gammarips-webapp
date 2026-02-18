# PROMPT: Fix Google Search Console Issues + SEO Cleanup

## Context
Google Search Console flagged 3 issues for gammarips.com:
1. **Datasets structured data** — Missing `creator` and `license` fields
2. **Not found (404)** — Old deleted pages still being crawled: `/signup`, `/chat`
3. **Alternate page with proper canonical tag** — Likely old route variants

The site currently has 10 clicks in 28 days from organic search. We need to fix these to avoid losing ground.

## Project
- **Repo:** gammarips-webapp (Next.js, Firebase, deployed on Firebase Hosting)
- **Framework:** Next.js App Router with `src/app/` structure

---

## Fix 1: Dataset Structured Data (mcp.json)

Google is interpreting `/mcp.json` as a Dataset. It needs `creator` and `license` fields.

**File:** `public/mcp.json`

Update it to include Schema.org Dataset-compatible fields:

```json
{
  "name": "GammaRips Overnight Edge",
  "description": "Institutional overnight options flow scanner. 5,000+ tickers scanned nightly. Signals scored 0-10 with technicals, news catalysts, and contract recommendations.",
  "url": "https://gammarips-mcp-406581297632.us-central1.run.app/sse",
  "auth": "none",
  "creator": {
    "name": "GammaRips",
    "url": "https://gammarips.com"
  },
  "license": "https://gammarips.com/terms",
  "capabilities": [
    "overnight_signals",
    "technicals",
    "news_analysis",
    "contract_recommendations",
    "market_themes",
    "chat"
  ],
  "data_freshness": "Daily by 06:00 EST, Mon-Fri",
  "universe": "5,000+ US equities"
}
```

---

## Fix 2: Redirect Deleted Pages (404s)

These pages were deleted during cleanup but Google still crawls them. Add redirects in `next.config.ts` (or `next.config.js`):

```js
// Add to next.config redirects
async redirects() {
  return [
    { source: '/signup', destination: '/', permanent: true },
    { source: '/chat', destination: '/', permanent: true },
    { source: '/dashboard', destination: '/reports', permanent: true },
  ];
},
```

**Important:** These should be 301 (permanent) redirects. This tells Google to stop crawling these old URLs.

---

## Fix 3: Canonical Tags

Ensure every page has an explicit canonical URL. Most pages already have this via Next.js `metadata.alternates.canonical` but verify:

**File:** `src/app/page.tsx` — Already has `alternates: { canonical: '/' }` ✅

Check these pages and add `alternates.canonical` to their `metadata` export if missing:

- `src/app/reports/page.tsx` → canonical: `/reports`
- `src/app/reports/[date]/page.tsx` → canonical should be dynamic: `/reports/${date}`
- `src/app/pricing/page.tsx` → canonical: `/pricing`
- `src/app/about/page.tsx` → canonical: `/about`
- `src/app/how-it-works/page.tsx` → canonical: `/how-it-works`
- `src/app/scorecard/page.tsx` → canonical: `/scorecard`
- `src/app/war-room/page.tsx` → canonical: `/war-room`
- `src/app/developers/page.tsx` → canonical: `/developers`
- `src/app/terms/page.tsx` → canonical: `/terms`
- `src/app/privacy/page.tsx` → canonical: `/privacy`
- `src/app/signals/page.tsx` → canonical: `/signals`
- `src/app/signals/[ticker]/page.tsx` → canonical: `/signals/${ticker}`

For dynamic routes, use `generateMetadata()`:
```ts
export async function generateMetadata({ params }: { params: { date: string } }): Promise<Metadata> {
  return {
    alternates: { canonical: `/reports/${params.date}` },
  };
}
```

---

## Fix 4: Organization Structured Data Cleanup

**File:** `src/app/layout.tsx`

The `founder.jobTitle` currently says `"Founder & Chairman"`. Change to `"Founder & CEO"`.

```ts
"founder": { "@type": "Person", "name": "Evan Parra", "jobTitle": "Founder & CEO" },
```

---

## Fix 5: Add Dataset Structured Data to Developers Page

**File:** `src/app/developers/page.tsx` (or wherever the developers page component lives)

Add a proper Schema.org Dataset JSON-LD so Google understands our MCP data offering:

```tsx
const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "GammaRips Overnight Options Flow Data",
  "description": "Daily overnight institutional options flow signals across 5,000+ US equities. Includes conviction scores, technicals, AI-generated catalysts, and contract recommendations.",
  "url": "https://gammarips.com/developers",
  "license": "https://gammarips.com/terms",
  "creator": {
    "@type": "Organization",
    "name": "GammaRips",
    "url": "https://gammarips.com"
  },
  "temporalCoverage": "2026-02-13/..",
  "distribution": {
    "@type": "DataDownload",
    "encodingFormat": "application/json",
    "contentUrl": "https://gammarips-mcp-406581297632.us-central1.run.app/sse"
  },
  "variableMeasured": [
    "overnight_score",
    "call_dollar_volume",
    "put_dollar_volume",
    "vol_oi_ratio",
    "active_strikes",
    "rsi_14",
    "macd_histogram"
  ]
};
```

Add this as a `<script type="application/ld+json">` in the page head or body.

---

## Fix 6: Sitemap — Remove Dead Routes, Add Missing Routes

**File:** The sitemap generator (check `src/app/sitemap.ts` or `public/sitemap.xml` if static)

Current sitemap has 11 URLs. Make sure:
- `/signals` is in the sitemap (it's live but NOT in sitemap currently)
- NO dead routes are listed
- Dynamic report dates are generated from Firestore `daily_reports` collection

If the sitemap is dynamically generated via `src/app/sitemap.ts`, update it. If it's a static file, it needs to become dynamic.

---

## Verification Checklist
After deploying:
1. `curl -s https://gammarips.com/signup` should return 301 → `/`
2. `curl -s https://gammarips.com/chat` should return 301 → `/`
3. `curl -s https://gammarips.com/mcp.json` should include `creator` and `license`
4. Every page should have a `<link rel="canonical">` tag
5. Founder title should say "Founder & CEO" not "Founder & Chairman"
6. Rich Results Test (https://search.google.com/test/rich-results) should pass for `/developers`
7. `/sitemap.xml` should include `/signals` and NOT include `/signup` or `/chat`

---

## Priority
Run this prompt FIRST before other webapp prompts. These are active SEO issues flagged by Google.
