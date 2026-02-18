# PROMPT: Fix Reports Page Display

## Problem
1. **Reports index** (`/reports/page.tsx`) — Cards show "Daily Overnight Signals" because `summary.headline` is null/undefined in Firestore `overnight_summaries` docs
2. **Report detail** (`/reports/[date]/page.tsx`) — Shows duplicate title: an `<h1>` with `report.title` PLUS the same title inside the markdown `report.content`. The markdown content already starts with the full title as an H1.
3. **Signal counts are wrong on index** — Uses `bull_count`/`bear_count` but Firestore has `bullish_count`/`bearish_count`

## Fixes

### Fix 1: Reports Index — Field Name Mismatch
In `/src/app/reports/page.tsx`, the card uses `summary.bull_count` and `summary.bear_count` but the Firestore `overnight_summaries` collection uses `bullish_count` and `bearish_count`.

Change:
```tsx
<span className="text-green-500">{summary.bull_count} Bull</span>
<span>•</span>
<span className="text-red-500">{summary.bear_count} Bear</span>
```
To:
```tsx
<span className="text-green-500">{summary.bullish_count || summary.bull_count || 0} Bull</span>
<span>•</span>
<span className="text-red-500">{summary.bearish_count || summary.bear_count || 0} Bear</span>
```

### Fix 2: Reports Index — Use Title from `daily_reports` as Fallback
The `overnight_summaries` collection doesn't have `headline`. But the `daily_reports` collection has `title` with the actual themed title (e.g. "The Agentic AI Trade Is Here — February 13, 2026").

Option A (preferred): In the `getAllOvernightSummaries` function in `firebase-admin.ts`, also fetch the corresponding `daily_reports` doc for each summary and merge the `title` field.

Option B (simpler): Change the fallback chain in the card:
```tsx
<CardTitle className="text-xl leading-tight">
  {summary.headline || summary.title || summary.market_narrative?.substring(0, 60) || "Daily Overnight Signals"}
</CardTitle>
```

And update the `getAllOvernightSummaries` function to also return `title` and `market_narrative` fields if they exist.

**Best approach:** Query `daily_reports` collection instead of (or in addition to) `overnight_summaries` for the index page, since `daily_reports` has the rich title. The function should return docs with at least: `scan_date`, `title`, `total_signals`, `bullish_count`, `bearish_count`, `top_themes`.

### Fix 3: Report Detail — Remove Duplicate Title
In `/src/app/reports/[date]/page.tsx`, the markdown content already contains the full report title as its first H1. Remove the hardcoded `<h1>` and metadata bar, OR strip the first H1 from the markdown content.

**Recommended approach — remove the hardcoded header, keep the markdown as-is:**

Change from:
```tsx
<div className="container mx-auto px-4 py-8 max-w-4xl">
  <h1 className="text-3xl font-bold mb-2">{report.title}</h1>
  <div className="flex gap-4 mb-8 text-sm text-muted-foreground">
    <span>{report.scan_date}</span>
    <span>{report.total_signals} signals</span>
    <span>📈 {report.bullish_count} bull</span>
    <span>📉 {report.bearish_count} bear</span>
  </div>
  <article className="prose prose-invert max-w-none">
    <ReactMarkdown>{report.content}</ReactMarkdown>
  </article>
</div>
```

To:
```tsx
<div className="container mx-auto px-4 py-8 max-w-4xl">
  <article className="prose prose-invert max-w-none">
    <ReactMarkdown>{report.content}</ReactMarkdown>
  </article>
</div>
```

The markdown content already includes the title, signal counts, and all formatting. Let it render cleanly without duplication.

Keep the `generateMetadata` function as-is — that's for SEO, not display.

### Fix 4: Add `remark-gfm` for Table Rendering
The report markdown contains tables (e.g. top signals table). Without `remark-gfm`, these render as raw text.

```bash
npm install remark-gfm
```

Then in the report detail page:
```tsx
import remarkGfm from "remark-gfm";

<ReactMarkdown remarkPlugins={[remarkGfm]}>{report.content}</ReactMarkdown>
```

## Firestore Schema Reference

### `daily_reports` collection (doc ID = date string like "2026-02-13")
```
{
  title: "The Agentic AI Trade Is Here — February 13, 2026",
  scan_date: "2026-02-13",
  total_signals: 2629,
  bullish_count: 613,
  bearish_count: 2016,
  content: "# 🌙 The Overnight Edge — February 13, 2026\n...",  // full markdown
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### `overnight_summaries` collection (doc ID = date string)
```
{
  scan_date: "2026-02-13",
  total_signals: 119,        // NOTE: this is enriched count, not raw
  bullish_count: 26,
  bearish_count: 93,
  top_themes: ["AI/ML", ...],
  market_narrative: "...",
  created_at: Timestamp,
  updated_at: Timestamp
}
```

Note: `overnight_summaries.total_signals` (119) is the ENRICHED count. `daily_reports.total_signals` (2629) is the RAW scanner count. The reports index should use `daily_reports` as the primary source for cards.
