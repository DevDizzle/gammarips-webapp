# PROMPT: Dead Code Cleanup — Remove All Zombie Code from gammarips-webapp

## Context
The gammarips-webapp codebase has been through a major pivot from an AI stock analysis tool ("Rips", SEC filings, Confluence Dashboard, options candidates) to **The Overnight Edge** (institutional overnight options flow scanner). There is significant dead code remaining — unused components, old data-fetching functions, stale imports, unreferenced variables, and entire feature modules that no longer serve any purpose.

Clean it all out. The codebase should only contain code that supports the current product.

## Tooling — Run These First

Before making manual changes, use automated tools to identify dead code:

### TypeScript / Next.js

```bash
# 1. Install tooling (if not already present)
npm install -D knip @typescript-eslint/eslint-plugin

# 2. Run knip — finds unused files, exports, dependencies, and types
# Add to package.json first:
# "scripts": { "knip": "knip" }
# Then create knip.json:
cat > knip.json << 'EOF'
{
  "entry": ["src/app/**/page.tsx", "src/app/**/layout.tsx", "src/app/**/route.ts"],
  "project": ["src/**/*.{ts,tsx}"],
  "ignore": ["src/**/*.test.*", "src/**/*.spec.*"],
  "ignoreDependencies": ["@types/*"]
}
EOF
npx knip

# 3. TypeScript strict check — finds unused locals and parameters
npx tsc --noEmit --noUnusedLocals --noUnusedParameters 2>&1 | head -100

# 4. ESLint unused imports (if eslint is configured)
npx eslint src/ --rule '{"@typescript-eslint/no-unused-vars": "error", "no-unused-imports/no-unused-imports": "error"}' --fix

# 5. Next.js build — catches any broken imports after cleanup
npm run build
```

### Key knip Output to Act On
- **Unused files** → Delete them
- **Unused exports** → Remove the export (and the function if nothing else uses it)
- **Unused dependencies** → `npm uninstall <package>`
- **Unlisted dependencies** → Add them or remove the import

## Manual Cleanup Checklist

### 1. Dead Components (DELETE these files entirely)

These components reference the old product and are no longer imported anywhere:

```
src/components/dashboard/public-winners-table.tsx
src/components/dashboard/execution-deck.tsx
src/components/dashboard/deep-dive-analysis.tsx
src/components/dashboard/analyst-brief.tsx
src/components/dashboard/kpi-carousel.tsx
src/components/dashboard/performance-movers.tsx
src/components/dashboard/performance-tile.tsx
src/components/dashboard/watchlist-button.tsx
src/components/dashboard/watchlist-widget.tsx
src/components/landing/market-hub.tsx
src/components/landing/market-movers.tsx
src/components/landing/performance-tile.tsx
src/components/landing/signals-preview.tsx
src/components/agent-chat.tsx
src/components/ticker-search.tsx (if no longer used)
```

**Before deleting each file:** Search the entire codebase for imports of that component:
```bash
grep -r "import.*from.*'@/components/dashboard/public-winners-table'" src/
```
If zero results → safe to delete.

### 2. Dead AI Flows (DELETE entire directory contents if unused)

```
src/ai/flows/send-midday-movers.ts
src/ai/flows/send-feedback-requests.ts
src/ai/flows/customer-service-agent.ts
src/ai/flows/send-daily-setups.ts
src/ai/flows/send-top-pick.ts
src/ai/flows/initial-recommendation.ts
src/ai/flows/feedback-summarization.ts
src/ai/flows/follow-up-questions.ts
src/ai/flows/chat-router.ts
src/ai/flows/grounded-qa-flow.ts
src/ai/tools/profitscout.ts
src/ai/tools/financial-data.ts
src/ai/agents/profit-scout-agent.ts
src/ai/trigger-flow.ts
src/ai/dev.ts
```

Check if `src/ai/genkit.ts` is still used by any remaining flow. If not, delete the entire `src/ai/` directory.

### 3. Dead Admin Scripts (DELETE)

```
src/admin/cleanup-users.ts
src/admin/fix-data.ts
src/admin/get-top-users.ts
src/admin/send-early-adopter-email.ts
src/admin/reset-usage-stats.ts
src/admin/get-min-perf-date.ts
src/admin/generate-insider-tokens.ts
```

Check if any are referenced in package.json scripts or cron jobs. If not → delete entire `src/admin/` directory.

### 4. Dead Functions in `src/lib/firebase-admin.ts`

These functions query old Firestore collections that no longer exist or are irrelevant:

**REMOVE these functions:**
- `getPerformanceTrackerStatsAdmin()` — old performance tracker
- `getAllPerformanceSignalsAdmin()` — old performance signals
- `getPerformanceSignalsByOptionType()` — old
- `getPerformanceSignals()` — old
- `getMidDayMoversAdmin()` — old mid-day movers
- `getPerformanceSignalsByTicker()` — old
- `getWinnersDashboardAdmin()` — old winners dashboard
- `getWinnerForTickerAdmin()` — old
- `getStocksAdmin()` — old tickers collection
- `getStockDataAdmin()` — old
- `getTopStocksAdmin()` — old
- `getTopOptionsAdmin()` — old options candidates
- `getOptionsCandidatesAdmin()` — old
- `getSeoPageGcsPathAdmin()` — old GCS pages
- `getRandomBuyStockAdmin()` — old
- `getRandomSellStockAdmin()` — old
- `getRandomStocks()` — old
- `getStockDataBundleAdmin()` — old GCS bundles
- `getGcsFileContentAdmin()` — old GCS access
- `parseGcsUri()` — old GCS helper
- `getTopPickAdmin()` — old
- `getPerformanceTrackingStartDateAdmin()` — old
- `getFairQualityOptionsAdmin()` — old
- `activateInsiderUser()` — old insider token system
- `handleWinSubmission()` — old user win upload
- `getUsersForFeedbackEmailAdmin()` — old drip
- `getEligibleEmailRecipientsAdmin()` — probably still needed for new drip
- `getSubscribedUsersAdmin()` — keep (used for email sends)
- `addToWatchlistAdmin()` — old watchlist
- `removeFromWatchlistAdmin()` — old watchlist
- `getUserWatchlistAdmin()` — old watchlist
- `logChatInteractionAdmin()` — old chat logging
- `saveFeedbackSurveyAdmin()` — old feedback
- `saveCancellationFeedbackAdmin()` — old (maybe keep for churn tracking)

**KEEP these functions:**
- `getAdminApp()`, `getDb()`, `getStorage()` — core infra
- `getAppStatusAdmin()` — app status check
- `getOrCreateUserAdmin()` — user management
- `setUserSubscriptionStatusAdmin()` — Stripe integration
- `getUserByStripeCustomerIdAdmin()` — Stripe integration
- `incrementUserUsageAdmin()` — usage tracking
- `saveFeedbackAdmin()` — if contact form still exists
- ALL new overnight signal functions (getLatestOvernightSummary, getOvernightSignals, etc.)
- ALL new email subscriber functions (addEmailSubscriber, unsubscribeEmailAdmin)

### 5. Dead Schemas in `src/lib/schemas.ts` (or `firebase.ts`)

Remove Zod schemas for old data types:
- `StockSchema` / `Stock`
- `WinnerSchema` / `Winner`
- `OptionCandidateSchema` / `OptionCandidate`
- `PerformanceSignalSchema` / `PerformanceSignal`
- `OptionsSignalSchema` / `OptionsSignal`
- `WatchlistItemSchema` / `WatchlistItem`
- `TickerEventSchema` / `TickerEvent` (unless economic events widget is kept)

**Keep:**
- `DbUser` type (user management)
- `FeedbackSurveyData` (if feedback form exists)
- Any new OvernightSignal / OvernightSummary types

### 6. Dead Dependencies in `package.json`

After removing dead code, check for orphaned npm packages:
```bash
npx knip --include dependencies
# or manually check:
npx depcheck
```

Likely candidates for removal (verify first):
- Any AI/Genkit packages if `src/ai/` is deleted
- Old charting libraries if dashboard components are removed

### 7. Dead Pages

Check if these old routes are still needed:
- `src/app/api/cron/page.tsx` — old cron dashboard, probably dead
- `src/app/api/page.tsx` — old API docs, redirect to /developers
- `src/app/feedback/page.tsx` — old feedback form, redirect to /about#contact
- `src/app/[ticker]/page.tsx` — old stock deep-dive pages

If they're kept as redirects (per PROMPT-SITE-POLISH-SEO-PAGES.md), the page files can still be deleted and replaced with redirect rules in `next.config.ts`.

### 8. Dead Environment Variables

Check `.env`, `.env.local`, `apphosting.yaml` for variables that are no longer referenced:
- `FMP_API_KEY` — if FMP (Financial Modeling Prep) functions are removed
- Any old API keys for services no longer used

### 9. Dead CSS / Tailwind Classes

```bash
# Check for unused Tailwind classes (optional, low priority)
npx tailwindcss --content 'src/**/*.{ts,tsx}' --output /dev/null 2>&1
```

## Process

1. **Run knip first** — get the automated report of unused files/exports/deps
2. **Delete dead files** — components, flows, admin scripts, old pages
3. **Clean firebase-admin.ts** — remove dead functions (this is the biggest file)
4. **Clean schemas** — remove dead types
5. **Remove unused imports** — `npx tsc --noEmit --noUnusedLocals`
6. **Remove dead deps** — `npm uninstall` orphaned packages
7. **Build** — `npm run build` must pass
8. **Test** — Visit all active pages, verify nothing broke

## DO NOT
- Remove user auth functions (getOrCreateUserAdmin, setUserSubscriptionStatus, etc.)
- Remove Stripe webhook/checkout logic
- Remove the new overnight signal functions
- Remove email subscriber functions
- Delete `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, or other config files
- Remove environment variable declarations in `apphosting.yaml` for active secrets

## Verification
1. `npx knip` shows zero (or near-zero) unused exports
2. `npx tsc --noEmit --noUnusedLocals` passes clean
3. `npm run build` passes
4. All active pages render correctly (/, /signals, /reports, /about, /pricing, /how-it-works)
5. Auth flow works (sign in, subscribe, view gated content)
6. Git diff shows only deletions and import cleanups — no new features in this PR
