# PROMPT: Finish /developers Page — Add Auth Instructions

## Prerequisites
- ✅ Free trial copy removed (already done)
- ✅ MCP auth enabled (PROMPT-MCP-AUTH.md completed)

## Objective
Update /developers page to show users how to get and use their API key.

---

## File: `/src/app/developers/developer-page-client.tsx`

### 1. Update auth status text (around line 135)

**Find:**
```tsx
Transport: SSE (Server-Sent Events) • Auth: None required during beta
```

**Replace with:**
```tsx
Transport: SSE (Server-Sent Events) • Auth: API Key (X-API-Key header)
```

---

### 2. Add "Get Your API Key" section BEFORE the MCP Endpoint section (around line 125)

**Add this new block:**
```tsx
<div className="p-6 rounded-lg border-2 border-primary bg-card space-y-4">
  <h3 className="font-semibold">0. Get Your API Key</h3>
  <p className="text-sm text-muted-foreground">
    Subscribe and generate your API key from your account dashboard.
  </p>
  {user ? (
    <Link href="/account">
      <Button>Go to Account → Generate Key</Button>
    </Link>
  ) : (
    <Button onClick={() => setAuthOpen(true)}>
      Subscribe to Get API Key
    </Button>
  )}
</div>
```

---

### 3. Update code examples to include API key header

**Find (Get Today's Signals example):**
```tsx
{`# Using mcporter CLI
mcporter call \\
  "https://profitscout-mcp-469352939749.us-central1.run.app/sse.get_winners_dashboard" \\
  limit:10 min_quality:High`}
```

**Replace with:**
```tsx
{`# Include your API key in requests
mcporter call \\
  --header "X-API-Key: YOUR_API_KEY" \\
  "https://profitscout-mcp-469352939749.us-central1.run.app/sse.get_winners_dashboard" \\
  limit:10 min_quality:High`}
```

---

**Find (Track Performance example):**
```tsx
{`mcporter call \\
  "https://profitscout-mcp-469352939749.us-central1.run.app/sse.get_performance_summary"`}
```

**Replace with:**
```tsx
{`mcporter call \\
  --header "X-API-Key: YOUR_API_KEY" \\
  "https://profitscout-mcp-469352939749.us-central1.run.app/sse.get_performance_summary"`}
```

---

### 4. Update the CTA section for logged-in users with expired/no subscription

**Find (around line 95):**
```tsx
{isPro ? (
  <div className="space-y-2">
    <p className="text-green-500 font-semibold">✓ You have full API access</p>
    <p className="text-sm text-muted-foreground">
      MCP Endpoint: <code className="text-primary">https://profitscout-mcp-469352939749.us-central1.run.app/sse</code>
    </p>
  </div>
) : (
```

**Replace with:**
```tsx
{isPro ? (
  <div className="space-y-2">
    <p className="text-green-500 font-semibold">✓ You have full API access</p>
    <p className="text-sm text-muted-foreground mb-2">
      MCP Endpoint: <code className="text-primary">https://profitscout-mcp-469352939749.us-central1.run.app/sse</code>
    </p>
    <Link href="/account">
      <Button variant="outline" size="sm">Get Your API Key →</Button>
    </Link>
  </div>
) : (
```

---

## Verification

1. Visit `/developers` logged out → see "Subscribe to Get API Key" button
2. Visit `/developers` logged in (no sub) → see "Subscribe to Continue" 
3. Visit `/developers` logged in (subscribed) → see "Get Your API Key" button linking to /account
4. Code examples show `X-API-Key: YOUR_API_KEY` header

---

## Commit Message
```
feat: add API key instructions to /developers page
```
