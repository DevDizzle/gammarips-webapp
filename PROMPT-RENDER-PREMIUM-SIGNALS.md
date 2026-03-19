# PROMPT: Render Premium Signal Badges in Frontend

## Goal
Display premium signal indicators throughout the webapp so users can immediately identify high-conviction signals. The data already exists in Firestore — this is purely frontend rendering.

## Data Available in Firestore

Every document in the `overnight_signals` collection (synced from BigQuery enrichment) now has these fields:

```
is_premium_signal: boolean    // true if ANY of 5 patterns match
premium_score: number         // 0-5, how many patterns stack
premium_hedge: boolean        // Institutional hedging flow detected
premium_high_rr: boolean      // High risk/reward + not overextended
premium_bull_flow: boolean    // Strong bullish call flow
premium_high_atr: boolean     // Explosive ATR move (2x+ normal)
premium_bear_flow: boolean    // Strong bearish put flow
```

---

## Where to Render

### 1. Signals List Page (`/signals`)
- Add a **"Premium"** or **"High Conviction"** badge next to any signal where `is_premium_signal === true`
- Badge should be visually distinct — gold/amber accent, small pill shape
- If `premium_score >= 2`, make the badge stronger (e.g., "Premium x2" or double icon or brighter color)
- If `premium_score >= 3`, even stronger treatment (e.g., "Premium x3" with a fire/lightning icon)
- Consider adding a filter/toggle: "Show Premium Only" that filters the list to `is_premium_signal === true`

### 2. Signal Detail Page (`/signals/[ticker]`)
- Show the premium badge prominently near the ticker name / signal header
- Add a **"Why Premium"** section or expandable card that lists which patterns matched:
  - If `premium_hedge`: "🛡️ Institutional Hedging — When big money hedges, the underlying moves"
  - If `premium_high_rr`: "📐 High Risk/Reward — Clean setup with room to run"
  - If `premium_bull_flow`: "📈 Strong Call Flow — Aggressive bullish accumulation"
  - If `premium_high_atr`: "⚡ Explosive Move — 2x+ normal range on unusual flow"
  - If `premium_bear_flow`: "📉 Strong Put Flow — Heavy bearish conviction"
- Show the `premium_score` as "X/5 patterns matched"
- This section should only render when `is_premium_signal === true`

### 3. Daily Report Page (`/reports/[date]`)
- In the signal summary table within each report, add a premium indicator column or badge
- Premium signals should stand out visually in the report context

### 4. Arena Page (`/arena`)
- If an arena pick's ticker matches a premium signal for that scan_date, show the badge next to the ticker in the debate view
- This connects the arena consensus with the premium scoring — powerful visual

### 5. Homepage (`/`)
- If there's a "today's signals" or "latest signals" preview section, show premium badges there too
- Consider a callout: "X premium signals detected today" as a hook

---

## Visual Design

### Badge Variants
```
premium_score = 1:  Gold pill badge "Premium" (subtle)
premium_score = 2:  Gold pill badge "Premium ×2" (stronger)  
premium_score >= 3: Gold pill badge "Premium ×3" with glow/emphasis (rare, highlight it)
```

### Color Scheme
- Use gold/amber (#F59E0B or similar) for premium badges — should contrast with both bull (green) and bear (red) signal colors
- Keep it clean — the badge should enhance, not clutter

### Pattern Reason Tags
- Small pills or chips below the main badge showing which patterns matched
- Use the emoji + short label format:
  - 🛡️ Hedge
  - 📐 R/R
  - 📈 Bull Flow
  - ⚡ ATR
  - 📉 Bear Flow

---

## Performance Stats (Optional But Powerful)

If you want to really sell the premium concept, add a small stats bar on the signals page or a tooltip on the premium badge:

"Premium signals win 79.8% of the time with 5.88% average peak return"

This can be hardcoded for now. Later we can pull live stats from the MCP or a Firestore summary doc.

---

## Implementation Notes

- All data is already in Firestore — no backend changes needed
- The fields (`is_premium_signal`, `premium_score`, `premium_hedge`, etc.) are set during enrichment
- If a signal document doesn't have these fields (old data before the feature), treat it as `is_premium_signal = false`
- The "Show Premium Only" filter on the signals list page is high-value — lets users cut through noise instantly

## Testing
1. Visit `/signals` — premium signals should have gold badges, non-premium should not
2. Click into a premium signal — "Why Premium" section should list the correct patterns
3. Toggle "Show Premium Only" — list should filter correctly
4. Check a signal with `premium_score >= 2` — badge should show the stacked count
5. Visit `/arena` — if today's arena pick is a premium signal, badge should appear
