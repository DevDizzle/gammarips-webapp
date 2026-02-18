# PROMPT: Homepage Live Data — Instant Value on Landing

## Context
The homepage at `gammarips.com` (`/src/app/page.tsx`) is currently all static marketing copy. No real data. Visitors have to click through to `/reports` to see anything. We need to show live data on the homepage so people get instant value when they land.

Data sources already exist in `firebase-admin.ts`:
- `getLatestOvernightSummary()` — returns latest `overnight_summaries` doc
- `getDailyReport(date)` — returns full report from `daily_reports` collection
- `getOvernightSignals(date, direction, offset, limit)` — returns signals from `overnight_signals`

The homepage is a **server component** — it can call these functions directly.

## What to Build

### New Layout Order (top to bottom)
1. **Header** (existing — keep as-is)
2. **Hero** (existing — keep as-is)
3. **How It Works** (existing 4 cards — keep as-is)
4. **🆕 Today's Market Snapshot** (from `overnight_summaries` + `daily_reports`)
5. **🆕 Top Signals Preview** (from `overnight_signals`)
6. **🆕 Report Snippet** (from `daily_reports`)
7. **"What Smart Money Did Last Night"** (existing copy section — keep as-is)
8. **Pricing** (existing — keep as-is)
9. **FAQ** (existing — keep as-is)

### Section 4: Today's Market Snapshot

Fetch data in the page component:
```tsx
import { getLatestOvernightSummary, getDailyReport } from "@/lib/firebase-admin";

export default async function LandingPage() {
  const summary = await getLatestOvernightSummary();
  const report = summary ? await getDailyReport(summary.scan_date) : null;
  // ... rest of page
}
```

Render a prominent card:
```tsx
{summary && (
  <section>
    <Card className="border-primary/30 bg-card/80">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {new Date(summary.scan_date).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' 
              })}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold font-headline mt-1">
              {report?.headline || summary.headline || "Today's Overnight Edge"}
            </h2>
          </div>
          <Link href={`/reports/${summary.scan_date}`}>
            <Button variant="outline" size="sm">
              Full Report <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {/* Signal counts */}
        <div className="flex gap-6 mb-4">
          <div>
            <span className="text-3xl font-bold">{report?.total_signals || summary.total_signals}</span>
            <span className="text-sm text-muted-foreground ml-2">signals scanned</span>
          </div>
          <div>
            <span className="text-3xl font-bold text-green-500">{report?.bullish_count || summary.bullish_count || summary.bull_count || 0}</span>
            <span className="text-sm text-muted-foreground ml-2">📈 bull</span>
          </div>
          <div>
            <span className="text-3xl font-bold text-red-500">{report?.bearish_count || summary.bearish_count || summary.bear_count || 0}</span>
            <span className="text-sm text-muted-foreground ml-2">📉 bear</span>
          </div>
        </div>

        {/* Market narrative */}
        {summary.market_narrative && (
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {summary.market_narrative}
          </p>
        )}

        {/* Theme badges */}
        {summary.top_themes && summary.top_themes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {summary.top_themes.slice(0, 5).map((theme: string) => (
              <Badge key={theme} variant="secondary" className="text-xs">
                {theme}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </section>
)}
```

Add `Badge` to the imports from `@/components/ui/badge`.

### Section 5: Top Signals Preview

Fetch top 5 signals (bull + bear mixed, sorted by score):
```tsx
import { getOvernightSignals } from "@/lib/firebase-admin";

// Inside the page component, after fetching summary:
const topBull = summary ? await getOvernightSignals(summary.scan_date, 'bull', 0, 3) : [];
const topBear = summary ? await getOvernightSignals(summary.scan_date, 'bear', 0, 2) : [];
const topSignals = [...topBull, ...topBear]
  .sort((a, b) => (b.signal_score || b.overnight_score || 0) - (a.signal_score || a.overnight_score || 0))
  .slice(0, 5);
```

Render a mini table:
```tsx
{topSignals.length > 0 && (
  <section>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold font-headline">Top Signals</h2>
      <Link href={`/reports/${summary?.scan_date}`} className="text-sm text-primary hover:underline">
        View all →
      </Link>
    </div>
    <div className="grid gap-3">
      {topSignals.map((signal: any) => (
        <Card key={signal.id} className="bg-card/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                signal.direction === 'BULLISH' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
              }`}>
                {signal.direction === 'BULLISH' ? '📈 BULL' : '📉 BEAR'}
              </span>
              <div>
                <span className="font-bold font-headline text-lg">{signal.ticker}</span>
                {signal.ai_thesis && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-md">
                    {signal.ai_thesis}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <div className="font-bold">Score: {signal.overnight_score || signal.signal_score}</div>
                <div className="text-xs text-muted-foreground">
                  Vol/OI: {signal.vol_oi_ratio?.toFixed(1) || '—'}x
                </div>
              </div>
              {/* Gate detailed info for free users */}
              {!signal.ai_thesis && (
                <Link href="/pricing" className="text-xs text-primary hover:underline">
                  🔒 Unlock
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
)}
```

**Note on gating:** The `ai_thesis`, `recommended_contract`, and `key_levels` fields only exist on enriched signals (score ≥ 6). Free users see ticker + direction + score. The thesis line acts as a teaser. Full details require subscription. For now, show what's available — we'll add proper auth-gated blurring later.

### Section 6: Report Snippet

Show the first ~500 characters of the daily report markdown as a teaser:
```tsx
{report?.content && (
  <section>
    <Card className="bg-card/50 border-primary/20">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold font-headline mb-4">Today's Report Preview</h2>
        <article className="prose prose-invert prose-sm max-w-none line-clamp-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {report.content.substring(0, 800)}
          </ReactMarkdown>
        </article>
        <div className="mt-4 pt-4 border-t border-border">
          <Link href={`/reports/${summary?.scan_date}`}>
            <Button variant="outline" size="sm">
              Read Full Report <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  </section>
)}
```

Add imports at the top of the file:
```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
```

If `remark-gfm` is not installed:
```bash
npm install remark-gfm
```

### Performance Note

The page uses `noStore()` in the data functions so it's always fresh. Since this is SSR, the Firestore queries happen server-side — no client bundle impact. The page will be slightly slower on first load but always shows current data.

If performance becomes an issue later, we can add `revalidate` caching (e.g., revalidate every 5 minutes). For now, always-fresh is fine.

## Firestore Field Reference

### `overnight_summaries` (doc ID = date like "2026-02-13")
```
scan_date: "2026-02-13"
total_signals: 119          // enriched count
bullish_count: 26
bearish_count: 93
headline: "The Agentic AI Trade Is Here"
top_themes: ["AI/ML", "Semiconductors", ...]
market_narrative: "Broad risk-off. Institutions rotating..."
created_at: Timestamp
```

### `daily_reports` (doc ID = date)
```
scan_date: "2026-02-13"
title: "The Agentic AI Trade Is Here — February 13, 2026"
headline: "The Agentic AI Trade Is Here"
total_signals: 2629         // raw scanner count (use this for display)
bullish_count: 613
bearish_count: 2016
content: "# 🌙 The Overnight Edge — February 13, 2026\n..."
```

### `overnight_signals` (doc ID = "date_TICKER")
```
ticker: "FSLY"
scan_date: "2026-02-13"
direction: "BULLISH" or "BEARISH"
overnight_score: 9
vol_oi_ratio: 3.9
active_strikes: 58
ai_thesis: "Agentic AI traffic driving edge network growth..."  // only on enriched
recommended_contract: "FSLY 2/21 $15C"  // only on enriched
```

## Important
- Use `daily_reports` signal counts (2,629) for the snapshot — these are the raw scanner numbers and more impressive than enriched counts (119)
- Prefer `report?.headline` over `summary.headline` as fallback chain — daily_reports is the canonical source
- The `overnight_signals` field for score is `overnight_score` (not `signal_score`)
- Direction values in Firestore are `"BULLISH"` / `"BEARISH"` (uppercase)
- Don't break the existing page structure — insert new sections between "How It Works" and "What Smart Money Did"
- Handle the case where no data exists gracefully (first-time visitors before any scan has run)
