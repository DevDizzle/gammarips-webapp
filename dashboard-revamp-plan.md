# Dashboard Reimagination Plan: "Public Market Hub"

**Goal:** Transform `/dashboard` into a high-value, **publicly accessible** market briefing page. This maximizes SEO (indexing specific stock data) and reduces friction for email collection by offering "teasers" before asking for a signup.

**Philosophy:** "Give Value first, Ask for Email second."

## 1. SEO & Access Strategy (The Pivot)

Instead of a hard login wall, the dashboard will be open to the public but with specific "Soft Gates."

*   **Public Access (SEO Friendly):**
    *   Global Market Indices (SPY, QQQ, VIX).
    *   "Top 3" Winners of the day (fully visible).
    *   General Market News headlines.
    *   Dynamic Page Metadata: e.g., "Bullish Setups for [Date]: NVDA, TSLA, AAPL - ProfitScout".

*   **The "Soft Gates" (Email Capture Triggers):**
    *   **The "Velvet Rope":** Show 3 winners, blur the remaining 7. CTA: *"Unlock full list of 10 winners (Free)"*.
    *   **The "Midday Edge":** A dedicated call-to-action for the "Midday Movers" report.
        *   *Hook:* "Don't miss the move. See which of yesterday's setups are ripping today."
        *   *Action:* Signup to receive the daily lunchtime report.
    *   **Personalization:** Clicking "Add to Watchlist" triggers a modal: *"Create a free account to track this stock."*
    *   **Deep Analysis:** Clicking "View AI Analysis" on a stock shows a summary, but blurs the deep-dive metrics. CTA: *"Read full report."*

## 2. Visual Layout & UX Strategy

We will move from a linear, single-column layout to a **responsive grid layout**.

### The "Cockpit" Layout
*   **Top Bar:** A sleek, scrolling ticker for Global Market Indices (SPY, QQQ, VIX, etc.).
*   **Desktop (Grid):**
    *   **Left Column (Main - 66%):** The "Alpha Stream" (existing `TodaysWinners` / `MarketHub`).
    *   **Right Column (Sidebar - 33%):** The "Context Stack". Sticky or scrollable column containing personal and contextual widgets.
*   **Mobile (Stack):** Top Bar -> Main Signal Stream -> Context Widgets stacked below.

## 3. New Components & Features (With Freemium Logic)

### A. Global Market Pulse (`<IndicesTicker />`)
*   **Access:** **100% Public.**
*   **Purpose:** Instant market weather report & visual hook.
*   **Data Source:** FMP or Polygon.
*   **Display:** SPY, QQQ, IWM, VIX, DIA. Current Price & Daily % Change (Green/Red).

### B. "My Scouting Report" Watchlist (`<WatchlistWidget />`)
*   **Access:** **Gated (Trigger).**
*   **Public View:** Shows a generic "Sample Watchlist" (e.g., NVDA, TSLA) or an empty state with "Start your list".
*   **Action:** When a user searches a ticker or clicks "Add to Watchlist", trigger the **Auth/Email Modal**.
*   **Tech:** Firestore sub-collection `users/{uid}/watchlist`.

### C. Smart News Feed (`<NewsFeedWidget />`)
*   **Access:** **Hybrid.**
*   **Public View:** General market headlines (top 5).
*   **Gated View:** Personalized news based on *their* watchlist.
*   **Features:**
    *   **Smart Filtering:** Context-aware news fetching.
    *   **Source:** Benzinga (Primary) or FMP.

### D. Social Sentiment / "The Chatter" (`<SocialSentimentWidget />`)
*   **Access:** **Public.**
*   **Purpose:** Fun, engaging metric to keep them on the page.
*   **Features:**
    *   Bullish/Bearish sentiment meter for the top setup of the day.
    *   Trending cashtags ($XYZ).
*   **Source:** FMP Social Sentiment API.

## 4. Implementation Phases

### Phase 1: Foundation & Public Data
*   [ ] **Env Setup:** Configure API keys for Benzinga, FMP, Polygon.
*   [ ] **Server Actions (Public):**
    *   `getMarketIndices()`: Fetch index data.
    *   `getPublicWinners()`: Fetch top 3 winners only.
*   [ ] **SEO Optimization:** Dynamic `generateMetadata` for the dashboard page based on daily winners.

### Phase 2: The "Soft Gate" Components
*   [ ] **Blur Component:** Create a reusable UI component that blurs content and overlays a "Sign up to reveal" button.
*   [ ] **Auth Modal:** Ensure the existing Auth Dialog can be triggered programmatically from any button (e.g., "Add to Watchlist").

### Phase 3: Widget Construction
*   [ ] Build `<IndicesTicker />` (Horizontal scroll, auto-refresh).
*   [ ] Build `<WatchlistWidget />` (Mock state for public -> Auth trigger).
*   [ ] Build `<NewsFeedWidget />`.
*   [ ] Refactor `src/app/dashboard/page.tsx` to CSS Grid.

### Phase 4: Polish & Testing
*   [ ] Verify API rate limits.
*   [ ] Test "Anonymous" vs "LoggedIn" states rigorously.
*   [ ] Visual polish (dark mode consistency, skeleton states).

## 5. Technical Dependencies

*   **Financial Modeling Prep (FMP):** Indices, Sentiment, General News.
*   **Benzinga:** Breaking News (Premium source).
*   **Polygon.io:** Quote data (Backup/Alternative).
*   **Firestore:** User Watchlist persistence.

---
*Created: December 20, 2025*
