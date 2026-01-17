# Master Refactor Plan: "Trader First" Unification
**Date:** January 15, 2026
**Status:** IN PROGRESS

## Executive Summary
This master plan unifies the **SEO Strategy**, **Pricing Model**, and **UX Simplification** into a single executable roadmap. It shifts the platform from a Sales-Led model to a **Product-Led Growth (PLG)** model.

**Core Objectives:**
1.  **One URL Policy:** Consolidate `/stocks/[ticker]` and `/dashboard/[ticker]` into a single, canonical, SEO-optimized `/[ticker]` entry point.
2.  **Hybrid Dashboard:** Replace the marketing homepage with a direct-to-value "Hybrid Dashboard" (`/`) that serves as both the landing page and the logged-in workspace.
3.  **Reverse Trial:** Frictionless onboarding where every new user gets 14 days of Pro access automatically (Server-side enforced), followed by a "Soft Lock" downgrade.

---

## Phase 0: Backend Pipeline Upgrade (The "Options Analyst" Engine)
**Goal:** Upgrade the content generation pipeline to produce "Senior Analyst" level briefs with specific Options terminology, enabling the "Trader First" SEO strategy.

*   **0.1. Data Ingestion:** Ensure BigQuery/Prep tables contain `{options_context}` data. *[Status: COMPLETE]*
*   **0.2. Prompt Engineering:** Update `page_generator.py` with the "Senior Derivatives Analyst" persona. *[Status: COMPLETE]*
*   **0.3. Dashboard Merging:** Update `dashboard_generator.py` to merge SEO content into `final_dashboard.json`. *[Status: COMPLETE]*
*   **0.4. Verification:** Manually verify V2 JSON. *[Status: COMPLETE]*

---

## Phase 1: Architecture Unification (The "One URL" Policy)
**Goal:** Eliminate the split personality between "Article Pages" and "App Pages" to maximize domain authority.

### 1.1. Frontend Data Layer Adapter
*   **Type Definitions:** Create TypeScript interfaces for the new V2 JSON structure. *[Status: COMPLETE]*
*   **`getDashboardData` Update:** Refactor to prefer V2 JSONs, falling back to V1 if necessary. *[Status: COMPLETE]*

### 1.2. Server Component Migration (The Unified Layout)
Refactor `src/app/dashboard/[ticker]/page.tsx` into a **Hybrid Server Component**. *[Status: COMPLETE]*

### 1.3. Redirects & Cleanup
*   **301 Redirects:** Configured in `next.config.ts` to forward all `/stocks/:ticker` and `/dashboard/:ticker` traffic to `/:ticker`. *[Status: COMPLETE]*
*   **Sitemap:** Update `sitemap.ts` to point to `/*` (root ticker paths). *[Status: COMPLETE]*
*   **Deprecation:** Delete the `src/app/stocks` folder. *[Status: COMPLETE]*

### 1.4. Ticker Page Polish
**Goal:** Refine the individual ticker dashboard to match the new "Hybrid" aesthetic and functionality.
*   **Alignment:** Ensure visual consistency with the new Homepage components. *[Status: COMPLETE]*
*   **SEO:** Verify metadata and semantic HTML structure. *[Status: COMPLETE]*

---

## Phase 2: The "Trader First" Home Page
**Goal:** Remove marketing fluff. Show the product immediately.

### 2.1. The "Hybrid Dashboard" (Unified Entry Point)
Merge `gammarips.com` and `gammarips.com/dashboard`. *[Status: COMPLETE]*
*   **Architecture:** `/dashboard` now redirects to `/`.
*   **Hero:** Simplified "GammaRips Options Scanner" branding with minimized spacing.
*   **Market Hub Tile:**
    *   **Indices Ticker:** Full-width grid alignment (including dynamic PCR/Universe Sentiment).
    *   **Trade Ideas:** Tabbed view of Top Calls and Top Puts.
    *   **Expand/Minimize:** "Show All" / "Show Less" toggles for better UX.
*   **Performance Tile:**
    *   **KPIs:** ROI, Win Rate, etc.
    *   **Lists:** Dynamic "Top Gainers (Count)" and "Top Losers (Count)" lists.
*   **Context:** Stacked "Economic Calendar" and "Market News" widgets.
*   **Cleanup:** Deprecated and deleted `/performance`, `/options/call-setups`, `/options/put-hedges`, `/winners-circle`.

### 2.2. Homepage SEO Enhancements (Part 2 - Pending)
**Goal:** Inject high-value semantic content to replace lost pages and boost "Methodology" keywords.
*   **Methodology Section:** Add "How We Find Rips" content (High-Conviction -> Gamma Scan -> Smart Money).
*   **FAQ Section:** Accordion-style "People Also Ask" (Accuracy, Real-time status, etc.).

### 2.3. Universe Sentiment Engine (PCR Upgrade)
**Goal:** Replace unreliable FMP Put/Call Ratio with a custom BigQuery-calculated "Universe Sentiment" metric.
*   **Backend Service:** Create `src/admin/calculate-pcr.ts` to query `profitscout-fida8.profit_scout.options_chain`.
    *   **Logic:** Sum all Call Volume vs. Put Volume for the latest run date across *all* tracked tickers.
    *   **Output:** Write result to Firestore `market_metrics/universe_pcr`.
*   **Frontend Integration:** Update `src/app/landing-page-actions.ts` to fetch this Firestore document instead of the FMP API.

---

## Phase 3: The Reverse Trial Engine
**Goal:** Maximize conversion by giving value first (14 Days Pro), then creating a "Soft Lock" (FOMO).

### 3.1. Firestore Schema Updates (`users/{uid}`)
*   Add `plan`: `'free' | 'trial' | 'pro'`. *[Status: COMPLETE in Client SDK]*
*   Add `proUntil`: Timestamp (The master key for access). *[Status: COMPLETE in Client SDK]*
*   Add `trialEnd`: Timestamp. *[Status: COMPLETE in Client SDK]*

### 3.2. Cloud Functions
*   **`onUserCreate`:** Automatically set `plan = 'trial'`, `trialEnd = now + 14d`, `proUntil = now + 14d`. *[Status: PENDING - Using Optimistic Client Logic for now]*

### 3.3. The "Soft Lock" Experience (Day 15+)
*   **No Hard Redirects:** Do *not* block login or redirect to Stripe.
*   **The Downgrade:**
    *   User sees the dashboard but data reverts to **15-minute delayed**.
    *   "Real-Time" toggles are grayed out.
    *   "AI Deep Dive" content is blurred.
*   **The Trigger (Upsell):**
    *   The "Upgrade" modal only appears when the user attempts to access a Pro feature.
    *   **Message:** "Your Pro trial has ended. Upgrade to unlock Real-Time Data and AI Signals."
*   **Implementation:** Build `<ProLock>` client component to wrap sensitive sections. *[Status: PENDING]*

---

## Phase 4: Branding & AI Discovery
**Goal:** Ensure "GammaRips" brand consistency and Schema.org optimization.

*   **Branding:** Replace "ProfitScout" with "GammaRips" in UI and Metadata. *[Status: COMPLETE]*
*   **Schema.org:** Inject `Organization` schema in Layout and `FAQPage`/`Article` schema in Dashboard. *[Status: COMPLETE]*

---

## Decisions Log
*   **Route Strategy:** **RESOLVED.** Single Entry Point at `/`. `/dashboard` is deprecated and redirects to Home. Ticker pages moved to root `/:ticker`.
*   **PCR Metric:** **RESOLVED.** Switched from FMP API (Buggy) to internal BigQuery aggregation (Universe Sentiment). Backend service pending implementation.

## Phase 5: Verification Checklist
*   [x] **SEO:** `curl https://gammarips.com/NVDA` returns rich HTML text (Analyst Brief) + Data.
*   [x] **Auth:** New signups immediately see Pro data (Optimistic Client Logic).
*   [x] **Homepage:** "Hybrid" Dashboard loads with correct alignment and no layout shifts.
*   [ ] **Soft Lock:** Expired users see delayed data and get an upsell modal *only* on interaction.