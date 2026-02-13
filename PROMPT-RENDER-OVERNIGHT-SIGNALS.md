# PROMPT: Replace Placeholder Data with Overnight Edge Firestore Data

## Context
The webapp at gammarips.com currently renders old data from `winners_dashboard`, `performance_tracker`, `tickers`, and `options_candidates` Firestore collections. We've pivoted to **The Overnight Edge** — an overnight institutional options flow scanner. New data is already flowing into Firestore from our enrichment Cloud Function. The webapp needs to read from the NEW collections and display real data.

## NEW Firestore Collections (already populated)

### `overnight_signals` (documents keyed `{scan_date}_{ticker}`)
Each document contains:
```
{
  ticker: string,              // e.g. "FSLY"
  scan_date: string,           // e.g. "2026-02-13"
  signal_score: number,        // 1-10, higher = stronger
  direction: string,           // "bull" or "bear"
  move_pct: number,            // e.g. 76.2 (percent)
  new_positioning_usd: number, // dollar value of new options positioning
  vol_oi_ratio: number,        // volume/open interest ratio
  active_strikes: number,      // number of active strike prices
  call_dollar_uoa: number,     // unusual options activity (calls, USD)
  put_dollar_uoa: number,      // unusual options activity (puts, USD)
  // Enrichment fields (present for score >= 6):
  news_summary: string,        // AI-generated news summary
  technical_analysis: string,  // AI-generated technical analysis
  ai_thesis: string,           // AI-generated trade thesis
  key_levels: object,          // { support: number[], resistance: number[] }
  recommended_contract: string, // e.g. "$220C 3/20"
  contract_score: number,      // 1-10 score for the recommended contract
  risk_reward: string,         // e.g. "3:1"
}
```

### `overnight_summaries` (documents keyed `{scan_date}`)
Each document contains:
```
{
  scan_date: string,
  total_signals: number,
  bull_count: number,
  bear_count: number,
  top_themes: string[],        // e.g. ["Agentic AI infrastructure", "Defensive rotation"]
  headline: string,            // e.g. "The Agentic AI Trade Is Here"
  market_narrative: string,    // 2-3 sentence summary of overnight tape
  generated_at: timestamp,
}
```

### `users` (existing, keep as-is for auth + subscription)

## What To Do

### 1. Update `src/lib/firebase-admin.ts`
Add these new functions (keep existing user functions):

```typescript
// --- Overnight Edge Data Functions ---

export interface OvernightSignal {
  id: string;
  ticker: string;
  scan_date: string;
  signal_score: number;
  direction: 'bull' | 'bear';
  move_pct: number;
  new_positioning_usd: number;
  vol_oi_ratio: number;
  active_strikes: number;
  call_dollar_uoa: number;
  put_dollar_uoa: number;
  // Enrichment fields (optional — only present for score >= 6)
  news_summary?: string;
  technical_analysis?: string;
  ai_thesis?: string;
  key_levels?: { support: number[]; resistance: number[] };
  recommended_contract?: string;
  contract_score?: number;
  risk_reward?: string;
}

export interface OvernightSummary {
  scan_date: string;
  total_signals: number;
  bull_count: number;
  bear_count: number;
  top_themes: string[];
  headline: string;
  market_narrative: string;
  generated_at: any;
}

export async function getLatestOvernightSummary(): Promise<OvernightSummary | null> {
  noStore();
  try {
    const snapshot = await getDb().collection('overnight_summaries')
      .orderBy('scan_date', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as OvernightSummary;
  } catch (error) {
    console.error('Error fetching overnight summary:', error);
    return null;
  }
}

export async function getOvernightSignals(
  scanDate: string,
  direction?: 'bull' | 'bear',
  minScore: number = 6,
  limit: number = 20
): Promise<OvernightSignal[]> {
  noStore();
  try {
    let query = getDb().collection('overnight_signals')
      .where('scan_date', '==', scanDate)
      .where('signal_score', '>=', minScore);

    const snapshot = await query.get();
    let signals: OvernightSignal[] = [];
    snapshot.forEach(doc => {
      const data = doc.data() as OvernightSignal;
      data.id = doc.id;
      if (!direction || data.direction === direction) {
        signals.push(data);
      }
    });

    // Sort by score desc, then by absolute move
    signals.sort((a, b) => b.signal_score - a.signal_score || Math.abs(b.move_pct) - Math.abs(a.move_pct));
    return signals.slice(0, limit);
  } catch (error) {
    console.error('Error fetching overnight signals:', error);
    return [];
  }
}

export async function getSignalByTicker(scanDate: string, ticker: string): Promise<OvernightSignal | null> {
  noStore();
  try {
    const docRef = getDb().collection('overnight_signals').doc(`${scanDate}_${ticker}`);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() } as OvernightSignal;
  } catch (error) {
    console.error(`Error fetching signal for ${ticker}:`, error);
    return null;
  }
}
```

### 2. Rewrite `src/app/page.tsx` (Landing Page)
Replace the entire landing page. Remove imports for old components (MarketHub, PerformanceTile, etc). New structure:

```
- Hero: "The Overnight Edge" branding with tagline "See what institutions did last night."
- Summary Bar: Display overnight_summaries data (total signals, bull/bear split, headline)
- Top Signals Table: Two columns — Top Bull Signals | Top Bear Signals (from overnight_signals, score >= 6)
  - Each row: Ticker, Score badge, Move %, Positioning $, AI Thesis (truncated)
  - Click row → expand or navigate to /signals/{ticker}
- Themes: Tag chips from top_themes
- CTA: Subscribe to unlock full analysis, contracts, and alerts
```

### 3. Rewrite `src/app/landing-page-actions.ts`
Replace `getLandingPageData()` with:

```typescript
export interface LandingPageData {
  summary: OvernightSummary | null;
  bullSignals: OvernightSignal[];
  bearSignals: OvernightSignal[];
}

export async function getLandingPageData(): Promise<LandingPageData> {
  const summary = await getLatestOvernightSummary();
  const scanDate = summary?.scan_date || new Date().toISOString().split('T')[0];

  const [bullSignals, bearSignals] = await Promise.all([
    getOvernightSignals(scanDate, 'bull', 6, 10),
    getOvernightSignals(scanDate, 'bear', 6, 10),
  ]);

  return { summary, bullSignals, bearSignals };
}
```

### 4. Update `src/components/landing/hero.tsx`
```tsx
export function Hero({ headline, narrative }: { headline?: string; narrative?: string }) {
  return (
    <section className="py-8 md:py-12 text-center container px-4">
      <h1 className="text-4xl md:text-6xl font-bold font-headline mb-2 tracking-tight">
        The Overnight Edge
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
        See what institutions did last night.
      </p>
      {headline && (
        <div className="mt-4 p-4 bg-primary/10 rounded-lg max-w-xl mx-auto">
          <p className="text-xl font-semibold">{headline}</p>
          {narrative && <p className="text-sm text-muted-foreground mt-2">{narrative}</p>}
        </div>
      )}
    </section>
  );
}
```

### 5. Create `src/components/overnight/signals-table.tsx`
A new component that renders the top signals. Columns:
- **Ticker** (bold)
- **Score** (color-coded badge: 9-10 red/green, 7-8 amber, 6 gray)
- **Move %** (green for positive, red for negative)
- **Positioning** (formatted as $1.3B, $10.3M, etc.)
- **Thesis** (truncated to ~100 chars, from `ai_thesis` field)

Free users see: ticker, score, move %, positioning.
Paid users ($49+) see: thesis, recommended contract, key levels.

### 6. Create signal detail page `src/app/signals/[ticker]/page.tsx`
When user clicks a signal row, show full detail:
- Full AI thesis
- Technical analysis
- News summary
- Key support/resistance levels
- Recommended contract + score
- Risk/reward ratio

Gate the detailed fields behind subscription check.

### 7. Remove/Archive Old Components
These components reference dead data. Remove or comment out:
- `src/components/dashboard/public-winners-table.tsx`
- `src/components/dashboard/execution-deck.tsx`
- `src/components/dashboard/deep-dive-analysis.tsx`
- `src/components/landing/market-hub.tsx`
- `src/components/landing/market-movers.tsx`
- `src/components/landing/performance-tile.tsx`
- `src/components/landing/signals-preview.tsx`

Keep: `economic-events-widget.tsx`, `news-feed.tsx` (if pulling from Polygon), user auth components, layout components.

### 8. Update Metadata
In `src/app/layout.tsx` and `page.tsx`:
- Title: "The Overnight Edge | GammaRips"
- Description: "Institutional options flow analysis delivered before the market opens."
- OG tags updated accordingly

### 9. Styling Notes
- Keep existing Tailwind + shadcn/ui setup
- Dark theme preferred (trading terminal feel)
- Mobile-first: signals table should stack on mobile (card layout)
- Use existing color scheme but lean into green/red for bull/bear

## DO NOT
- Touch the `users` collection or auth logic
- Remove Stripe integration
- Change Firebase project config
- Create a new repository — this IS the gammarips-webapp repo
- Add any old collection references (winners_dashboard, performance_tracker, tickers, options_candidates)

## Test
After changes, run `npm run build` to verify no type errors. The data is already in Firestore so the page should render real signals immediately.
