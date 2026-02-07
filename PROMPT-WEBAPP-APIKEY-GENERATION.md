# PROMPT: Add API Key Generation to /account Page

## Objective
Let subscribed users generate and manage their MCP API key from the account page.

---

## Step 1: Create API Key Utility

**Create new file: `src/lib/api-key.ts`**

```typescript
import { sha256 } from 'js-sha256';

/**
 * Generate a secure API key with gr_live_ prefix
 */
export function generateApiKey(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  return `gr_live_${hex}`;
}

/**
 * Hash an API key for secure storage (never store plain keys)
 */
export function hashApiKey(apiKey: string): string {
  return sha256(apiKey);
}
```

**Install dependency:**
```bash
npm install js-sha256
npm install -D @types/js-sha256
```

---

## Step 2: Update User Type

**File: `src/lib/firebase.ts`**

Add to `DbUser` interface:
```typescript
export interface DbUser {
  // ... existing fields ...
  apiKeyHash?: string;
  apiKeyCreatedAt?: Timestamp;
}
```

---

## Step 3: Add API Key Section to Account Page

**File: `src/app/account/page.tsx`**

Add imports:
```typescript
import { useState } from 'react';
import { generateApiKey, hashApiKey } from '@/lib/api-key';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
```

Add state (inside component):
```typescript
const [newApiKey, setNewApiKey] = useState<string | null>(null);
const [generating, setGenerating] = useState(false);
const db = getFirestore(app);
```

Add handlers:
```typescript
const handleGenerateApiKey = async () => {
  if (!user) return;
  setGenerating(true);
  
  try {
    const apiKey = generateApiKey();
    const apiKeyHash = hashApiKey(apiKey);
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      apiKeyHash: apiKeyHash,
      apiKeyCreatedAt: serverTimestamp(),
    });
    
    setNewApiKey(apiKey);
  } catch (error) {
    console.error('Error generating API key:', error);
  } finally {
    setGenerating(false);
  }
};

const handleRegenerateApiKey = async () => {
  if (confirm('This will invalidate your existing API key. Any agents using the old key will stop working. Continue?')) {
    setNewApiKey(null);
    await handleGenerateApiKey();
  }
};

const handleCopyKey = () => {
  if (newApiKey) {
    navigator.clipboard.writeText(newApiKey);
    // Optional: show toast
  }
};
```

Add UI section (after subscription status, before any footer):
```tsx
{/* API Access Section */}
<section className="p-6 rounded-lg border bg-card space-y-4">
  <h2 className="text-xl font-bold">API Access</h2>
  
  {!isPro ? (
    <div className="space-y-2">
      <p className="text-muted-foreground">
        Subscribe to generate an API key for MCP access.
      </p>
      {/* Show subscribe button or link */}
    </div>
  ) : !dbUser?.apiKeyHash ? (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Generate an API key to connect your AI agent to GammaRips MCP.
      </p>
      <Button onClick={handleGenerateApiKey} disabled={generating}>
        {generating ? 'Generating...' : 'Generate API Key'}
      </Button>
    </div>
  ) : newApiKey ? (
    <div className="space-y-4">
      <div className="p-4 bg-green-500/10 border border-green-500 rounded">
        <p className="text-sm font-semibold text-green-400 mb-2">
          ⚠️ Copy this key now — you won't see it again!
        </p>
        <code className="block p-3 bg-muted rounded text-sm break-all font-mono">
          {newApiKey}
        </code>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={handleCopyKey}>
            Copy to Clipboard
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setNewApiKey(null)}>
            Done
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-500">
        <span>✓</span>
        <span className="font-semibold">API Key Active</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Created: {dbUser.apiKeyCreatedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
      </p>
      <p className="text-sm text-muted-foreground">
        Key prefix: <code className="text-primary">gr_live_••••••••</code>
      </p>
      <Button variant="outline" size="sm" onClick={handleRegenerateApiKey}>
        Regenerate Key
      </Button>
      <p className="text-xs text-muted-foreground">
        Regenerating will invalidate your current key immediately.
      </p>
    </div>
  )}
  
  <div className="pt-4 border-t mt-4">
    <p className="text-sm font-semibold mb-2">MCP Endpoint:</p>
    <code className="block p-2 bg-muted rounded text-sm font-mono">
      https://profitscout-mcp-469352939749.us-central1.run.app/sse
    </code>
    <p className="text-xs text-muted-foreground mt-2">
      Use header: <code>X-API-Key: your_key_here</code>
    </p>
  </div>
</section>
```

---

## Step 4: Handle Client Component Requirements

If `/account/page.tsx` is a server component, you may need to:
1. Create `account-client.tsx` with `'use client'` directive
2. Move the interactive API key logic there
3. Import and render from the main page

---

## Verification Checklist

- [ ] `npm install js-sha256` completed
- [ ] `src/lib/api-key.ts` created with generateApiKey and hashApiKey
- [ ] DbUser type updated with apiKeyHash and apiKeyCreatedAt
- [ ] /account page shows "Generate API Key" for subscribed users without key
- [ ] Generated key displays once with copy button
- [ ] After dismissing, shows "API Key Active" with regenerate option
- [ ] Key hash saved to Firestore (check in Firebase console)
- [ ] Non-subscribed users see "Subscribe to generate" message

---

## Test Flow

1. Log in as subscribed user
2. Go to /account
3. Click "Generate API Key"
4. Copy the key (gr_live_...)
5. Refresh page — should show "API Key Active" (key hidden)
6. Test key against MCP:
   ```bash
   curl -H "X-API-Key: gr_live_your_key" \
     "https://profitscout-mcp-469352939749.us-central1.run.app/v1"
   ```
7. Should return datasets list (not 401)

---

## Commit Message
```
feat: add API key generation UI to /account page
```
