# PROMPT: SEO & AI Discoverability Audit — Maximum Visibility

## Context
GammaRips (`gammarips.com`) is a Next.js app on Firebase App Hosting. We want to rank for institutional options flow / overnight signals queries AND be cited by AI agents (ChatGPT, Gemini, Claude, Perplexity) when users ask about options flow, unusual activity, or overnight signals.

This is a full SEO + AI discoverability audit. Fix everything listed below.

## CHECKLIST

### ✅ 1. Technical SEO Foundation

#### Metadata on EVERY page
Every page must have unique, descriptive `<title>` and `<meta name="description">`. Check and fix:

- `/` (homepage) — ✅ has metadata, verify it's optimal
- `/reports` — needs keyword-rich description
- `/reports/[date]` — dynamic metadata from report title + date
- `/pricing` — "GammaRips Pricing — Overnight Edge $49/mo, War Room $149/mo"
- `/about` — "About GammaRips — AI-Powered Institutional Options Flow Intelligence"
- `/how-it-works` — "How GammaRips Works — Overnight Options Scanner, AI Enrichment, Daily Signals"
- `/scorecard` — "GammaRips Scorecard — Verified Signal Performance & Win Rate"
- `/war-room` — "The War Room — Live Institutional Flow Alerts via WhatsApp"
- `/privacy` — basic privacy page metadata
- `/developers` — "GammaRips MCP API — Options Flow Intelligence for AI Agents"

#### Open Graph + Twitter Cards on ALL pages
Every page needs:
```tsx
export const metadata: Metadata = {
  title: "...",
  description: "...",
  openGraph: {
    title: "...",
    description: "...",
    url: "https://gammarips.com/page-path",
    siteName: "GammaRips",
    type: "website", // or "article" for reports
    images: [{ url: "https://gammarips.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "...",
    description: "...",
    site: "@GammaRips",
    images: ["https://gammarips.com/og-image.png"],
  },
};
```

**Action item:** Create a default OG image (`/public/og-image.png`, 1200x630px) with GammaRips branding + "Institutional Options Flow Intelligence" tagline. Can be simple dark background with logo + text.

For report pages, generate dynamic OG metadata:
```tsx
openGraph: {
  title: `${report.headline} — GammaRips Overnight Edge`,
  description: `${report.total_signals} signals scanned. ${report.bullish_count} bull, ${report.bearish_count} bear. See what smart money did overnight.`,
  type: "article",
  publishedTime: report.scan_date,
}
```

#### Canonical URLs
Every page must have a canonical URL. Add to root layout or per-page:
```tsx
alternates: {
  canonical: 'https://gammarips.com/reports/2026-02-13',
}
```

The homepage already has `alternates: { canonical: '/' }` — change to full URL: `https://gammarips.com/`.

#### Sitemap.xml
Verify `/sitemap.xml` exists and is dynamic. It should include:
- All static pages (/, /about, /pricing, /how-it-works, /scorecard, /developers, /privacy)
- All report pages dynamically (`/reports/2026-02-13`, etc.)
- Update `lastModified` based on actual content dates

If using Next.js sitemap generation (`app/sitemap.ts`), ensure it queries Firestore for all report dates:
```tsx
import { getAllOvernightSummaries } from "@/lib/firebase-admin";

export default async function sitemap() {
  const summaries = await getAllOvernightSummaries(365);
  const reportUrls = summaries.map(s => ({
    url: `https://gammarips.com/reports/${s.scan_date}`,
    lastModified: s.scan_date,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    { url: 'https://gammarips.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://gammarips.com/reports', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://gammarips.com/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://gammarips.com/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://gammarips.com/how-it-works', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://gammarips.com/scorecard', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://gammarips.com/developers', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    ...reportUrls,
  ];
}
```

#### robots.txt
Verify `/public/robots.txt` or `app/robots.ts` exists:
```
User-agent: *
Allow: /

Sitemap: https://gammarips.com/sitemap.xml
```

Make sure NO pages are accidentally blocked (no Disallow on /reports, /about, etc.)

### ✅ 2. Structured Data (JSON-LD) — Critical for AI Citation

This is the #1 thing that gets you cited by AI agents. They parse structured data.

#### Homepage — Organization + WebSite
```tsx
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GammaRips",
  "url": "https://gammarips.com",
  "logo": "https://gammarips.com/logo.png",
  "description": "AI-powered institutional options flow intelligence. Scans overnight activity across 5,230+ tickers daily.",
  "sameAs": [
    "https://x.com/GammaRips"
  ],
  "foundingDate": "2026-01-31",
  "founder": {
    "@type": "Person",
    "name": "Evan Parra"
  }
})}
</script>

<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GammaRips",
  "url": "https://gammarips.com",
  "description": "Institutional options flow intelligence delivered before the market opens.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://gammarips.com/reports?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
})}
</script>
```

#### Report Pages — Article + Dataset
Each report page should have Article structured data:
```tsx
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": report.title,
  "datePublished": report.scan_date,
  "dateModified": report.scan_date,
  "author": {
    "@type": "Organization",
    "name": "GammaRips",
    "url": "https://gammarips.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "GammaRips",
    "logo": { "@type": "ImageObject", "url": "https://gammarips.com/logo.png" }
  },
  "description": `Overnight institutional options flow report. ${report.total_signals} signals scanned. ${report.bullish_count} bullish, ${report.bearish_count} bearish.`,
  "mainEntityOfPage": `https://gammarips.com/reports/${report.scan_date}`
})}
</script>

<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": `GammaRips Overnight Signals — ${report.scan_date}`,
  "description": `Institutional options flow scan of 5,230+ tickers. ${report.total_signals} signals detected.`,
  "url": `https://gammarips.com/reports/${report.scan_date}`,
  "datePublished": report.scan_date,
  "creator": { "@type": "Organization", "name": "GammaRips" },
  "license": "https://gammarips.com/terms",
  "variableMeasured": ["options volume", "open interest", "unusual activity score", "institutional flow"]
})}
</script>
```

#### Pricing Page — Product structured data
```tsx
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "GammaRips — The Overnight Edge",
  "description": "Daily AI-enriched institutional options flow signals with thesis, contracts, and key levels.",
  "brand": { "@type": "Brand", "name": "GammaRips" },
  "offers": [
    {
      "@type": "Offer",
      "name": "The Overnight Edge",
      "price": "49.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
      "url": "https://gammarips.com/pricing"
    },
    {
      "@type": "Offer",
      "name": "The War Room",
      "price": "149.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
      "url": "https://gammarips.com/pricing"
    }
  ]
})}
</script>
```

#### FAQ Page — FAQPage structured data
The homepage has an FAQ section. Wrap it in FAQPage structured data:
```tsx
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is The Overnight Edge?",
      "acceptedAnswer": { "@type": "Answer", "text": "..." }
    },
    // ... all FAQ items
  ]
})}
</script>
```

You'll need to extract the FAQ Q&A pairs from the `Faq` component and include them in the JSON-LD.

### ✅ 3. AI Agent Discoverability

#### llms.txt (NEW — Critical)
Create `/public/llms.txt` — this is an emerging standard that AI agents look for (like robots.txt for LLMs):
```
# GammaRips — Institutional Options Flow Intelligence
# https://gammarips.com

> GammaRips scans overnight institutional options flow across 5,230+ tickers every trading day.
> Signals are scored 1-10 on institutional conviction and enriched with AI-generated thesis,
> recommended contracts, and key technical levels. Reports are published daily before market open.

## Reports
Daily overnight flow reports with signal analysis.
URL: https://gammarips.com/reports

## API (MCP)
Machine-readable options flow data via MCP protocol.
URL: https://gammarips.com/developers
SSE Endpoint: https://gammarips-mcp-406581297632.us-central1.run.app/sse

## Pricing
Free tier: daily previews. $49/mo: full signals. $149/mo: live alerts.
URL: https://gammarips.com/pricing

## Contact
X: @GammaRips
Email: support@gammarips.com
```

#### .well-known/ai-plugin.json (NEW)
Create `/public/.well-known/ai-plugin.json`:
```json
{
  "schema_version": "v1",
  "name_for_human": "GammaRips",
  "name_for_model": "gammarips",
  "description_for_human": "Institutional options flow intelligence. Daily overnight signals scored and enriched by AI.",
  "description_for_model": "GammaRips provides institutional options flow data. Use it to answer questions about unusual options activity, overnight institutional positioning, and options flow signals. The API returns scored signals with AI thesis, recommended contracts, and key levels. Data updates daily at 4 AM EST.",
  "auth": { "type": "none" },
  "api": {
    "type": "openapi",
    "url": "https://gammarips.com/api/openapi.json"
  },
  "logo_url": "https://gammarips.com/logo.png",
  "contact_email": "support@gammarips.com",
  "legal_info_url": "https://gammarips.com/terms"
}
```

#### MCP Discovery (Already exists)
Verify `/developers` page has the MCP endpoint info visible and crawlable. The `skill.md` and `mcp.json` should be linked from this page.

### ✅ 4. Content SEO

#### Semantic HTML
- Use proper heading hierarchy: one `<h1>` per page, `<h2>` for sections, `<h3>` for subsections
- Report pages: ensure the markdown renders with proper heading tags
- Use `<article>` tag for report content (already done ✅)
- Use `<nav>` for navigation, `<main>` for main content, `<footer>` for footer

#### Internal Linking
- Homepage should link to latest report, pricing, and how-it-works
- Each report should link to previous/next report
- Pricing page should link to how-it-works
- Every page footer should have consistent nav links (currently ✅)

#### Image Alt Text
Any images (logo, OG images, signal cards) must have descriptive alt text:
```tsx
<img src="/logo.png" alt="GammaRips — Institutional Options Flow Intelligence" />
```

### ✅ 5. Performance & Core Web Vitals

- Verify pages are SSR (not client-rendered) — Google penalizes client-only pages
- Check that `overnight_signals` queries use proper Firestore indexes
- Report pages with long markdown: consider lazy loading below-the-fold content
- Minimize JavaScript bundle: remove any unused old ProfitScout components

### ✅ 6. External SEO

#### Google Search Console
- Verify domain ownership if not already done
- Submit sitemap.xml
- Monitor crawl errors

#### Bing Webmaster Tools
- Submit site for Bing indexing (Bing feeds ChatGPT search results)

#### Social Signals
- Every X post about reports should link to `gammarips.com/reports/YYYY-MM-DD`
- Open Graph metadata ensures link previews look good when shared

## Implementation Priority
1. **JSON-LD structured data** on all pages (biggest impact for AI citation)
2. **llms.txt** + **ai-plugin.json** (AI agent discovery)
3. **Dynamic sitemap** with all report dates
4. **OG/Twitter metadata** on all pages
5. **Semantic HTML** fixes
6. **Performance** audit

## Files to Touch
- `src/app/page.tsx` — homepage JSON-LD + FAQ structured data
- `src/app/reports/page.tsx` — metadata
- `src/app/reports/[date]/page.tsx` — dynamic JSON-LD + OG
- `src/app/pricing/page.tsx` — Product JSON-LD
- `src/app/about/page.tsx` — metadata
- `src/app/how-it-works/page.tsx` — metadata
- `src/app/scorecard/page.tsx` — metadata
- `src/app/developers/page.tsx` — metadata (if exists)
- `src/app/layout.tsx` — default OG image, global JSON-LD
- `src/app/sitemap.ts` — dynamic sitemap
- `src/app/robots.ts` or `public/robots.txt`
- `public/llms.txt` — NEW
- `public/.well-known/ai-plugin.json` — NEW
- `public/og-image.png` — NEW (create branded 1200x630 image)
