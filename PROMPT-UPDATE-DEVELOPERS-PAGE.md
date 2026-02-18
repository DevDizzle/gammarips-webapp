# PROMPT: Update /developers, /account, Header Nav, skill.md, mcp.json

## Context
The MCP API no longer requires authentication. No API key, no sign-up, no trial — just connect. Multiple pages and components need updating to reflect this.

---

## Files to Update

### 1. `public/skill.md`
Replace the entire file with:

```markdown
# GammaRips — The Overnight Edge

## What I Am
An institutional overnight options flow scanner. I scan 5,000+ tickers every night for unusual options activity and surface the highest-conviction signals before the market opens.

## What I Can Tell You
- Where institutional money moved overnight (direction, dollar volume, strike depth)
- Conviction scores (0-10) based on Vol/OI ratio, active strikes, UOA depth, price confirmation
- Technical setup for each signal (RSI, MACD, SMA 50/200, golden cross)
- AI-analyzed news catalysts explaining the "why"
- Recommended options contracts with spread % and contract scores

## When to Query Me
- Pre-market analysis (data available by 6 AM EST)
- Finding unusual institutional positioning
- Options contract discovery
- Sector rotation / market theme detection

## MCP Endpoint
`https://gammarips-mcp-406581297632.us-central1.run.app/sse`

No authentication required. Connect and start querying.

## Available Tools
- `getOvernightSignals` — Today's signals (filterable by direction, score, limit)
- `getSignalDetail` — Deep dive on a single ticker
- `getTopMovers` — Quick top 5 bull + bear summary
- `getMarketThemes` — AI-detected sector rotation themes
- `chat` — Natural language Q&A about overnight flow
```

---

### 2. `public/mcp.json`
Replace the entire file with:

```json
{
  "name": "GammaRips Overnight Edge",
  "description": "Institutional overnight options flow scanner. 5,000+ tickers scanned nightly. Signals scored 0-10 with technicals, news catalysts, and contract recommendations.",
  "url": "https://gammarips-mcp-406581297632.us-central1.run.app/sse",
  "auth": "none",
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

### 3. `src/components/layout/public-header.tsx` — Add "Developers" to nav

Add `{ href: '/developers', label: 'Developers' }` to the `links` array. Place it after 'About':

```tsx
const links = [
    { href: '/signals', label: 'Signals' },
    { href: '/reports', label: 'Reports' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/developers', label: 'Developers' },
  ];
```

That's it for this file. The desktop nav, mobile Sheet nav, and active-state highlighting all derive from this array automatically.

---

### 4. `src/app/developers/developer-page-client.tsx` — Full overhaul

#### A. Fix MCP URL everywhere
Replace ALL instances of:
```
https://profitscout-mcp-469352939749.us-central1.run.app/sse
```
With:
```
https://gammarips-mcp-406581297632.us-central1.run.app/sse
```

#### B. Replace the CTA/Signup section
The current section has sign-up, 14-day trial, and auth gating. Replace the entire `{/* CTA Section */}` block with:

```tsx
{/* CTA Section */}
<section className="p-8 rounded-lg border-2 border-primary bg-card" id="connect">
  <div className="text-center space-y-4">
    <h2 className="text-2xl font-bold font-headline">Connect Your Agent</h2>
    <p className="text-muted-foreground">
      The MCP API is free. No API key, no sign-up, no trial. Just connect and query.
    </p>
    <code className="block p-3 bg-muted rounded text-sm">
      https://gammarips-mcp-406581297632.us-central1.run.app/sse
    </code>
    <p className="text-sm text-muted-foreground">
      Want real-time alerts + enriched analysis? <Link href="/pricing" className="text-primary hover:underline">See paid plans →</Link>
    </p>
  </div>
</section>
```

#### C. Replace the Pricing section
Remove the old $19/mo and 14-day trial cards. Replace the entire `{/* Pricing */}` section with:

```tsx
{/* Pricing */}
<section className="space-y-6">
  <h2 className="text-2xl font-bold font-headline">Pricing</h2>
  
  <div className="grid md:grid-cols-3 gap-6">
    <div className="p-6 rounded-lg border-2 border-primary bg-card relative">
      <div className="absolute -top-3 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
        CURRENT
      </div>
      <div className="text-sm text-primary mb-2">MCP API</div>
      <div className="text-3xl font-bold mb-4">Free</div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>✓ All tools, no auth required</li>
        <li>✓ Overnight signals + scores</li>
        <li>✓ Market themes + top movers</li>
        <li>✓ Natural language chat</li>
      </ul>
    </div>
    <div className="p-6 rounded-lg border bg-card">
      <div className="text-sm text-muted-foreground mb-2">The Overnight Edge</div>
      <div className="text-3xl font-bold mb-4">$49<span className="text-lg text-muted-foreground">/mo</span></div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>✓ Full enriched signals daily</li>
        <li>✓ AI news + catalyst analysis</li>
        <li>✓ Contract recommendations</li>
        <li>✓ Performance tracking</li>
      </ul>
    </div>
    <div className="p-6 rounded-lg border bg-card">
      <div className="text-sm text-muted-foreground mb-2">The War Room</div>
      <div className="text-3xl font-bold mb-4">$149<span className="text-lg text-muted-foreground">/mo</span></div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>✓ Everything in Edge</li>
        <li>✓ WhatsApp real-time alerts</li>
        <li>✓ Direct access to GammaMolt</li>
        <li>✓ Intraday high-conviction calls</li>
      </ul>
    </div>
  </div>
</section>
```

#### D. Update the Vision section
Change:
```
Our CEO is an AI named GammaMolt.
```
To:
```
Our Chief Intelligence Officer is an AI named GammaMolt.
```

#### E. Update the hero badges
Replace:
```tsx
<span className="px-3 py-1 bg-muted rounded-full">✓ 14-Day Free Trial</span>
```
With:
```tsx
<span className="px-3 py-1 bg-muted rounded-full">✓ Free, No Auth</span>
```

#### F. Update Quick Start transport line
Replace:
```
Transport: SSE (Server-Sent Events) • Auth: None required during beta
```
With:
```
Transport: SSE (Server-Sent Events) • No authentication required
```

#### G. Replace Bottom CTA
Replace the entire `{/* Bottom CTA */}` section with:

```tsx
{/* Bottom CTA */}
<section className="text-center space-y-6">
  <h2 className="text-2xl font-bold font-headline">Ready to Build?</h2>
  <p className="text-muted-foreground">Point your agent at the endpoint and start querying. That's it.</p>
  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
    <Link href="/pricing">
      <Button size="lg">See Paid Plans →</Button>
    </Link>
    <a
      href="https://x.com/GammaRips"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Button variant="outline" size="lg">
        Follow @GammaRips on X
      </Button>
    </a>
  </div>
</section>
```

#### H. Remove auth dialog and auth state
After the above changes, nothing on this page references auth. Remove:
- `const [authOpen, setAuthOpen] = useState(false);`
- `const { user, dbUser, isPro, loading } = useAuth();`
- `<AuthDialog open={authOpen} onOpenChange={setAuthOpen} />`
- The imports: `useAuth`, `AuthDialog`, and `useState` (if nothing else uses it)

---

### 5. `src/app/account/page.tsx` — Replace API Access section

The entire `{/* API Access Section */}` currently shows API key generation/management with `X-API-Key` header instructions. Replace that entire `<section>` block with:

```tsx
{/* API Access Section */}
<section className="p-6 rounded-lg border bg-card space-y-4">
  <h2 className="text-xl font-bold">MCP API Access</h2>
  <p className="text-muted-foreground">
    The GammaRips MCP API is free and open. No API key required.
  </p>
  <div>
    <p className="text-sm font-semibold mb-2">MCP Endpoint:</p>
    <code className="block p-2 bg-muted rounded text-sm font-mono">
      https://gammarips-mcp-406581297632.us-central1.run.app/sse
    </code>
    <p className="text-xs text-muted-foreground mt-2">
      Transport: SSE (Server-Sent Events) • No authentication required
    </p>
  </div>
  <Link href="/developers" className="text-sm text-primary hover:underline inline-block mt-2">
    View full API documentation →
  </Link>
</section>
```

Also clean up unused imports/state from the account page that were only used by the old API key section:
- Remove `generateApiKey`, `hashApiKey` imports from `@/lib/api-key`
- Remove `const [newApiKey, setNewApiKey] = useState<string | null>(null);`
- Remove `const [generating, setGenerating] = useState(false);`
- Remove the `handleGenerateApiKey`, `handleRegenerateApiKey`, and `handleCopyKey` functions entirely
- Remove `import { doc, updateDoc, serverTimestamp, getFirestore } from 'firebase/firestore';` and `import { app } from '@/lib/firebase';` and `const db = getFirestore(app);` **ONLY if nothing else on the page uses them** (check the CancellationForm — it uses `useAuth` but not Firestore directly, so these should be safe to remove)

Make sure the `Link` import from `next/link` is present (it may not be currently imported on this page — add it if needed).

---

## Do NOT Change
- File structure / routing
- `src/components/layout/footer.tsx` (already has Developers link)
- Any pages not listed above
- Auth flow on the account page itself (profile, subscription, cancellation — keep those)
- The `src/lib/api-key.ts` utility file (leave it, just remove the import from account page)

## Verify After
1. `/developers` renders with no errors, no auth dialog, no sign-up flow
2. `/account` shows simplified MCP section with "no API key required" messaging
3. Header nav includes "Developers" link on desktop and mobile
4. MCP URL is `gammarips-mcp-406581297632.us-central1.run.app/sse` everywhere
5. `skill.md` and `mcp.json` have no auth references
6. No console errors on any modified page
